// Core types for Scratch.ai

export type LectureMode = 'detailed' | 'simple';

export type FileType = 'pdf' | 'pptx' | 'docx';

export interface ParsedSlides {
  content: string;
  pageCount?: number;
  slideCount?: number;
  fileName: string;
  fileType: FileType;
}

export interface LectureSession {
  id: string;
  userId?: string;
  title: string;
  courseName?: string;
  mode: LectureMode;
  transcriptFull?: string;
  slidesContent?: string;
  notesDetailed?: string;
  notesSimple?: string;
  durationMinutes?: number;
  createdAt: Date;
}

export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

export interface GeneratedNote {
  id: string;
  chunkId: string;
  content: string;
  mode: LectureMode;
  timestamp: Date;
}

export interface TodoItem {
  id: string;
  lectureId: string;
  task: string;
  dueDate?: Date;
  urgency: 'high' | 'medium' | 'low';
  type: 'exam' | 'assignment' | 'reading' | 'project' | 'other';
  originalQuote?: string;
  isCompleted: boolean;
  reminderAt?: Date;
}

export interface QuizQuestion {
  id: number;
  type: 'factual' | 'conceptual' | 'application' | 'comparison' | 'teach';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  idealAnswer: string;
  keyPoints: string[];
  commonMistakes: string[];
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
  answerType: 'text' | 'voice' | 'image';
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}
