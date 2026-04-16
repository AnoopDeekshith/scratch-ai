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

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Live Transcript</h2>
        {isListening && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600">Recording</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {!transcript && !interimTranscript && (
          <div className="text-center text-gray-400 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-lg">Waiting for speech...</p>
            <p className="text-sm mt-2">Click Start Recording to begin</p>
          </div>
        )}

        {transcript && (
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{transcript}</p>
        )}

        {interimTranscript && (
          <p className="text-blue-600 italic leading-relaxed font-medium animate-pulse">{interimTranscript}</p>
        )}
      </div>
    </div>
  );
}
