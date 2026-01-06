import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'quiz' | 'meeting' | 'workshop' | 'ama' | 'game' | 'announcements';
  status: 'active' | 'upcoming' | 'past';
  timeRemaining?: string;
  discordLink?: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const isActive = event.status === 'active';
  const isUpcoming = event.status === 'upcoming';
  const isPast = event.status === 'past';

  const typeColors: Record<string, string> = {
    quiz: 'bg-primary/20 text-primary border-primary/30',
    meeting: 'bg-secondary/20 text-secondary border-secondary/30',
    workshop: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ama: 'bg-green-500/20 text-green-400 border-green-500/30',
    game: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    announcements: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative group ${isPast ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      <div
        className={`relative bg-card border rounded-lg p-4 md:p-6 transition-all duration-300 ${
          isActive
            ? 'border-primary/50 shadow-[0_0_30px_rgba(0,212,255,0.1)]'
            : isUpcoming
            ? 'border-secondary/30 hover:border-secondary/50'
            : 'border-border hover:border-muted-foreground/30'
        }`}
      >
        {/* Scanning effect for active events */}
        {isActive && (
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="scanning-line absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        )}

        {/* Status badge */}
        <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
          <span
            className={`text-[10px] md:text-xs font-body uppercase tracking-wider px-2 md:px-3 py-1 rounded-full border ${typeColors[event.type]}`}
          >
            {event.type}
          </span>
          
          {isActive && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary led-pulse" />
              <span className="text-[10px] md:text-xs text-primary font-body uppercase tracking-wide">Live</span>
            </motion.div>
          )}
          
          {isUpcoming && (
            <span className="text-[10px] md:text-xs text-secondary font-body uppercase tracking-wide px-2 md:px-3 py-1 bg-secondary/10 rounded-full border border-secondary/30">
              Upcoming
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg md:text-xl lg:text-2xl text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="font-body text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 line-clamp-2">
          {event.description}
        </p>

        {/* Timer for active events */}
        {isActive && event.timeRemaining && (
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] md:text-xs text-muted-foreground font-body uppercase tracking-wide">Time Remaining</span>
              <span className="text-xs md:text-sm text-primary font-body font-medium timer-meter">{event.timeRemaining}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-primary/50 timer-meter" 
              />
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-muted-foreground font-body mb-4 md:mb-6 flex-wrap">
          <div className="flex items-center gap-1 md:gap-1.5">
            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Action button - Only for active events */}
        {isActive && event.discordLink && (
          <motion.a
            href={event.discordLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 font-body text-xs md:text-sm uppercase tracking-wider py-2.5 md:py-3 rounded transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <span>Join Now</span>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
