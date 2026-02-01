import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SyncEventsButtonProps {
  onSync: () => Promise<void>;
  syncing: boolean;
}

const SyncEventsButton = ({ 
  onSync, 
  syncing, 
}: SyncEventsButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Button
        onClick={onSync}
        disabled={syncing}
        variant="default"
        size="lg"
        className="font-body uppercase tracking-wider text-xs md:text-sm px-6 py-3 transition-all duration-300"
      >
        {syncing 
          ? 'Syncing...' 
          : 'Sync Events'
        }
      </Button>
    </motion.div>
  );
};

export default SyncEventsButton;
