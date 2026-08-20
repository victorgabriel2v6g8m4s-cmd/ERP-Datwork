import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, ShieldAlert, User } from 'lucide-react';
import { ROUTE_PATHS } from '../../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../../i18n/system.ts';
import { SYSTEM_THEME } from '../../theme/system.ts';

export function LoginPage() {
  const navigate = useNavigate();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(SYSTEM_TEXTS.login.requiredFields);
      (username.trim() ? passwordInputRef : usernameInputRef).current?.focus();
      return;
    }

    navigate(ROUTE_PATHS.home);
  };

  return (
    <main className={SYSTEM_THEME.login.shell}>
      <motion.form
        noValidate
        onSubmit={handleLoginSubmit}
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className={SYSTEM_THEME.login.form}
        aria-describedby="development-access-notice"
      >
        <header className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-3 text-lg font-black tracking-tight text-white">{SYSTEM_TEXTS.login.title}</h1>
          <p className="text-xs font-medium text-slate-400">{SYSTEM_TEXTS.login.subtitle}</p>
        </header>

        <div id="development-access-notice" className={SYSTEM_THEME.login.notice} role="note">
          <ShieldAlert className="mr-1 inline h-4 w-4" aria-hidden="true" />
          {SYSTEM_TEXTS.login.demoNotice}
        </div>

        {error && (
          <div id="login-error" className={SYSTEM_THEME.login.error} role="alert">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={SYSTEM_THEME.login.label} htmlFor="demo-username">
              {SYSTEM_TEXTS.login.usernameLabel}
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                ref={usernameInputRef}
                id="demo-username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={SYSTEM_TEXTS.login.usernamePlaceholder}
                aria-invalid={Boolean(error && !username.trim())}
                aria-describedby={error ? 'login-error development-access-notice' : 'development-access-notice'}
                className={SYSTEM_THEME.login.input}
              />
            </div>
          </div>

          <div>
            <label className={SYSTEM_THEME.login.label} htmlFor="demo-password">
              {SYSTEM_TEXTS.login.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                ref={passwordInputRef}
                id="demo-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={SYSTEM_TEXTS.login.passwordPlaceholder}
                aria-invalid={Boolean(error && !password.trim())}
                aria-describedby={error ? 'login-error development-access-notice' : 'development-access-notice'}
                className={SYSTEM_THEME.login.input}
              />
            </div>
          </div>
        </div>

        <button type="submit" className={SYSTEM_THEME.login.submit}>
          <span>{SYSTEM_TEXTS.login.submit}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </motion.form>
    </main>
  );
}
