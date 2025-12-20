import InfoPage from './InfoPage';
import { loadSite } from '../utils/storage';
import { useState } from 'react';
import { contactService } from '../services/contactService';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: '', title: '', body: '', ctaText: '', ctaHref: '/shop' },
    collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {
      contact: { title: 'Contact Us', subtitle: "We're here to help", sections: [{ body: '' }] }
    }
  });
  const content = site.infoPages['contact'];
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      try {
        await contactService.submit(name, email, message);
        alert('Message sent successfully!');
        setName('');
        setEmail('');
        setMessage('');
      } catch {
        alert('Failed to send message. Please try again.');
      }
    }
  };

  return (
    <InfoPage title={content.title} subtitle={content.subtitle}>
      <form className="space-y-6" onSubmit={onSubmit}>
        <input className="border px-4 py-3 w-full" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border px-4 py-3 w-full" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <textarea className="border px-4 py-3 w-full h-32" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <button className="border-2 border-hot-pink text-hot-pink px-8 py-3 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500">Send</button>
      </form>
    </InfoPage>
  );
}
