'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TranscriptPanel from '@/components/lecture/TranscriptPanel';
import RecordingControls from '@/components/lecture/RecordingControls';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

export default function LectureSessionPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params.id as string;
  const [sessionData, setSessionData] = useState<any>(null);
  const [mode, setMode] = useState<'detailed' | 'simple'>('detailed');

  const {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition();

  useEffect(() => {
    const data = localStorage.getItem(`session-${lectureId}`);
    if (data) {
      const parsed = JSON.parse(data);
      setSessionData(parsed);
      setMode(parsed.mode || 'detailed');
    }
  }, [lectureId]);

  const handleEndLecture = () => {
    stopListening();
    if (confirm('Are you sure you want to end this lecture?')) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Scratch.ai
                </span>
              </Link>
              <div className="text-gray-400">|</div>
              <div>
                <h1 className="font-semibold text-gray-900">{sessionData?.title || 'Lecture Session'}</h1>
                {sessionData?.courseName && (
                  <p className="text-sm text-gray-500">{sessionData.courseName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'detailed' | 'simple')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
              >
                <option value="detailed">Detailed Mode</option>
                <option value="simple">Simplified Mode</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleEndLecture}>
                End Lecture
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="flex-1 container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Left: Transcript Panel */}
          <TranscriptPanel
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
          />

          {/* Right: Notes Panel (Placeholder for Step 4) */}
          <div className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">AI-Generated Notes</h2>
              <p className="text-sm text-gray-500 mt-1">Mode: {mode === 'detailed' ? 'Detailed' : 'Simplified'}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-center text-gray-400 mt-12">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">AI Note Generation Coming in Step 4</p>
                <p className="text-sm mt-2">Notes will appear here as the lecture progresses</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="container mx-auto px-6">
          <RecordingControls
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
            onReset={resetTranscript}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {sessionData?.slidesContent && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <strong>Slides loaded:</strong> AI will use your uploaded slides for context
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
