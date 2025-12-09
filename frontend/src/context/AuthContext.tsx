import { createContext, FC, ReactNode, useEffect, useReducer } from "react";
import { User } from "@/model/user";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | undefined;
  user: User | null;
  storeUser: (user: User) => void;
  storeToken: (token: string) => void;
  onLogout: () => void;
  dispatch: React.Dispatch<AppAction>;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  token: string;
}

type AppAction = {
  type: "LOGIN" | "LOGOUT" | "UPDATE_USER";
  payload?: {
    user?: User;
    token?: string;
  };
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const authReducer = (state: AppState, action: AppAction): AppState => {
  const { type, payload } = action;

  switch (type) {
    case "LOGIN":
      return {
        user: payload?.user ?? null,
        isAuthenticated: true,
        token: payload?.token ?? "",
      };
    case "LOGOUT":
      return { user: null, isAuthenticated: false, token: "" };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...payload?.user },
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    token: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    if (token && user) {
      dispatch({ type: "LOGIN", payload: { user, token } });
    }
  }, []);

  const storeUser = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    dispatch({ type: "UPDATE_USER", payload: { user } });
  };

  const storeToken = (token: string) => {
    localStorage.setItem("token", token);
    dispatch({ type: "LOGIN", payload: { token } });
  };

  const onLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
        storeUser,
        storeToken,
        onLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
