'use client';

import { useRouter } from 'next/navigation';
import locationsData from '@/data/counties.json';

type CountyData = {
  name: string;
  sub_counties: string[];
};

interface PopularAreasProps {
  county: string;
  disabled?: boolean;
  onNavigate?: (path: string) => void;
}

export default function PopularAreas({ county, disabled = false, onNavigate }: PopularAreasProps) {
  const router = useRouter();

  const handleAreaClick = (countyName: string, area?: string) => {
    if (disabled) return;

    const path = area
      ? `/${countyName.toLowerCase()}/${area.toLowerCase().replace(/\s+/g, '-')}`
      : `/${countyName.toLowerCase()}`;

    if (onNavigate) {
      onNavigate(path);
      return;
    }

    if (area) {
      // Navigate to specific area in county
      router.push(path);
    } else {
      // Navigate to county page
      router.push(path);
    }
  };

  // Handle "no county selected" case - show popular counties
  if (!county || county === 'all') {
    const popularCounties = [
      'Nairobi',
      'Mombasa',
      'Kisumu',
      'Nakuru',
      'Kiambu',
      'Eldoret',
      'Laikipia',
      'Narok',
      'Limuru',
    ];

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Popular Counties</h2>
        <div className="flex flex-wrap gap-2">
          {popularCounties.map((countyName, index) => (
            <button
              key={index}
              onClick={() => handleAreaClick(countyName)}
              disabled={disabled}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {countyName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show areas for selected county
  const countyData = (locationsData as CountyData[]).find((c) => c.name === county);
  if (!countyData) return null;

  const areas = countyData.sub_counties || [];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Popular Areas in {county}</h2>
      <div className="flex flex-wrap gap-2">
        {areas.map((area: string, index: number) => (
          <button
            key={index}
            onClick={() => handleAreaClick(county, area)}
            disabled={disabled}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
