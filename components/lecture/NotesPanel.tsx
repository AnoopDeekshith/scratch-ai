'use client';

import { useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import DiagramRenderer from './DiagramRenderer';

interface NotesPanelProps {
  notes: string;
  isGenerating: boolean;
  mode: 'detailed' | 'simple';
}

interface ContentBlock {
  type: 'markdown' | 'diagram';
  content: string;
  id?: string;
}

export default function NotesPanel({ notes, isGenerating, mode }: NotesPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes]);

  // Parse notes into markdown and diagram blocks
  const contentBlocks = useMemo(() => {
    if (!notes) return [];

    const blocks: ContentBlock[] = [];
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let diagramCount = 0;

    while ((match = mermaidRegex.exec(notes)) !== null) {
      // Add markdown content before this diagram
      if (match.index > lastIndex) {
        const markdownContent = notes.slice(lastIndex, match.index).trim();
        if (markdownContent) {
          blocks.push({
            type: 'markdown',
            content: markdownContent,
          });
        }
      }

      // Add the diagram
      blocks.push({
        type: 'diagram',
        content: match[1].trim(),
        id: `diagram-${Date.now()}-${diagramCount++}`,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining markdown content
    if (lastIndex < notes.length) {
      const remainingContent = notes.slice(lastIndex).trim();
      if (remainingContent) {
        blocks.push({
          type: 'markdown',
          content: remainingContent,
        });
      }
    }

    return blocks;
  }, [notes]);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI-Generated Notes</h2>
          {isGenerating && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600">Generating...</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Mode: {mode === 'detailed' ? 'Detailed' : 'Simplified'}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {!notes ? (
          <div className="text-center text-gray-400 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">Notes will appear here</p>
            <p className="text-sm mt-2">Start recording to generate AI notes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contentBlocks.map((block, index) => (
              <div key={index}>
                {block.type === 'markdown' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{block.content}</ReactMarkdown>
                  </div>
                ) : (
                  <DiagramRenderer code={block.content} id={block.id!} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
