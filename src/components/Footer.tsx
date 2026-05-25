'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969539/deafult-county-escort_bjiy2c.png')] max-md:bg-[url('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969787/footer-mobile_fmu8r4.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/90"></div>
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section - Logo and Description */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/primary-logo.png" alt="Alchemyst Logo" className="h-10" />
            <span className="text-3xl font-bold text-white">Alchemyst</span>
          </Link>
          <p className="text-neutral-300 max-w-2xl mx-auto text-sm">
            Kenya's premier platform connecting independent escorts and clients. A safe, professional space built by us,
            for us. Expanding across East Africa.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/escorts" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Escorts
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services/incalls"
                  className="text-neutral-300 hover:text-primary transition-colors text-sm"
                >
                  Incalls
                </Link>
              </li>
              <li>
                <Link
                  href="/services/outcalls"
                  className="text-neutral-300 hover:text-primary transition-colors text-sm"
                >
                  Outcalls
                </Link>
              </li>
              <li>
                <Link
                  href="/services/massage"
                  className="text-neutral-300 hover:text-primary transition-colors text-sm"
                >
                  Massage
                </Link>
              </li>
              <li>
                <Link href="/services/spas" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Spas
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Providers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-neutral-300 hover:text-primary transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-neutral-300 hover:text-primary transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/community-guidelines"
                  className="text-neutral-300 hover:text-primary transition-colors text-sm"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="pt-8 border-t border-neutral-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © {currentYear} Alchemyst.co.ke. All rights reserved.
            </p>
            <p className="text-neutral-400 text-sm">
              Made with <span className="text-primary">♥</span> in Kenya
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
