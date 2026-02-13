import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Toast from '../../components/others/Toast'

import Navbar from '../../components/Navbar'
import FeedFilter from '../../components/feed/FeedFilter'
import FeedList from '../../components/feed/FeedList'
import HeaderActionsRow from '../../components/feed/HeaderActionsRow'
import InfoRow from '../../components/feed/InfoRow'


export default function Feed() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [theme, setTheme] = useState('light')
  const [hiddenTypes, setHiddenTypes] = useState([])
  const [hiddenCommunities, setHiddenCommunities] = useState([])
  const location = useLocation()
  const [toast, setToast] = useState(location.state?.success || '')

  useEffect(() => {
    if (location.state?.success) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])




  return (
    <div className={`${theme === 'dark' ? 'bg-[#0b1a11] text-white' : 'bg-[#f4f5f2] text-[#0d1f14]'} min-h-screen antialiased`}>
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-28 pb-16">
        {/* We use a grid that takes up 100% width but has controlled gutters */}
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* 1. Left Spacer - Helps center the main feed relative to Navbar */}
            <div className="hidden xl:block xl:col-span-1" />

            {/* 2. Main Feed Column - Max-width 4xl to keep it readable and "Centered" */}
            <div className="xl:col-span-7 max-w-4xl w-full mx-auto xl:mx-0">
              <header className="mb-10">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#75C043] mb-2">Common Feed</p>
                <h1 className="text-4xl font-black tracking-tight text-[#0d1f14]">All communities in one place</h1>
              </header>

              <HeaderActionsRow />

              <div className="mt-8 flex flex-col gap-6">
                <div className="sticky top-24 z-20 pb-2">
                  <FeedFilter value={filter} onChange={setFilter} />
                </div>
                <FeedList
                  key={filter}
                  filter={filter}
                  hiddenTypes={hiddenTypes || []}
                  hiddenCommunities={hiddenCommunities || []}
                />
              </div>
            </div>

            {/* 3. InfoRow Column - Pushed to the COMPLETE EDGE */}
            <aside className="hidden xl:block xl:col-span-4 self-start sticky top-28">
              {/* This inner div ensures it stays at the right side of its column */}
              <div className="max-w-[300px] ml-[30px]">
                <InfoRow />
              </div>
            </aside>

            {/* Mobile InfoRow (only shows on small screens at the bottom) */}
            <div className="xl:hidden mt-12">
              <InfoRow />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
