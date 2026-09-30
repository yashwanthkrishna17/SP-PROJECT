import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name || 'uploaded_document';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = fileName.split('.').pop()?.toLowerCase();

    let extractedText = '';

    if (ext === 'pdf') {
      try {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        const res = await parser.getText();
        extractedText = res.text || '';
      } catch (pdfErr) {
        console.error('PDF parsing error:', pdfErr);
        // Fallback: extract printable strings from buffer
        const rawStr = buffer.toString('binary');
        const textMatches = rawStr.match(/[\x20-\x7E\s]{4,}/g);
        if (textMatches && textMatches.length > 0) {
          extractedText = textMatches.join(' ').replace(/\s+/g, ' ');
        }
      }
    } else if (ext === 'docx') {
      try {
        const mammoth = await import('mammoth');
        const res = await mammoth.extractRawText({ buffer });
        extractedText = res.value || '';
      } catch (docxErr) {
        console.error('DOCX parsing error:', docxErr);
      }
    } else {
      // Plain text or fallback
      try {
        extractedText = buffer.toString('utf-8');
      } catch {
        extractedText = buffer.toString('latin1');
      }
    }

    // Clean up extracted text
    const cleanText = (extractedText || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Attempt to guess title from first few lines or filename
    let detectedTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 120);
    if (lines.length > 0) {
      // Find the first line that looks like a title (not page headers or numbers)
      const candidate = lines.find(l => !/page|chapter|\d{4}|department|university|icfai|table of/i.test(l));
      if (candidate) {
        detectedTitle = candidate;
      }
    }

    const words = cleanText.split(/\s+/).filter(Boolean);

    return NextResponse.json({
      success: true,
      text: cleanText,
      title: detectedTitle,
      fileName,
      wordCount: words.length,
      fileType: ext || 'txt',
    });
  } catch (error: any) {
    console.error('Document extraction route failure:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to extract text from document' },
      { status: 500 }
    );
  }
}
