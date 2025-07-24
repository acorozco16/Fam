import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  UserCheck,
  ListTodo,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { ReadinessItem, TripCollaborator } from '../../types';
import { taskAssignmentService } from '../../services/taskAssignmentService';

interface TaskOverviewProps {
  tripId: string;
  readinessItems: ReadinessItem[];
  collaborators: TripCollaborator[];
  currentUserEmail: string;
  tripStartDate?: string;
}

export const TaskOverview: React.FC<TaskOverviewProps> = ({
  tripId,
  readinessItems,
  collaborators,
  currentUserEmail,
  tripStartDate
}) => {
  // Enhanced readiness items with assignment data
  const enhancedItems = useMemo(() => 
    taskAssignmentService.getEnhancedReadinessItems(tripId, readinessItems),
    [tripId, readinessItems]
  );

  // Calculate statistics
  const stats = useMemo(() => 
    taskAssignmentService.getTaskStats(tripId, readinessItems),
    [tripId, readinessItems]
  );

  // Group tasks by collaborator
  const tasksByMember = useMemo(() => {
    const grouped: Record<string, ReadinessItem[]> = {};
    
    collaborators.forEach(member => {
      grouped[member.email] = enhancedItems.filter(item => 
        item.assignedTo === member.email
      );
    });
    
    // Add unassigned tasks
    grouped['unassigned'] = enhancedItems.filter(item => !item.assignedTo);
    
    return grouped;
  }, [enhancedItems, collaborators]);

  // Calculate days until trip
  const daysUntilTrip = tripStartDate 
    ? Math.ceil((new Date(tripStartDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Tasks
              </CardTitle>
              <ListTodo className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-500">
              {stats.assigned} assigned, {stats.unassigned} unassigned
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">
              {completionPercentage}% complete
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Urgent Tasks
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.overdue}</div>
            <div className="text-xs text-gray-500">
              Need immediate attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Days to Trip
              </CardTitle>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {daysUntilTrip !== null ? daysUntilTrip : '—'}
            </div>
            <div className="text-xs text-gray-500">
              {daysUntilTrip !== null && daysUntilTrip > 0 ? 'days remaining' : 'trip started'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Trip Preparation Progress</span>
          </CardTitle>
          <CardDescription>
            Overall completion status across all family members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.completed} completed</span>
              <span>{stats.total - stats.completed} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Distribution by Member */}
      <Tabs defaultValue="by-member" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="by-member">By Family Member</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="by-member" className="space-y-4">
          {collaborators.map(member => {
            const memberTasks = tasksByMember[member.email] || [];
            const memberStats = stats.byMember[member.email] || { assigned: 0, completed: 0, pending: 0 };
            const memberCompletionRate = memberStats.assigned > 0 
              ? Math.round((memberStats.completed / memberStats.assigned) * 100)
              : 0;

            return (
              <Card key={member.email}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>
                          {memberStats.assigned} tasks assigned
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {memberStats.assigned > 0 && (
                        <Badge variant={memberCompletionRate === 100 ? 'default' : 'outline'}>
                          {memberCompletionRate}% complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {memberTasks.length > 0 ? (
                    <div className="space-y-3">
                      {memberStats.assigned > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{memberStats.completed}/{memberStats.assigned}</span>
                          </div>
                          <Progress value={memberCompletionRate} className="h-1" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {memberTasks.slice(0, 3).map(task => (
                          <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              {task.status === 'complete' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : task.urgent ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm font-medium">{task.title}</span>
                            </div>
                            <Badge 
                              variant={task.status === 'complete' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                        
                        {memberTasks.length > 3 && (
                          <div className="text-center pt-2">
                            <span className="text-sm text-gray-500">
                              +{memberTasks.length - 3} more tasks
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No tasks assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="by-category" className="space-y-4">
          {/* Group by category */}
          {Object.entries(
            enhancedItems.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {} as Record<string, ReadinessItem[]>)
          ).map(([category, items]) => {
            const completedInCategory = items.filter(item => item.status === 'complete').length;
            const categoryCompletion = Math.round((completedInCategory / items.length) * 100);

            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{category}</CardTitle>
                    <Badge variant="outline">
                      {completedInCategory}/{items.length} complete
                    </Badge>
                  </div>
                  <Progress value={categoryCompletion} className="h-1" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm">{item.title}</span>
                        <div className="flex items-center space-x-2">
                          {item.assignedTo && (
                            <Badge variant="secondary" className="text-xs">
                              {collaborators.find(c => c.email === item.assignedTo)?.name || 'Assigned'}
                            </Badge>
                          )}
                          <Badge 
                            variant={item.status === 'complete' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-center pt-2">
                        <span className="text-sm text-gray-500">
                          +{items.length - 3} more in this category
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="unassigned">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Tasks</CardTitle>
              <CardDescription>
                {tasksByMember.unassigned?.length || 0} tasks need to be assigned to family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksByMember.unassigned?.length > 0 ? (
                <div className="space-y-3">
                  {tasksByMember.unassigned.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>All tasks have been assigned!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};