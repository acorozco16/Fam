import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Send,
  X
} from 'lucide-react';
import { ReadinessItem, TripCollaborator, TaskComment } from '../../types';

interface TaskAssignmentProps {
  task: ReadinessItem;
  collaborators: TripCollaborator[];
  currentUserEmail: string;
  currentUserName: string;
  onAssignTask: (taskId: string, assignedTo: string, assignedBy: string) => void;
  onUnassignTask: (taskId: string) => void;
  onCompleteTask: (taskId: string, completedBy: string) => void;
  onAddComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
}

export const TaskAssignment: React.FC<TaskAssignmentProps> = ({
  task,
  collaborators,
  currentUserEmail,
  currentUserName,
  onAssignTask,
  onUnassignTask,
  onCompleteTask,
  onAddComment
}) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [newComment, setNewComment] = useState('');

  // Find assigned collaborator
  const assignedCollaborator = task.assignedTo 
    ? collaborators.find(c => c.email === task.assignedTo)
    : null;

  // Find who completed the task
  const completedByCollaborator = task.completedBy
    ? collaborators.find(c => c.email === task.completedBy)
    : null;

  const handleAssignTask = () => {
    if (selectedAssignee) {
      onAssignTask(task.id, selectedAssignee, currentUserEmail);
      setSelectedAssignee('');
      setShowAssignDialog(false);
    }
  };

  const handleUnassignTask = () => {
    onUnassignTask(task.id);
  };

  const handleCompleteTask = () => {
    onCompleteTask(task.id, currentUserEmail);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(task.id, {
        taskId: task.id,
        authorId: currentUserEmail,
        authorName: currentUserName,
        content: newComment.trim()
      });
      setNewComment('');
      setShowCommentDialog(false);
    }
  };

  const canAssign = !task.assignedTo;
  const canUnassign = task.assignedTo === currentUserEmail || currentUserEmail === collaborators.find(c => c.role === 'owner')?.email;
  const canComplete = task.assignedTo === currentUserEmail && task.status === 'incomplete';
  const hasComments = task.comments && task.comments.length > 0;

  return (
    <div className="space-y-3">
      {/* Task Assignment Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.assignedTo ? (
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                Assigned to{' '}
                <span className="font-medium text-blue-600">
                  {assignedCollaborator?.name || task.assignedTo}
                </span>
              </span>
              {task.assignedAt && (
                <span className="text-xs text-gray-400">
                  {new Date(task.assignedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Unassigned</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {canAssign && (
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserCheck className="w-4 h-4 mr-1" />
                  Assign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Task</DialogTitle>
                  <DialogDescription>
                    Choose a family member to assign this task to.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.subtitle}</p>
                  </div>
                  
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select family member" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators
                        .filter(c => c.role !== 'viewer')
                        .map(collaborator => (
                          <SelectItem key={collaborator.email} value={collaborator.email}>
                            <div className="flex items-center space-x-2">
                              <span>{collaborator.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {collaborator.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAssignTask} disabled={!selectedAssignee}>
                      Assign Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {canUnassign && task.assignedTo && (
            <Button variant="outline" size="sm" onClick={handleUnassignTask}>
              <X className="w-4 h-4 mr-1" />
              Unassign
            </Button>
          )}

          {canComplete && (
            <Button variant="default" size="sm" onClick={handleCompleteTask}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}

          {/* Comments Button */}
          <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                {hasComments ? `${task.comments!.length}` : 'Comment'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Task Comments</DialogTitle>
                <DialogDescription>
                  {task.title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Existing Comments */}
                {hasComments && (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {task.comments!.map(comment => (
                      <Card key={comment.id} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add New Comment */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddComment} 
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task Status and Completion */}
      {task.status === 'complete' && task.completedBy && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>
            Completed by{' '}
            <span className="font-medium">
              {completedByCollaborator?.name || task.completedBy}
            </span>
          </span>
          {task.completedAt && (
            <span className="text-xs text-gray-400">
              on {new Date(task.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Urgency Indicator */}
      {task.urgent && task.status === 'incomplete' && (
        <div className="flex items-center space-x-2 text-sm text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <span>Urgent - needs attention soon</span>
        </div>
      )}

      {/* Due Date Indicator */}
      {task.daysBeforeTrip && task.status === 'incomplete' && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            Recommended: {task.daysBeforeTrip} days before trip
          </span>
        </div>
      )}
    </div>
  );
};