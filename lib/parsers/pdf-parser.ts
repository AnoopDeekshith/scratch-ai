import pdf from 'pdf-parse';
import { ParsedSlides } from '@/lib/types';

/**
 * Parse PDF file and extract text content
 * @param buffer - PDF file buffer
 * @param fileName - Original file name
 * @returns Parsed slides content
 */
export async function parsePDF(buffer: Buffer, fileName: string): Promise<ParsedSlides> {
  try {
    const data = await pdf(buffer);

    // Extract text content
    let content = data.text;

    // Clean up the text
    content = content
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
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

/**
 * Validate if buffer is a valid PDF
 */
export function isValidPDF(buffer: Buffer): boolean {
  // PDF files start with %PDF
  const header = buffer.slice(0, 4).toString('ascii');
  return header === '%PDF';
}
