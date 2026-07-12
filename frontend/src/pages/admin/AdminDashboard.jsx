import { motion } from 'framer-motion';
import AnalyticsDashboard from '../../features/analytics/AnalyticsDashboard';

export default function AdminDashboard() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-2 md:p-6"
    >
      <AnalyticsDashboard />
    </motion.section>
  );
}