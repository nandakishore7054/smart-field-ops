import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, CheckCircle, ShieldCheck } from 'lucide-react';
import { Card } from '../../common/components/ui/Card';

import { useLocation } from '../../common/contexts/LocationContext';

export default function CheckInButton({ currentStatus, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const { getFreshLocation } = useLocation();

  const handleAction = async (action) => {
    setLoading(true);
    
    try {
      const position = await getFreshLocation();
      const { latitude, longitude } = position.coords;
      
      const endpoint = action === 'check-in' ? '/attendance/check-in' : '/attendance/check-out';
      const res = await api.post(endpoint, {
        location: { latitude, longitude },
        method: 'gps',
      });
      toast.success(res.data.message);
      if (onStatusChange) onStatusChange(res.data.data);
    } catch (error) {
      console.error('Geolocation error:', error);
      if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
        toast.error('Location permission denied. Please enable location services to check in.');
      } else {
        toast.error(error.response?.data?.message || `Failed to ${action}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'checked-out') {
    return (
      <Card variant="elevated" className="p-8 text-center bg-surface/50 border-border/50 max-w-sm w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="mx-auto bg-green-500/10 text-green-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10" />
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-3">Shift Completed</h3>
        <p className="text-muted-foreground leading-relaxed">You have successfully checked out for today. Enjoy the rest of your day!</p>
      </Card>
    );
  }

  const isCheckedIn = currentStatus === 'checked-in';
  
  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center shadow-md border-border/50 bg-surface/50 max-w-sm w-full relative overflow-hidden group">
      
      {/* Background ambient glow based on status */}
      <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 blur-3xl pointer-events-none ${
        isCheckedIn ? 'bg-destructive' : 'bg-primary'
      }`} />

      <div className="mb-10 relative z-10">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
          {isCheckedIn ? 'Active Shift' : 'Ready to Start?'}
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-surface-muted px-4 py-2 rounded-full mx-auto">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>GPS Verification Required</span>
        </div>
      </div>

      <motion.button
        onClick={() => handleAction(isCheckedIn ? 'check-out' : 'check-in')}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 ${
          isCheckedIn 
            ? 'bg-gradient-to-br from-destructive to-red-600 shadow-destructive/30 hover:shadow-destructive/50'
            : 'bg-gradient-to-br from-primary to-blue-600 shadow-primary/30 hover:shadow-primary/50'
        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2" />
              <span className="text-lg font-semibold tracking-wide">Verifying...</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <Fingerprint className="w-16 h-16 mb-2 opacity-90" />
              <span className="text-2xl font-bold tracking-tight uppercase">
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Pulsing rings around the button */}
      {!loading && (
        <>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 ${isCheckedIn ? 'border-destructive/20' : 'border-primary/20'} animate-ping pointer-events-none opacity-20`} style={{ animationDuration: '3s' }} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-${isCheckedIn ? 'destructive/10' : 'primary/10'} animate-ping pointer-events-none opacity-10`} style={{ animationDuration: '3s', animationDelay: '1s' }} />
        </>
      )}
    </Card>
  );
}
