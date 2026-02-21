import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { Link, useNavigate } from '@tanstack/react-router';
import LoginButton from './LoginButton';
import ProfileSetupModal from './ProfileSetupModal';
import AdminNav from './AdminNav';
import UserNav from './UserNav';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ProfileSetupModal open={showProfileSetup} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AH</span>
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">Artisan Hub</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/products" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Marketplace
              </Link>
              {isAuthenticated && (
                <>
                  {isAdmin && <AdminNav />}
                  <UserNav />
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LoginButton />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background">
            <nav className="container py-4 flex flex-col gap-4">
              <Link 
                to="/products" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              {isAuthenticated && isAdmin && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    User Management
                  </Link>
                  <Link 
                    to="/admin/revenue" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Revenue Analytics
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link 
                    to="/artist/dashboard" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Artist Dashboard
                  </Link>
                  <Link 
                    to="/artist/register" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Become an Artist
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">AH</span>
                </div>
                <span className="font-bold text-lg">Artisan Hub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering creatives worldwide with a platform to showcase and sell their original work.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/products" className="hover:text-foreground transition-colors">
                    Browse Products
                  </Link>
                </li>
                <li>
                  <Link to="/artist/register" className="hover:text-foreground transition-colors">
                    Become an Artist
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Artists</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>90% Revenue Share</li>
                <li>Secure Payments</li>
                <li>Global Exposure</li>
                <li>Easy Management</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiX className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Artisan Hub. All rights reserved.</p>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
