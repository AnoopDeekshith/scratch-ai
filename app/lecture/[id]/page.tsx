'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TranscriptPanel from '@/components/lecture/TranscriptPanel';
import NotesPanel from '@/components/lecture/NotesPanel';
import RecordingControls from '@/components/lecture/RecordingControls';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useWhisperRecording from '@/hooks/useWhisperRecording';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function LectureSessionPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params.id as string;
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [sessionData, setSessionData] = useState<any>(null);
  const [mode, setMode] = useState<'detailed' | 'simple'>('detailed');
  const [notes, setNotes] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [transcriptionMethod, setTranscriptionMethod] = useState<'webspeech' | 'whisper'>('whisper');
  const lastProcessedLength = useRef(0);
  const generationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Web Speech API hook
  const webSpeech = useSpeechRecognition();

  // Whisper API hook
  const whisper = useWhisperRecording();

  // Use the selected transcription method
  const {
    transcript,
    isListening: isActivelyListening,
    startListening: startActiveListening,
    stopListening: stopActiveListening,
    resetTranscript: resetActiveTranscript,
    error,
  } = transcriptionMethod === 'whisper' ? {
    transcript: whisper.transcript,
    isListening: whisper.isRecording,
    startListening: whisper.startRecording,
    stopListening: whisper.stopRecording,
    resetTranscript: whisper.resetTranscript,
    error: whisper.error,
  } : {
      transcript: webSpeech.transcript,
      isListening: webSpeech.isListening,
      startListening: webSpeech.startListening,
      stopListening: webSpeech.stopListening,
      resetTranscript: webSpeech.resetTranscript,
      error: webSpeech.error,
    };

  const interimTranscript = transcriptionMethod === 'webspeech' ? webSpeech.interimTranscript : whisper.interimTranscript;
  const isProcessing = transcriptionMethod === 'whisper' ? whisper.isProcessing : false;

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

    const CHUNK_LENGTH = 100; // Process every ~100 characters for faster feedback
    const currentLength = transcript.length;

    if (currentLength - lastProcessedLength.current > CHUNK_LENGTH) {
      // Debounce: wait 1.5 seconds of no new input
      if (generationTimeout.current) {
        clearTimeout(generationTimeout.current);
      }

      generationTimeout.current = setTimeout(() => {
        generateNotes(transcript.slice(lastProcessedLength.current));
        lastProcessedLength.current = currentLength;
      }, 1500);
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
    stopActiveListening();
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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden transition-colors">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-colors">
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
                <h1 className="font-semibold text-gray-900 dark:text-gray-100">{sessionData?.title || 'Lecture Session'}</h1>
                {sessionData?.courseName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{sessionData.courseName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={transcriptionMethod}
                onChange={(e) => setTranscriptionMethod(e.target.value as 'webspeech' | 'whisper')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={isActivelyListening}
              >
                <option value="whisper">OpenAI Whisper (High Accuracy)</option>
                <option value="webspeech">Web Speech (Free, Real-time)</option>
              </select>
              <select
                value={mode}
                onChange={(e) => handleModeChange(e.target.value as 'detailed' | 'simple')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="detailed">Detailed Mode</option>
                <option value="simple">Simplified Mode</option>
              </select>
              <button
                onClick={toggleDarkMode}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <Button variant="outline" size="sm" onClick={handleEndLecture}>
                End Lecture
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-6 py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <TranscriptPanel
              transcript={transcript}
              interimTranscript={interimTranscript}
              isListening={isActivelyListening}
            />
            <NotesPanel
              notes={notes}
              isGenerating={isGeneratingNotes}
              mode={mode}
            />
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 shadow-lg transition-colors">
        <div className="container mx-auto px-6">
          <RecordingControls
            isListening={isActivelyListening}
            onStart={startActiveListening}
            onStop={stopActiveListening}
            onReset={() => {
              resetActiveTranscript();
              setNotes('');
              lastProcessedLength.current = 0;
            }}
          />

          {isProcessing && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Processing audio with Whisper...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
              {transcriptionMethod === 'whisper' && (
                <p className="mt-2">Try switching to Web Speech API if Whisper is unavailable.</p>
              )}
            </div>
          )}

          {sessionData?.slidesContent && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-900 dark:text-blue-300">
              <strong>Slides loaded:</strong> AI will use your uploaded slides for context
            </div>
          )}

          {transcriptionMethod === 'whisper' && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <strong>Using OpenAI Whisper:</strong> High-accuracy transcription (~$0.006/min). Audio is processed in 5-second chunks.
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
