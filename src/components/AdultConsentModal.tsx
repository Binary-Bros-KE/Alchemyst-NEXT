'use client';

import { useRouter } from 'next/navigation';
import { grantAdultConsent } from '@/utils/consent';

interface AdultConsentModalProps {
  onClose?: () => void;
}

export default function AdultConsentModal({ onClose }: AdultConsentModalProps) {
  const router = useRouter();

  const accept = () => {
    grantAdultConsent();
    onClose?.();
  };

  const decline = () => {
    router.push('/adult-content-warning');
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6">
        <h2 className="mb-3 flex flex-col items-center gap-2 text-center text-2xl font-bold uppercase">
          <div className="flex items-center justify-center rounded-full bg-black p-2">
            <img src="/primary-logo.png" className="h-25" alt="Alchemyst logo" />
          </div>
          Adult Content Warning
        </h2>
        <p className="mb-4 text-center text-text-secondary">
          This website contains content intended for adults aged 18 and over. By continuing, you confirm that you
          are at least 18 years old and that viewing this content is legal in your jurisdiction.
        </p>
        <div className="flex gap-3 max-md:flex-col justify-end">
          <button
            onClick={decline}
            className="cursor-pointer rounded-lg border border-border-light px-4 py-2 text-text-primary"
          >
            I am under 18 / Exit
          </button>
          <button
            onClick={accept}
            className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-medium text-text-inverse"
          >
            I am 18 or older — Enter
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-text-secondary">Consent will be remembered for 25 hours.</p>
      </div>
    </div>
  );
}
