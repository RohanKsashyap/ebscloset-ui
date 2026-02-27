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
  Heart,
  Loader2,
  X
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { authService, Address } from '../services/authService';

const SavedAddresses = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Omit<Address, '_id'>>({
    type: 'Home',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    isPrimary: false
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchAddresses = async () => {
      try {
        const data = await authService.getAddresses();
        setAddresses(data);
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  const handleOpenModal = (addr: Address | null = null) => {
    if (addr) {
      setEditingAddress(addr);
      setFormData({
        type: addr.type,
        fullName: addr.fullName,
        address: addr.address,
        city: addr.city,
        postalCode: addr.postalCode,
        country: addr.country,
        phone: addr.phone,
        isPrimary: addr.isPrimary
      });
    } else {
      setEditingAddress(null);
      setFormData({
        type: 'Home',
        fullName: user?.fullName || '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: user?.phone || '',
        isPrimary: addresses.length === 0
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let updatedAddresses;
      if (editingAddress?._id) {
        updatedAddresses = await authService.updateAddress(editingAddress._id, formData);
      } else {
        updatedAddresses = await authService.addAddress(formData);
      }
      setAddresses(updatedAddresses);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    setLoading(true);
    try {
      const updatedAddresses = await authService.deleteAddress(id);
      setAddresses(updatedAddresses);
    } catch (err) {
      console.error('Error deleting address:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'home': return Home;
      case 'office': return Briefcase;
      default: return Heart;
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Saved Addresses</h1>
            <p className="text-gray-500 font-medium text-sm md:text-base">Manage your default shipping and billing locations</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#ed4690] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-pink-100 hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          {loading && addresses.length === 0 ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#ed4690] animate-spin" />
            </div>
          ) : (
            addresses.map((addr) => {
              const Icon = getIcon(addr.type);
              return (
                <div key={addr._id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-50 shadow-sm relative group overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#ed4690]">
                      <Icon className="w-6 h-6" />
                    </div>
                    {addr.isPrimary && (
                      <span className="px-3 py-1 bg-pink-50 text-[#ed4690] text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{addr.type}</h3>
                  
                  <div className="space-y-1 text-sm text-gray-500 font-medium mb-8">
                    <p className="text-gray-900 font-bold">{addr.fullName}</p>
                    <p>{addr.address}</p>
                    <p>{addr.city}, {addr.postalCode}</p>
                    <p>{addr.country}</p>
                    <p>{addr.phone}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-auto">
                    <button 
                      onClick={() => handleOpenModal(addr)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f8f9fa] hover:bg-gray-100 rounded-2xl text-sm font-bold text-gray-900 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => addr._id && handleDelete(addr._id)}
                      className="w-12 h-12 flex items-center justify-center bg-[#f8f9fa] hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-400 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {!loading && addresses.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white rounded-[2rem] border border-dashed border-gray-200">
               <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-500 font-medium">No saved addresses yet.</p>
            </div>
          )}

          {/* Add Another Card */}
          <button 
            onClick={() => handleOpenModal()}
            className="bg-transparent rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-2 border-dashed border-gray-200 hover:border-[#ed4690] hover:bg-white transition-all flex flex-col items-center justify-center group min-h-[250px] md:min-h-[300px]"
          >
            <div className="w-12 h-12 bg-gray-50 group-hover:bg-pink-50 rounded-full flex items-center justify-center text-gray-300 group-hover:text-[#ed4690] mb-4 transition-all">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Another Address</h3>
            <p className="text-xs text-gray-400 font-medium">Shipping, Billing, or Gifts</p>
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-5 py-3 bg-[#f8f9fa] border-none rounded-xl focus:ring-2 focus:ring-[#ed4690] outline-none font-medium"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-5 py-3 bg-[#f8f9fa] border-none rounded-xl focus:ring-2 focus:ring-[#ed4690] outline-none font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-5 py-3 bg-[#f8f9fa] border-none rounded-xl focus:ring-2 focus:ring-[#ed4690] outline-none font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">City</label>
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-5 py-3 bg-[#f8f9fa] border-none rounded-xl focus:ring-2 focus:ring-[#ed4690] outline-none font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Postal Code</label>
                      <input 
                        type="text" 
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                        className="w-full px-5 py-3 bg-[#f8f9fa] border-none rounded-xl focus:ring-2 focus:ring-[#ed4690] outline-none font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Country</label>
                      <input 
                        type="text" 
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full px-5 py-3 bg-[#f8f9fa] border-none rounded-xl focus:ring-2 focus:ring-[#ed4690] outline-none font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-3 bg-[#f8f9fa] border-none rounded-xl focus:ring-2 focus:ring-[#ed4690] outline-none font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="isPrimary"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                      className="w-4 h-4 text-[#ed4690] focus:ring-[#ed4690] rounded"
                    />
                    <label htmlFor="isPrimary" className="text-sm font-bold text-gray-700">Set as primary address</label>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#ed4690] text-white font-bold rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
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
