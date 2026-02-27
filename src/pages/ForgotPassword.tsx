import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Mail } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            alt="Modern Closet" 
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
            Recover your<br />account access
          </h1>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto px-6 pt-24 pb-12 flex flex-col">
          <Link to="/login" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors self-end mb-12">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-500">No worries! Enter your email and we'll send you reset instructions.</p>
          </div>

          {success ? (
            <div className="p-6 bg-pink-50 text-pink-700 rounded-2xl border border-pink-100 text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Mail className="w-6 h-6 text-[#ed4690]" />
              </div>
              <p className="font-semibold mb-2">Check your email</p>
              <p className="text-sm">We've sent password recovery instructions to your email address.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-6 text-sm font-bold text-[#ed4690] hover:underline"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#ed4690] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#ed4690] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-pink-200 disabled:opacity-70 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Send Instructions'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
