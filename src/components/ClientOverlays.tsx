'use client';

import { useState, useEffect } from 'react';
import { hasAdultConsent } from '@/utils/consent';
import AdultConsentModal from '@/components/AdultConsentModal';
import TelegramModal from '@/components/TelegramModal';
import ScrollToTop from '@/components/ScrollToTop';

export default function ClientOverlays() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!hasAdultConsent()) {
      setShowConsent(true);
    }
  }, []);

  return (
    <>
      {showConsent && <AdultConsentModal onClose={() => setShowConsent(false)} />}
      <TelegramModal />
      <ScrollToTop />
    </>
  );
}
