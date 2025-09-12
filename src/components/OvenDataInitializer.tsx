import React, { useEffect } from 'react';
import { ovenService } from '@/services/ovenService';
import { toast } from 'sonner';

const OvenDataInitializer = () => {
  useEffect(() => {
    const initializeData = async () => {
      try {
        await ovenService.initializeDefaultOvens();
        console.log('Oven data initialized successfully');
      } catch (error) {
        console.error('Error initializing oven data:', error);
      }
    };

    initializeData();
  }, []);

  return null; // This component doesn't render anything visible
};

export default OvenDataInitializer;