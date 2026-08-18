const { createWorker } = require('tesseract.js');

let worker = null;

/**
 * Initialize the OCR worker once at server startup.
 * Call this in server.js before listening.
 */
async function initWorker() {
  worker = await createWorker('eng');
  console.log('Tesseract OCR worker initialized');
}

/**
 * Extract text from an image buffer.
 * @param {Buffer} imageBuffer - The image file buffer from multer
 * @returns {Promise<{text: string, confidence: number}>}
 */
async function recognizeText(imageBuffer) {
  if (!worker) {
    throw new Error('OCR worker not initialized. Call initWorker() first.');
  }
  const result = await worker.recognize(imageBuffer);
  return {
    text: result.data.text.trim(),
    confidence: result.data.confidence
  };
}

/**
 * Terminate the OCR worker (call on server shutdown).
 */
async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
    console.log('Tesseract OCR worker terminated');
  }
}

module.exports = { initWorker, recognizeText, terminateWorker };
