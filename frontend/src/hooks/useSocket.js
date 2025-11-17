import { useEffect } from 'react';
import { socketService } from '../sockets/socket';
import { useAuthStore } from '../stores/authStore';

export const useSocket = () => {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (user && token) {
      socketService.connect(token);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user, token]);

  return socketService;
};