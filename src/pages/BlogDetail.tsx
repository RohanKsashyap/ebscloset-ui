import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import SEO from '../components/SEO';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogService.getBlogBySlug(slug!),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-serif">Article Not Found</h2>
        <Link to="/journal" className="text-pink-600 uppercase text-xs tracking-widest font-bold border-b border-pink-600">Back to Journal</Link>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen pb-24">
      <SEO 
        title={`${post.title} - Journal`} 
        description={post.excerpt}
      />
      
      {/* Hero Image */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img 
          src={post.image || '/placeholder-blog.jpg'} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-16 max-w-7xl mx-auto text-white">
          <Link to="/journal" className="inline-flex items-center gap-2 mb-8 text-xs tracking-[0.2em] uppercase font-semibold hover:text-pink-400 transition-colors">
            <ArrowLeft size={16} /> Back to Journal
          </Link>
          <div className="max-w-3xl space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-pink-400">{post.category}</span>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight">{post.title}</h1>
            <div className="flex items-center gap-8 text-sm opacity-80 font-medium tracking-wide">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                By {post.author}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 italic font-serif leading-relaxed mb-12 border-l-4 border-pink-100 pl-8 break-words">
            {post.excerpt}
          </p>
          <div 
            className="blog-content space-y-8 text-gray-800 leading-[1.8] text-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Footer / Share */}
        <div className="mt-20 pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-2">
            {post.tags?.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-white transition-all">
            <Share2 size={14} /> Share Article
          </button>
        </div>

        {/* Newsletter Box (Mini) */}
        <div className="mt-24 p-12 bg-[#FAF9F6] rounded-3xl text-center space-y-6">
          <h3 className="text-2xl font-serif italic">Stay Updated</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">Subscribe to get the latest editorial updates directly in your inbox.</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input type="email" placeholder="Email Address" className="flex-1 px-6 py-3 rounded-full text-sm outline-none border border-gray-200" />
            <button className="bg-black text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold">Join</button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;
