// src/components/GoogleLoginButton.tsx
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { authAxios } from "@/api/auth.axios";
import { addUser } from "@/redux/slices/user.slice";
import {  useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
    const credential = credentialResponse.credential;

    if (!credential) {
      console.error("No credential returned");
      return;
    }

    try {
      const res = await authAxios.post("/google-login", { credential });
      dispatch(addUser(res.data.user)); 
      navigate('/')
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error("Google Login Failed")}
    />
  );
};

export default GoogleLoginButton
