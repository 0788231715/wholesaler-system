import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation(
    (data) => authAPI.forgotPassword(data),
    {
      onSuccess: () => {
        toast.success('Password reset link sent to your email!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send reset link');
      }
    }
  );

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900">Forgot Password</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />

        <div>
          <Button type="submit" loading={mutation.isLoading} className="w-full">
            Send Reset Link
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
