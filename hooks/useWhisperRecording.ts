'use client';

import { useState, useRef, useCallback } from 'react';

interface UseWhisperRecordingReturn {
  transcript: string;
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export default function useWhisperRecording(): UseWhisperRecordingReturn {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendAudioChunk = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/transcribe-whisper', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // If Whisper fails, error will be caught and handled
        throw new Error(data.error || 'Transcription failed');
      }

      if (data.text && data.text.trim()) {
        setTranscript(prev => prev + ' ' + data.text.trim());
      }
    } catch (err: any) {
      console.error('Whisper transcription error:', err);
      setError(err.message || 'Transcription failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAndSendChunk = useCallback(() => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioChunksRef.current = [];
      sendAudioChunk(audioBlob);
    }
  }, []);

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Send audio chunks every 15 seconds
      chunkIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          processAndSendChunk();

          // Restart recording for next chunk
          setTimeout(() => {
            if (mediaRecorderRef.current && isRecording) {
              mediaRecorderRef.current.start();
            }
          }, 100);
        }
      }, 15000);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

    // Process final chunk
    processAndSendChunk();

    setIsRecording(false);
  };

  const resetTranscript = () => {
    setTranscript('');
    audioChunksRef.current = [];
  };

  return {
    transcript,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  };
}
