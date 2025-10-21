import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
// import logo from '@/assets/logo.png';

interface HeaderProps {
  user: {
    username: string;
    plan: string;
  } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout, onProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="gradient-text text-xl font-bold">QuotientOne</div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="/" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </a>
            <a 
              href="https://quotientone-getintouch.carrd.co/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Services
            </a>
            <a 
              href="https://quotientoneabout.carrd.co/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              About Us
            </a>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-foreground font-medium">Welcome, {user.username}</span>
                  {/* <span className="text-muted-foreground ml-2 px-2 py-1 bg-secondary rounded-full text-xs uppercase font-semibold">
                    {user.plan}
                  </span> */}
                </div>
                {onProfile && (
                  <Button variant="ghost" size="sm" onClick={onProfile}>
                    Profile
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="hero" size="sm" onClick={onLoginClick}>
                Login / Sign Up
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 mt-4">
              <a 
                href="/" 
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Home
              </a>
              <a 
                href="https://quotientone-getintouch.carrd.co/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Services
              </a>
              <a 
                href="https://quotientoneabout.carrd.co/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                About Us
              </a>
              <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-foreground font-medium">Welcome, {user.username}</span>
                      {/* <span className="text-muted-foreground ml-2 px-2 py-1 bg-secondary rounded-full text-xs uppercase font-semibold">
                        {user.plan}
                      </span> */}
                    </div>
                    <div className="space-y-2">
                      {onProfile && (
                        <Button variant="ghost" size="sm" onClick={onProfile} className="w-full">
                          Profile
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="hero" size="sm" onClick={onLoginClick} className="w-full">
                    Login / Sign Up
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};