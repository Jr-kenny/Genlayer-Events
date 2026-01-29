import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Timeline from '@/components/Timeline';
import Footer from '@/components/Footer';
import DynamicBackground from '@/components/DynamicBackground';

const Index = () => {
  const [activeSection, setActiveSection] = useState<'active' | 'upcoming' | 'past'>('active');

  return (
    <div className="min-h-screen bg-background text-foreground font-body relative">
      <DynamicBackground />
      
      <div className="relative z-10">
        <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
        <Hero />
        <Timeline filter={activeSection} />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
