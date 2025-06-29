// src/components/shared/AuthLogin.tsx
import AuthImageSection from "@/components/shared/AuthImageSection";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import GoogleLoginButton from '@/components/user/GoogleAuthButton'

interface AuthLoginProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  signupRoute: string;
  onSubmit?: (formData: { email: string; password: string }) => Promise<void>;
  logo?: string;
  role: "user" | "shop" | "admin";
}

const AuthLogin: React.FC<AuthLoginProps> = ({
  title,
  subtitle,
  backgroundImage,
  signupRoute,
  onSubmit,
  logo,
  role
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', role });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    // Validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Show error toast for validation errors
      toast.error('Please fix the form errors before submitting', {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
        icon: '⚠️',
      });
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading('Signing you in...', {
      position: 'top-right',
      style: {
        background: '#EFF6FF',
        color: '#1D4ED8',
        border: '1px solid #DBEAFE',
      },
    });

    try {
      if (onSubmit) {
        await onSubmit(formData);
        // Success toast
        toast.success('Login successful! Welcome back!', {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#DCFCE7',
            color: '#16A34A',
            border: '1px solid #BBF7D0',
          },
          icon: '🎉',
        });
      } else {
        // Default behavior - simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Login Form Submitted:', formData);

        // Success toast
        toast.success('Login successful! Welcome back!', {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#DCFCE7',
            color: '#16A34A',
            border: '1px solid #BBF7D0',
          },
          icon: '🎉',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Error toast with specific message
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';

      toast.error(errorMessage, {
        position: 'top-right',
        duration: 5000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
        icon: '❌',
      });
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
        {/* Login Form */}
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2 rounded border-gray-300 focus:ring-black" />
                Remember me
              </label>
              {role == "user" && (
              <Link to="/forgot-password" className="text-sm text-black hover:underline">
                Forgot password?
              </Link>
              )}
              {role == "shop" && (
              <Link to="/shop/forgot-password" className="text-sm text-black hover:underline">
                Forgot password?
              </Link>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to={signupRoute} className="text-black font-medium hover:underline transition-colors">
              Sign up
            </Link>
          </div>

          {role == "user" && (
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <GoogleLoginButton />
              </div>
            </div>
          )}

        </div>
      </div>

      <AuthImageSection backgroundImage={backgroundImage} logo={logo} />
    </div>
  );
};

export default AuthLogin;