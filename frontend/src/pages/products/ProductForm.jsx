import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { productAPI } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const isEditing = !!product;
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      minOrderQuantity: 1,
      unit: 'piece'
    }
  });

  const mutation = useMutation(
    (data) => 
      isEditing 
        ? productAPI.updateProduct(product._id, data)
        : productAPI.createProduct(data),
    {
      onSuccess: () => {
        toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
        queryClient.invalidateQueries('products');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    }
  );

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Product Name"
        placeholder="Enter product name"
        error={errors.name?.message}
        {...register('name', { required: 'Product name is required' })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter product description"
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price ($)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.price?.message}
          {...register('price', { 
            required: 'Price is required',
            min: { value: 0, message: 'Price must be positive' }
          })}
        />

        <Input
          label="Stock Quantity"
          type="number"
          min="0"
          placeholder="0"
          error={errors.stock?.message}
          {...register('stock', { 
            required: 'Stock is required',
            min: { value: 0, message: 'Stock cannot be negative' }
          })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Category"
          placeholder="e.g., Vegetables, Fruits"
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />

        <Input
          label="Unit"
          placeholder="e.g., kg, piece, box"
          error={errors.unit?.message}
          {...register('unit', { required: 'Unit is required' })}
        />
      </div>

      <Input
        label="Minimum Order Quantity"
        type="number"
        min="1"
        placeholder="1"
        error={errors.minOrderQuantity?.message}
        {...register('minOrderQuantity', { 
          required: 'Minimum order quantity is required',
          min: { value: 1, message: 'Must be at least 1' }
        })}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={mutation.isLoading}>
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;