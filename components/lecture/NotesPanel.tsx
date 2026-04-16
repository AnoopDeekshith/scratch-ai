'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
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

// Colorful heading components for ReactMarkdown
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-extrabold mt-6 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold mt-5 mb-2 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-500 pl-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mt-4 mb-2 text-teal-700 dark:text-teal-400">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold mt-3 mb-1 text-amber-700 dark:text-amber-400">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-sm font-semibold mt-2 mb-1 text-orange-600 dark:text-orange-400">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-sm font-medium mt-2 mb-1 text-pink-600 dark:text-pink-400">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="text-gray-800 dark:text-gray-200 leading-relaxed my-2">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 my-2 text-gray-800 dark:text-gray-200 pl-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 my-2 text-gray-800 dark:text-gray-200 pl-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-800 dark:text-gray-200">{children}</li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block bg-gray-800 dark:bg-gray-950 text-gray-100 rounded-md p-3 text-sm font-mono overflow-x-auto my-2">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded px-1.5 py-0.5 text-sm font-mono">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-600 dark:text-gray-400 my-3 bg-purple-50 dark:bg-purple-950/30 py-2 rounded-r">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-4 border-gradient border-t border-gray-200 dark:border-gray-700" />
  ),
};

export default function NotesPanel({ notes, isGenerating, mode }: NotesPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [notes]);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Parse notes into markdown, diagram, and todo blocks
  const contentBlocks = useMemo(() => {
    if (!notes) return [];

    // If generating, show raw markdown for real-time streaming
    if (isGenerating) {
      return [{
        type: 'markdown' as const,
        content: notes,
      }];
    }

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
      diagramCount++;
    }

    // Extract todos
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

      workingNotes = workingNotes.replace(todoMatch[0], '').trim();
    }

    // Build blocks
    let lastIndex = 0;
    diagramMatches.forEach((diagram, i) => {
      if (diagram.index > lastIndex) {
        const markdownContent = workingNotes.slice(lastIndex, diagram.index).trim();
        if (markdownContent) {
          blocks.push({ type: 'markdown', content: markdownContent });
        }
      }
      blocks.push({
        type: 'diagram',
        content: diagram.content,
        id: `diagram-${Date.now()}-${i}`,
      });
      lastIndex = diagram.index + diagram.length;
    });

    if (lastIndex < workingNotes.length) {
      const remainingContent = workingNotes.slice(lastIndex).trim();
      if (remainingContent) {
        blocks.push({ type: 'markdown', content: remainingContent });
      }
    }

    if (todos.length > 0) {
      blocks.push({ type: 'todos', content: '', todos });
    }

    return blocks;
  }, [notes, isGenerating]);

  const panelContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI-Generated Notes</h2>
            {isGenerating && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Generating...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
              {mode === 'detailed' ? '📋 Detailed' : '✨ Simplified'}
            </span>
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            >
              {isFullscreen ? (
                // Compress icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                // Expand icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors"
      >
        {!notes ? (
          <div className="text-center text-gray-400 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">Notes will appear here</p>
            <p className="text-sm mt-2">Start recording to generate AI notes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contentBlocks.map((block, index) => (
              <div key={index}>
                {block.type === 'markdown' ? (
                  <div className="max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {block.content}
                    </ReactMarkdown>
                  </div>
                ) : block.type === 'diagram' ? (
                  <DiagramRenderer code={block.content} id={block.id!} />
                ) : block.type === 'todos' && block.todos ? (
                  <TodoList todos={block.todos} />
                ) : null}
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 italic py-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm font-medium">Writing notes...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col">
        {panelContent}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
      {panelContent}
    </div>
  );
}
