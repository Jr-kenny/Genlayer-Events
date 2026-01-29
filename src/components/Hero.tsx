import { motion } from 'framer-motion';
import { useGenLayer } from '@/hooks/useGenLayer';

const Hero = () => {
  const { hasEvents } = useGenLayer();

  const scrollToEvents = () => {
    const element = document.getElementById('events');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <span className="watermark text-[15vw] md:text-[20vw] font-heading text-foreground/[0.02] select-none">
          TEMPORAL
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl mb-6 md:mb-8"
        >
          <span className="text-foreground">Genlayer</span>
          <br />
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            className="italic text-foreground/90"
          >
            Events
          </motion.span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
          className="font-body text-xs sm:text-sm md:text-base uppercase tracked-wide text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-2"
        >
          Join the Genlayer community in real-time activities, quizzes, and meetings. 
          <br className="hidden sm:block" />
          <span className="text-primary/70">Powered by GenLayer Intelligent Contracts</span>
        </motion.p>

        {/* Explore Events button - only visible when there are events */}
        {hasEvents && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToEvents}
            className="cta-button font-body text-xs md:text-sm uppercase tracking-widest px-6 md:px-8 py-3 md:py-4 text-foreground"
          >
            Explore Events
          </motion.button>
        )}

        {/* Alternative message when no events */}
        {!hasEvents && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
            className="font-body text-xs text-muted-foreground/70"
          >
            Click "Load Events" below to fetch events from the blockchain
          </motion.p>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 md:h-16 bg-gradient-to-b from-transparent via-foreground/20 to-foreground/40" 
        />
      </motion.div>
    </section>
  );
};

export default Hero;
