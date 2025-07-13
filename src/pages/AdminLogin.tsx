import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Check admin role
    const user = data.user;
    if (user?.user_metadata?.role === 'admin') {
      navigate('/admin');
    } else {
      setError('You are not authorized as an admin.');
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleLogin} className="bg-white/10 p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Admin Login</h2>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="Admin Email"
          className="rounded-xl bg-black/60 border-tiketx-blue/40 text-white"
        />
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="rounded-xl bg-black/60 border-tiketx-violet/40 text-white"
        />
        <Button type="submit" className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-tiketx-pink via-tiketx-violet to-tiketx-blue text-white shadow-lg" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        {error && <div className="text-red-400 text-center text-sm">{error}</div>}
      </form>
    </div>
  );
} 