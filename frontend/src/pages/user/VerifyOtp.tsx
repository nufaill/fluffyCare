// src/pages/user/VerifyOtp.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import  Authaxios  from '@/api/auth.axios';

interface OtpFormData {
  otp: string;
}

interface LocationState {
  email?: string;
}

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Get email from navigation state or localStorage
  const [email] = useState<string>(() => {
    return state?.email || localStorage.getItem('pendingVerificationEmail') || '';
  });
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<OtpFormData>({
    defaultValues: { otp: '' }
  });
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(120); // 120 seconds
  const [canResend, setCanResend] = useState(false);
  
  const otpValue = watch('otp');

  // Redirect if no email is available
  useEffect(() => {
    if (!email) {
      toast.error('No email found for verification. Please sign up again.');
      navigate('/signup');
    }
  }, [email, navigate]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, canResend]);

  // Format countdown time
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP input - only allow numbers and limit to 6 digits
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 6) {
      setValue('otp', value);
    }
  };

  // Verify OTP submission
  const onSubmit = async (data: OtpFormData) => {
    if (!email) {
      toast.error('Email is required for verification');
      return;
    }

    if (data.otp.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      
      const response = await Authaxios.post('/verify-otp', {
        email: email,
        otp: data.otp,
      });

      if (response.data.success) {
        toast.success('Email verified successfully! Your account has been created.');
        
        // Clear stored email
        localStorage.removeItem('pendingVerificationEmail');
        
        // Navigate to login or dashboard
        navigate('/login', { 
          replace: true,
          state: { message: 'Registration completed successfully! Please log in.' }
        });
      } else {
        toast.error(response.data.message || 'OTP verification failed');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      
      const errorMessage = err?.response?.data?.message || 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
      
      // Clear OTP input on error
      setValue('otp', '');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Email is required to resend OTP');
      return;
    }

    try {
      setResendLoading(true);
      
      const response = await Authaxios.post('/resend-otp', {
        email: email,
      });

      if (response.data.success) {
        toast.success('New OTP sent to your email!');
        
        // Reset timer and states
        setCountdown(120);
        setCanResend(false);
        setValue('otp', ''); // Clear current OTP input
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      
      const errorMessage = err?.response?.data?.message || 'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Handle back to signup
  const handleBackToSignup = () => {
    localStorage.removeItem('pendingVerificationEmail');
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-blue-600">{email}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.otp ? 'border-red-300' : 'border-gray-300'
                }`}
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'OTP must be 6 digits'
                  }
                })}
                onChange={handleOtpChange}
                maxLength={6}
                autoComplete="one-time-code"
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpValue.length !== 6}
              className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-colors ${
                loading || otpValue.length !== 6
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Timer and Resend Section */}
          <div className="mt-6 text-center">
            {!canResend ? (
              <div className="text-sm text-gray-600">
                <p>Didn't receive the code?</p>
                <p className="font-medium text-blue-600 mt-1">
                  Resend available in {formatTime(countdown)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className={`text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors ${
                    resendLoading ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
                  }`}
                >
                  {resendLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Back to Signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToSignup}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Sign Up
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Please check your email for the verification code. It may take a few minutes to arrive.
                  The code will expire in 10 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;