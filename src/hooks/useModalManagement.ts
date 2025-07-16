import { useState } from 'react';

/**
 * Custom hook for managing modal states
 */
export const useModalManagement = () => {
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showFamilyProfiles, setShowFamilyProfiles] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddTravelerModal, setShowAddTravelerModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  const closeAllModals = () => {
    setShowAddActivityModal(false);
    setShowFlightModal(false);
    setShowAccommodationModal(false);
    setShowTransportModal(false);
    setShowFamilyProfiles(false);
    setShowEditProfile(false);
    setShowAddTravelerModal(false);
    setShowFamilyModal(false);
  };

  return {
    modals: {
      showAddActivityModal,
      setShowAddActivityModal,
      showFlightModal,
      setShowFlightModal,
      showAccommodationModal,
      setShowAccommodationModal,
      showTransportModal,
      setShowTransportModal,
      showFamilyProfiles,
      setShowFamilyProfiles,
      showEditProfile,
      setShowEditProfile,
      showAddTravelerModal,
      setShowAddTravelerModal,
      showFamilyModal,
      setShowFamilyModal
    },
    closeAllModals
  };
};