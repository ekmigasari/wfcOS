import { useEffect,useState } from 'react';

/**
 * Hook to detect whether the current device is a mobile/tablet or desktop
 * 
 * Features:
 * - Detects mobile and tablet devices based on user agent
 * - Updates on window resize (handles orientation changes)
 * - Returns boolean flags for easy conditional rendering
 * 
 * @returns {Object} Object containing isMobileOrTablet and isDesktop flags
 */
export function useDeviceDetect() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window === 'undefined') return false;
      
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = 
        /iphone|ipod|android|blackberry|windows phone/g.test(userAgent);
      const isTablet = 
        /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent);
      
      setIsMobileOrTablet(isMobile || isTablet);
    };
    
    // Initial check
    checkDevice();
    
    // Re-check on resize (handles orientation changes)
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { 
    isMobileOrTablet, 
    isDesktop: !isMobileOrTablet 
  };
} 