from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scorer import score_message, get_risk_level
from audio_detector import score_voice_audio

app = FastAPI(title="RakshaShield ML Service", version="1.0.0")

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageRequest(BaseModel):
    text: str


class ScoreResponse(BaseModel):
    score: int
    reasons: list[str]


class AudioScoreResponse(BaseModel):
    score: int
    riskLevel: str
    reasons: list[str]
    modelConfidence: float
    label: str


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "rakshaShield-ml"}


@app.post("/score-message", response_model=ScoreResponse)
def score_message_endpoint(req: MessageRequest):
    if not req.text or not req.text.strip():
        return ScoreResponse(score=0, reasons=["Empty text provided — nothing to analyze"])
    
    result = score_message(req.text)
    return ScoreResponse(score=result["score"], reasons=result["reasons"])


@app.post("/score-audio", response_model=AudioScoreResponse)
async def score_audio_endpoint(audio: UploadFile = File(...)):
    try:
        content = await audio.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty audio file provided")
        
        result = score_voice_audio(content, filename=audio.filename or "sample.wav")
        return AudioScoreResponse(**result)
    except Exception as e:
        print(f"Audio scoring error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
