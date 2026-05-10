import { X, User, Mail, Phone, Lock, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CustomerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  customer?: any;
}

export default function CustomerManagementModal({ isOpen, onClose, onSave, customer }: CustomerManagementModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || '',
        email: customer.email || '',
        password: '', // Don't show password
        phone: customer.phone || '',
        role: customer.role || 'user'
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'user'
      });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleIn">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-2xl">
              <User className="text-pink-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {customer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Role</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all appearance-none"
                  >
                    <option value="user">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                {customer ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required={!customer}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-pink-200"
            >
              {customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
