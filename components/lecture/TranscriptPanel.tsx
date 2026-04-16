'use client';

import { useEffect, useRef } from 'react';

interface TranscriptPanelProps {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
}

export default function TranscriptPanel({ transcript, interimTranscript, isListening }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const isProcessing = interimTranscript.includes('Processing');

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live Transcript</h2>
        {isListening && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-amber-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${isProcessing ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {isProcessing ? 'Processing' : 'Recording'}
            </span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {!transcript && !interimTranscript && (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-lg font-medium">Waiting for speech...</p>
            <p className="text-sm mt-2">Click Start Recording to begin</p>
          </div>
        )}

        {transcript && (
          <p className="text-gray-900 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">
            {transcript}
          </p>
        )}

        {interimTranscript && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isProcessing
              ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
            }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${isProcessing ? 'bg-amber-500' : 'bg-blue-500'}`} />
            <p className={`text-sm italic font-medium ${isProcessing
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-blue-700 dark:text-blue-300'
              }`}>
              {interimTranscript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
