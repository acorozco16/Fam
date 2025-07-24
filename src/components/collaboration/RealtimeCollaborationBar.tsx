import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Circle, 
  Eye, 
  Edit,
  Crown,
  MessageCircle
} from 'lucide-react';
import { PresenceData } from '../../services/realtimeCollaborationService';
import { TripCollaborator } from '../../types';

interface RealtimeCollaborationBarProps {
  presenceUsers: PresenceData[];
  collaborators: TripCollaborator[];
  typingUsers: string[];
  isOnline: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  currentUserId: string;
}

export const RealtimeCollaborationBar: React.FC<RealtimeCollaborationBarProps> = ({
  presenceUsers,
  collaborators,
  typingUsers,
  isOnline,
  connectionStatus,
  currentUserId
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleIcon = (userId: string) => {
    const collaborator = collaborators.find(c => c.userId === userId);
    if (!collaborator) return null;
    
    switch (collaborator.role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-600" />;
      case 'collaborator': return <Edit className="w-3 h-3 text-blue-600" />;
      case 'viewer': return <Eye className="w-3 h-3 text-gray-600" />;
      default: return null;
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': 
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'connecting': 
        return <Wifi className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'disconnected': 
        return <WifiOff className="w-4 h-4 text-red-600" />;
    }
  };

  const onlineUsers = presenceUsers.filter(user => user.status === 'online');
  const awayUsers = presenceUsers.filter(user => user.status === 'away');
  const totalActiveUsers = onlineUsers.length + awayUsers.length;

  const getTypingMessage = () => {
    if (typingUsers.length === 0) return null;
    
    const typingNames = typingUsers
      .map(userId => {
        const user = presenceUsers.find(p => p.userId === userId);
        return user?.name || 'Someone';
      })
      .slice(0, 3); // Limit to 3 names
    
    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else if (typingNames.length === 3) {
      return `${typingNames[0]}, ${typingNames[1]} and ${typingNames[2]} are typing...`;
    } else {
      return `${typingNames[0]}, ${typingNames[1]} and ${typingUsers.length - 2} others are typing...`;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side - Connection status and active users */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {getConnectionStatusIcon()}
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'disconnected' && 'Offline'}
            </span>
          </div>

          {/* Active Users */}
          {totalActiveUsers > 0 && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="flex items-center space-x-1">
                {/* Show individual avatars for first few users */}
                {onlineUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.userId}
                    className="relative group"
                    title={`${user.name} - ${user.status}`}
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border border-white">
                      <span className="text-xs font-medium text-blue-700">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    {/* Status indicator */}
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${getStatusColor(user.status)}`}
                    />
                    {/* Role indicator */}
                    <div className="absolute -top-1 -right-1">
                      {getRoleIcon(user.userId)}
                    </div>
                  </div>
                ))}
                
                {/* Show count if more users */}
                {totalActiveUsers > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{totalActiveUsers - 5}
                  </Badge>
                )}
              </div>
              
              {/* Active user count */}
              <span className="text-sm text-gray-600">
                {totalActiveUsers} active
              </span>
            </div>
          )}
        </div>

        {/* Right side - Typing indicators and actions */}
        <div className="flex items-center space-x-4">
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="italic">
                {getTypingMessage()}
              </span>
              <div className="flex space-x-1">
                <Circle className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <Circle className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <Circle className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}

          {/* Network status indicator */}
          {!isOnline && (
            <Badge variant="destructive" className="text-xs">
              Offline
            </Badge>
          )}
          
          {connectionStatus === 'connected' && isOnline && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Live
            </Badge>
          )}
        </div>
      </div>

      {/* Offline message */}
      {!isOnline && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              You're offline. Changes will sync when you reconnect.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};