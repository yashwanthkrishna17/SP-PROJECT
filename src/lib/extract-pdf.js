const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('No file path provided');
    process.exit(1);
  }

  try {
    const data = fs.readFileSync(filePath);
    const parser = new PDFParse({ data });
    const res = await parser.getText();
    const text = res.text || '';
    process.stdout.write(text);
  } catch (err) {
    console.error('Extraction failed:', err);
    process.exit(1);
  }
}

main();
