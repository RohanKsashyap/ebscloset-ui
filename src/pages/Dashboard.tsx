import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Heart, 
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import { orderService, Order } from '../services/orderService';
import { authService } from '../services/authService';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { products, wishlistIds } = useProductContext();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchDashboardData = async () => {
      try {
        const myOrders = await orderService.getMyOrders();
        setOrders(myOrders);
        // Refresh user data from backend to get latest addresses etc
        const me = await authService.getMe();
        setUser(me);
        localStorage.setItem('user', JSON.stringify(me));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));
  const latestWishlist = wishlistProducts.slice(0, 4);

  if (!user) return null;

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const primaryAddress = user.addresses?.find((a: any) => a.isPrimary) || user.addresses?.[0];

  const stats = [
    { label: 'TOTAL SPENT', value: `$${totalSpent.toFixed(2)}` },
    { label: 'ORDERS COMPLETED', value: orders.length.toString() },
    { label: 'ITEMS IN WISHLIST', value: wishlistIds.length.toString() },
    { label: 'LOYALTY POINTS', value: Math.floor(totalSpent / 10).toString() },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-[#ed4690]">{user.fullName?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-gray-500 text-sm md:text-base">Here's what's happening with your account today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] border border-gray-50 shadow-sm relative group overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#ed4690]" />
            </div>
            <button 
              onClick={() => navigate('/orders')}
              className="text-[10px] font-bold text-[#ed4690] uppercase tracking-wider hover:underline"
            >
              View All
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Recent Orders</h3>
          {orders.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">{orders[0].orderId || `#ORD-${orders[0]._id?.substring(0, 8)}`}</p>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {orders[0].status || 'Pending'}
              </span>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">No orders yet</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] border border-gray-50 shadow-sm relative group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#ed4690]" />
            </div>
            <button 
              onClick={() => navigate('/addresses')}
              className="text-[10px] font-bold text-[#ed4690] uppercase tracking-wider hover:underline"
            >
              Edit
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Primary Address</h3>
          {primaryAddress ? (
            <p className="text-sm text-gray-500 leading-relaxed">
              {primaryAddress.address}<br />
              {primaryAddress.city}, {primaryAddress.postalCode}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No address saved</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] border border-gray-50 shadow-sm relative group md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-[#ed4690]" />
            </div>
            <button 
              onClick={() => navigate('/profile')}
              className="text-[10px] font-bold text-[#ed4690] uppercase tracking-wider hover:underline"
            >
              Manage
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Account Profile</h3>
          <p className="text-sm text-gray-500 mb-1">{user.fullName}</p>
          <p className="text-[10px] text-gray-400 font-medium">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'July 2023'}</p>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-50 shadow-sm mb-8 md:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-gray-900">Account Activity Summary</h2>
          <button className="text-sm font-semibold text-[#ed4690] hover:underline flex items-center gap-2">
            Download Report
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#f8f9fa] p-4 md:p-6 rounded-3xl border border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest from Wishlist */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Latest from Wishlist</h2>
          <Link to="/shop" className="text-sm font-bold text-[#ed4690] hover:underline flex items-center gap-1">
            Go to Shop <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {latestWishlist.map((product) => (
              <div key={product._id || product.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden mb-3" onClick={() => navigate(`/product/${product._id || product.id}`)}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#ed4690] shadow-sm">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#ed4690] transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-center border border-dashed border-gray-200">
            <Heart className="w-10 h-10 md:w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Your wishlist is empty.</p>
            <Link to="/shop" className="text-[#ed4690] font-bold mt-2 inline-block">Start Shopping</Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
