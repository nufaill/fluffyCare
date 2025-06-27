import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../../services/user/authService';
import type { SignupForm } from '../../types/auth.type';

export const useCustomerRegister = () => {
  return useMutation({
    mutationFn: (data: SignupForm) => registerUser(data),
    onError: (error: Error) => {
      console.error("Registration error:", error.message);
    }
  });
};
