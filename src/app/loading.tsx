export default function Loading() {
  return (
    <main className="min-h-screen bg-mist px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-10 w-44 rounded-xl" />
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="skeleton h-56 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
          <div className="skeleton h-80 rounded-[1.7rem]" />
        </div>
      </div>
    </main>
  );
}
