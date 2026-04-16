'use client';

import { useState } from 'react';

interface Todo {
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos: initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleTodo = (index: number) => {
    setTodos(prev => prev.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  if (todos.length === 0) return null;

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="my-6 border border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-blue-900">Action Items</h3>
            <p className="text-sm text-blue-700">
              {completedCount} of {todos.length} completed
            </p>
          </div>
        </div>

        <svg
          className={`w-5 h-5 text-blue-700 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Todo List */}
      {!isCollapsed && (
        <div className="px-4 py-3 bg-white border-t border-blue-200">
          <div className="space-y-2">
            {todos.map((todo, index) => (
              <label
                key={index}
                className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(index)}
                  className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {todo.text}
                </span>
              </label>
            ))}
          </div>

          {completedCount === todos.length && todos.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <span className="text-green-700 font-medium">🎉 All tasks completed!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
