'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TranscriptPanel from '@/components/lecture/TranscriptPanel';
import NotesPanel from '@/components/lecture/NotesPanel';
import RecordingControls from '@/components/lecture/RecordingControls';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

export default function LectureSessionPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params.id as string;
  const [sessionData, setSessionData] = useState<any>(null);
  const [mode, setMode] = useState<'detailed' | 'simple'>('detailed');
  const [notes, setNotes] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const lastProcessedLength = useRef(0);
  const generationTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-generate notes when transcript grows
  useEffect(() => {
    if (!transcript) return;

    const CHUNK_LENGTH = 200; // Process every ~200 characters
    const currentLength = transcript.length;

    if (currentLength - lastProcessedLength.current > CHUNK_LENGTH) {
      // Debounce: wait 3 seconds of no new input
      if (generationTimeout.current) {
        clearTimeout(generationTimeout.current);
      }

      generationTimeout.current = setTimeout(() => {
        generateNotes(transcript.slice(lastProcessedLength.current));
        lastProcessedLength.current = currentLength;
      }, 3000);
    }
  }, [transcript]);

  const generateNotes = async (transcriptChunk: string) => {
    if (isGeneratingNotes || !transcriptChunk.trim()) return;

    setIsGeneratingNotes(true);

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptChunk,
          slidesContent: sessionData?.slidesContent,
          previousNotes: notes,
          mode,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate notes');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let chunk = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunk = decoder.decode(value, { stream: true });
          setNotes(prev => prev + chunk);
        }
        setNotes(prev => prev + '\n\n---\n\n');
      }
    } catch (err) {
      console.error('Error generating notes:', err);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleEndLecture = () => {
    stopListening();
    if (confirm('Are you sure you want to end this lecture?')) {
      router.push('/dashboard');
    }
  };

  const handleModeChange = (newMode: 'detailed' | 'simple') => {
    setMode(newMode);
    // Regenerate all notes with new mode
    if (transcript && confirm('Regenerate all notes in ' + newMode + ' mode?')) {
      setNotes('');
      lastProcessedLength.current = 0;
      generateNotes(transcript);
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
                onChange={(e) => handleModeChange(e.target.value as 'detailed' | 'simple')}
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
          <TranscriptPanel
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
          />
          <NotesPanel
            notes={notes}
            isGenerating={isGeneratingNotes}
            mode={mode}
          />
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="container mx-auto px-6">
          <RecordingControls
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
            onReset={() => {
              resetTranscript();
              setNotes('');
              lastProcessedLength.current = 0;
            }}
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
