import { useState } from 'react';
import { Activity, FlightFormData, AccommodationFormData, TransportFormData, NewTravelerForm } from '../types';

/**
 * Custom hook for managing various form states
 */
export const useFormManagement = () => {
  // Activity form states
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Flight form states
  const [flightFormData, setFlightFormData] = useState<FlightFormData>({
    airline: '',
    flightNumber: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    departureAirport: '',
    arrivalAirport: '',
    passengers: [],
    cost: '',
    status: 'planned'
  });
  const [editingFlightIndex, setEditingFlightIndex] = useState<number | null>(null);

  // Accommodation form states
  const [accommodationFormData, setAccommodationFormData] = useState<AccommodationFormData>({
    name: '',
    type: 'hotel',
    address: '',
    checkIn: '',
    checkOut: '',
    guests: [],
    cost: '',
    status: 'planned'
  });
  const [editingAccommodationIndex, setEditingAccommodationIndex] = useState<number | null>(null);

  // Transportation form states
  const [transportFormData, setTransportFormData] = useState<TransportFormData>({
    type: 'rental-car',
    details: '',
    date: '',
    time: '',
    travelers: [],
    cost: '',
    status: 'planned'
  });
  const [editingTransportationIndex, setEditingTransportationIndex] = useState<number | null>(null);

  // New traveler form
  const [newTravelerForm, setNewTravelerForm] = useState<NewTravelerForm>({
    name: '',
    type: 'adult',
    dateOfBirth: '',
    relationship: '',
    notes: '',
    healthInfo: ''
  });

  // Custom readiness item
  const [newCustomItem, setNewCustomItem] = useState('');

  const resetForms = () => {
    setNewActivity({});
    setEditingActivity(null);
    setValidationErrors({});
    setFlightFormData({
      airline: '',
      flightNumber: '',
      departureDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',
      departureAirport: '',
      arrivalAirport: '',
      passengers: [],
      cost: '',
      status: 'planned'
    });
    setEditingFlightIndex(null);
    setAccommodationFormData({
      name: '',
      type: 'hotel',
      address: '',
      checkIn: '',
      checkOut: '',
      guests: [],
      cost: '',
      status: 'planned'
    });
    setEditingAccommodationIndex(null);
    setTransportFormData({
      type: 'rental-car',
      details: '',
      date: '',
      time: '',
      travelers: [],
      cost: '',
      status: 'planned'
    });
    setEditingTransportationIndex(null);
    setNewTravelerForm({
      name: '',
      type: 'adult',
      dateOfBirth: '',
      relationship: '',
      notes: '',
      healthInfo: ''
    });
    setNewCustomItem('');
  };

  return {
    // Activity form
    newActivity,
    setNewActivity,
    editingActivity,
    setEditingActivity,
    validationErrors,
    setValidationErrors,

    // Flight form
    flightFormData,
    setFlightFormData,
    editingFlightIndex,
    setEditingFlightIndex,

    // Accommodation form
    accommodationFormData,
    setAccommodationFormData,
    editingAccommodationIndex,
    setEditingAccommodationIndex,

    // Transport form
    transportFormData,
    setTransportFormData,
    editingTransportationIndex,
    setEditingTransportationIndex,

    // Traveler form
    newTravelerForm,
    setNewTravelerForm,

    // Custom item
    newCustomItem,
    setNewCustomItem,

    // Utilities
    resetForms
  };
};