import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { ArrowRight } from 'lucide-react'
import heroImage from '../../../assets/bg3.jpg'

const HERO_IMAGE = heroImage

function WaveDivider({ className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-0 left-0 right-0 z-[1] text-[#f3f7ef] ${className}`}
      aria-hidden
    >
      <svg
        className="block h-[min(8vw,5rem)] w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
        />
      </svg>
    </div>
  )
}

function HeroSection() {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  return (
    <section id="home" className="relative isolate text-white">
      <div className="relative flex h-[calc(100svh-2.75rem)] min-h-[22rem] flex-col overflow-hidden pb-10">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Students collaborating on campus"
            className="h-full w-full object-cover"
            decoding="async"
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>

        {/* Content overlay — centered like reference */}
        <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col justify-center items-center px-4 pt-24 text-center text-white sm:px-6 sm:pt-28 lg:px-8">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center max-w-4xl"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md sm:mb-8"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="text-sm font-medium tracking-wide">HERALD COLLEGE · STUDENT COMMUNITIES</span>
            </Motion.div>

            <h1 className="mb-4 font-display text-4xl font-bold leading-tight sm:mb-6 md:text-6xl lg:text-7xl">
              One home for <br />
              <span className="bg-gradient-to-r from-lime-200 to-white bg-clip-text text-transparent">
                <TypeAnimation
                  sequence={[
                    'Every club & council.',
                    2000,
                    'Events & meetups.',
                    2000,
                    'Discussions & updates.',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>

            <p className="mb-6 max-w-2xl text-base font-medium leading-relaxed text-gray-200 sm:mb-10 sm:text-lg md:text-xl">
            HCKonnect centralizes everything - events, discussions, and updates, so communities could focus on content, not platforms.
            </p>

            <div className="flex w-full flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/feed' : '/register')}
                className="flex w-full items-center justify-center border-none bg-white px-8 py-4 text-base font-bold text-primary shadow-md transition-colors hover:bg-white/90 sm:w-auto rounded-xl"
              >
                {isAuthenticated ? 'Open feed' : 'Get started'}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/communities' : '/login')}
                className="w-full rounded-xl border border-white/30 bg-white/5 px-8 py-4 text-base font-bold text-white shadow-xl backdrop-blur-sm transition-colors hover:bg-white/10 sm:w-auto"
              >
                Browse communities
              </button>
            </div>
          </Motion.div>
        </div>

        <WaveDivider />
      </div>
    </section>
  )
}

export default HeroSection
