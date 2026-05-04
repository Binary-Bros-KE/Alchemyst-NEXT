'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllProfiles, type Profile } from '@/lib/features/profiles/profilesSlice';
import type { RootState } from '@/lib/store';
import ProfileCard from '@/components/ProfileCard';
import SpaCard from '@/components/SpaCard';
import { BLOG_LAYOUTS } from '@/data/blogs';

export function ConfessionLayout({ blog }: { blog: any }) {
  return (
    <article className="max-w-4xl mx-auto">
      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-line leading-relaxed text-gray-700">{blog.content}</div>
      </div>
    </article>
  );
}

export function TopTenLayout({ blog }: { blog: any }) {
  return (
    <article className="max-w-4xl mx-auto">
      <div className="py-4">{blog.intro}</div>
      {blog.sections?.map((section: any, index: number) => (
        <div key={index} className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {index + 1}. {section.title}
          </h2>

          <div
            className={`flex flex-col lg:flex-row gap-8 items-center ${
              section.imagePosition === 'right' ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div className="lg:w-1/2">
              <img
                src={section.image}
                alt={section.title}
                className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-md"
              />
            </div>

            <div className="lg:w-1/2">
              <p className="text-gray-700 mb-4 leading-relaxed">{section.description}</p>

              {section.tips && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    {section.tips.map((tip: string, tipIndex: number) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </article>
  );
}

export function SpaReviewLayout({ blog }: { blog: any }) {
  const dispatch = useAppDispatch();
  const { allProfiles } = useAppSelector((state: RootState) => state.profiles);

  useEffect(() => {
    if (allProfiles.length === 0) {
      dispatch(fetchAllProfiles());
    }
  }, [allProfiles.length, dispatch]);

  const featuredSpas = allProfiles.filter(
    (profile: Profile) => blog.featuredSpas?.includes(profile._id) && profile.userType === 'spa'
  );

  return (
    <article className="max-w-6xl mx-auto">
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-gray-700 leading-relaxed">{blog.introduction}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {featuredSpas.map((spa: Profile, index: number) => (
          <div key={spa._id} className="relative">
            <div className="absolute -top-3 -left-3 z-10">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                #{index + 1}
              </span>
            </div>
            <SpaCard profile={spa as any} />
          </div>
        ))}
      </div>

      <div className="prose prose-lg max-w-none bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 leading-relaxed">{blog.conclusion}</p>
      </div>
    </article>
  );
}

export function ProfileSpotlightLayout({ blog }: { blog: any }) {
  const dispatch = useAppDispatch();
  const { allProfiles } = useAppSelector((state: RootState) => state.profiles);

  useEffect(() => {
    if (allProfiles.length === 0) {
      dispatch(fetchAllProfiles());
    }
  }, [allProfiles.length, dispatch]);

  const featuredProfiles = allProfiles.filter(
    (profile: Profile) => blog.featuredProfiles?.includes(profile._id) && profile.userType !== 'spa'
  );

  return (
    <article className="max-w-6xl mx-auto">
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-gray-700 leading-relaxed">{blog.introduction}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
        {featuredProfiles.map((profile: Profile) => (
          <ProfileCard key={profile._id} profile={profile as any} />
        ))}
      </div>

      <div className="prose prose-lg max-w-none bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 leading-relaxed">{blog.conclusion}</p>
      </div>
    </article>
  );
}

export function MixedContentLayout({ blog }: { blog: any }) {
  const dispatch = useAppDispatch();
  const { allProfiles } = useAppSelector((state: RootState) => state.profiles);

  useEffect(() => {
    if (allProfiles.length === 0) {
      dispatch(fetchAllProfiles());
    }
  }, [allProfiles.length, dispatch]);

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed">{block.content}</p>
          </div>
        );

      case 'profile_spotlight': {
        const profiles = allProfiles.filter(
          (p: Profile) => block.profileIds?.includes(p._id) && p.userType !== 'spa'
        );
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Featured Profiles</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map((profile: Profile) => (
                <ProfileCard key={profile._id} profile={profile as any} />
              ))}
            </div>
          </div>
        );
      }

      case 'spa_spotlight': {
        const spas = allProfiles.filter((p: Profile) => block.spaIds?.includes(p._id) && p.userType === 'spa');
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Spas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spas.map((spa: Profile) => (
                <SpaCard key={spa._id} profile={spa as any} />
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return <article className="max-w-4xl mx-auto">{blog.content?.map(renderContentBlock)}</article>;
}

export function TrendingNewsLayout({ blog }: { blog: any }) {
  return (
    <article className="max-w-4xl mx-auto">
      {blog.sections?.map((section: any, index: number) => {
        switch (section.type) {
          case 'text':
            return (
              <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
                {section.content}
              </p>
            );

          case 'image': {
            const images = section.images || [{ src: section.src, alt: section.alt }];
            const count = images.length;
            const gridCols =
              count === 1 ? '' : count === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

            return (
              <figure key={index} className="my-8">
                <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
                  {images.map((img: any, i: number) => (
                    <img
                      key={i}
                      src={img.src}
                      alt={img.alt || ''}
                      className={`w-full ${count === 1 ? 'max-w-md mx-auto' : ''} h-[500px] object-cover rounded-lg shadow-md`}
                    />
                  ))}
                </div>
                {section.caption && (
                  <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'quote':
            return (
              <blockquote
                key={index}
                className="my-8 border-l-4 border-primary bg-primary/10 rounded-r-lg px-6 py-5"
              >
                <p className="text-gray-800 italic text-lg leading-relaxed mb-3">
                  &ldquo;{section.content}&rdquo;
                </p>
                <footer className="text-sm">
                  <span className="font-semibold text-primary">{section.author}</span>
                  {section.platform && (
                    <span className="text-gray-500"> — {section.platform}</span>
                  )}
                </footer>
              </blockquote>
            );

          case 'subheading':
            return (
              <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4">
                {section.content}
              </h3>
            );

          default:
            return null;
        }
      })}
    </article>
  );
}

export function BlogLayout({ blog }: { blog: any }) {
  const layouts: Record<string, React.ComponentType<{ blog: any }>> = {
    [BLOG_LAYOUTS.CONFESSION]: ConfessionLayout,
    [BLOG_LAYOUTS.TOP_TEN]: TopTenLayout,
    [BLOG_LAYOUTS.SPA_REVIEW]: SpaReviewLayout,
    [BLOG_LAYOUTS.PROFILE_SPOTLIGHT]: ProfileSpotlightLayout,
    [BLOG_LAYOUTS.MIXED_CONTENT]: MixedContentLayout,
    [BLOG_LAYOUTS.TRENDING_NEWS]: TrendingNewsLayout,
  };

  const LayoutComponent = layouts[blog.layout] || ConfessionLayout;
  return <LayoutComponent blog={blog} />;
}
