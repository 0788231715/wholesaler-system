import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
<<<<<<< HEAD
import { Plus, Search, Edit, Trash2, Package, Layers } from 'lucide-react';
=======
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
import { toast } from 'react-hot-toast';
import { productAPI } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ProductForm from './ProductForm';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery(
    ['products', searchTerm],
    () => productAPI.getProducts({ search: searchTerm })
  );

  const deleteMutation = useMutation(
    (id) => productAPI.deleteProduct(id),
    {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        queryClient.invalidateQueries('products');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  const canManageProducts = ['admin', 'producer'].includes(user?.role);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteMutation.mutate(product._id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

<<<<<<< HEAD
  const getPriceRange = (product) => {
    if (!product.hasVariants || product.variants.length === 0) {
      return `${product.price?.toFixed(2)}`;
    }
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      return `${minPrice.toFixed(2)}`;
    }
    return `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`;
  };

=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        
        {canManageProducts && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products?.data?.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-2 text-gray-600">Get started by creating your first product.</p>
          {canManageProducts && (
            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
              <Plus size={20} className="mr-2" />
              Add Product
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.data?.map((product) => (
<<<<<<< HEAD
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-200 flex items-center justify-center relative">
=======
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
                {product.images?.[0] ? (
                  <img 
                    src={product.images[0].url} 
                    alt={product.images[0].alt} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="text-gray-400" size={48} />
                )}
<<<<<<< HEAD
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
                    product.totalStock > 10 ? 'bg-green-100 text-green-800' :
                    product.totalStock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.totalStock} in stock
                  </span>
                </div>

                {user?.role === 'retailer' && product.totalStock > 0 && (
                  <Button 
                    className="w-full mt-4"
                    disabled={product.hasVariants}
                    title={product.hasVariants ? "Select options on product page" : ""}
                  >
                    {product.hasVariants ? 'View Options' : 'Add to Cart'}
=======
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} in stock
                  </span>
                </div>

                {user?.role === 'retailer' && product.stock > 0 && (
                  <Button className="w-full mt-4">
                    Add to Cart
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
                  </Button>
                )}

                {canManageProducts && (
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleDelete(product)}
                      className="flex-1"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Products;