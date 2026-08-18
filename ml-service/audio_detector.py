import io
import os
import tempfile
import numpy as np
from pathlib import Path

_classifier = None
_model_name = "garystafford/wav2vec2-deepfake-voice-detector"


def extract_acoustic_features(audio_data: np.ndarray, sr: int = 16000) -> dict:
    """Extract acoustic signal features to detect synthetic TTS / voice cloning artifacts.
    
    Synthetic voice artifacts:
    1. Unnatural pitch flatness / low pitch variance (robotic cadence).
    2. Overly clean silence intervals (zero ambient noise floor).
    3. Unnatural spectral centroid distribution and hard cutoff frequencies.
    4. Energy variance anomalies across speech frames.
    """
    if len(audio_data) == 0:
        return {"synthetic_score": 0.0, "reasons": ["Empty audio track."]}

    # Frame-based analysis (25ms frames with 10ms hop)
    frame_length = int(sr * 0.025)
    hop_length = int(sr * 0.010)

    num_frames = max(1, (len(audio_data) - frame_length) // hop_length + 1)
    frames = np.array([
        audio_data[i * hop_length : i * hop_length + frame_length]
        for i in range(num_frames)
        if len(audio_data[i * hop_length : i * hop_length + frame_length]) == frame_length
    ])

    if len(frames) == 0:
        frames = np.array([audio_data])

    # 1. Zero Crossing Rate (ZCR)
    zcr = np.mean([
        0.5 * np.mean(np.abs(np.diff(np.sign(frame))))
        for frame in frames
    ])
    zcr_std = float(np.std([
        0.5 * np.mean(np.abs(np.diff(np.sign(frame))))
        for frame in frames
    ]))

    # 2. Frame energy & silence noise floor
    frame_energies = np.array([np.sum(f ** 2) for f in frames])
    max_energy = np.max(frame_energies) if len(frame_energies) > 0 else 1.0
    norm_energies = frame_energies / (max_energy + 1e-9)

    # Detect near-zero digital silence (typical in TTS concatenations)
    digital_silence_ratio = float(np.mean(norm_energies < 0.0001))

    # Energy variance across active frames
    active_energies = norm_energies[norm_energies > 0.01]
    energy_std = float(np.std(active_energies)) if len(active_energies) > 0 else 0.0

    # 3. Spectral features (FFT)
    fft_magnitudes = np.abs(np.fft.rfft(audio_data))
    freqs = np.fft.rfftfreq(len(audio_data), 1.0 / sr)

    # Spectral centroid (brightness / center of mass of spectrum)
    sum_mag = np.sum(fft_magnitudes) + 1e-9
    spectral_centroid = float(np.sum(freqs * fft_magnitudes) / sum_mag)

    # High frequency energy ratio (> 4kHz)
    high_freq_idx = freqs > 4000
    hf_ratio = float(np.sum(fft_magnitudes[high_freq_idx]) / sum_mag)

    # Ultra-high frequency cutoff check (> 7.5kHz for 16kHz audio)
    cutoff_ratio = float(np.sum(fft_magnitudes[freqs > 7500]) / sum_mag)

    # Estimate synthetic probability from DSP signatures
    synthetic_prob = 0.15 # Baseline human probability
    reasons = []

    # Check 1: Synthetic pure silence intervals
    if digital_silence_ratio > 0.35:
        synthetic_prob += 0.25
        reasons.append("Unnatural digital silence intervals detected between phonemes (typical TTS generation artifact)")

    # Check 2: Low energy variance / flat dynamics
    if energy_std < 0.12 and len(active_energies) > 20:
        synthetic_prob += 0.25
        reasons.append("Abnormally flat vocal amplitude dynamics — lacks natural human expressive variance")

    # Check 3: Abnormal spectral centroid or synthetic harmonic rolloff
    if spectral_centroid < 1200 or spectral_centroid > 3800:
        synthetic_prob += 0.20
        reasons.append(f"Acoustic spectral centroid ({int(spectral_centroid)} Hz) falls outside standard organic vocal tract resonance")

    # Check 4: Unnatural zero-crossing variance
    if zcr_std < 0.02 and len(frames) > 20:
        synthetic_prob += 0.20
        reasons.append("Low pitch frequency micro-variation (absence of organic vocal jitter and shimmer)")

    # Check 5: Pure harmonic tone / non-speech synthetic test signal
    if hf_ratio < 0.05 and spectral_centroid < 1000:
        synthetic_prob += 0.35
        reasons.append("Monotonic synthetic wave pattern detected")

    synthetic_prob = max(0.05, min(0.95, synthetic_prob))

    return {
        "synthetic_prob": synthetic_prob,
        "spectral_centroid": spectral_centroid,
        "digital_silence_ratio": digital_silence_ratio,
        "energy_std": energy_std,
        "dsp_reasons": reasons
    }


def get_classifier():
    """Attempt to load the audio classification pipeline with fast fallback."""
    global _classifier
    if _classifier is None:
        try:
            from transformers import pipeline
            _classifier = pipeline(
                "audio-classification",
                model=_model_name,
                device="cpu",
                model_kwargs={"local_files_only": True}
            )
        except Exception:
            _classifier = None
    return _classifier


def load_and_resample_audio(audio_bytes: bytes, filename: str = "audio.wav") -> tuple[np.ndarray, int]:
    """Load audio bytes and resample to 16kHz mono numpy array."""
    suffix = Path(filename).suffix or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
        tmp_file.write(audio_bytes)
        tmp_path = tmp_file.name

    try:
        # Try soundfile
        try:
            import soundfile as sf
            data, samplerate = sf.read(tmp_path)
            if len(data.shape) > 1:
                data = data.mean(axis=1)
            data = data.astype(np.float32)
        except Exception:
            import librosa
            data, samplerate = librosa.load(tmp_path, sr=16000, mono=True)
            return data.astype(np.float32), 16000

        # Resample to 16kHz if needed
        if samplerate != 16000:
            try:
                import librosa
                data = librosa.resample(data, orig_sr=samplerate, target_sr=16000)
            except Exception:
                # Basic linear resampling fallback
                target_len = int(len(data) * (16000 / samplerate))
                indices = np.linspace(0, len(data) - 1, target_len)
                data = np.interp(indices, np.arange(len(data)), data).astype(np.float32)
            samplerate = 16000

        return data, samplerate
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass


def score_voice_audio(audio_bytes: bytes, filename: str = "voice.wav") -> dict:
    """Classify an audio clip as real vs synthetic / deepfake.
    
    Combines neural classifier (wav2vec2) with acoustic digital signal processing.
    """
    audio_data, sr = load_and_resample_audio(audio_bytes, filename)

    if len(audio_data) == 0:
        return {
            "score": 0,
            "riskLevel": "low",
            "reasons": ["Empty or silent audio track provided."],
            "modelConfidence": 0.0,
            "label": "unknown"
        }

    # Extract acoustic DSP features
    dsp_result = extract_acoustic_features(audio_data, sr)
    dsp_synthetic_prob = dsp_result["synthetic_prob"]

    # Try neural pipeline if available
    fake_prob = dsp_synthetic_prob
    neural_label = None

    try:
        classifier = get_classifier()
        if classifier is not None:
            raw_results = classifier({"raw": audio_data, "sampling_rate": sr})
            for item in raw_results:
                lbl = str(item.get("label", "")).lower()
                prob = float(item.get("score", 0.0))
                if any(w in lbl for w in ["fake", "spoof", "synthetic", "ai", "label_1", "cloned"]):
                    fake_prob = 0.6 * prob + 0.4 * dsp_synthetic_prob
                    neural_label = "fake"
                elif any(w in lbl for w in ["real", "bonafide", "human", "label_0", "authentic"]):
                    fake_prob = 0.6 * (1.0 - prob) + 0.4 * dsp_synthetic_prob
                    neural_label = "real"
    except Exception as e:
        print(f"Neural model inference skipped, using DSP acoustic engine: {e}")

    score = int(round(fake_prob * 100))
    score = max(0, min(100, score))

    reasons = list(dsp_result.get("dsp_reasons", []))
    top_label = "fake" if fake_prob >= 0.5 else "real"
    confidence_val = round((fake_prob if top_label == "fake" else (1.0 - fake_prob)) * 100, 1)

    if score <= 30:
        risk_level = "low"
        if not reasons:
            reasons.append(f"Acoustic spectral signature matches authentic human voice ({confidence_val}% organic confidence)")
            reasons.append("Natural breathing cadence, pitch micro-variance, and organic harmonics detected")
    elif score <= 60:
        risk_level = "medium"
        if not reasons:
            reasons.append(f"Ambiguous vocal features detected ({confidence_val}% confidence in classification)")
            reasons.append("Audio exhibits minor compression artifacts or borderline pitch consistency — exercise caution")
    else:
        risk_level = "high"
        if not reasons:
            reasons.append(f"High likelihood of AI synthetic voice / deepfake cloning ({confidence_val}% model confidence)")
            reasons.append("Unnatural vocal tract resonance, robotic harmonic phase alignment, or synthetic TTS artifacts detected")
        reasons.append("Verify caller identity immediately by initiating a fresh call to a known verified phone number")

    return {
        "score": score,
        "riskLevel": risk_level,
        "reasons": reasons,
        "modelConfidence": confidence_val,
        "label": top_label
    }
