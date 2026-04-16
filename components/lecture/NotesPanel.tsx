'use client';

import { useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import DiagramRenderer from './DiagramRenderer';
import TodoList from './TodoList';

interface NotesPanelProps {
  notes: string;
  isGenerating: boolean;
  mode: 'detailed' | 'simple';
}

interface ContentBlock {
  type: 'markdown' | 'diagram' | 'todos';
  content: string;
  id?: string;
  todos?: Array<{ text: string; completed: boolean }>;
}

export default function NotesPanel({ notes, isGenerating, mode }: NotesPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes]);

  // Parse notes into markdown, diagram, and todo blocks
  const contentBlocks = useMemo(() => {
    if (!notes) return [];

    const blocks: ContentBlock[] = [];
    let workingNotes = notes;

    // Extract diagrams
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    const diagramMatches: Array<{ content: string; index: number; length: number }> = [];
    let match;
    let diagramCount = 0;

    while ((match = mermaidRegex.exec(notes)) !== null) {
      diagramMatches.push({
        content: match[1].trim(),
        index: match.index,
        length: match[0].length,
      });
    }

    // Extract todos (looking for Action Items section with checkbox list)
    const todoSectionRegex = /\*\*Action Items:\*\*\s*((?:- \[[ x]\].*\n?)+)/gi;
    const todoMatch = todoSectionRegex.exec(notes);
    let todos: Array<{ text: string; completed: boolean }> = [];

    if (todoMatch) {
      const todoLines = todoMatch[1].trim().split('\n');
      todos = todoLines
        .map(line => {
          const checkboxMatch = line.match(/- \[([ x])\]\s*(.+)/i);
          if (checkboxMatch) {
            return {
              text: checkboxMatch[2].trim(),
              completed: checkboxMatch[1].toLowerCase() === 'x',
            };
          }
          return null;
        })
        .filter((todo): todo is { text: string; completed: boolean } => todo !== null);

      // Remove todo section from working notes
      workingNotes = workingNotes.replace(todoMatch[0], '').trim();
    }

    // Build blocks
    let lastIndex = 0;
    diagramMatches.forEach((diagram, i) => {
      // Add markdown content before this diagram
      if (diagram.index > lastIndex) {
        const markdownContent = workingNotes.slice(lastIndex, diagram.index).trim();
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
        content: diagram.content,
        id: `diagram-${Date.now()}-${i}`,
      });

      lastIndex = diagram.index + diagram.length;
    });

    // Add remaining markdown content
    if (lastIndex < workingNotes.length) {
      const remainingContent = workingNotes.slice(lastIndex).trim();
      if (remainingContent) {
        blocks.push({
          type: 'markdown',
          content: remainingContent,
        });
      }
    }

    // Add todos at the end if any
    if (todos.length > 0) {
      blocks.push({
        type: 'todos',
        content: '',
        todos,
      });
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
                  <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{block.content}</ReactMarkdown>
                  </div>
                ) : block.type === 'diagram' ? (
                  <DiagramRenderer code={block.content} id={block.id!} />
                ) : block.type === 'todos' && block.todos ? (
                  <TodoList todos={block.todos} />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
