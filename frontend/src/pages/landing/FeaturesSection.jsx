import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Camera, WifiOff, Users, LineChart, Moon } from 'lucide-react';
import { Card } from '../../common/components/ui/Card';

const features = [
  { 
    icon: Navigation, 
    title: 'Real-time Dispatch', 
    desc: 'Assign tasks and track your workforce with live Socket.IO updates and GPS integration.' 
  },
  { 
    icon: Camera, 
    title: 'Proof of Work', 
    desc: 'Workers submit photos, signatures, and verified coordinates for irrefutable job completion.' 
  },
  { 
    icon: WifiOff, 
    title: 'Offline Ready', 
    desc: 'Our Progressive Web App (PWA) architecture ensures tasks can be viewed without a cellular signal.' 
  },
  { 
    icon: Users, 
    title: 'Role-based Access', 
    desc: 'Secure, tailored environments for Admins, Dispatchers, and Field Workers in one platform.' 
  },
  { 
    icon: LineChart, 
    title: 'Live Analytics', 
    desc: 'Monitor completion rates, worker performance, and operational bottlenecks instantly.' 
  },
  { 
    icon: Moon, 
    title: 'Dark Mode Support', 
    desc: 'Easy on the eyes with complete light, dark, and system theme synchronization.' 
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
          >
            Everything you need to run the field
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Smart Field Ops replaces fragmented tools with a single, unified platform designed specifically for mobile workforces.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card variant="interactive" className="h-full p-6 bg-surface/50 backdrop-blur-sm border-border/50 hover:bg-surface transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
