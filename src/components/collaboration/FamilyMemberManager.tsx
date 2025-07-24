import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserPlus, 
  Crown, 
  Edit, 
  Eye, 
  Mail, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { TripCollaborator, TripInvite } from '../../types';

interface FamilyMemberManagerProps {
  tripId: string;
  tripTitle: string;
  ownerId: string;
  currentUserEmail: string;
  currentUserName: string;
  collaborators: TripCollaborator[];
  pendingInvites: TripInvite[];
  onRemoveCollaborator?: (userId: string) => void;
  onCancelInvite?: (inviteId: string) => void;
  onOpenInviteModal?: () => void;
}

export const FamilyMemberManager: React.FC<FamilyMemberManagerProps> = ({
  tripId,
  tripTitle,
  ownerId,
  currentUserEmail,
  currentUserName,
  collaborators,
  pendingInvites,
  onRemoveCollaborator,
  onCancelInvite,
  onOpenInviteModal
}) => {
  const isOwner = currentUserEmail === ownerId;
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'collaborator':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInviteStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    
    const now = new Date();
    const active = new Date(lastActive);
    const diffInMinutes = Math.floor((now.getTime() - active.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Family Members</h3>
          <Badge variant="secondary">
            {collaborators.length} member{collaborators.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <Button 
          size="sm" 
          onClick={() => onOpenInviteModal?.()}
          className="flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite</span>
        </Button>
      </div>

      {/* Active Collaborators */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Active Members</CardTitle>
          <CardDescription>
            Family members who can access and collaborate on this trip
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.userId}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">
                    {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{collaborator.name}</span>
                    {collaborator.role === 'owner' && (
                      <Crown className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{collaborator.email}</span>
                    <span>•</span>
                    <span>Last active {formatLastActive(collaborator.lastActive)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Role Badge */}
                <Badge 
                  variant="outline" 
                  className={getRoleBadgeColor(collaborator.role)}
                >
                  <span className="flex items-center space-x-1">
                    {getRoleIcon(collaborator.role)}
                    <span className="capitalize">{collaborator.role}</span>
                  </span>
                </Badge>

                {/* Actions (only for owner and not self) */}
                {isOwner && collaborator.userId !== currentUserEmail && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCollaborator?.(collaborator.userId)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Pending Invitations</CardTitle>
            <CardDescription>
              Invitations sent but not yet accepted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200"
              >
                <div className="flex items-center space-x-3">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{invite.inviteeEmail}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Invited by {invite.inviterName}</span>
                      <span>•</span>
                      <span>{new Date(invite.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Status */}
                  <div className="flex items-center space-x-1">
                    {getInviteStatusIcon(invite.status)}
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                      {invite.status}
                    </Badge>
                  </div>

                  {/* Role */}
                  <Badge variant="outline" className={getRoleBadgeColor(invite.role)}>
                    <span className="flex items-center space-x-1">
                      {getRoleIcon(invite.role)}
                      <span className="capitalize">{invite.role}</span>
                    </span>
                  </Badge>

                  {/* Cancel (only for owner) */}
                  {isOwner && invite.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelInvite?.(invite.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Collaboration Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Family Collaboration</h4>
              <p className="text-sm text-blue-700">
                Invite family members to help plan your trip together. Collaborators can add activities, 
                manage tasks, and help coordinate travel plans. Viewers can see everything but can't make changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};