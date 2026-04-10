import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, ShoppingBag, Heart, Sparkles } from 'lucide-react';

export default function NotFound() {
  const popularCategories = [
    { name: 'New Arrivals', href: '/arrivals', icon: <Sparkles className="w-5 h-5" /> },
    { name: 'Party Dresses', href: '/party', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Special Occasion', href: '/special-occasion', icon: <Heart className="w-5 h-5" /> },
    { name: 'Shop All', href: '/shop', icon: <ArrowRight className="w-5 h-5" /> },
  ];

  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-20 px-6">
      <SEO 
        title="Page Not Found"
        description="The page you are looking for might have been moved or deleted. Explore our popular categories of girls dresses instead."
      />
      
      <div className="max-w-2xl w-full text-center">
        <span className="text-hot-pink font-serif text-8xl md:text-9xl mb-8 block opacity-20">404</span>
        <h1 className="font-serif text-4xl md:text-6xl text-gray-900 mb-6">Lost in the Magic?</h1>
        <p className="text-gray-600 text-lg mb-12 max-w-md mx-auto">
          It seems the page you're looking for has wandered off. Don't worry, there's plenty more to discover in our closet.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {popularCategories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.href}
              className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-hot-pink/30 hover:bg-pink-50/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-hot-pink shadow-sm">
                  {cat.icon}
                </div>
                <span className="font-semibold text-gray-900">{cat.name}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-hot-pink transition-colors" />
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="inline-block bg-hot-pink text-white px-12 py-4 rounded-full font-semibold hover:bg-hot-pink/90 transition-all shadow-lg shadow-hot-pink/20"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
