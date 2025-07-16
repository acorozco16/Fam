import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with current screen size if window is available
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < breakpoint;
      setIsMobile(mobile);
      console.log('Mobile detection:', mobile, 'Window width:', window.innerWidth);
    };

    // Check immediately
    checkIsMobile();

    // Add event listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
};