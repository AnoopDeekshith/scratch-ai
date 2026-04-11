import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generateNotes(
  transcriptChunk: string,
  slidesContent: string | undefined,
  previousNotes: string,
  mode: 'detailed' | 'simple',
  systemPrompt: string
): Promise<string> {
  const context = `
${slidesContent ? `LECTURE SLIDES:\n${slidesContent}\n\n` : ''}
${previousNotes ? `PREVIOUS NOTES:\n${previousNotes}\n\n` : ''}
CURRENT TRANSCRIPT SEGMENT:\n${transcriptChunk}
`.trim();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: context,
      },
    ],
    system: systemPrompt,
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

export async function* streamNotes(
  transcriptChunk: string,
  slidesContent: string | undefined,
  previousNotes: string,
  mode: 'detailed' | 'simple',
  systemPrompt: string
): AsyncGenerator<string> {
  const context = `
${slidesContent ? `LECTURE SLIDES:\n${slidesContent}\n\n` : ''}
${previousNotes ? `PREVIOUS NOTES:\n${previousNotes}\n\n` : ''}
CURRENT TRANSCRIPT SEGMENT:\n${transcriptChunk}
`.trim();

  const stream = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: context }],
    system: systemPrompt,
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

export { client };
