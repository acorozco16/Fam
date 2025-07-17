import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const LoginScreen = () => {
  const { login, loading, error } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  
  // Detect if running as PWA (home screen app)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone === true;

  const addDebug = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setDebugInfo([]); // Clear previous debug info
      
      // If running as PWA, show instructions
      if (isPWA) {
        addDebug('PWA mode detected - showing Safari instructions');
        setIsLoggingIn(false);
        return;
      }
      
      addDebug('Starting login process...');
      console.log('🔑 Starting login process...');
      
      const result = await login();
      
      addDebug(`Login result: ${JSON.stringify(result)}`);
      console.log('🔑 Login result:', result);
      
      if (result.success) {
        addDebug('Login successful');
        console.log('✅ Login successful');
        if (result.pending) {
          addDebug('Redirect auth pending...');
          console.log('⏳ Redirect auth pending...');
        }
      } else {
        addDebug(`Login failed: ${result.error}`);
        console.error('❌ Login failed:', result.error);
      }
    } catch (error) {
      addDebug(`Login error: ${error.message}`);
      console.error('💥 Login error:', error);
    } finally {
      if (!isPWA) {
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to FamApp
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to manage your family trips and adventures
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <Button 
            onClick={handleLogin}
            disabled={loading || isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </div>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            <p>Your trips will be saved securely in the cloud</p>
            {isPWA && (
              <p className="mt-2 text-xs text-orange-600">
                Note: Login will open in Safari due to app restrictions
              </p>
            )}
          </div>
          
          {/* Debug Panel - Remove after fixing */}
          {debugInfo.length > 0 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs font-semibold mb-1">Debug Info:</p>
              {debugInfo.map((info, index) => (
                <p key={index} className="text-xs text-gray-600">{info}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};