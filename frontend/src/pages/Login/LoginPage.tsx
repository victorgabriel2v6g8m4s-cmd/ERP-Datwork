import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate(); // 🧭 Gancho de navegação por URL real
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação de acesso simulada profissional
    if (username.trim() && password.trim()) {
      console.log(`[AUTH] Usuário "${username}" autenticado com sucesso.`);
      navigate('/home'); // Push na URL para a Homepage Central
    } else {
      setError('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 z-50 font-sans select-none">
      <motion.form
        onSubmit={handleLoginSubmit}
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="w-full max-w-sm p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl space-y-5"
      >
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight mt-3">Portal Agenda Mágica</h2>
          <p className="text-xs text-slate-400 font-medium">Faça login para gerenciar seu ecossistema</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs text-red-400 font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-3.5">
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário ou E-mail"
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-white placeholder-slate-500 transition-colors"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de Acesso"
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-white placeholder-slate-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Entrar no Sistema</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.form>
    </div>
  );
}
