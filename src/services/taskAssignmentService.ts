import { ReadinessItem, TaskComment } from '../types';

/**
 * Service for handling task assignment operations in collaborative trips
 */
class TaskAssignmentService {
  private storageKey = 'famapp_task_assignments';

  /**
   * Assigns a task to a family member
   */
  assignTask(
    tripId: string, 
    taskId: string, 
    assignedTo: string, 
    assignedBy: string
  ): void {
    const assignments = this.getTaskAssignments(tripId);
    
    assignments[taskId] = {
      assignedTo,
      assignedBy,
      assignedAt: new Date().toISOString(),
      status: 'incomplete'
    };

    this.saveTaskAssignments(tripId, assignments);
  }

  /**
   * Unassigns a task from a family member
   */
  unassignTask(tripId: string, taskId: string): void {
    const assignments = this.getTaskAssignments(tripId);
    
    if (assignments[taskId]) {
      // Keep completion data if task was completed
      const { assignedTo, assignedBy, assignedAt, ...rest } = assignments[taskId];
      assignments[taskId] = rest;
      
      // If no assignment data left, remove the entry
      if (Object.keys(assignments[taskId]).length === 0) {
        delete assignments[taskId];
      }
    }

    this.saveTaskAssignments(tripId, assignments);
  }

  /**
   * Marks a task as complete
   */
  completeTask(
    tripId: string, 
    taskId: string, 
    completedBy: string
  ): void {
    const assignments = this.getTaskAssignments(tripId);
    
    if (!assignments[taskId]) {
      assignments[taskId] = {};
    }

    assignments[taskId] = {
      ...assignments[taskId],
      status: 'complete',
      completedBy,
      completedAt: new Date().toISOString()
    };

    this.saveTaskAssignments(tripId, assignments);
  }

  /**
   * Marks a task as incomplete
   */
  uncompleteTask(tripId: string, taskId: string): void {
    const assignments = this.getTaskAssignments(tripId);
    
    if (assignments[taskId]) {
      const { completedBy, completedAt, ...rest } = assignments[taskId];
      assignments[taskId] = {
        ...rest,
        status: 'incomplete'
      };
    }

    this.saveTaskAssignments(tripId, assignments);
  }

  /**
   * Adds a comment to a task
   */
  addTaskComment(
    tripId: string, 
    taskId: string, 
    comment: Omit<TaskComment, 'id' | 'createdAt'>
  ): TaskComment {
    const assignments = this.getTaskAssignments(tripId);
    
    if (!assignments[taskId]) {
      assignments[taskId] = {};
    }

    if (!assignments[taskId].comments) {
      assignments[taskId].comments = [];
    }

    const newComment: TaskComment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    assignments[taskId].comments!.push(newComment);
    this.saveTaskAssignments(tripId, assignments);

    return newComment;
  }

  /**
   * Gets enhanced readiness items with assignment data
   */
  getEnhancedReadinessItems(
    tripId: string, 
    readinessItems: ReadinessItem[]
  ): ReadinessItem[] {
    const assignments = this.getTaskAssignments(tripId);

    return readinessItems.map(item => {
      const assignmentData = assignments[item.id];
      
      if (!assignmentData) {
        return item;
      }

      return {
        ...item,
        assignedTo: assignmentData.assignedTo,
        assignedBy: assignmentData.assignedBy,
        assignedAt: assignmentData.assignedAt,
        completedBy: assignmentData.completedBy,
        completedAt: assignmentData.completedAt,
        status: assignmentData.status || item.status,
        comments: assignmentData.comments || []
      };
    });
  }

  /**
   * Gets tasks assigned to a specific family member
   */
  getTasksForMember(tripId: string, memberEmail: string): any[] {
    const assignments = this.getTaskAssignments(tripId);
    
    return Object.entries(assignments)
      .filter(([_, data]) => data.assignedTo === memberEmail)
      .map(([taskId, data]) => ({
        taskId,
        ...data
      }));
  }

  /**
   * Gets task assignment statistics for a trip
   */
  getTaskStats(tripId: string, readinessItems: ReadinessItem[]) {
    const assignments = this.getTaskAssignments(tripId);
    const enhancedItems = this.getEnhancedReadinessItems(tripId, readinessItems);
    
    const stats = {
      total: enhancedItems.length,
      assigned: 0,
      unassigned: 0,
      completed: 0,
      overdue: 0,
      byMember: {} as Record<string, {
        assigned: number;
        completed: number;
        pending: number;
      }>
    };

    enhancedItems.forEach(item => {
      if (item.assignedTo) {
        stats.assigned++;
        
        if (!stats.byMember[item.assignedTo]) {
          stats.byMember[item.assignedTo] = {
            assigned: 0,
            completed: 0,
            pending: 0
          };
        }
        
        stats.byMember[item.assignedTo].assigned++;
        
        if (item.status === 'complete') {
          stats.completed++;
          stats.byMember[item.assignedTo].completed++;
        } else {
          stats.byMember[item.assignedTo].pending++;
        }
        
        if (item.urgent && item.status === 'incomplete') {
          stats.overdue++;
        }
      } else {
        stats.unassigned++;
      }
      
      if (item.status === 'complete') {
        stats.completed++;
      }
    });

    return stats;
  }

  /**
   * Bulk assign tasks to family members
   */
  bulkAssignTasks(
    tripId: string,
    taskAssignments: Array<{
      taskId: string;
      assignedTo: string;
      assignedBy: string;
    }>
  ): void {
    const assignments = this.getTaskAssignments(tripId);
    
    taskAssignments.forEach(({ taskId, assignedTo, assignedBy }) => {
      assignments[taskId] = {
        ...assignments[taskId],
        assignedTo,
        assignedBy,
        assignedAt: new Date().toISOString()
      };
    });

    this.saveTaskAssignments(tripId, assignments);
  }

  /**
   * Private helper to get task assignments for a trip
   */
  private getTaskAssignments(tripId: string): Record<string, any> {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${tripId}`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading task assignments:', error);
      return {};
    }
  }

  /**
   * Private helper to save task assignments for a trip
   */
  private saveTaskAssignments(tripId: string, assignments: Record<string, any>): void {
    try {
      localStorage.setItem(
        `${this.storageKey}_${tripId}`, 
        JSON.stringify(assignments)
      );
    } catch (error) {
      console.error('Error saving task assignments:', error);
    }
  }

  /**
   * Clear all assignment data for a trip (useful for cleanup)
   */
  clearTripAssignments(tripId: string): void {
    localStorage.removeItem(`${this.storageKey}_${tripId}`);
  }

  /**
   * Export assignment data for backup/sync
   */
  exportAssignmentData(tripId: string): any {
    return this.getTaskAssignments(tripId);
  }

  /**
   * Import assignment data from backup/sync
   */
  importAssignmentData(tripId: string, data: any): void {
    this.saveTaskAssignments(tripId, data);
  }
}

export const taskAssignmentService = new TaskAssignmentService();