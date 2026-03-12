import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  X,
  ChevronRight
} from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import DashboardLayout from '../components/DashboardLayout';

const Wishlist = () => {
  const navigate = useNavigate();
  const { products, wishlistIds, toggleWishlist } = useProductContext();
  const { addItem } = useCart();
  
  const wishlistProducts = products.filter(p => wishlistIds.includes((p._id || p.id) as string | number));
  
  // Suggested products (could be trending or random)
  const suggestedProducts = products
    .filter(p => !wishlistIds.includes((p._id || p.id) as string | number))
    .slice(0, 3);

  const handleMoveAllToBag = () => {
    wishlistProducts.forEach(product => {
      addItem({
        id: (product._id || product.id) as string | number,
        name: product.name,
        price: product.price,
        image: product.image,
        size: product.sizes?.[0] // Default to first size if available
      });
    });
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: (product._id || product.id) as string | number,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes?.[0]
    });
  };

  const getStockStatus = (product: any) => {
    const stockValues = product.stock ? Object.values(product.stock as Record<string, number>) : [];
    const totalStock = stockValues.reduce((a, b) => a + b, 0);
    
    if (totalStock === 0) return 'Coming Soon';
    if (totalStock <= 5) return 'Limited Quantity';
    return 'In Stock';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[10px] text-gray-400 mb-6 uppercase tracking-widest font-bold">
          <Link to="/dashboard" className="hover:text-black">Home</Link>
          <span>/</span>
          <span className="text-black">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">
              Saved Items
            </h1>
            <p className="text-gray-500 font-medium">
              You have {wishlistProducts.length} items curated in your private collection.
            </p>
          </div>
          {wishlistProducts.length > 0 && (
            <button 
              onClick={handleMoveAllToBag}
              className="flex items-center gap-2 bg-[#ed4690]/10 text-[#ed4690] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#ed4690] hover:text-white transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Move All to Bag
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
            {wishlistProducts.map((product) => {
              const productId = (product._id || product.id) as string | number;
              const status = getStockStatus(product);
              
              return (
                <div key={productId} className="group relative">
                  <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-50 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {status === 'Coming Soon' ? (
                        <span className="px-3 py-1 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                          Coming Soon
                        </span>
                      ) : status === 'Limited Quantity' ? (
                        <span className="px-3 py-1 bg-pink-100/90 backdrop-blur-md text-[#ed4690] text-[10px] font-bold rounded-full uppercase tracking-widest">
                          Limited Quantity
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-white/80 backdrop-blur-md text-gray-900 text-[10px] font-bold rounded-full uppercase tracking-widest">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => toggleWishlist(productId)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="px-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#ed4690] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-1">
                      {product.color?.[0] || 'Multi'} • {product.materials || 'Premium Cotton'}
                    </p>
                    
                    {status === 'Coming Soon' ? (
                      <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                        Notify Me
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-4 bg-white text-[#ed4690] border-2 border-[#ed4690]/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#ed4690] hover:text-white hover:border-[#ed4690] transition-all"
                      >
                        Add to Bag
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center border border-dashed border-gray-200 mb-20">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#ed4690]">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Save your favorite items to keep track of them and get notified about restocks.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-[#ed4690] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-[#d63d81] transition-all shadow-lg shadow-pink-100"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Suggested Section */}
        {suggestedProducts.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inspired by your style</h2>
              <Link to="/shop" className="text-sm font-bold text-gray-400 hover:text-black flex items-center gap-1 transition-colors uppercase tracking-widest">
                Shop All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              {suggestedProducts.map((product) => (
                <div key={(product._id || product.id) as string | number} className="group cursor-pointer" onClick={() => navigate(`/product/${product._id || product.id}`)}>
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 bg-gray-50 shadow-sm">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#ed4690] transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-gray-400">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;
