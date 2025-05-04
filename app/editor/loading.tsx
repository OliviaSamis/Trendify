export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-800 to-slate-950">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 w-full h-full rounded-full border-4 border-slate-700"></div>
        <div className="absolute inset-0 w-full h-full rounded-full border-t-4 border-t-purple-500 animate-spin"></div>
      </div>
      <h2 className="mt-6 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        Trendify
      </h2>
      <p className="mt-2 text-sm text-slate-400">Loading editor...</p>
    </div>
  )
}
