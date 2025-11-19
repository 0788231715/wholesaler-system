import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const mutation = useMutation(
    (data) => authAPI.resetPassword(token, data),
    {
      onSuccess: () => {
        toast.success('Password reset successfully! You can now log in.');
        navigate('/login');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reset password');
      }
    }
  );

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const password = watch('password');

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900">Reset Password</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          error={errors.password?.message}
          {...register('password', { 
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' }
          })}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
          error={errors.passwordConfirm?.message}
          {...register('passwordConfirm', { 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
        />

        <div>
          <Button type="submit" loading={mutation.isLoading} className="w-full">
            Reset Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
