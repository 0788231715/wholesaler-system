import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const PleaseVerifyEmail = () => {
  return (
    <div className="text-center">
      <Mail className="mx-auto text-primary-600" size={48} />
      <h2 className="mt-6 text-2xl font-bold text-gray-900">Please Verify Your Email</h2>
      <p className="mt-2 text-sm text-gray-600">
        We've sent a verification link to your email address. Please check your inbox (and spam folder) to complete your registration.
      </p>
      <div className="mt-6">
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default PleaseVerifyEmail;
