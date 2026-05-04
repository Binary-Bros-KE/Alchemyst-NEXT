'use client';

import { useState, useEffect } from 'react';
import { BiSupport } from 'react-icons/bi';
import { FaTelegramPlane } from 'react-icons/fa';

export default function TelegramModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed =
      typeof window !== 'undefined' && localStorage.getItem('telegramModalDismissed') === 'true';
    setDismissed(wasDismissed);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setIsOpen(true), 30000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  const close = () => {
    setIsOpen(false);
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('telegramModalDismissed', 'true');
    }
  };

  const handleJoin = () => {
    window.open('https://t.me/alchemyst_lt', '_blank', 'noopener,noreferrer');
    close();
  };

  return (
    <>
      {/* Sticky sidebar icons */}
      <div className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 flex-col space-y-2">
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer rounded-l-sm bg-blue-500 p-3 text-white shadow-lg transition-colors hover:bg-blue-600 max-md:p-1"
          aria-label="Join Telegram Channel"
        >
          <FaTelegramPlane size={20} />
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer rounded-l-sm bg-green-500 p-3 text-white shadow-lg transition-colors hover:bg-green-600 max-md:p-1"
          aria-label="Contact via Telegram"
        >
          <BiSupport size={20} />
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl">
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
              Join Our Telegram Channel
            </h2>
            <p className="mb-2 font-extrabold uppercase text-primary">
              Best Kenyan (254🔞) Telegram Channel
            </p>

            <ul className="mb-6 list-inside space-y-1 text-center text-gray-600">
              <li>🍆🔞 DAILY PORN (XXX) VIDEOS</li>
              <li>🍑💦 SEX TIPS AND TOYS</li>
              <li>🥵🔥 NUDES AND OF-LEAKS</li>
              <li>🔞🍑 FREE HOOK-UPS</li>
              <li>🔥💦 TRENDING VIDEOS</li>
            </ul>

            <p className="mb-6 text-center text-gray-600">
              Join our Telegram channel and message admin for inquiries.{' '}
              <span className="text-primary">(@alche_me)</span>
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleJoin}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Join Now
              </button>
              <button
                onClick={close}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-400"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
