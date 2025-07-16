import { useState, useEffect } from 'react';
import { FamilyMember } from '../types';

/**
 * Custom hook for managing family profiles
 */
export const useFamilyProfiles = () => {
  const [familyProfiles, setFamilyProfiles] = useState<FamilyMember[]>([]);
  const [editingProfile, setEditingProfile] = useState<FamilyMember | null>(null);

  // Load family profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('familyProfiles');
    if (savedProfiles) {
      try {
        setFamilyProfiles(JSON.parse(savedProfiles));
      } catch (error) {
        console.error('Error loading family profiles:', error);
        setFamilyProfiles([]);
      }
    }
  }, []);

  // Save family profiles to localStorage when profiles change
  useEffect(() => {
    if (familyProfiles.length >= 0) {
      localStorage.setItem('familyProfiles', JSON.stringify(familyProfiles));
    }
  }, [familyProfiles]);

  const addProfile = (profile: FamilyMember) => {
    const newProfile = {
      ...profile,
      id: profile.id || Date.now().toString()
    };
    setFamilyProfiles(prev => [...prev, newProfile]);
    return newProfile;
  };

  const updateProfile = (profileId: string, updates: Partial<FamilyMember>) => {
    setFamilyProfiles(prev => 
      prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, ...updates }
          : profile
      )
    );
  };

  const deleteProfile = (profileId: string) => {
    setFamilyProfiles(prev => prev.filter(profile => profile.id !== profileId));
  };

  const getProfileById = (profileId: string): FamilyMember | undefined => {
    return familyProfiles.find(profile => profile.id === profileId);
  };

  return {
    familyProfiles,
    setFamilyProfiles,
    editingProfile,
    setEditingProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    getProfileById
  };
};