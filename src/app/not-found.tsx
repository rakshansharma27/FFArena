import Link from 'next/link'

export const runtime = 'edge'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F3F4F6] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-8xl font-extrabold tracking-widest text-[#ff6b00]">404</h1>
        <h2 className="text-2xl font-bold tracking-wide">ZONE NOT FOUND</h2>
        <p className="text-gray-400 text-sm">
          The arena you are looking for does not exist or has been relocated.
        </p>
        <div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-medium rounded-lg transition-all shadow-lg shadow-[#ff6b00]/20"
          >
            Return to Lobby
          </Link>
        </div>
      </div>
    </div>
  )
}
