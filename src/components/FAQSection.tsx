import { useState } from 'react';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HOME_FAQ = [
  {
    question: "How long will my order take to arrive?",
    answer: "Orders are typically processed within 1-2 business days. Standard shipping takes 3-5 business days, while express boutique shipping arrives in 1-2 business days."
  },
  {
    question: "What is your return policy for delicate items?",
    answer: "We accept returns on unworn items with original tags within 14 days. Due to the delicate nature of our artisanal pieces, they must be returned in their original packaging."
  },
  {
    question: "How can I track my atelier parcel?",
    answer: "Once your order ships, you will receive a confirmation email with a tracking number and a link to monitor your delivery's progress."
  },
  {
    question: "Do you offer international boutique shipping?",
    answer: "Yes, we ship to selected international locations. Shipping costs and delivery times vary by destination and will be calculated at checkout."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Side: Header */}
        <div className="lg:col-span-5">
          <div className="text-[#C12067] mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 9H21.5L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2.5 9H9.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 tracking-tight font-serif italic">
            Common <br /> Curations
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
            Find answers to common questions about our artisanal process, shipping, and returns.
          </p>
          <Link 
            to="/faq" 
            className="inline-flex items-center text-[#C12067] font-medium group"
          >
            View all FAQs 
            <ArrowUpRight size={20} className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        {/* Right Side: Accordion */}
        <div className="lg:col-span-7">
          <div className="divide-y divide-gray-100">
            {HOME_FAQ.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="py-8 first:pt-0">
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left group"
                  >
                    <span className={`text-xl md:text-2xl font-light tracking-tight transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {faq.question}
                    </span>
                    <div className="ml-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                      {isOpen ? <Minus size={24} strokeWidth={1} /> : <Plus size={24} strokeWidth={1} />}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-500 leading-relaxed text-lg max-w-2xl">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
