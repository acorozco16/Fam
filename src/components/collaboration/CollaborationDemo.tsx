import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Mail, 
  CheckCircle,
  Clock,
  Play,
  ArrowRight
} from 'lucide-react';
import { InviteModal } from './InviteModal';
import { FamilyMemberManager } from './FamilyMemberManager';
import { InviteAcceptPage } from './InviteAcceptPage';
import { TaskAssignmentDemo } from './TaskAssignmentDemo';
import { collaborationService } from '../../services/collaborationService';

export const CollaborationDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'invite' | 'manage' | 'accept' | 'tasks' | null>(null);
  const [demoStep, setDemoStep] = useState(1);
  
  // Mock data for demo
  const mockTrip = {
    id: 'demo-trip-123',
    city: 'Madrid',
    country: 'Spain',
    startDate: '2025-08-15',
    endDate: '2025-08-22'
  };

  const mockUser = {
    email: 'john@example.com',
    name: 'John Smith'
  };

  const mockCollaborators = [
    {
      userId: 'john@example.com',
      email: 'john@example.com',
      name: 'John Smith',
      role: 'owner' as const,
      joinedAt: '2025-07-22T10:00:00Z',
      lastActive: '2025-07-22T10:00:00Z'
    },
    {
      userId: 'jane@example.com',
      email: 'jane@example.com', 
      name: 'Jane Smith',
      role: 'collaborator' as const,
      joinedAt: '2025-07-21T15:30:00Z',
      lastActive: '2025-07-22T09:45:00Z'
    }
  ];

  const mockPendingInvites = [
    {
      id: 'invite-456',
      tripId: 'demo-trip-123',
      inviterEmail: 'john@example.com',
      inviterName: 'John Smith',
      inviteeEmail: 'grandma@example.com',
      role: 'viewer' as const,
      token: 'demo-token-789',
      status: 'pending' as const,
      createdAt: '2025-07-22T08:00:00Z',
      expiresAt: '2025-07-29T08:00:00Z',
      message: 'Would love your help planning our family trip to Madrid!'
    }
  ];

  const demoSteps = [
    {
      title: 'Family Member Invites',
      description: 'See how family members can be invited to collaborate on trip planning',
      component: 'invite',
      icon: UserPlus
    },
    {
      title: 'Collaboration Management',
      description: 'Manage family members, roles, and permissions for your trip',
      component: 'manage',
      icon: Users
    },
    {
      title: 'Invite Acceptance',
      description: 'Experience how family members accept invitations and join trips',
      component: 'accept',
      icon: Mail
    },
    {
      title: 'Task Assignment',
      description: 'Assign trip preparation tasks to family members and track progress',
      component: 'tasks',
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FamApp Collaboration Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience how families can plan trips together with real-time collaboration, 
            invite management, and role-based permissions.
          </p>
        </div>

        {/* Demo Steps Overview */}
        {!activeDemo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {demoSteps.map((step, index) => (
              <Card 
                key={step.component}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                onClick={() => setActiveDemo(step.component as any)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Demo Content */}
        {activeDemo && (
          <div>
            {/* Demo Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Button 
                variant="outline" 
                onClick={() => setActiveDemo(null)}
              >
                ← Back to Overview
              </Button>
              
              <Badge variant="secondary" className="text-sm">
                Demo: {demoSteps.find(s => s.component === activeDemo)?.title}
              </Badge>
            </div>

            {/* Demo Content */}
            <div className="bg-white rounded-lg shadow-xl">
              {activeDemo === 'invite' && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4">Invite Family Members</h2>
                    <p className="text-gray-600">
                      Click the button below to see how trip owners can invite family members
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <InviteModal
                      isOpen={true}
                      onClose={() => {}}
                      tripId={mockTrip.id}
                      tripTitle={`${mockTrip.city}, ${mockTrip.country}`}
                      userEmail={mockUser.email}
                      userName={mockUser.name}
                    />
                  </div>
                </div>
              )}

              {activeDemo === 'manage' && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4">Manage Collaboration</h2>
                    <p className="text-gray-600">
                      See how trip owners manage family members and permissions
                    </p>
                  </div>
                  
                  <FamilyMemberManager
                    tripId={mockTrip.id}
                    tripTitle={`${mockTrip.city}, ${mockTrip.country}`}
                    ownerId={mockUser.email}
                    currentUserEmail={mockUser.email}
                    currentUserName={mockUser.name}
                    collaborators={mockCollaborators}
                    pendingInvites={mockPendingInvites}
                    onRemoveCollaborator={(userId) => {
                      console.log('Remove collaborator:', userId);
                    }}
                    onCancelInvite={(inviteId) => {
                      console.log('Cancel invite:', inviteId);
                    }}
                  />
                </div>
              )}

              {activeDemo === 'accept' && (
                <div>
                  <InviteAcceptPage inviteToken="demo-token-789" />
                </div>
              )}

              {activeDemo === 'tasks' && (
                <div>
                  <TaskAssignmentDemo />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Overview */}
        {!activeDemo && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-12">Collaboration Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardHeader>
                  <UserPlus className="w-10 h-10 text-blue-600 mb-4" />
                  <CardTitle>Email Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Send personalized email invitations to family members with role-based permissions
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Collaborator & Viewer roles
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Personal messages
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Secure invite tokens
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-10 h-10 text-blue-600 mb-4" />
                  <CardTitle>Family Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Manage family members, track activity, and control permissions
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Real-time activity tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Role-based permissions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Remove/modify access
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="w-10 h-10 text-blue-600 mb-4" />
                  <CardTitle>Real-time Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Stay synchronized with live updates and collaboration events
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Live trip editing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Task assignments
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Activity notifications
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle className="w-10 h-10 text-blue-600 mb-4" />
                  <CardTitle>Task Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Assign trip preparation tasks to family members with progress tracking
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Smart task suggestions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Progress dashboards
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Task comments & discussion
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};