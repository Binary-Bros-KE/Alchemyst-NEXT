'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { hasAdultConsent } from '@/utils/consent';
import AdultConsentModal from '@/components/AdultConsentModal';
import TelegramModal from '@/components/TelegramModal';
import ScrollToTop from '@/components/ScrollToTop';
import { fetchAllProfiles } from '@/lib/features/profiles/profilesSlice';

export default function ClientOverlays() {
  const dispatch = useAppDispatch();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = hasAdultConsent();
    if (!consent) {
      document.documentElement.classList.add('adult-consent-pending');
      setShowConsent(true);
    } else {
      document.documentElement.classList.remove('adult-consent-pending');
    }

    dispatch(fetchAllProfiles());
  }, [dispatch]);

  const handleConsentClose = () => {
    document.documentElement.classList.remove('adult-consent-pending');
    setShowConsent(false);
  };

  return (
    <>
      {showConsent && <AdultConsentModal onClose={handleConsentClose} />}
      <TelegramModal />
      <ScrollToTop />
    </>
  );
}
