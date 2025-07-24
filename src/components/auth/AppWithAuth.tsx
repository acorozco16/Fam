import { useAuth } from '../../contexts/AuthContext';
import { LoginScreen } from './LoginScreen';
import { LoadingScreen } from './LoadingScreen';

interface AppWithAuthProps {
  children: React.ReactNode;
}

export const AppWithAuth: React.FC<AppWithAuthProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('🔍 Auth state:', { user: !!user, loading, isAuthenticated });

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('🔐 User not authenticated, showing login screen');
    return <LoginScreen />;
  }

  console.log('✅ User authenticated, showing main app');
  return <>{children}</>;
};