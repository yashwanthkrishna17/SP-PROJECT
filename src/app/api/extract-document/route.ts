import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name || 'uploaded_document';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';

    let extractedText = '';

    if (ext === 'pdf') {
      // Save buffer to temporary file for isolated, native Node extraction
      tempFilePath = path.join(os.tmpdir(), `viva_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);
      fs.writeFileSync(tempFilePath, buffer);

      const scriptPath = path.join(process.cwd(), 'src', 'lib', 'extract-pdf.js');
      const { stdout } = await execFileAsync(process.execPath, [scriptPath, tempFilePath], {
        maxBuffer: 50 * 1024 * 1024,
      });

      extractedText = stdout || '';
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const res = await mammoth.extractRawText({ buffer });
      extractedText = res.value || '';
    } else {
      extractedText = buffer.toString('utf-8');
    }

    // Clean up extracted text
    const cleanText = (extractedText || '')
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Determine detected title from first meaningful lines or file name
    let detectedTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const lines = cleanText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5 && l.length < 140);

    for (const line of lines.slice(0, 15)) {
      if (
        !/page|chapter|\d{4}|department|university|faculty|icfai|table of|author|guide|abstract|report on/i.test(line) &&
        line.split(/\s+/).length >= 2
      ) {
        detectedTitle = line;
        break;
      }
    }

    const words = cleanText.split(/\s+/).filter(Boolean);

    return NextResponse.json({
      success: true,
      text: cleanText,
      title: detectedTitle,
      fileName,
      wordCount: words.length,
      fileType: ext,
    });
  } catch (error: any) {
    console.error('Document extraction route failure:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to extract text from document' },
      { status: 500 }
    );
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {}
    }
  }
}
