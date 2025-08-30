import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Mail } from 'lucide-react';
import { useSeedTheme } from '@/contexts/SeedThemeProvider';
import { ASSIGNMENT_SEED, ROLLNO } from '@/utils/seed';

export function Footer() {
  const { seed } = useSeedTheme();

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white font-black">
                M
              </div>
              <span className="text-xl font-bold text-primary">Marketplace</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted reselling platform for unique finds and amazing deals.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block text-muted-foreground hover:text-primary transition-smooth">
                Home
              </Link>
              <Link to="/browse" className="block text-muted-foreground hover:text-primary transition-smooth">
                Browse
              </Link>
              <Link to="/sell" className="block text-muted-foreground hover:text-primary transition-smooth">
                Start Selling
              </Link>
              <Link to="/how-it-works" className="block text-muted-foreground hover:text-primary transition-smooth">
                How It Works
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <div className="space-y-2 text-sm">
              <Link to="/help" className="block text-muted-foreground hover:text-primary transition-smooth">
                Help Center
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-smooth">
                Contact Us
              </Link>
              <Link to="/safety" className="block text-muted-foreground hover:text-primary transition-smooth">
                Safety Tips
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-smooth">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Utility Pages */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Developer</h3>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-smooth">
                About (Seed Info)
              </Link>
              <Link to="/logs/recent" className="block text-muted-foreground hover:text-primary transition-smooth">
                Recent Logs
              </Link>
              <Link to={`/${ROLLNO}/healthz`} className="block text-muted-foreground hover:text-primary transition-smooth">
                Health Check
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Marketplace. Built with{' '}
              <Heart className="w-4 h-4 inline text-red-500" />{' '}
              using seed: <span className="font-mono text-primary">{seed}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Theme generated from seed hash • Roll No: {ROLLNO}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}