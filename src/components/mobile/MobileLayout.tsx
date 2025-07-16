import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: 'overview' | 'itinerary' | 'travel' | 'packing';
  onTabChange: (tab: 'overview' | 'itinerary' | 'travel' | 'packing') => void;
  badges?: {
    overview?: number;
    itinerary?: number;
    travel?: number;
    packing?: number;
  };
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  badges = {}
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16 pb-safe">
          {/* Overview Tab */}
          <button
            onClick={() => onTabChange('overview')}
            className={`relative flex flex-col items-center justify-center px-3 py-2 min-w-[64px] ${
              activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {badges.overview && badges.overview > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {badges.overview}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Overview</span>
          </button>

          {/* Itinerary Tab */}
          <button
            onClick={() => onTabChange('itinerary')}
            className={`relative flex flex-col items-center justify-center px-3 py-2 min-w-[64px] ${
              activeTab === 'itinerary' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {badges.itinerary && badges.itinerary > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {badges.itinerary}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Itinerary</span>
          </button>

          {/* Travel Tab */}
          <button
            onClick={() => onTabChange('travel')}
            className={`relative flex flex-col items-center justify-center px-3 py-2 min-w-[64px] ${
              activeTab === 'travel' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {badges.travel && badges.travel > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {badges.travel}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Travel</span>
          </button>

          {/* Packing Tab */}
          <button
            onClick={() => onTabChange('packing')}
            className={`relative flex flex-col items-center justify-center px-3 py-2 min-w-[64px] ${
              activeTab === 'packing' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {badges.packing && badges.packing > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {badges.packing}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Packing</span>
          </button>
        </div>
      </div>
    </div>
  );
};