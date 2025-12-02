import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptionService } from 'api/services/encryption.service';

export const useSessionTimeout = (timeoutMinutes: number = 15) => {
  const navigate = useNavigate();
 const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const warningRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    // Clear all sensitive data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    encryptionService.clearKeys();
    
    console.log('🔒 Session expired - logged out for security');
    
    // Redirect to login
    navigate('/login');
    
    // Show notification
    alert('Your session has expired for security reasons. Please log in again.');
  }, [navigate]);

  const resetTimeout = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Show warning 2 minutes before logout
    const warningTime = (timeoutMinutes - 2) * 60 * 1000;
    if (warningTime > 0) {
      warningRef.current = setTimeout(() => {
        const continueSession = window.confirm(
          '⚠️ Your session will expire in 2 minutes due to inactivity. Click OK to continue your session.'
        );
        if (continueSession) {
          resetTimeout();
        }
      }, warningTime);
    }

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      logout();
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, logout]);

  useEffect(() => {
  // Activity events that reset the timeout
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
  
  events.forEach(event => {
    document.addEventListener(event, resetTimeout, { passive: true });
  });

  // Initialize timeout
  resetTimeout();

  return () => {
    events.forEach(event => {
      document.removeEventListener(event, resetTimeout);
    });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }
  };
}, [resetTimeout]);

  return { resetTimeout };
};