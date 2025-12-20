import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { 
      setError('Fill all fields'); 
      return; 
    }
    
    setIsLoading(true);
    try {
      await authService.adminLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-sm mx-auto">
        <h1 className="font-serif text-4xl mb-6 text-hot-pink">Admin Login</h1>
        <p className="text-sm tracking-[0.3em] uppercase text-rose-gold mb-8">Enter the admin credentials</p>

        <div className="space-y-4">
          <input 
            className="border px-4 py-3 w-full" 
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <input 
            type="password" 
            className="border px-4 py-3 w-full" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button 
            className="border-2 border-hot-pink text-hot-pink px-10 py-4 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </section>
    </main>
  );
}
