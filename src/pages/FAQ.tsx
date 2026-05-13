import { useState } from 'react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { Search, Plus, Minus, ArrowUpRight } from 'lucide-react';

const FAQ_DATA = [
  {
    category: "Shipping & Delivery",
    questions: [
      {
        question: "How long will my order take to arrive?",
        answer: "Orders are typically processed within 1-2 business days. Standard shipping takes 3-5 business days, while express boutique shipping arrives in 1-2 business days."
      },
      {
        question: "Do you offer international boutique shipping?",
        answer: "Yes, we ship to selected international locations. Shipping costs and delivery times vary by destination and will be calculated at checkout."
      },
      {
        question: "How can I track my atelier parcel?",
        answer: "Once your order ships, you will receive a confirmation email with a tracking number and a link to monitor your delivery's progress."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy for delicate items?",
        answer: "We accept returns on unworn items with original tags within 14 days. Due to the delicate nature of our artisanal pieces, they must be returned in their original packaging."
      }
    ]
  }
];

const CATEGORIES = [
  "Shipping & Delivery",
  "Returns & Exchanges",
  "Size Guide",
  "Care Instructions",
  "Sustainability"
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-[#FCFCFC] min-h-screen">
      <SEO 
        title="Common Curations | FAQ"
        description="Find answers to common questions about EB's Closet, including shipping, returns, sizing, and dress care."
        canonical="https://www.ebscloset.com.au/faq"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_DATA.flatMap(cat => cat.questions).map(q => ({
              "@type": "Question",
              "name": q.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": q.answer
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <header className="pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-start mb-4">
          <div className="text-[#C12067] mr-4">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.5 9H21.5L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2.5 9H9.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
        </div>
        <h1 className="text-6xl md:text-8xl font-light text-gray-900 mb-8 tracking-tight font-serif italic">
          Common <br /> Curations
        </h1>
        <p className="max-w-xl text-gray-500 text-lg leading-relaxed mb-12">
          Every detail of our childhood collections is designed with intent. Find answers here about our artisanal process, care guidelines, and boutique experience.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <input 
            type="text"
            placeholder="Search for your question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#EFEFEF] rounded-full py-5 px-8 pr-16 text-lg focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all placeholder:text-gray-400"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#C12067] text-white p-3 rounded-full hover:bg-[#a01a55] transition-colors">
            <ArrowUpRight size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-12">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Categories</h3>
            <ul className="space-y-6">
              {CATEGORIES.map((cat, i) => (
                <li key={cat} className="flex items-center group cursor-pointer">
                  {i === 0 && <span className="w-1.5 h-1.5 bg-[#C12067] rounded-full mr-3" />}
                  <span className={`text-sm tracking-wide ${i === 0 ? 'text-[#C12067] font-medium' : 'text-gray-600 group-hover:text-gray-900 transition-colors'}`}>
                    {cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Autumn Edit Card */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] group cursor-pointer shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&q=80&w=800" 
              alt="Autumn Edit"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-sm font-medium italic mb-1">Our Autumn Edit</p>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Explore the process</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-20">
          {FAQ_DATA.map((section) => (
            <section key={section.category}>
              <h2 className="text-3xl font-light text-gray-900 mb-12 relative inline-block">
                {section.category}
                <span className="absolute -bottom-2 left-0 w-12 h-[1px] bg-[#C12067]" />
              </h2>
              <div className="divide-y divide-gray-100">
                {section.questions.map((q) => {
                  const id = `${section.category}-${q.question}`;
                  const isOpen = openItems.includes(id);
                  return (
                    <div key={q.question} className="py-8 first:pt-0">
                      <button 
                        onClick={() => toggleItem(id)}
                        className="w-full flex justify-between items-center text-left group"
                      >
                        <span className={`text-xl md:text-2xl font-light tracking-tight transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {q.question}
                        </span>
                        <div className="ml-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                          {isOpen ? <Minus size={24} strokeWidth={1} /> : <Plus size={24} strokeWidth={1} />}
                        </div>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                        <p className="text-gray-500 leading-relaxed text-lg max-w-2xl">
                          {q.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer Guidance Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="bg-[#F3F3F3] rounded-[40px] overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="p-12 md:p-20 flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C12067] mb-6">Personal Assistance</p>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Still need <br /> guidance?
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-md">
              Our concierge team is available to assist you with styling advice, sizing queries, or order updates.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#C12067] text-white px-8 py-4 rounded-full font-medium flex items-center hover:bg-[#a01a55] transition-colors">
                Contact Us <ArrowUpRight size={20} className="ml-2" />
              </button>
              <button className="bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-colors">
                Live Chat
              </button>
            </div>
          </div>
          <div className="relative min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200" 
              alt="Silk fabric" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-8 right-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-4">
              <div className="text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.5 9H21.5L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2.5 9H9.5L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
