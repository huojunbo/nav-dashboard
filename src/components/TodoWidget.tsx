import React, { useState, useEffect, FormEvent } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoWidget = (): React.JSX.Element => {
  const { t } = useTranslation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');

  // Fetch todos from API
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('nav-dashboard-todos');
      if (saved) {
        setTodos(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, completed: false }),
      });
      if (!response.ok) throw new Error('Failed to create todo');
      const created: Todo = await response.json();
      setTodos([created, ...todos]);
      setInput('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: number): Promise<void> => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updated: Todo = await response.json();
      setTodos(todos.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const removeTodo = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md w-full max-w-md mx-auto">
        <div className="text-center text-slate-400 py-4">{t('todos.loading')}</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-white">{t('todos.title')}</h3>

      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('todos.addPlaceholder')}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {todos.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">{t('todos.noTasks')}</p>
        )}
        {todos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-center justify-between p-3 rounded-lg border border-white/5 ${todo.completed ? 'bg-white/5' : 'bg-white/10'
              } transition-all`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${todo.completed
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-slate-500 hover:border-blue-400'
                  }`}
              >
                {todo.completed && <Check className="w-3 h-3" />}
              </button>
              <span className={`text-sm ${todo.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => removeTodo(todo.id)}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoWidget;
