import { NextRequest, NextResponse } from 'next/server';
import { parsePDF, isValidPDF } from '@/lib/parsers/pdf-parser';
import { parsePPTX, parseDOCX, isValidOfficeFile } from '@/lib/parsers/pptx-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file extension
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    let parsedContent;

    // Parse based on file type
    switch (fileExtension) {
      case 'pdf':
        if (!isValidPDF(buffer)) {
          return NextResponse.json(
            { error: 'Invalid PDF file' },
            { status: 400 }
          );
        }
        parsedContent = await parsePDF(buffer, fileName);
        break;

      case 'pptx':
        if (!isValidOfficeFile(buffer)) {
          return NextResponse.json(
            { error: 'Invalid PPTX file' },
            { status: 400 }
          );
        }
        parsedContent = await parsePPTX(buffer, fileName);
        break;

      case 'docx':
        if (!isValidOfficeFile(buffer)) {
          return NextResponse.json(
            { error: 'Invalid DOCX file' },
            { status: 400 }
          );
        }
        parsedContent = await parseDOCX(buffer, fileName);
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload PDF, PPTX, or DOCX files.' },
          { status: 400 }
        );
    }

    // Return parsed content
    return NextResponse.json({
      success: true,
      data: parsedContent,
      message: 'Slides parsed successfully',
    });

  } catch (error) {
    console.error('Error in parse-slides API:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse slides',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
