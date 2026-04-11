import { ParsedSlides } from '@/lib/types';

/**
 * Parse PDF file and extract text content
 * Note: This uses dynamic import to handle CommonJS module
 */
export async function parsePDF(buffer: Buffer, fileName: string): Promise<ParsedSlides> {
  try {
    // Dynamic import for pdf-parse with type assertion
    const pdfParseModule: any = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);

    // Extract and clean text
    const content = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      content,
      pageCount: data.numpages,
      fileName,
      fileType: 'pdf',
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function isValidPDF(buffer: Buffer): boolean {
  const header = buffer.slice(0, 4).toString('ascii');
  return header === '%PDF';
}
