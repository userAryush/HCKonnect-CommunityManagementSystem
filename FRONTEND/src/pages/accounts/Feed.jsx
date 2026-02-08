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
    <div className={`${theme === 'dark' ? 'bg-[#0b1a11] text-white' : 'bg-[#f4f5f2] text-[#0d1f14]'} min-h-screen`}>
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />


      <main className="pt-24 pb-16">
        <Toast message={toast} onClose={() => setToast('')} />
        <div className="mx-auto w-full max-w-7xl px-4">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Common Feed</p>
            <h1 className="mt-2 text-3xl font-bold">All communities in one place</h1>
          </header>

          <HeaderActionsRow />
          <InfoRow />

          <div className="flex flex-col gap-6">
            <FeedFilter value={filter} onChange={setFilter} />
            <FeedList
              key={`${filter}-${hiddenTypes.join(',')}-${hiddenCommunities.join(',')}`}
              filter={filter}
              hiddenTypes={hiddenTypes}
              hiddenCommunities={hiddenCommunities}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
