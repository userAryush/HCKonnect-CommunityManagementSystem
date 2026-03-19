import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import FeedFilter from '../../components/feed/FeedFilter'
import FeedList from '../../components/feed/FeedList'
import InfoRow from '../../components/feed/InfoRow'

export default function Feed() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const location = useLocation()

  return (
    <div className="bg-[#F9FAFB] min-h-screen antialiased">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Main Feed Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <header className="flex flex-col gap-2 mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-surface-dark sm:text-3xl">Daily Feed</h1>
                <p className="text-sm text-surface-muted">Central hub for all community updates and discussions.</p>
              </header>

              <div className="sticky top-[72px] z-20 bg-[#F9FAFB]/80 backdrop-blur-md py-4 border-b border-surface-border/50 -mx-4 px-4 sm:mx-0 sm:px-0">
                <FeedFilter value={filter} onChange={setFilter} />
              </div>

              <div className="mt-2">
                <FeedList
                  key={filter}
                  filter={filter}
                />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
              <InfoRow />
            </aside>

            {/* Mobile Sidebar */}
            <div className="lg:hidden mt-12 pt-12 border-t border-surface-border">
              <InfoRow />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
