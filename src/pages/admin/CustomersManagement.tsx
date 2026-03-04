import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  TrendingUp, 
  UserPlus, 
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  orders?: any[];
}

interface CustomersManagementProps {
  users: User[];
}

export default function CustomersManagement({ users }: CustomersManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: users.length,
    newThisMonth: users.filter(u => {
      const date = new Date(u.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    activeNow: Math.floor(users.length * 0.034) // Mock active users based on provided screenshot logic
  };

  const calculateTotalSpent = (user: User) => {
    if (!user.orders) return 0;
    return user.orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMs = now.getTime() - then.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const getLastActive = (user: User) => {
    if (user.orders && user.orders.length > 0) {
      const lastOrder = user.orders.reduce((prev, current) => {
        return (new Date(prev.createdAt) > new Date(current.createdAt)) ? prev : current;
      });
      return getTimeAgo(lastOrder.createdAt);
    }
    return getTimeAgo(user.createdAt);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 rounded-2xl">
            <Users className="text-pink-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Customers</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers by name, email or ID..."
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl w-full md:w-80 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-pink-200">
            <Plus size={18} />
            Add New Customer
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-bold">{stats.total.toLocaleString()}</h3>
              <div className="flex items-center text-green-500 text-xs font-bold">
                <TrendingUp size={14} className="mr-1" />
                +12.5%
              </div>
            </div>
          </div>
          <div className="p-4 bg-pink-50 rounded-2xl">
            <Users className="text-pink-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-500">New This Month</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-bold">{stats.newThisMonth.toLocaleString()}</h3>
              <div className="flex items-center text-green-500 text-xs font-bold">
                <TrendingUp size={14} className="mr-1" />
                +5.2%
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl">
            <UserPlus className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-500">Active Now</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-bold">{stats.activeNow.toLocaleString()}</h3>
              <div className="flex items-center text-red-500 text-xs font-bold">
                <TrendingUp size={14} className="mr-1 rotate-180" />
                -2.1%
              </div>
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-2xl">
            <Zap className="text-orange-400" size={24} />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer Name</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Total Orders</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Total Spent</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Last Active</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentUsers.map((user) => (
                <tr key={user._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-100 to-pink-50 flex items-center justify-center text-pink-600 font-bold text-sm overflow-hidden border-2 border-white shadow-sm">
                        {user.fullName.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{user.email}</td>
                  <td className="px-8 py-6 text-sm font-bold text-center">{user.orders?.length || 0}</td>
                  <td className="px-8 py-6 text-sm font-bold text-center">₹{calculateTotalSpent(user).toLocaleString()}</td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium text-center">
                    {getLastActive(user)}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      (user.orders?.length || 0) > 5 
                        ? 'bg-pink-100 text-pink-600 border border-pink-200' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {(user.orders?.length || 0) > 5 ? 'Premium Member' : 'Member'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} Customers
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-30 transition-all rounded-xl"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
                      : 'text-gray-500 hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 5 && <span className="text-gray-400 px-2">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === totalPages 
                      ? 'bg-pink-600 text-white' 
                      : 'text-gray-500 hover:bg-white'
                  }`}
                >
                  {totalPages.toLocaleString()}
                </button>
              )}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-30 transition-all rounded-xl"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
