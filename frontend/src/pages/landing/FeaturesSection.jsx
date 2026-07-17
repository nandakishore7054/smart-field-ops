import React from 'react';
import { motion } from 'framer-motion';
import { 
  Navigation, Map, ShieldAlert, ClipboardList, Users, 
  CalendarCheck, CalendarOff, Radio, PieChart, Route, 
  BrainCircuit, Bell, Smartphone, Lock, Cpu
} from 'lucide-react';

const features = [
  { icon: Navigation, title: 'Live GPS Tracking', desc: 'Monitor your workforce in real-time on a live interactive dashboard.' },
  { icon: Map, title: 'Interactive Maps', desc: 'Detailed geographic visualization with historical path trails and worker pins.' },
  { icon: ShieldAlert, title: 'Geofencing', desc: 'Draw virtual boundaries to automatically verify job site attendance.' },
  { icon: ClipboardList, title: 'Smart Task Management', desc: 'Dispatch tasks to the nearest available worker with a click.' },
  { icon: Users, title: 'User & Role Management', desc: 'Securely manage Admin, Dispatcher, and Worker privileges.' },
  { icon: CalendarCheck, title: 'Attendance Management', desc: 'Automated shift tracking driven by physical GPS verification.' },
  { icon: CalendarOff, title: 'Leave Management', desc: 'Streamlined time-off requests directly from the mobile app.' },
  { icon: Radio, title: 'Real-Time Socket Communication', desc: 'Low-latency bidirectional streaming ensures no manual page refreshes.' },
  { icon: PieChart, title: 'Dashboard Analytics', desc: 'Visualize key performance indicators and operational metrics instantly.' },
  { icon: Route, title: 'Distance Analytics', desc: 'Accurate Haversine-based calculations for travel tracking and reimbursements.' },
  { icon: BrainCircuit, title: 'AI Operations Summary', desc: 'Generative AI synthesizes thousands of telemetry points into human-readable reports.' },
  { icon: Bell, title: 'Notifications', desc: 'Instant alerts for task assignments, geofence breaches, and system updates.' },
  { icon: Smartphone, title: 'Progressive Web App', desc: 'Lightweight, installable mobile experience optimized for battery life.' },
  { icon: Lock, title: 'JWT Authentication', desc: 'Stateless, cryptographically secure session management.' },
  { icon: Cpu, title: 'Groq + Gemini AI Integration', desc: 'High-speed Llama 3 inference with automated Google Gemini failover.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Platform Capabilities</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Everything you need to scale operations.</h3>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of tools built specifically for modern, distributed workforces. No bloated features—just exactly what you need.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
