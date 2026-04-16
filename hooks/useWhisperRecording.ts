'use client';

import { useState, useRef, useCallback } from 'react';

interface UseWhisperRecordingReturn {
  transcript: string;
  interimTranscript: string;
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export default function useWhisperRecording(): UseWhisperRecordingReturn {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Use a ref to track recording state to avoid stale closure issues
  const isRecordingRef = useRef(false);

  const sendAudioChunk = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      setInterimTranscript('⚙ Processing audio...');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/transcribe-whisper', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      if (data.text && data.text.trim()) {
        setTranscript(prev => prev + (prev ? ' ' : '') + data.text.trim());
      }
      // After processing, if still recording show listening again
      if (isRecordingRef.current) {
        setInterimTranscript('🎙 Listening...');
      } else {
        setInterimTranscript('');
      }
    } catch (err: any) {
      console.error('Whisper transcription error:', err);
      setError(err.message || 'Transcription failed');
      setInterimTranscript('');
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

  const startNewMediaRecorder = useCallback((stream: MediaStream) => {
    let mimeType = 'audio/webm';
    // Check for supported mime types for cross-browser support
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      mimeType = 'audio/ogg;codecs=opus';
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Process the accumulated chunks when recorder stops
      if (audioChunksRef.current.length > 0 && isRecordingRef.current) {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        sendAudioChunk(audioBlob);
        // Restart recorder for next chunk
        setTimeout(() => {
          if (isRecordingRef.current && streamRef.current) {
            const nextRecorder = startNewMediaRecorder(streamRef.current);
            mediaRecorderRef.current = nextRecorder;
            nextRecorder.start();
          }
        }, 50);
      }
    };

    return mediaRecorder;
  }, [processAndSendChunk]);

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = startNewMediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      isRecordingRef.current = true;
      setIsRecording(true);
      setInterimTranscript('🎙 Listening...');

      // Stop current recorder every 5 seconds — onstop handler restarts it
      chunkIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;

    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Override onstop to do a final send without restarting
      mediaRecorderRef.current.onstop = () => {
        processAndSendChunk();
      };
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
    setInterimTranscript('');
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    audioChunksRef.current = [];
  };

  return {
    transcript,
    interimTranscript,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  };
}
