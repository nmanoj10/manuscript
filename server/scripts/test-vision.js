const vision = require('@google-cloud/vision');

const image = process.argv[2];
if (!image) {
  console.error('Usage: node scripts/test-vision.js <imageUrl|imagePath>');
  process.exit(1);
}

(async () => {
  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.documentTextDetection(image);
    const text = result.fullTextAnnotation && result.fullTextAnnotation.text;
    if (text) console.log(text);
    else console.log('No text detected. Full response:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Vision error:', err);
    process.exit(2);
  }
})();
