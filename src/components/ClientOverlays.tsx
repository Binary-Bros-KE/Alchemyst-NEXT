'use client';

import { useState, useLayoutEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { hasAdultConsent } from '@/utils/consent';
import AdultConsentModal from '@/components/AdultConsentModal';
import TelegramModal from '@/components/TelegramModal';
import ScrollToTop from '@/components/ScrollToTop';
import { fetchAllProfiles } from '@/lib/features/profiles/profilesSlice';
import type { RootState } from '@/lib/store';

export default function ClientOverlays() {
  const dispatch = useAppDispatch();
  const lastFetchTime = useAppSelector((state: RootState) => state.profiles.lastFetchTime);
  const [showConsent, setShowConsent] = useState(false);

  useLayoutEffect(() => {
    const consent = hasAdultConsent();
    const html = document.documentElement;

    if (!consent) {
      html.classList.add('adult-consent-pending');
      setShowConsent(true);
    } else {
      html.classList.remove('adult-consent-pending');
    }

    if (lastFetchTime === null) {
      dispatch(fetchAllProfiles());
    }
  }, [dispatch, lastFetchTime]);

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
