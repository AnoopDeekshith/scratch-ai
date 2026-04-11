import { NextRequest } from 'next/server';
import { streamNotes } from '@/lib/ai/claude';
import { getSystemPrompt } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  try {
    const { transcriptChunk, slidesContent, previousNotes, mode } = await request.json();

    if (!transcriptChunk || transcriptChunk.trim().length < 10) {
      return new Response('Transcript chunk too short', { status: 400 });
    }

    const systemPrompt = getSystemPrompt(mode || 'detailed');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamNotes(
            transcriptChunk,
            slidesContent,
            previousNotes || '',
            mode || 'detailed',
            systemPrompt
          )) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error generating notes:', error);
    return new Response('Failed to generate notes', { status: 500 });
  }
}
