import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  Trophy, Star, Target, Zap, Users, Heart, 
  Award, CheckCircle, Sparkles, Rocket,
  Clock, TrendingUp
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  type: 'adult' | 'child';
  age?: string;
  relationship?: string;
  interests?: string;
  dietaryInfo?: string;
  healthInfo?: string;
  energyLevel?: string[];
  activityPreferences?: string[];
  sleepSchedule?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  threshold: number;
  completed: boolean;
}

interface ProfileGamificationProps {
  familyProfiles: FamilyMember[];
  onOpenFamilyProfiles?: () => void;
  showCelebration?: boolean;
  onCelebrationComplete?: () => void;
}

export const ProfileGamification: React.FC<ProfileGamificationProps> = ({
  familyProfiles,
  onOpenFamilyProfiles,
  showCelebration = false,
  onCelebrationComplete
}) => {
  const [celebrationVisible, setCelebrationVisible] = useState(showCelebration);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Profile completeness calculation
  const calculateProfileCompleteness = (profile: FamilyMember): number => {
    const essentialFields = ['name', 'age', 'relationship'];
    const detailedFields = ['interests', 'dietaryInfo', 'healthInfo', 'energyLevel', 'activityPreferences', 'sleepSchedule'];
    
    let score = 0;
    let maxScore = 0;
    
    essentialFields.forEach(field => {
      maxScore += 60;
      if (profile[field as keyof FamilyMember] && profile[field as keyof FamilyMember] !== '') {
        score += 60;
      }
    });
    
    detailedFields.forEach(field => {
      maxScore += 40;
      const value = profile[field as keyof FamilyMember];
      if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
        score += 40;
      }
    });
    
    return Math.round((score / maxScore) * 100);
  };

  const getProfileStats = () => {
    if (familyProfiles.length === 0) {
      return {
        totalProfiles: 0,
        averageCompleteness: 0,
        completeProfiles: 0,
        canUnlockAI: false
      };
    }
    
    const completenessScores = familyProfiles.map(calculateProfileCompleteness);
    const averageCompleteness = Math.round(
      completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length
    );
    const completeProfiles = completenessScores.filter(score => score >= 70).length;
    
    return {
      totalProfiles: familyProfiles.length,
      averageCompleteness,
      completeProfiles,
      canUnlockAI: averageCompleteness >= 70
    };
  };

  const profileStats = getProfileStats();

  // Simple milestones - just helpful progress markers
  const milestones: Milestone[] = [
    {
      id: 'first_profile',
      title: 'First profile created',
      description: 'You can start getting basic recommendations',
      icon: Users,
      threshold: 1,
      completed: profileStats.totalProfiles >= 1
    },
    {
      id: 'ai_unlocked',
      title: 'AI recommendations unlocked',
      description: 'Now you can get personalized suggestions',
      icon: Sparkles,
      threshold: 70,
      completed: profileStats.canUnlockAI
    }
  ];

  const nextMilestone = milestones.find(m => !m.completed);

  const getProgressMessage = () => {
    if (profileStats.totalProfiles === 0) {
      return "Add family members to get personalized recommendations.";
    }
    if (profileStats.averageCompleteness < 70) {
      return `You're ${70 - profileStats.averageCompleteness}% away from unlocking AI recommendations.`;
    }
    return "AI recommendations are unlocked! You'll get personalized suggestions for your trips.";
  };

  // Celebration effect
  useEffect(() => {
    if (showCelebration) {
      setCelebrationVisible(true);
      const timer = setTimeout(() => {
        setCelebrationVisible(false);
        onCelebrationComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, onCelebrationComplete]);

  return (
    <div className="space-y-4">
      {/* Simple Progress Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Family Profiles</h3>
            <span className="text-sm text-gray-600">{profileStats.averageCompleteness}% complete</span>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{getProgressMessage()}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  profileStats.canUnlockAI ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${profileStats.averageCompleteness}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{profileStats.totalProfiles} profiles created</span>
              <span>{profileStats.completeProfiles} ready for AI</span>
            </div>

            {onOpenFamilyProfiles && (
              <Button 
                onClick={onOpenFamilyProfiles}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Users className="w-4 h-4 mr-2" />
                {profileStats.totalProfiles === 0 ? 'Add Family Members' : 'Complete Profiles'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simple milestones - only show what's helpful */}
      {milestones.some(m => m.completed) && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">What you've unlocked:</h4>
            <div className="space-y-2">
              {milestones.filter(m => m.completed).map((milestone) => (
                <div key={milestone.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <div className="p-1 bg-green-100 rounded-full">
                    <milestone.icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="font-medium text-green-900">{milestone.title}</span>
                    <p className="text-sm text-green-700">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next helpful step */}
      {nextMilestone && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <nextMilestone.icon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Next: {nextMilestone.title}</h4>
                <p className="text-sm text-gray-600">{nextMilestone.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};