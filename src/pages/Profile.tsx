import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Eye,
  EyeOff,
  AlertTriangle,
  Settings,
  RefreshCcw
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({
      fullName: parsedUser.fullName || '',
      email: parsedUser.email || '',
      phone: '',
    });
  }, [navigate]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Profile Settings</h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">Manage your identity and keep your account secure.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-100 rounded-full shadow-sm">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-100 rounded-full shadow-sm">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
               <User className="w-full h-full p-2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-[#ed4690]">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 md:mb-3">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Sarah Jenkins"
                className="w-full px-5 md:px-6 py-3 md:py-4 bg-[#f8f9fa] border-none rounded-2xl focus:ring-2 focus:ring-[#ed4690] outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 md:mb-3">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="sarah.j@example.com"
                className="w-full px-5 md:px-6 py-3 md:py-4 bg-[#f8f9fa] border-none rounded-2xl focus:ring-2 focus:ring-[#ed4690] outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="mb-8 md:mb-10">
            <label className="block text-sm font-bold text-gray-900 mb-2 md:mb-3">Phone Number</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 (555) 000-0000"
              className="w-full px-5 md:px-6 py-3 md:py-4 bg-[#f8f9fa] border-none rounded-2xl focus:ring-2 focus:ring-[#ed4690] outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="flex justify-end">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#ed4690] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-pink-100">
              Save Changes
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-[#ed4690]">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          </div>

          <div className="mb-4 md:mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2 md:mb-3">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full px-5 md:px-6 py-3 md:py-4 bg-[#f8f9fa] border-none rounded-2xl focus:ring-2 focus:ring-[#ed4690] outline-none transition-all placeholder:text-gray-400 font-medium"
              />
              <button 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 md:mb-3">New Password</label>
              <input 
                type="password" 
                placeholder="Min. 8 characters"
                className="w-full px-5 md:px-6 py-3 md:py-4 bg-[#f8f9fa] border-none rounded-2xl focus:ring-2 focus:ring-[#ed4690] outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 md:mb-3">Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Confirm password"
                className="w-full px-5 md:px-6 py-3 md:py-4 bg-[#f8f9fa] border-none rounded-2xl focus:ring-2 focus:ring-[#ed4690] outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-medium text-center sm:text-left">
              Password must be at least 8 characters long and include a mix of uppercase, lowercase, and symbols.
            </p>
            <button className="w-full sm:w-auto px-8 py-4 bg-[#0f172a] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-slate-200">
              Update Password
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-red-50/30 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-600 mb-1">Delete Account</h3>
              <p className="text-sm text-red-500/70 font-medium">Permanently remove your account and all of your data. This action is irreversible.</p>
            </div>
          </div>
          <button className="w-full md:w-auto px-8 py-4 border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all bg-white">
            Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
