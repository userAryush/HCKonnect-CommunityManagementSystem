import { useState } from 'react'
import Navbar from '../components/Navbar'
import FeedFilter from '../components/feed/FeedFilter'
import FeedList from '../components/feed/FeedList'
// import SettingsMenu from '../components/SettingsMenu'

export default function Feed() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [theme, setTheme] = useState('light')
  const [hiddenTypes, setHiddenTypes] = useState([])
  const [hiddenCommunities, setHiddenCommunities] = useState([])



  // const rightActions = (
  //   <SettingsMenu
  //     theme={theme}
  //     setTheme={setTheme}
  //     hiddenTypes={hiddenTypes}
  //     setHiddenTypes={setHiddenTypes}
  //     hiddenCommunities={hiddenCommunities}
  //     setHiddenCommunities={setHiddenCommunities}
  //   />
  // )

  return (
    <div className={`${theme === 'dark' ? 'bg-[#0b1a11] text-white' : 'bg-[#f4f5f2] text-[#0d1f14]'} min-h-screen`}>
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
        // rightActions={rightActions}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Common Feed</p>
              <h1 className="mt-2 text-2xl font-semibold">All communities in one place</h1>
            </div>
          </header>
          <div className="mt-6">
            <FeedFilter value={filter} onChange={setFilter} />
          </div>
          <section className="mt-6">
            <FeedList
              key={`${filter}-${hiddenTypes.join(',')}-${hiddenCommunities.join(',')}`}
              filter={filter}
              hiddenTypes={hiddenTypes}
              hiddenCommunities={hiddenCommunities}
            />
          </section>
        </div>
      </main>
    </div>
  )
}
