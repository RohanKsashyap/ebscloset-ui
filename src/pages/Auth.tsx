import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Chrome, 
  Facebook 
} from 'lucide-react';
import { authService } from '../services/authService';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    rememberMe: false,
    agreeMarketing: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.register(
          formData.fullName, 
          formData.email, 
          formData.password
        );
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    } 
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200" 
            alt="Modern Closet Collection" 
            className="w-full h-full object-cover grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="font-bold tracking-widest text-lg uppercase">Modern Closet</span>
          </div>
          
          <h1 className="text-6xl font-bold leading-tight mb-8">
            Curated style<br />for the whole<br />family
          </h1>
          
          <p className="text-lg text-gray-200 max-w-md leading-relaxed">
            Elevating your wardrobe with essentials designed for Men, Women, and Kids.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto px-6 pt-24 pb-12 flex flex-col">
          {/* Back Button */}
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors self-end mb-12">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome' : 'Create Account'}
            </h2>
            <p className="text-gray-500">
              {isLogin 
                ? 'Please enter your details to access your account.' 
                : 'Join our community for exclusive access and updates.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            <button 
              onClick={() => navigate('/login')}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${
                isLogin ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${
                !isLogin ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <input 
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#ed4690] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="hello@example.com"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#ed4690] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-900">Password</label>
                {isLogin && (
                  <Link to="/forgot-password" className="text-xs font-semibold text-[#ed4690] hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#ed4690] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id={isLogin ? "rememberMe" : "agreeMarketing"}
                name={isLogin ? "rememberMe" : "agreeMarketing"}
                checked={isLogin ? formData.rememberMe : formData.agreeMarketing}
                onChange={handleInputChange}
                className="w-5 h-5 rounded-lg border-gray-300 text-[#ed4690] focus:ring-[#ed4690] cursor-pointer"
              />
              <label htmlFor={isLogin ? "rememberMe" : "agreeMarketing"} className="text-sm text-gray-500 cursor-pointer">
                {isLogin 
                  ? 'Remember me for 30 days' 
                  : 'I agree to receive personalized marketing emails and accept the terms of service.'}
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#ed4690] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-pink-200 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Or {isLogin ? 'continue' : 'sign up'} with
              </span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-4 border border-gray-900 rounded-full hover:bg-gray-50 transition-all font-semibold text-sm">
                <Chrome className="w-5 h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 py-4 border border-gray-900 rounded-full hover:bg-gray-50 transition-all font-semibold text-sm">
                <Facebook className="w-5 h-5 fill-current" />
                Meta
              </button>
            </div>
          </div>

          <p className="mt-12 text-center text-xs text-gray-500 leading-relaxed">
            By {isLogin ? 'signing in' : 'creating an account'}, you agree to our<br />
            <Link to="/terms" className="underline hover:text-black">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-black">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
