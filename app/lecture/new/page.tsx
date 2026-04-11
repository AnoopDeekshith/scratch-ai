'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SlideUploader from '@/components/lecture/SlideUploader';
import { ParsedSlides, LectureMode } from '@/lib/types';

export default function NewLecturePage() {
  const router = useRouter();
  const [lectureTitle, setLectureTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [mode, setMode] = useState<LectureMode>('detailed');
  const [slidesContent, setSlidesContent] = useState<ParsedSlides | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleSlideUpload = (parsedSlides: ParsedSlides) => {
    setSlidesContent(parsedSlides);
    console.log('Slides uploaded:', parsedSlides);
  };

  const handleStartLecture = async () => {
    if (!lectureTitle.trim()) {
      alert('Please enter a lecture title');
      return;
    }

    setIsStarting(true);

    try {
      // For now, we'll create a simple session ID
      // In Step 8, this will be stored in Supabase
      const sessionId = `lecture-${Date.now()}`;

      // Store session data in localStorage for now
      const sessionData = {
        id: sessionId,
        title: lectureTitle,
        courseName: courseName || undefined,
        mode,
        slidesContent: slidesContent?.content,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(`session-${sessionId}`, JSON.stringify(sessionData));

      // Navigate to the lecture session page
      router.push(`/lecture/${sessionId}`);
    } catch (error) {
      console.error('Error starting lecture:', error);
      alert('Failed to start lecture. Please try again.');
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Scratch.ai
              </span>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Start New Lecture</h1>
          <p className="text-lg text-gray-600">
            Set up your lecture session and optionally upload slides for better AI context
          </p>
        </div>

        <div className="space-y-6">
          {/* Lecture Details Card */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lecture Details</h2>

            <div className="space-y-4">
              {/* Lecture Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g., Introduction to Transformers"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Course Name */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name (Optional)
                </label>
                <input
                  id="course"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., CS 229 - Machine Learning"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note-Taking Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('detailed')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      mode === 'detailed'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">Detailed</div>
                    <div className="text-sm text-gray-600">
                      Comprehensive notes with technical terms and depth
                    </div>
                  </button>

                  <button
                    onClick={() => setMode('simple')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      mode === 'simple'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">Simplified</div>
                    <div className="text-sm text-gray-600">
                      Easy-to-understand explanations with analogies
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Slide Upload Card */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Lecture Slides</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload your lecture slides (PDF, PPTX, or DOCX) to give the AI more context.
              This helps generate more accurate and comprehensive notes.
            </p>
            <SlideUploader onUploadComplete={handleSlideUpload} />

            {slidesContent && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Slides parsed successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                      {slidesContent.fileName} • {slidesContent.pageCount || 'Multiple'} pages • {slidesContent.content.length} characters extracted
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Start Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleStartLecture}
              disabled={!lectureTitle.trim() || isStarting}
              size="lg"
              className="flex-1"
            >
              {isStarting ? 'Starting...' : 'Start Lecture Session'}
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 text-sm text-blue-900">
                <p className="font-medium mb-1">Before you start:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Make sure your browser allows microphone access</li>
                  <li>For best results, use Chrome or Edge browser</li>
                  <li>Find a quiet environment with minimal background noise</li>
                  <li>You can switch between modes during the lecture</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
