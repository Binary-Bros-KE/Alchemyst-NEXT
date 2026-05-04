'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiPhone, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { BiLocationPlus } from 'react-icons/bi';
import { BsWhatsapp } from 'react-icons/bs';
import { generateProfilePath } from '@/utils/urlHelpers';
import type { Profile } from '@/lib/features/profiles/profilesSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ProfileCardProps {
  profile: Profile;
  imgHght?: string;
}

// Helper component for the diagonal ribbon style
const Ribbon = ({
  text,
  colorClass,
  icon,
  top,
}: {
  text: string;
  colorClass: string;
  icon?: React.ReactNode;
  top: string;
}) => (
  <div
    className={`absolute transform -rotate-45 text-center text-white text-[8px] font-bold shadow-lg ${colorClass} ${top} w-40`}
  >
    <span className="inline-flex items-center gap-1.5 py-1 text-[8px] uppercase tracking-wider">
      {icon}
      {text}
    </span>
  </div>
);

export default function ProfileCard({ profile, imgHght }: ProfileCardProps) {
  const router = useRouter();
  const [showBio, setShowBio] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Using document.execCommand for broader compatibility within iframes
      const input = document.createElement('input');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      input.value = profile.contact?.phoneNumber || '';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);

      setCopied(true);
      toast.success('Phone number copied!');
      setTimeout(() => setCopied(false), 2000);

      trackInteraction('phone_copy');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${profile.contact?.phoneNumber}`;
    trackInteraction('call');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/${profile.contact?.phoneNumber}`, '_blank');
    trackInteraction('whatsapp');
  };

  const handleViewProfile = () => {
    trackInteraction('profile_view');
    router.push(generateProfilePath(profile));
  };

  const trackInteraction = async (type: string) => {
    if (!API_URL) return;
    try {
      await fetch(`${API_URL}/analytics/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile._id,
          interactionType: type,
        }),
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  const renderBadges = () => {
    const packageType = profile.currentPackage?.packageType;
    const isPackageActive = profile.currentPackage?.status === 'active';
    const isVerified = profile.verification?.profileVerified;

    const badgeList: { text: string; colorClass: string; icon?: React.ReactNode }[] = [];

    // Check for package badge
    if (packageType && isPackageActive) {
      const packageInfo: Record<string, { text: string; colorClass: string }> = {
        elite: { text: 'VIP', colorClass: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
        premium: { text: 'Premium', colorClass: 'bg-gradient-to-r from-purple-500 to-pink-500' },
        basic: { text: 'Regular', colorClass: 'bg-neutral-600' },
      };

      if (packageInfo[packageType]) {
        badgeList.push(packageInfo[packageType]);
      }
    }

    // Check for verification badge
    if (isVerified) {
      badgeList.push({
        text: 'Verified',
        colorClass: 'bg-blue-500',
        icon: <FiCheckCircle size={12} />,
      });
    }

    if (badgeList.length === 0) return null;

    return (
      <div className="absolute top-0 left-0 w-40 h-40 overflow-hidden z-10 pointer-events-none">
        {badgeList.map((badge, index) => (
          <Ribbon
            key={badge.text}
            text={badge.text}
            colorClass={badge.colorClass}
            icon={badge.icon}
            top={index === 0 ? 'top-3 -left-15' : 'top-8 -left-12'}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-card rounded-lg overflow-hidden shadow-lg cursor-pointer group border ${
        profile.userType === 'masseuse'
          ? 'border-blue-500/20'
          : profile.userType === 'of-model'
          ? 'border-fuchsia-500/20'
          : 'border-primary/20'
      }`}
      onClick={handleViewProfile}
      onMouseEnter={() => setShowBio(true)}
      onMouseLeave={() => setShowBio(false)}
    >
      {renderBadges()}

      <div className={`h-70 ${imgHght ? imgHght : 'max-md:h-50'} relative overflow-hidden`}>
        <img
          src={
            profile.profileImage?.url ||
            'https://placehold.co/300x400/232323/FFF?text=Profile'
          }
          alt={profile.username}
          className="w-full h-full object-cover"
        />

        {showBio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-center items-center text-center"
          >
            {profile.bio ? (
              <p className="text-white text-sm line-clamp-6 mb-4 max-md:mb-2">{profile.bio}</p>
            ) : (
              <p className="text-white/70 text-sm mb-4 italic max-md:mb-2">No bio available</p>
            )}
            <button
              className={`px-4 py-2 text-white rounded-lg font-medium transition-all cursor-pointer max-md:text-xs max-md:px-2 ${
                profile.userType === 'masseuse'
                  ? 'bg-blue-500 hover:bg-blue-500/90'
                  : profile.userType === 'of-model'
                  ? 'bg-fuchsia-500 hover:bg-fuchsia-500/90'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              View Full Profile
            </button>
          </motion.div>
        )}

        <div
          className={`absolute bottom-2 right-2 px-2 rounded-lg text-sm capitalize text-white font-medium ${
            profile.userType === 'masseuse'
              ? 'bg-blue-500'
              : profile.userType === 'of-model'
              ? 'bg-fuchsia-500'
              : 'bg-primary'
          }`}
        >
          {profile.userType}
        </div>
      </div>

      <div className="bg-white p-3 space-y-2 max-md:p-2">
        <h3
          className={`font-bold capitalize truncate text-md ${
            profile.userType === 'masseuse'
              ? 'text-blue-500'
              : profile.userType === 'of-model'
              ? 'text-fuchsia-500'
              : 'text-primary'
          }`}
        >
          {profile.username} ({profile.age} yrs)
        </h3>
        <p className="text-md text-muted-foreground truncate flex items-center gap-1">
          <BiLocationPlus size={12} />
          {profile.location?.county}, {profile.location?.location}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-blue-500/50 font-bold flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500/50 rounded-full"></div>
            {profile.serviceType === 'both'
              ? 'Incalls & Outcalls'
              : profile.serviceType === 'incall'
              ? 'Incalls Only'
              : 'Outcalls Only'}
          </div>
          <div
            className={`capitalize font-semibold rounded-sm w-fit text-sm px-2 ${
              profile.userType === 'masseuse'
                ? 'text-blue-500 bg-blue-400/20'
                : profile.userType === 'of-model'
                ? 'text-fuchsia-500 bg-fuchsia-400/20'
                : 'text-primary bg-primary/20'
            }`}
          >
            {profile.gender}
          </div>
        </div>

        {profile.contact?.phoneNumber && (
          <div className="flex items-center gap-2 max-w-full">
            <input
              type="text"
              value={profile.contact.phoneNumber}
              readOnly
              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded text-foreground max-w-[85%] max-md:max-w-[78%] truncate"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleCopyPhone}
              className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-all cursor-pointer"
            >
              {copied ? <FiCheckCircle size={16} /> : <FiCopy size={16} />}
            </button>
          </div>
        )}

        <div className="flex gap-2 max-md:gap-1">
          <button
            onClick={handleCall}
            className="flex-1 px-3 py-2 bg-gray-400 text-white rounded font-medium hover:bg-gray-600 transition-all flex items-center justify-center gap-1 text-sm cursor-pointer"
          >
            <FiPhone size={14} />
            Call
          </button>
          {profile.contact?.hasWhatsApp && (
            <button
              onClick={handleWhatsApp}
              className="flex-1 px-3 py-2 bg-[#25D366] text-white rounded font-medium hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-1 text-sm cursor-pointer"
            >
              <BsWhatsapp size={14} />
              Chat
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

