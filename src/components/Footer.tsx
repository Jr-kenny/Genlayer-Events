import { Twitter, MessageCircle, Send, Github } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const leftStackItems = [
    '01 / Distributed Neural Consensus',
    '02 / Trustless Decision-Making',
    '03 / Optimistic Finality',
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://x.com/GenLayer', label: 'X (Twitter)' },
    { icon: MessageCircle, href: 'https://discord.gg/rtuNxk838J', label: 'Discord' },
    { icon: Send, href: 'https://t.me/GenLayer', label: 'Telegram' },
    { icon: Github, href: 'https://github.com/genlayerlabs', label: 'GitHub' },
  ];

  return (
    <footer className="relative py-24 px-6 border-t border-border/30 overflow-hidden">
      {/* Base watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="watermark text-[25vw] font-heading text-foreground/[0.03] select-none whitespace-nowrap">
          GENLAYER
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 mb-16">
          {/* Left Stack */}
          <div className="space-y-4">
            {leftStackItems.map((item, index) => (
              <p
                key={index}
                className="font-body text-xs uppercase tracking-widest text-muted-foreground/60"
              >
                {item}
              </p>
            ))}
          </div>

          {/* Right Matrix - Social Links */}
          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-secondary glow-red transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Acknowledgement */}
            <p className="font-body text-xs text-muted-foreground/50">
              Built with love by{' '}
              <a
                href="https://x.com/Jrken_ny"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary/80 transition-colors"
              >
                jrkenny
              </a>
            </p>
          </div>
        </div>

        {/* Control Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/20">
          <p className="font-body text-xs text-muted-foreground/40">
            © {new Date().getFullYear()} Primeisles. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="font-body text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Scroll to Top ↑
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 led-pulse" />
            <span className="font-body text-xs text-muted-foreground/40">Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
