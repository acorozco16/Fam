import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Users, 
  UserPlus, 
  Send, 
  X, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Edit
} from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import { TripInvite } from '../../types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
  userEmail: string;
  userName: string;
  onInviteSent?: (email: string, role: 'collaborator' | 'viewer', message?: string) => Promise<void>;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  tripId,
  tripTitle,
  userEmail,
  userName,
  onInviteSent
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [role, setRole] = useState<'collaborator' | 'viewer'>('collaborator');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Debug logging for modal visibility
  React.useEffect(() => {
    console.log('InviteModal isOpen:', isOpen);
    if (isOpen) {
      console.log('InviteModal should be visible with props:', { tripId, tripTitle, userEmail, userName });
    }
  }, [isOpen, tripId, tripTitle, userEmail, userName]);

  const roleDescriptions = {
    collaborator: {
      icon: Edit,
      title: 'Collaborator',
      description: 'Can edit trip details, manage tasks, and add activities',
      permissions: ['Edit trip details', 'Manage tasks', 'Add activities', 'View budget']
    },
    viewer: {
      icon: Eye,
      title: 'Viewer',
      description: 'Can view trip details but cannot make changes',
      permissions: ['View trip details', 'View activities', 'View budget', 'Read-only access']
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!isValidEmail(inviteEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (inviteEmail.toLowerCase() === userEmail.toLowerCase()) {
      setError('You cannot invite yourself');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (onInviteSent) {
        // Use real-time collaboration service
        await onInviteSent(inviteEmail.trim(), role, personalMessage.trim() || undefined);
        setSuccess(`Invitation sent to ${inviteEmail}!`);
      } else {
        // Fallback to mock service
        const invite = await collaborationService.createTripInvite(
          tripId,
          userEmail,
          userName,
          inviteEmail.trim(),
          role,
          personalMessage.trim() || undefined
        );
        setSuccess(`Invitation sent to ${inviteEmail}!`);
      }
      
      // Reset form
      setInviteEmail('');
      setPersonalMessage('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <CardTitle>Invite Family Member</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Invite someone to collaborate on <strong>{tripTitle}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="family@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Role & Permissions</Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(roleDescriptions).map(([roleKey, roleInfo]) => (
                <div
                  key={roleKey}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    role === roleKey
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setRole(roleKey as 'collaborator' | 'viewer')}
                >
                  <div className="flex items-start space-x-3">
                    <roleInfo.icon className={`w-5 h-5 mt-0.5 ${
                      role === roleKey ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{roleInfo.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{roleInfo.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {roleInfo.permissions.map((permission) => (
                          <Badge 
                            key={permission} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {role === roleKey && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Hey! I'd love you to help plan our family trip..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 text-right">
              {personalMessage.length}/200
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={isLoading || !inviteEmail.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};