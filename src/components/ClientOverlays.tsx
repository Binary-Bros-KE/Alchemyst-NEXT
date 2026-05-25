'use client';

import { useState, useEffect } from 'react';
import { hasAdultConsent } from '@/utils/consent';
import AdultConsentModal from '@/components/AdultConsentModal';
import TelegramModal from '@/components/TelegramModal';
import ScrollToTop from '@/components/ScrollToTop';

interface ClientOverlaysProps {
  initialShowConsent?: boolean;
}

export default function ClientOverlays({ initialShowConsent = true }: ClientOverlaysProps) {
  const [showConsent, setShowConsent] = useState(initialShowConsent);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setShowConsent(!hasAdultConsent());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {showConsent && <AdultConsentModal onClose={() => setShowConsent(false)} />}
      <TelegramModal />
      <ScrollToTop />
    </>
  );
}
