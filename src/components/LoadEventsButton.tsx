import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface LoadEventsButtonProps {
  onLoad: () => Promise<void>;
  loading: boolean;
  syncing: boolean;
}

const LoadEventsButton = ({ 
  onLoad, 
  loading, 
  syncing, 
}: LoadEventsButtonProps) => {
  const isProcessing = loading || syncing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Button
        onClick={onLoad}
        disabled={isProcessing}
        variant="outline"
        size="lg"
        className="font-body uppercase tracking-wider text-xs md:text-sm px-6 py-3 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
      >
        {isProcessing 
          ? (syncing ? 'Syncing Events...' : 'Loading...') 
          : 'Load Events'
        }
      </Button>
    </motion.div>
  );
};

export default LoadEventsButton;
