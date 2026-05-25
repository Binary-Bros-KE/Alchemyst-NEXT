'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clearFilters, setSelectedCounty } from '@/lib/features/ui/uiSlice';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
  </svg>
);

const DropdownArrowIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

interface User {
  username?: string;
  userType?: string;
  isActive?: boolean;
  profileImage?: { url: string };
}

interface NavLink {
  href: string;
  label: string;
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Load user and token from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }

    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }

    // Monkey-patch localStorage.setItem to emit custom event
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key: string, value: string) {
      const event = new Event('localStorageChange');
      (event as any).key = key;
      (event as any).newValue = value;
      window.dispatchEvent(event);
      originalSetItem.apply(this, [key, value]);
    };

    const handleLocalStorageChange = (event: Event) => {
      const customEvent = event as any;
      if (customEvent.key === 'user') {
        try {
          const updatedUser = JSON.parse(customEvent.newValue);
          setUser(updatedUser);
        } catch {
          setUser(null);
        }
      }
      if (customEvent.key === 'token') {
        setToken(customEvent.newValue || null);
      }
    };

    window.addEventListener('localStorageChange', handleLocalStorageChange);
    return () => {
      window.removeEventListener('localStorageChange', handleLocalStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/escorts', label: 'Escorts' },
    { href: '/masseuses', label: 'Massage' },
    { href: '/of-models', label: 'OF Models' },
    { href: '/spas', label: 'Spas' },
    { href: '/blog', label: 'Blog' },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    dispatch(clearFilters());
    dispatch(setSelectedCounty('all'));
  };

  const renderNavLink = (link: NavLink, isMobile: boolean = false) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={handleNavClick}
      className={`transition-colors ${
        isMobile
          ? `text-4xl font-bold text-text-inverse hover:text-primary ${pathname === link.href ? 'text-primary' : ''}`
          : `text-text-inverse hover:text-primary ${pathname === link.href ? 'text-primary font-medium' : ''}`
      }`}
    >
      {link.label}
    </Link>
  );

  return (
    <nav className="border-b border-neutral-800 bg-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-text-inverse">
          <span className="text-primary">
            <img src="/primary-logo.png" alt="Alchemyst Logo" className="h-10" />
          </span>
          Alchemyst
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => renderNavLink(link, false))}

          {token && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-3 text-text-inverse ${
                  user.isActive ? 'bg-green-600/20 border border-green-600' : 'bg-red-600/20 border border-red-600'
                } px-4 py-1 rounded-md hover:opacity-90 transition-opacity cursor-pointer`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium max-w-[150px] truncate block text-sm">{user.username || 'User'}</span>
                  <span className="text-xs text-text-muted capitalize">{user.userType}</span>
                </div>
                <DropdownArrowIcon className={`h-5 w-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                {user?.profileImage?.url ? (
                  <img src={user.profileImage.url} className="h-10 w-10 rounded-full object-cover" alt="Profile" />
                ) : (
                  <UserIcon className="h-8 w-8 text-primary" />
                )}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-52 bg-bg-secondary border border-border-light rounded-xl shadow-lg"
                  >
                    <div className="px-4 py-3 border-b border-border-light">
                      <span className={`text-sm font-medium ${user.isActive ? 'text-green-500' : 'text-red-400'}`}>
                        {user.isActive ? 'Profile Active' : 'Profile Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-col text-sm text-text-primary">
                      <button
                        onClick={() => {
                          router.push('/dashboard');
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 text-left hover:bg-primary cursor-pointer hover:text-white"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          router.push('/dashboard#settings');
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 text-left hover:bg-primary cursor-pointer hover:text-white"
                      >
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-left text-red-400 hover:bg-primary cursor-pointer rounded-b-xl hover:text-white"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 text-text-inverse border border-primary rounded-lg font-medium hover:bg-primary/10 transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-text-inverse text-3xl z-50 relative"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded-md font-semibold text-sm hover:bg-primary-dark">
              <CloseIcon />
              <span>Close</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded-md font-semibold text-sm hover:bg-primary-dark">
              <span>Menu</span>
              <MenuIcon />
            </div>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center md:hidden"
          >
            <div className="flex flex-col items-center gap-4 w-full px-8">
              {navLinks.map((link) => renderNavLink(link, true))}

              <div className="w-full border-t border-neutral-700 my-4" />

              {token && user ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    {user?.profileImage?.url ? (
                      <img src={user.profileImage.url} className="h-20 w-20 rounded-full object-cover" alt="Profile" />
                    ) : (
                      <UserIcon className="h-20 w-20 text-primary" />
                    )}
                    <div className="text-white text-xl font-bold">{user.username || 'User'}</div>
                    <div className={`text-sm ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {user.isActive ? 'Active Profile' : 'Inactive Profile'}
                    </div>
                  </div>

                  <button
                    onClick={() => { router.push('/dashboard'); setMobileMenuOpen(false); }}
                    className="text-2xl font-bold text-text-inverse hover:text-primary"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { router.push('/dashboard#settings'); setMobileMenuOpen(false); }}
                    className="text-2xl font-bold text-text-inverse hover:text-primary"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-2xl font-bold text-red-400 hover:text-red-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-8 py-4 text-text-inverse border-2 border-primary rounded-lg font-bold text-xl hover:bg-primary/10 transition-all text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-8 py-4 bg-primary text-text-inverse rounded-lg font-bold text-xl hover:bg-primary-hover transition-all text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
