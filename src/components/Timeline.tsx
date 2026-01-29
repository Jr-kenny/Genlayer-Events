import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from './EventCard';
import LoadEventsButton from './LoadEventsButton';
import { useGenLayer } from '@/hooks/useGenLayer';

interface TimelineProps {
  filter: 'active' | 'upcoming' | 'past';
}

const Timeline = ({ filter }: TimelineProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { 
    events, 
    loading, 
    syncing, 
    error, 
    isInitialized, 
    lastSync, 
    loadEvents, 
    hasEvents 
  } = useGenLayer();

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredEvents = events.filter((event) => event.status === filter);
  const isProcessing = loading || syncing;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.15 }
    }
  };

  return (
    <section id="events" className="relative py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={filter}
            variants={headerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl text-foreground mb-3 md:mb-4">
              {filter === 'active' && 'Live Now'}
              {filter === 'upcoming' && 'Coming Soon'}
              {filter === 'past' && 'Past Events'}
            </h2>
            <p className="font-body text-muted-foreground text-xs md:text-sm uppercase tracking-widest">
              {isProcessing ? 'Loading...' : `${filteredEvents.length} ${filter} ${filteredEvents.length === 1 ? 'event' : 'events'}`}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Load Events Button - Always visible */}
        <div className="flex justify-center mb-8 md:mb-12">
          <LoadEventsButton
            onLoad={loadEvents}
            loading={loading}
            syncing={syncing}
          />
        </div>

        {/* Loading state - only show when syncing */}
        {syncing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-body text-muted-foreground">
              AI validators reaching consensus...
            </p>
            <p className="font-body text-xs text-muted-foreground/70 mt-1">
              This may take a moment
            </p>
          </motion.div>
        )}

        {/* Error state */}
        {error && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <p className="font-body text-destructive text-sm">Error: {error}</p>
            <p className="font-body text-xs text-muted-foreground mt-2">
              Try clicking "Load Events" to refresh
            </p>
          </motion.div>
        )}

        {/* Timeline */}
        {!isProcessing && !error && (
          <div className="relative">
            {/* Vertical line - hidden on mobile */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block">
              <motion.div
                className="absolute top-0 left-0 w-full bg-secondary"
                initial={{ height: 0 }}
                animate={{ height: `${scrollProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Events */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={filter}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-4 md:space-y-16"
              >
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    variants={itemVariants}
                    className={`relative md:w-[calc(50%-2rem)] ${
                      index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    }`}
                  >
                    {/* Timeline dot - hidden on mobile */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 25,
                        delay: 0.2 + index * 0.1 
                      }}
                      className={`hidden md:block absolute top-8 w-3 h-3 rounded-full border-2 ${
                        event.status === 'active'
                          ? 'bg-primary border-primary'
                          : event.status === 'upcoming'
                          ? 'bg-secondary border-secondary'
                          : 'bg-muted border-muted-foreground'
                      } ${index % 2 === 0 ? '-right-1.5 translate-x-1/2' : '-left-1.5 -translate-x-1/2'}`}
                    />
                    
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredEvents.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-center py-16"
              >
                <p className="font-body text-muted-foreground">No {filter} events at the moment.</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Timeline;
