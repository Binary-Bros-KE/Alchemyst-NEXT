'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCalendar, FiUser, FiClock, FiShare2 } from 'react-icons/fi';
import { blogs } from '@/data/blogs';
import { BlogLayout } from '@/components/blog/BlogLayouts';
import { BlogCard } from '@/components/blog/BlogCard';

export default function BlogDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const blog = (blogs as any[]).find((b) => b.id === id);

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <button
            onClick={() => router.push('/blog')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const shareBlog = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const relatedBlogs = (blogs as any[])
    .filter((b) => b.id !== blog.id && b.category === blog.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-gray-900">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-64 md:h-96 object-cover opacity-60 max-md:min-h-110"
        />
        <div className="max-w-4xl mx-auto cursor-pointer max-md:mx-3">
          <button
            onClick={() => router.push('/blog')}
            className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6 absolute top-0 mt-5 cursor-pointer"
          >
            <FiArrowLeft size={20} />
            Back to Blogs
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                {blog.category}
              </span>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <FiUser size={14} />
                  {blog.author}
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  {new Date(blog.publishDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock size={14} />
                  {blog.readTime}
                </span>
              </div>
            </div>

            <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{blog.title}</h1>

            <p className="text-sm md:text-lg text-blue-100 max-w-3xl">{blog.excerpt}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <BlogLayout blog={blog} />
          </div>

          <div className="flex justify-end mb-8">
            <button
              onClick={shareBlog}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiShare2 size={16} />
              Share
            </button>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <BlogCard key={relatedBlog.id} blog={relatedBlog} featured={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
