'use client';

import Button from '@/components/ui/Button';

interface RecordingControlsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
  onReset: () => void;
}

export default function RecordingControls({ isListening, onStart, onStop, onReset }: RecordingControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      {!isListening ? (
        <Button onClick={onStart} variant="primary" size="lg" className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start Recording
        </Button>
      ) : (
        <Button onClick={onStop} variant="secondary" size="lg" className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
          Stop Recording
        </Button>
      )}

      <Button onClick={onReset} variant="outline" size="lg">
        Reset
      </Button>
    </div>
  );
}
