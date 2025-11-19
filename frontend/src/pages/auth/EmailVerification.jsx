import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login: loginUser } = useAuthStore();

  const { data, isLoading, error } = useQuery(
    ['verifyEmail', token],
    () => authAPI.verifyEmail(token),
    {
      onSuccess: (data) => {
        // Log the user in
        loginUser(data.data.user, data.data.token);
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 3000);
      },
      retry: false,
    }
  );

  return (
    <div className="text-center">
      {isLoading && (
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">Verifying your email...</h2>
        </div>
      )}

      {error && (
        <div>
          <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.response?.data?.message || 'An unknown error occurred.'}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            The link may be invalid or expired. Please try registering again.
          </p>
          <div className="mt-6">
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Back to Registration
            </Link>
          </div>
        </div>
      )}

      {data && (
        <div>
          <h2 className="text-2xl font-bold text-green-600">Email Verified Successfully!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome aboard! You are now logged in and will be redirected to your dashboard shortly.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
