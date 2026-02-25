import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  MapPin, 
  Heart, 
  RefreshCcw, 
  LogOut,
  Award,
  X
} from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'My Orders', path: '/orders' },
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: MapPin, label: 'Saved Addresses', path: '/addresses' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: RefreshCcw, label: 'Returns & Refunds', path: '/returns' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col pt-8 pb-6 px-4 
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ed4690] rounded-full flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900">Account Hub</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.label}
                onClick={() => {
                  navigate(link.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#ed4690] text-white shadow-lg shadow-pink-100' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </button>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-4"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Membership Status */}
        <div className="mt-auto bg-[#f0f4f8] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-[#ed4690]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Membership Status</p>
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1 truncate">
              Gold Member
              <Award className="w-3 h-3 text-[#ed4690] flex-shrink-0" />
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
