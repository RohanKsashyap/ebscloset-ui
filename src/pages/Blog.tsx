import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { blogService, BlogPost } from '../services/blogService';
import { ArrowRight, Calendar, User } from 'lucide-react';
import SEO from '../components/SEO';

const Blog: React.FC = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getBlogs
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const featuredPost = blogs?.[0];
  const otherPosts = blogs?.slice(1);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <SEO 
        title="Journal - EB's Closet" 
        description="Explore the latest in girl's fashion, styling tips, and behind-the-scenes at EB's Closet."
      />
      
      {/* Header */}
      <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4 block">Volume III • Issue 04</span>
        <h1 className="text-6xl md:text-8xl font-serif mb-4 italic">The Journal</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          An editorial journey through childhood, curated for the modern aesthetician and their little muses.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-24 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl group">
              <img 
                src={featuredPost.image || '/placeholder-blog.jpg'} 
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
            </div>
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-pink-600 font-semibold">{featuredPost.category}</span>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight">{featuredPost.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed break-words">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(featuredPost.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} />
                  {featuredPost.author}
                </div>
              </div>
              <Link 
                to={`/journal/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors uppercase text-xs tracking-widest font-semibold"
              >
                Read Feature <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Post Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {otherPosts?.map((post) => (
            <Link key={post._id} to={`/journal/${post.slug}`} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-xl mb-6 bg-gray-100">
                <img 
                  src={post.image || '/placeholder-blog.jpg'} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-pink-600 mb-2 block font-bold">{post.category}</span>
              <h3 className="text-xl font-serif mb-3 group-hover:underline">{post.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4 break-words">
                {post.excerpt}
              </p>
              <span className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1">Discover</span>
            </Link>
          ))}
        </div>

        {/* Join the EB's CLOSET Section */}
        <div className="mt-32 relative rounded-[2rem] overflow-hidden py-24 px-8 text-center bg-black text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-pink-900/20" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <span className="text-xs uppercase tracking-[0.4em] text-pink-500">The Inner Circle</span>
            <h2 className="text-4xl md:text-6xl font-serif">Join the EB's CLOSET</h2>
            <p className="text-gray-400 text-lg">
              Receive exclusive invitations to collection previews, private boutique events, and editorial insights.
            </p>
            <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 text-xs tracking-widest outline-none focus:border-white/50 transition-colors"
              />
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-10 py-4 rounded-full text-xs tracking-widest font-bold transition-colors uppercase">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
