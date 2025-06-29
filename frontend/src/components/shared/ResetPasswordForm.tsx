import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import logo from "@/assets/user/logo.png"
import { userResetPassword } from '@/services/user/authService';
import { shopResetPassword } from '@/services/shop/authService';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ResetPasswordFormProps {
    role: 'user' | 'shop';
    token?: string;
    onBack?: () => void;
    onSuccess?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    role,
    token,
    onBack,
    onSuccess
}) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tokenFromUrl = searchParams.get('token');
    const finalToken = token || tokenFromUrl;

    // Password validation
    const validatePassword = (pwd: string): string[] => {
        const validationErrors: string[] = [];
        if (pwd.length < 8) validationErrors.push('At least 8 characters');
        if (!/[A-Z]/.test(pwd)) validationErrors.push('One uppercase letter');
        if (!/[a-z]/.test(pwd)) validationErrors.push('One lowercase letter');
        if (!/\d/.test(pwd)) validationErrors.push('One number');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) validationErrors.push('One special character');
        return validationErrors;
    };

    const passwordErrors = validatePassword(password);
    const isPasswordValid = passwordErrors.length === 0 && password.length > 0;
    const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setErrors(['Invalid or expired reset token']);
            return;
        }

        if (!isPasswordValid) {
            setErrors(['Please ensure your password meets all requirements']);
            return;
        }

        if (!doPasswordsMatch) {
            setErrors(['Passwords do not match']);
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            await (role === 'user' ? userResetPassword : shopResetPassword)({
                token,
                password,
                confirmPassword
            });

            setIsSuccess(true);
            console.log('Password reset successful:', { token, role });
        } catch (error) {
            setErrors(['Failed to reset password. Please try again.']);
            console.error('Password reset failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Logo */}
                        <div className="flex items-center justify-center space-x-2 mb-8">
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-12 sm:w-24 sm:h-14 md:w-28 md:h-16 lg:w-32 lg:h-20 flex items-center justify-center">
                                    <img
                                        src={logo || "/placeholder.svg?height=44&width=57"}
                                        alt="logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Success Icon */}
                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-black mb-4">Password Reset Successful!</h2>
                        <p className="text-gray-600 mb-8">
                            Your password has been successfully updated. You can now log in with your new password.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={onSuccess || onBack}
                                className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                            >
                                Continue to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Logo */}
                        <div className="flex items-center justify-center space-x-2 mb-8">
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-12 sm:w-24 sm:h-14 md:w-28 md:h-16 lg:w-32 lg:h-20 flex items-center justify-center">
                                    <img
                                        src={logo || "/placeholder.svg?height=44&width=57"}
                                        alt="logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-8 w-8 text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-black mb-4">Invalid Reset Link</h2>
                        <p className="text-gray-600 mb-8">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>

                        <button
                            onClick={onBack}
                            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                        >
                            Request New Reset Link
                        </button>
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
                        <div className="flex items-center justify-center space-x-2 mb-6">
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-12 sm:w-24 sm:h-14 md:w-28 md:h-16 lg:w-32 lg:h-20 flex items-center justify-center">
                                    <img
                                        src={logo || "/placeholder.svg?height=44&width=57"}
                                        alt="logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>

                            <span className="text-2xl font-bold text-black">fluffyCare</span>
                        </div>

                        <h2 className="text-2xl font-bold text-black mb-2">Reset Your Password</h2>
                        <p className="text-gray-600">
                            Create a new secure password for your {role === 'user' ? 'pet parent' : 'service provider'} account.
                        </p>
                    </div>

                    {/* Error Messages */}
                    {errors.length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <ul className="text-sm text-red-600 space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                                    <div className="grid grid-cols-1 gap-1">
                                        {[
                                            { check: password.length >= 8, text: 'At least 8 characters' },
                                            { check: /[A-Z]/.test(password), text: 'One uppercase letter' },
                                            { check: /[a-z]/.test(password), text: 'One lowercase letter' },
                                            { check: /\d/.test(password), text: 'One number' },
                                            { check: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character' }
                                        ].map((req, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${req.check ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className={`text-xs ${req.check ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${confirmPassword.length > 0 && !doPasswordsMatch
                                        ? 'border-red-300 bg-red-50'
                                        : confirmPassword.length > 0 && doPasswordsMatch
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-300'
                                        }`}
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {confirmPassword.length > 0 && (
                                <p className={`mt-2 text-sm ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                                    {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    {onBack && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate('/shop/login')}
                                className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                            >
                                Continue to Login
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
                        <a href="mailto:support@fluffycare.com" className="text-black hover:underline font-medium">
                            support@fluffycare.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordForm;