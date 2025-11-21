// NOTE: Tesseract worker usage in Node can be environment-dependent and
// may cause crashes in some runtimes (worker threads / DOM APIs). To keep
// the server stable, provide a safe stub implementation here that returns
// empty OCR text. Replace this with a robust Node-compatible OCR
// implementation (e.g., tesseract.js-node or an external OCR service)
// when ready.

export const extractTextFromBuffer = async (_buffer: Buffer): Promise<string> => {
  console.warn('OCR is currently disabled in this environment — returning empty text.');
  return '';
};

export const terminateWorker = async () => {
  // no-op for stub
};
