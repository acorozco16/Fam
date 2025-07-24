import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Crown,
  Edit,
  Eye,
  Plane
} from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import { TripInvite, CollaborativeTrip } from '../../types';

interface InviteAcceptPageProps {
  inviteToken: string;
}

export const InviteAcceptPage: React.FC<InviteAcceptPageProps> = ({ inviteToken }) => {
  const [invite, setInvite] = useState<TripInvite | null>(null);
  const [trip, setTrip] = useState<CollaborativeTrip | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInviteDetails();
  }, [inviteToken]);

  const loadInviteDetails = async () => {
    try {
      // Get invite from localStorage (in production, this would be an API call)
      const pendingInvites = JSON.parse(localStorage.getItem('pendingInvites') || '[]');
      const foundInvite = pendingInvites.find((inv: TripInvite) => inv.token === inviteToken);
      
      if (!foundInvite) {
        setError('Invalid or expired invitation link');
        setIsLoading(false);
        return;
      }

      // Check if invite is expired
      if (new Date(foundInvite.expiresAt) < new Date()) {
        setError('This invitation has expired');
        setIsLoading(false);
        return;
      }

      // Check if invite is still pending
      if (foundInvite.status !== 'pending') {
        setError(`This invitation has already been ${foundInvite.status}`);
        setIsLoading(false);
        return;
      }

      setInvite(foundInvite);
      
      // Pre-fill email if it matches the invite
      setUserEmail(foundInvite.inviteeEmail);

      // Load trip details (in production, this would be an API call)
      const mockTrip: CollaborativeTrip = {
        id: foundInvite.tripId,
        city: 'Madrid',
        country: 'Spain',
        startDate: '2025-08-15',
        endDate: '2025-08-22',
        ownerId: foundInvite.inviterEmail,
        collaborators: [],
        permissions: {},
        invites: [foundInvite],
        lastModified: new Date().toISOString(),
        modifiedBy: foundInvite.inviterEmail,
        isShared: true
      };
      
      setTrip(mockTrip);
      
    } catch (err) {
      setError('Failed to load invitation details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!userEmail.trim() || !isValidEmail(userEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsAccepting(true);
    setError('');

    try {
      await collaborationService.acceptInvite(inviteToken, userEmail.trim(), userName.trim());
      setSuccess(true);
      
      // Redirect to trip page after 3 seconds
      setTimeout(() => {
        window.location.href = `/trip/${invite?.tripId}`;
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineInvite = async () => {
    try {
      await collaborationService.declineInvite(inviteToken);
      setError('Invitation declined');
    } catch (err) {
      setError('Failed to decline invitation');
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'collaborator':
        return <Edit className="w-5 h-5 text-blue-600" />;
      case 'viewer':
        return <Eye className="w-5 h-5 text-gray-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'collaborator':
        return 'You can edit trip details, manage tasks, and add activities';
      case 'viewer':
        return 'You can view trip details but cannot make changes';
      default:
        return 'Unknown role';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the trip!</h2>
            <p className="text-gray-600 mb-4">
              You've successfully joined the family trip planning.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to the trip page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Invited!</h1>
          <p className="text-gray-600">
            {invite?.inviterName} has invited you to collaborate on their family trip
          </p>
        </div>

        {/* Trip Details */}
        {trip && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>{trip.city}, {trip.country}</span>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.startDate} - {trip.endDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Family Trip</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invite?.message && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 italic">"{invite.message}"</p>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                {getRoleIcon(invite?.role || '')}
                <div>
                  <h4 className="font-medium">You're invited as a {invite?.role}</h4>
                  <p className="text-sm text-gray-600">{getRoleDescription(invite?.role || '')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acceptance Form */}
        <Card>
          <CardHeader>
            <CardTitle>Join the Trip</CardTitle>
            <CardDescription>
              Please provide your details to accept the invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled={userEmail === invite?.inviteeEmail}
              />
              {userEmail === invite?.inviteeEmail && (
                <p className="text-xs text-gray-500">
                  This email matches the invitation recipient
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleDeclineInvite}
                disabled={isAccepting}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                onClick={handleAcceptInvite}
                disabled={isAccepting || !userName.trim() || !userEmail.trim()}
                className="flex-1"
              >
                {isAccepting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};