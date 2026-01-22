import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthFormProps {
  onSuccess: (token: string, user: { id: number; username: string; email: string }) => void;
}

const AuthForm = ({ onSuccess }: AuthFormProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload =
        mode === 'login'
          ? { email, password }
          : { email, password, username: username || email.split('@')[0] };
      const res = await fetch(`${API_BASE}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auth failed');
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">
          {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
        </h2>
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('auth.username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('auth.usernamePlaceholder')}
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={t('auth.passwordPlaceholder')}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            {loading
              ? t('common.loading')
              : mode === 'login'
              ? t('auth.login')
              : t('auth.register')}
          </button>
        </form>
        <div className="mt-4 text-sm text-slate-400">
          {mode === 'login' ? (
            <button className="hover:text-blue-400" onClick={() => setMode('register')}>
              {t('auth.noAccount')}
            </button>
          ) : (
            <button className="hover:text-blue-400" onClick={() => setMode('login')}>
              {t('auth.haveAccount')}
            </button>
          )}
        </div>
      </div>
  );
};

export default AuthForm;

