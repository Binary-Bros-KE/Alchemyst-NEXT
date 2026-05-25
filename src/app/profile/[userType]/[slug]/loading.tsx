export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-neutral-900 py-4 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="h-8 w-48 animate-pulse rounded bg-white/15" />
        </div>
      </div>

      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-4">
          <div className="aspect-[3/4] animate-pulse rounded-xl bg-neutral-200" />
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-lg bg-neutral-200" />
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="h-10 w-64 animate-pulse rounded bg-neutral-200" />
          <div className="h-6 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-lg bg-neutral-200" />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
