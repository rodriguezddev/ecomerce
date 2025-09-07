
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { authService, User, Profile, profileService } from "@/services/api";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Nuevo estado para manejar la carga inicial
  login: (username: string, password: string) => Promise<boolean>;
  updateProfile: (profile: Profile) => void;
  register: (userData: User) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in from localStorage
  useEffect(() => {
    try {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
        if (storedUser.perfil) {
          setProfile(storedUser.perfil);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // If there's an error, clear potentially corrupted data
      authService.logout();
    } finally {
        setIsLoading(false); // Marcar que la carga inicial ha terminado
      }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
       setIsLoading(true);
      const response = await authService.login(username, password);
      
      // Process the response and set the user
      if (response && response.tokens.accessToken) {
        // Create a user object based on the token information
        const loggedInUser: User = {
          username: username,
          email: username, // Fallback as email if needed
          rol: response.rol,
          perfil: {
            nombre:  "",
            apellido:  "",
            direccion:  "",
            cedula:  "",
            numeroTelefono:  "",
            id: response.profileId
          },
          token: response.tokens.accessToken,
          refreshToken: response.refreshToken
        };
setUser(loggedInUser);
        
        
        // Store the user in localStorage with the token
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('token', response.tokens.accessToken);
        
        toast({
          title: "Inicio de sesión exitoso",
          description: `¡Bienvenido de nuevo, ${username}!`,
        });
        return true;
      } else {
        throw new Error("No access token returned");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: "Usuario o contraseña inválidos",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false); // Finalizar carga
    }
  };

  const register = async (userData: User): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(userData);
      
      toast({
        title: "Registro exitoso",
        description: `¡Bienvenido, ${userData.username}!`,
      });
      
      // Auto login after registration
      return await login(userData.username, userData.password || "");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error de registro",
        description: "Por favor, proporciona información válida",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    if (user) {
      const updatedUser = { ...user, perfil: updatedProfile };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };


  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  console.log(user, 'XXXXXXX')

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      isAuthenticated: !!user?.token, 
      isLoading,
      login, 
      register,
      updateProfile,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
