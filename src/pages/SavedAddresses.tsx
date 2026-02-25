import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Plus,
  Home,
  Briefcase,
  Edit2,
  Trash2,
  Truck,
  ChevronRight,
  Heart
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const SavedAddresses = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  const addresses = [
    {
      id: 1,
      type: 'Home',
      icon: Home,
      primary: true,
      name: 'Sarah Jenkins',
      address: '123 Sakura Lane, Blossom Hill',
      city: 'Tokyo, 150-0001',
      country: 'Japan'
    },
    {
      id: 2,
      type: 'Office',
      icon: Briefcase,
      primary: false,
      name: 'Sarah Jenkins',
      address: 'Tech Plaza, Level 14, Tower B',
      city: 'Shibuya City, 150-8510',
      country: 'Tokyo, Japan'
    },
    {
      id: 3,
      type: 'Parents\' House',
      icon: Heart,
      primary: false,
      name: 'Sarah Jenkins',
      address: '45-12 Pine Gardens, South Ward',
      city: 'Kyoto, 600-8216',
      country: 'Japan'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Saved Addresses</h1>
            <p className="text-gray-500 font-medium text-sm md:text-base">Manage your default shipping and billing locations</p>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#ed4690] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-pink-100 hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-50 shadow-sm relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#ed4690]">
                  <addr.icon className="w-6 h-6" />
                </div>
                {addr.primary && (
                  <span className="px-3 py-1 bg-pink-50 text-[#ed4690] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Primary
                  </span>
                )}
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{addr.type}</h3>
              
              <div className="space-y-1 text-sm text-gray-500 font-medium mb-8">
                <p>{addr.address}</p>
                <p>{addr.city}</p>
                <p>{addr.country}</p>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f8f9fa] hover:bg-gray-100 rounded-2xl text-sm font-bold text-gray-900 transition-all">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-[#f8f9fa] hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-400 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Another Card */}
          <button className="bg-transparent rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-2 border-dashed border-gray-200 hover:border-[#ed4690] hover:bg-white transition-all flex flex-col items-center justify-center group min-h-[250px] md:min-h-[300px]">
            <div className="w-12 h-12 bg-gray-50 group-hover:bg-pink-50 rounded-full flex items-center justify-center text-gray-300 group-hover:text-[#ed4690] mb-4 transition-all">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Another Address</h3>
            <p className="text-xs text-gray-400 font-medium">Shipping, Billing, or Gifts</p>
          </button>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-50 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Delivery Areas</h2>
            <button className="text-sm font-bold text-[#ed4690] hover:underline">View Map Mode</button>
          </div>
          
          <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden aspect-[4/3] md:aspect-[21/9] bg-gray-100 group">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
              alt="Delivery Map"
              className="w-full h-full object-cover opacity-60 grayscale-[40%]"
            />
            
            {/* Status Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white p-3 md:p-4 md:pl-6 md:pr-8 rounded-full shadow-2xl border border-gray-100 flex items-center gap-3 md:gap-4 max-w-full overflow-hidden">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#ed4690] rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Truck className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">In Transit</p>
                  <p className="text-xs md:text-sm font-bold text-gray-900 truncate">Package to Home Address</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 ml-1 md:ml-4 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SavedAddresses;
