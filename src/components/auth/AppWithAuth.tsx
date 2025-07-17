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

  // Skip auth requirement - let users use the app without signing in
  // They can still sign in later if they want cloud sync
  console.log('✅ Showing main app (auth optional)');
  return <>{children}</>;
};