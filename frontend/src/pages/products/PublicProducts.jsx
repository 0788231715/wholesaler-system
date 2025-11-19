import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Package, Layers } from 'lucide-react';
import { productAPI } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const PublicProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products, isLoading } = useQuery(
    ['public-products', searchTerm],
    () => productAPI.getProducts({ search: searchTerm })
  );

  const getPriceRange = (product) => {
    if (!product.hasVariants || product.variants.length === 0) {
      return `$${product.price?.toFixed(2)}`;
    }
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      return `$${minPrice.toFixed(2)}`;
    }
    return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Product Catalog</h1>
        <p className="mt-4 text-lg text-gray-600">Browse our wide selection of high-quality products.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products?.data?.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-2 text-gray-600">Please check back later or try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.data?.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                {product.images?.[0] ? (
                  <img 
                    src={product.images[0].url} 
                    alt={product.images[0].alt} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="text-gray-400" size={48} />
                )}
                {product.hasVariants && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Layers size={12} className="mr-1" />
                    Variants
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex-grow">{product.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {getPriceRange(product)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.totalStock > 0 ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <Link to="/login" className="w-full">
                    <Button className="w-full mt-4">
                        Login to Order
                    </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProducts;
