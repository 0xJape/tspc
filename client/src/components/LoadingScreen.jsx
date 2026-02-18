import { useState, useEffect } from 'react'

export default function LoadingScreen({ onComplete }) {
  const [stage, setStage] = useState('welcome') // welcome -> logo -> fadeout

  useEffect(() => {
    // Welcome text shows for 1.5s
    const welcomeTimer = setTimeout(() => {
      setStage('logo')
    }, 1500)

    // Logo shows for 1.5s then fades out
    const logoTimer = setTimeout(() => {
      setStage('fadeout')
    }, 3000)

    // Complete after fade out
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 3800)

    return () => {
      clearTimeout(welcomeTimer)
      clearTimeout(logoTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Welcome Text */}
        <div
          className={`transition-opacity duration-700 ${
            stage === 'welcome' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="text-2xl md:text-3xl font-light text-gray-900 tracking-wide">
            Welcome to
          </h1>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-gray-900 club-name">
            Tupi Smash Pickleball Club
          </h2>
        </div>

        {/* Logo */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
            stage === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col items-center">
            <img 
              src="/tspc.png" 
              alt="TSPC Logo" 
              className="w-32 h-32 md:w-40 md:h-40 animate-pulse-slow"
            />
            <div className="mt-6 flex space-x-2">
              <div className="w-2 h-2 bg-baseline-green rounded-full animate-bounce-1"></div>
              <div className="w-2 h-2 bg-baseline-green rounded-full animate-bounce-2"></div>
              <div className="w-2 h-2 bg-baseline-green rounded-full animate-bounce-3"></div>
            </div>
          </div>
        </div>

        {/* Fade out overlay */}
        <div
          className={`absolute inset-0 bg-white transition-opacity duration-800 pointer-events-none ${
            stage === 'fadeout' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  )
}
