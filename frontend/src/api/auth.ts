import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { baseUrl } from "./base";

export type LoginProps = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const { dispatch, storeUser, storeToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const login = async ({ email, password }: LoginProps) => {
    return fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          toast({
            title: "Login failed.",
            description:
              "You may have entered an invalid email or password. Please try again.",
            variant: "destructive",
          });
          return;
        }
        return res.json();
      })
      .then((data) => {
        const { token, user } = data;
        storeUser(user);
        storeToken(token);
        dispatch({ type: "LOGIN", payload: { user, token } });

        const origin = location.state?.from?.pathname || "/listings";
        navigate(origin);
        toast({
          title: "Login successful",
          description: `Nice to have you back, ${user.firstname}!`,
          variant: "success",
          duration: 3000,
        });
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: login,
  });
};

export const useLogout = () => {
  const { dispatch, onLogout } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    dispatch({ type: "LOGOUT" });
    onLogout();
    navigate("/");
  };

  return useMutation({
    mutationFn: logout,
  });
};

export type SignUpFormData = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  otp: string;
};

export const useSignup = () => {
  const { toast } = useToast();
  const { mutateAsync: login } = useLogin();

  const signup = async (data: SignUpFormData) => {
    return fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.status === 400 || res.status === 404) {
          toast({
            title: "Sign up failed.",
            description:
              "You might have entered an invalid verification code. Please check your email try again.",
            variant: "destructive",
          });
          return;
        }
        if (res.status === 201) {
          toast({
            title: "Sign up successful!",
            description: "Logging you in...",
            duration: 3000,
          });
          void login({
            email: data.email,
            password: data.password,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (data: SignUpFormData) => signup(data),
  });
};

export type SendOTPProps = Omit<SignUpFormData, "otp">;

export const useSendOTP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const sendOTP = async (data: SendOTPProps) => {
    const { email } = data;

    return fetch(`${baseUrl}/auth/otp`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => {
        if (res.status === 400) {
          toast({
            title: "Failed to send OTP.",
            description:
              "You may have entered an email that is already registered to an existing user.",
            variant: "destructive",
          });
          return;
        }
        if (res.status === 404) {
          toast({
            title: "Something went wrong.",
            description: "Failed to send OTP. Please try again.",
            variant: "destructive",
          });
          return;
        }
        if ((res as Response).ok) {
          navigate("/verify", {
            state: {
              ...data,
            },
          });
        }
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (data: SendOTPProps) => sendOTP(data),
  });
};
