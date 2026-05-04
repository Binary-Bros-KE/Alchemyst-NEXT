import Link from 'next/link';
import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';

type Blog = {
  id: string;
  title: string;
  coverImage: string;
  category: string;
  publishDate: string;
  excerpt: string;
  author: string;
  readTime: string;
};

export function BlogCard({ blog, featured = false }: { blog: Blog; featured?: boolean }) {
  if (featured) {
    return (
      <Link href={`/blog/${blog.id}`} className="block group">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="md:flex">
            <div className="md:flex-1">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="md:flex-1 p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {blog.category}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <FiCalendar size={14} />
                  {new Date(blog.publishDate).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                {blog.title}
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">{blog.excerpt}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiUser size={14} />
                    {blog.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={14} />
                    {blog.readTime}
                  </span>
                </div>

                <span className="text-primary font-medium group-hover:underline">Read More -&gt;</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${blog.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              {blog.category}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <FiClock size={12} />
              {blog.readTime}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{blog.author}</span>
            <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
