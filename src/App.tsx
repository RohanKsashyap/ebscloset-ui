import { useState, useEffect, useRef } from 'react';
import HomePage from './components/HomePage';
import Navigation from './components/Navigation';
import NewsletterPopup from './components/NewsletterPopup';
import Footer from './components/Footer';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { hydrateBackend } from './utils/storage';
import { ProductProvider } from './context/ProductContext';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import SizeGuide from './pages/SizeGuide';
import Care from './pages/Care';
import GiftCards from './pages/GiftCards';
import OurStory from './pages/OurStory';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Arrivals from './pages/Arrivals';
import ArrivalsDetail from './pages/ArrivalsDetail';
import Age from './pages/Age';
import Occasions from './pages/Occasions';
import Styles from './pages/Styles';
import Parents from './pages/Parents';
import Party from './pages/Party';
import Casual from './pages/Casual';
import Seasonal from './pages/Seasonal';
import SpecialOccasion from './pages/SpecialOccasion';
import Returns from './pages/Returns';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Budget from './pages/Budget';

function AdminProtectedRoute() {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('admin');
  
  if (!adminToken || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <AdminDashboard />;
}

function AdminLoginRoute() {
  const adminToken = localStorage.getItem('adminToken');
  
  if (adminToken) {
    return <Navigate to="/admin" replace />;
  }
  
  return <AdminLogin />;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<AdminProtectedRoute />} />
        <Route path="/admin/login" element={<AdminLoginRoute />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/care" element={<Care />} />
        <Route path="/gift-cards" element={<GiftCards />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/arrivals" element={<Arrivals />} />
        <Route path="/arrivals/:id" element={<ArrivalsDetail />} />
        <Route path="/age" element={<Age />} />
        <Route path="/occasions" element={<Occasions />} />
        <Route path="/styles" element={<Styles />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/party" element={<Party />} />
        <Route path="/casual" element={<Casual />} />
        <Route path="/seasonal" element={<Seasonal />} />
        <Route path="/special-occasion" element={<SpecialOccasion />} />
      </Routes>
    </div>
  );
}

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const sparkleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem('hasVisited', 'true');
      }, 2000);
    }
    void hydrateBackend();
    const handler = (e: MouseEvent) => {
      const root = sparkleRef.current;
      if (!root) return;
      const count = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        const sizeClass = ['s','m','l'][Math.floor(Math.random()*3)];
        const colorClass = Math.random() < 0.6 ? 'white' : 'gold';
        el.className = `sparkle ${colorClass} ${sizeClass}`;
        const jitterX = (Math.random() - 0.5) * 16;
        const jitterY = (Math.random() - 0.5) * 16;
        el.style.left = `${e.clientX + jitterX}px`;
        el.style.top = `${e.clientY + jitterY}px`;
        el.style.animationDuration = `${400 + Math.floor(Math.random() * 400)}ms`;
        root.appendChild(el);
        const ttl = parseInt(el.style.animationDuration) || 600;
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, ttl + 50);
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <BrowserRouter>
      <ProductProvider>
        <div className="min-h-screen bg-white">
          <Navigation />
          <div ref={sparkleRef} className="sparkle-trail" />
          <AppRoutes />
          <Footer />
          {showPopup && <NewsletterPopup onClose={() => setShowPopup(false)} />}
        </div>
      </ProductProvider>
    </BrowserRouter>
  );
}

export default App;
