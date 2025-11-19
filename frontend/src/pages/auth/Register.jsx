<<<<<<< HEAD
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
  const navigate = useNavigate();
=======
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      confirmPassword: ''
    }
  });

<<<<<<< HEAD
  const mutation = useMutation(
    (data) => authAPI.register(data),
    {
      onSuccess: () => {
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/please-verify');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  );

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    registerData.address = {
      street: registerData.address || '',
      city: '',
      state: '',
      zipCode: ''
    };
    mutation.mutate(registerData);
=======
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      
      // Add address object structure expected by backend
      registerData.address = {
        street: registerData.address || '',
        city: '',
        state: '',
        zipCode: ''
      };
      
      console.log('📤 Sending registration data:', JSON.stringify(registerData, null, 2));
      
      // Get the auth store register function
      const { register: registerUser } = useAuthStore.getState();
      
      // Attempt registration
      const result = await registerUser(registerData);
      
      if (result.success) {
        console.log('✅ Registration successful:', result);
        toast.success('Registration successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        console.error('❌ Registration failed:', result);
        // Show more specific error message
        if (result.message.includes('exists')) {
          toast.error('Email already registered. Please try logging in or use a different email.');
        } else {
          toast.error(result.message || 'Registration failed. Please check all fields and try again.');
        }
      }
    } catch (error) {
      console.error('⚠️ Registration error details:', {
        response: error.response?.data,
        status: error.response?.status,
        error: error.message
      });
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        toast.error('Please check your registration details. All required fields must be filled.');
      } else if (error.response?.status === 409) {
        toast.error('This email is already registered. Please try logging in instead.');
      } else if (error.response?.status === 422) {
        toast.error('Invalid input. Please check all fields are correctly filled.');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-gray-600">Join the wholesaler system today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Company"
            placeholder="Enter company name"
            error={errors.company?.message}
            {...register('company', { required: 'Company is required' })}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address'
            }
          })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            placeholder="Enter phone number"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('role', { required: 'Role is required' })}
            >
              <option value="">Select Role</option>
              <option value="producer">Producer</option>
              <option value="retailer">Retailer</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === watch('password') || 'Passwords do not match'
          })}
        />

<<<<<<< HEAD
        <Button type="submit" loading={mutation.isLoading} className="w-full">
=======
        <Button type="submit" loading={loading} className="w-full">
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;