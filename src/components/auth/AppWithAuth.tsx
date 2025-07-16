import { useAuth } from '../../contexts/AuthContext';
import { LoginScreen } from './LoginScreen';
import { LoadingScreen } from './LoadingScreen';

interface AppWithAuthProps {
  children: React.ReactNode;
}

export const AppWithAuth: React.FC<AppWithAuthProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
};