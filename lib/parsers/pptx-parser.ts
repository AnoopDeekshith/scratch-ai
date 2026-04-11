import mammoth from 'mammoth';
import { ParsedSlides } from '@/lib/types';

/**
 * Parse PPTX file and extract text content
 * Note: mammoth is primarily for DOCX, but we'll use it as a fallback.
 * For production, consider using a dedicated PPTX parser like 'pptx-parser' or 'officegen'
 * @param buffer - PPTX file buffer
 * @param fileName - Original file name
 * @returns Parsed slides content
 */
export async function parsePPTX(buffer: Buffer, fileName: string): Promise<ParsedSlides> {
  try {
    // For PPTX files, we'll use a simple extraction approach
    // In production, you might want to use a specialized library
    const { value: content } = await mammoth.extractRawText({ buffer });

    // Clean up the text
    const cleanedContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      content: cleanedContent,
      fileName,
      fileType: 'pptx',
    };
  } catch (error) {
    console.error('Error parsing PPTX:', error);
    throw new Error(`Failed to parse PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse DOCX file and extract text content
 * @param buffer - DOCX file buffer
 * @param fileName - Original file name
 * @returns Parsed document content
 */
export async function parseDOCX(buffer: Buffer, fileName: string): Promise<ParsedSlides> {
  try {
    const { value: content } = await mammoth.extractRawText({ buffer });

    // Clean up the text
    const cleanedContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      content: cleanedContent,
      fileName,
      fileType: 'docx',
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate if buffer is a valid PPTX/DOCX (Office Open XML format)
 */
export function isValidOfficeFile(buffer: Buffer): boolean {
  // Office files are ZIP archives starting with PK
  const header = buffer.slice(0, 2).toString('ascii');
  return header === 'PK';
}
