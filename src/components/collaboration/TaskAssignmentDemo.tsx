import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Target,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { TaskAssignment } from './TaskAssignment';
import { TaskOverview } from './TaskOverview';
import { ReadinessItem, TripCollaborator, TaskComment } from '../../types';
import { taskAssignmentService } from '../../services/taskAssignmentService';

export const TaskAssignmentDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock trip data
  const mockTripId = 'demo-trip-123';
  const mockCurrentUser = {
    email: 'john@example.com',
    name: 'John Smith'
  };

  // Mock collaborators
  const mockCollaborators: TripCollaborator[] = [
    {
      userId: 'john@example.com',
      email: 'john@example.com',
      name: 'John Smith',
      role: 'owner',
      joinedAt: '2025-07-22T10:00:00Z',
      lastActive: '2025-07-22T10:00:00Z'
    },
    {
      userId: 'jane@example.com',
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'collaborator',
      joinedAt: '2025-07-21T15:30:00Z',
      lastActive: '2025-07-22T09:45:00Z'
    },
    {
      userId: 'teen@example.com',
      email: 'teen@example.com',
      name: 'Alex Smith',
      role: 'collaborator',
      joinedAt: '2025-07-20T12:00:00Z',
      lastActive: '2025-07-22T08:30:00Z'
    },
    {
      userId: 'grandma@example.com',
      email: 'grandma@example.com',
      name: 'Grandma Rose',
      role: 'viewer',
      joinedAt: '2025-07-19T14:00:00Z',
      lastActive: '2025-07-21T20:00:00Z'
    }
  ];

  // Mock readiness items with various states
  const [mockReadinessItems, setMockReadinessItems] = useState<ReadinessItem[]>([
    {
      id: 'flights-booked',
      title: 'Book Flight Tickets',
      subtitle: 'Find and book flights for the family',
      category: 'transportation',
      status: 'complete',
      urgent: false,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 30,
      assignedTo: 'john@example.com',
      assignedBy: 'john@example.com',
      assignedAt: '2025-07-20T10:00:00Z',
      completedBy: 'john@example.com',
      completedAt: '2025-07-21T14:30:00Z',
      comments: [
        {
          id: 'comment1',
          taskId: 'flights-booked',
          authorId: 'john@example.com',
          authorName: 'John Smith',
          content: 'Found great direct flights on United! Booked for all 4 of us.',
          createdAt: '2025-07-21T14:32:00Z'
        }
      ]
    },
    {
      id: 'hotel-booking',
      title: 'Reserve Hotel',
      subtitle: 'Book family-friendly accommodations',
      category: 'accommodation',
      status: 'incomplete',
      urgent: true,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 25,
      assignedTo: 'jane@example.com',
      assignedBy: 'john@example.com',
      assignedAt: '2025-07-21T09:00:00Z',
      comments: [
        {
          id: 'comment2',
          taskId: 'hotel-booking',
          authorId: 'jane@example.com',
          authorName: 'Jane Smith',
          content: 'Looking at 3 options - the Marriott has a great family pool!',
          createdAt: '2025-07-21T16:00:00Z'
        },
        {
          id: 'comment3',
          taskId: 'hotel-booking',
          authorId: 'john@example.com',
          authorName: 'John Smith',
          content: 'Pool sounds perfect for the kids. Book it if the price is right!',
          createdAt: '2025-07-21T16:30:00Z'
        }
      ]
    },
    {
      id: 'travel-insurance',
      title: 'Get Travel Insurance',
      subtitle: 'Purchase comprehensive family travel insurance',
      category: 'documents',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 20,
      assignedTo: 'teen@example.com',
      assignedBy: 'john@example.com',
      assignedAt: '2025-07-22T08:00:00Z'
    },
    {
      id: 'packing-kids',
      title: 'Pack Kids\' Clothes',
      subtitle: 'Pack clothing and essentials for children',
      category: 'packing',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 3
    },
    {
      id: 'currency-exchange',
      title: 'Exchange Currency',
      subtitle: 'Get Euros for the trip',
      category: 'financial',
      status: 'incomplete',
      urgent: true,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 7
    },
    {
      id: 'research-restaurants',
      title: 'Research Family Restaurants',
      subtitle: 'Find kid-friendly dining options in Madrid',
      category: 'activities',
      status: 'incomplete',
      urgent: false,
      isCustom: true,
      priority: 'low'
    }
  ]);

  // Enhanced items with current assignment state
  const enhancedItems = taskAssignmentService.getEnhancedReadinessItems(
    mockTripId, 
    mockReadinessItems
  );

  // Demo action handlers
  const handleAssignTask = (taskId: string, assignedTo: string, assignedBy: string) => {
    taskAssignmentService.assignTask(mockTripId, taskId, assignedTo, assignedBy);
    // In a real app, this would trigger a re-render via state management
    console.log(`Task ${taskId} assigned to ${assignedTo} by ${assignedBy}`);
  };

  const handleUnassignTask = (taskId: string) => {
    taskAssignmentService.unassignTask(mockTripId, taskId);
    console.log(`Task ${taskId} unassigned`);
  };

  const handleCompleteTask = (taskId: string, completedBy: string) => {
    taskAssignmentService.completeTask(mockTripId, taskId, completedBy);
    
    // Update local state for demo
    setMockReadinessItems(prev => 
      prev.map(item => 
        item.id === taskId 
          ? { ...item, status: 'complete' as const }
          : item
      )
    );
    console.log(`Task ${taskId} completed by ${completedBy}`);
  };

  const handleAddComment = (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => {
    const newComment = taskAssignmentService.addTaskComment(mockTripId, taskId, comment);
    
    // Update local state for demo
    setMockReadinessItems(prev => 
      prev.map(item => 
        item.id === taskId 
          ? { 
              ...item, 
              comments: [...(item.comments || []), newComment]
            }
          : item
      )
    );
    console.log(`Comment added to task ${taskId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Task Assignment Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how families can assign, track, and collaborate on trip preparation tasks 
            with role-based permissions and real-time updates.
          </p>
        </div>

        {/* Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Task Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual Tasks</TabsTrigger>
            <TabsTrigger value="workflow">Assignment Workflow</TabsTrigger>
          </TabsList>

          {/* Task Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Family Task Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Real-time overview of all trip preparation tasks and family member progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskOverview
                  tripId={mockTripId}
                  readinessItems={enhancedItems}
                  collaborators={mockCollaborators}
                  currentUserEmail={mockCurrentUser.email}
                  tripStartDate="2025-08-15"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Tasks Tab */}
          <TabsContent value="individual" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Individual Task Management</h2>
              <p className="text-gray-600">
                See how each task can be assigned, tracked, and discussed by family members
              </p>
            </div>

            {enhancedItems.map(task => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{task.title}</span>
                        {task.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        {task.isCustom && (
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{task.subtitle}</CardDescription>
                    </div>
                    <Badge 
                      variant={task.status === 'complete' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {task.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <TaskAssignment
                    task={task}
                    collaborators={mockCollaborators}
                    currentUserEmail={mockCurrentUser.email}
                    currentUserName={mockCurrentUser.name}
                    onAssignTask={handleAssignTask}
                    onUnassignTask={handleUnassignTask}
                    onCompleteTask={handleCompleteTask}
                    onAddComment={handleAddComment}
                  />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Assignment Workflow Tab */}
          <TabsContent value="workflow">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1: Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <span>1. Assign Tasks</span>
                  </CardTitle>
                  <CardDescription>
                    Trip organizers can assign tasks to family members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Role-based permissions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Smart suggestions by member</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Bulk assignment options</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Timeline-based prioritization</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Collaboration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span>2. Collaborate</span>
                  </CardTitle>
                  <CardDescription>
                    Family members can discuss and coordinate tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Task-specific comments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Real-time notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Progress updates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Questions and clarifications</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Track Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span>3. Track Progress</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor completion and ensure nothing is missed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Visual progress tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Member-specific dashboards</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Deadline reminders</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Completion celebrations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Summary */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Task Assignment Features</CardTitle>
                <CardDescription>
                  Comprehensive task management for family trip planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Assignment Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Smart task suggestions based on family roles</li>
                      <li>• Role-based assignment permissions</li>
                      <li>• Bulk assignment and management tools</li>
                      <li>• Task reassignment and delegation</li>
                      <li>• Timeline and priority management</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Collaboration Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Task-specific comment threads</li>
                      <li>• Real-time progress updates</li>
                      <li>• Member activity tracking</li>
                      <li>• Deadline and urgency notifications</li>
                      <li>• Completion tracking and history</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};