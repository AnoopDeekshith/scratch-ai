import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    return new Response(
      JSON.stringify({ text: transcription }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Whisper transcription error:', error);

    // Check for quota/billing issues
    if (error.code === 'insufficient_quota') {
      return new Response(
        JSON.stringify({
          error: 'OpenAI quota exceeded. Please check your billing.',
          fallback: true
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to transcribe audio',
        details: error.message,
        fallback: true
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
