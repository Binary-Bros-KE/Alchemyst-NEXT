'use client';

import { useMemo, useState } from 'react';
import { FiSearch, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import { BlogCard } from '@/components/blog/BlogCard';
import { blogs, BLOG_CATEGORIES } from '@/data/blogs';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
] as const;

export default function BlogsPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]['value']>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredBlogs = useMemo(() => {
    let filtered = blogs as any[];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.excerpt.toLowerCase().includes(query) ||
          blog.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((blog) => blog.category === selectedCategory);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        case 'oldest':
          return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredBlogs = filteredBlogs.filter((blog) => blog.featured);
  const regularBlogs = filteredBlogs.filter((blog) => !blog.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-[url('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760962804/alchemyst-sex-talk_fhazdb.png')] bg-cover bg-center text-white py-16">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative mx-auto px-4 max-w-7xl z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Let's Talk Sex</h1>
            <p className="text-xl text-blue-100 mb-8">
              "Some of the best moments in life are the ones you can't tell anyone about." - Sarah Nader
            </p>

            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
              >
                <span className="font-medium">Filters and Categories</span>
                <FiChevronDown className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {(BLOG_CATEGORIES as string[]).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Sort By</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        sortBy === option.value ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="font-bold mb-2">Stay Updated</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Sex Tips, Sex styles, Porn Videos, leaks, escorts, massuses, spas and models.
                </p>
                <a
                  href="https://t.me/alchemyst_ke"
                  className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 justify-center"
                >
                  <FaTelegramPlane />
                  Join Telegram Channel
                </a>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
                </h2>
                <p className="text-gray-600">
                  {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex bg-white rounded-lg border p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <FiList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {featuredBlogs.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Featured Articles</h3>
                <div className="space-y-6">
                  {featuredBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} featured />
                  ))}
                </div>
              </div>
            )}

            {regularBlogs.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {featuredBlogs.length > 0 ? 'More Articles' : 'All Articles'}
                </h3>
                <div
                  className={
                    viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'
                  }
                >
                  {regularBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} featured={false} />
                  ))}
                </div>
              </div>
            )}

            {filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiSearch size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
