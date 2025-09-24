import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import logo from "@/assets/user/logo.png"
import { useNavigate } from 'react-router-dom';
import { userSendResetLink } from '@/services/user/auth.service';
import { shopSendResetLink } from '@/services/shop/auth.service';

interface ForgotPasswordFormProps {
    role: 'user' | 'shop';
    onBack?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ role, onBack }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
       await (role === 'user' ? userSendResetLink : shopSendResetLink)(email);
        setIsSubmitted(true);
    } catch (error) {
        console.error('Failed to send reset link:', error);
    } finally {
        setIsLoading(false);
    }
};

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-12 sm:w-24 sm:h-14 md:w-28 md:h-16 lg:w-32 lg:h-20 flex items-center justify-center">
                                <img
                                    src={logo || "/placeholder.svg?height=44&width=57"}
                                    alt="logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>


                        {/* Success Icon */}
                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Mail className="h-8 w-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-black mb-4">Check Your Email</h2>
                        <p className="text-gray-600 mb-6">
                            We've sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions to reset your password.
                        </p>

                        <div className="space-y-4">

                        {role =="user" &&(
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                            >
                                Back to Login
                            </button>
                        )}
                        {role =="shop" &&(
                            <button
                                onClick={() => navigate('/shop/login')}
                                className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                            >
                                Back to Login
                            </button>
                        )}


                            <p className="text-sm text-gray-500">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-black hover:underline font-medium"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-12 sm:w-24 sm:h-14 md:w-28 md:h-16 lg:w-32 lg:h-20 flex items-center justify-center">
                                <img
                                    src={logo || "/placeholder.svg?height=44&width=57"}
                                    alt="logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-black mb-2">Forgot Password?</h2>
                        <p className="text-gray-600">
                            No worries! Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                                    placeholder={`Enter your ${role} email address`}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center group"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Sending Reset Link...
                                </>
                            ) : (
                                <>
                                    Send Reset Link
                                    <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    {onBack && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={onBack}
                                className="text-gray-600 hover:text-black transition-colors font-medium flex items-center justify-center mx-auto group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Login
                            </button>
                        </div>
                    )}

                    {/* Role Indicator */}
                    <div className="mt-6 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {role === 'user' ? 'Pet Parent' : 'Service Provider'} Account
                        </span>
                    </div>
                </div>

                {/* Additional Help */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:fluffycare.team@gmail.com" className="text-black hover:underline font-medium">
                            fluffycare.team@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;