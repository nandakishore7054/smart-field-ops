import { Card } from '../../common/components/ui/Card';
import { motion } from 'framer-motion';

export default function KPICards({ data }) {
  const cards = [
    { label: 'Total Tasks', value: data.totalTasks, color: 'text-foreground', bg: 'bg-primary/10' },
    { label: 'Completed', value: data.completedTasks, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: data.pendingTasks, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Verified', value: data.verifiedTasks, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Rejected', value: data.rejectedTasks, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Completion Rate', value: `${data.completionRate}%`, color: 'text-foreground', bg: 'bg-indigo-500/10' },
    { label: 'Active Workers', value: data.activeWorkers, color: 'text-foreground', bg: 'bg-fuchsia-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 border-border/50 shadow-sm hover:shadow-md hover:border-border transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
