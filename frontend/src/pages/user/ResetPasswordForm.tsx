import ResetPasswordForm from '@/components/shared/ResetPasswordForm';
import { useSearchParams } from 'react-router-dom';

const ShopResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;

  return <ResetPasswordForm role="user" token={token} />;
};

export default ShopResetPassword;
