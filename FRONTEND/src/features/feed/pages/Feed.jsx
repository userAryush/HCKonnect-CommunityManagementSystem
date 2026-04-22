import { useState } from 'react'
import Navbar from '../../../shared/components/layout/Navbar'
import FeedFilter from '../components/FeedFilter'
import FeedList from '../components/FeedList'
import InfoRow from '../components/InfoRow'
import Button from '../../../shared/components/ui/Button'
import { Plus, MessageSquare } from 'lucide-react'
import VacancyApplicationModal from '../../vacancy/components/VacancyApplicationModal'
import CreateDiscussionModal from '../../discussion/components/CreateDiscussionModal'
import CreatePostModal from '../../posts/components/CreatePostModal'
import { useToast } from '../../../shared/components/ui/ToastContext'

export default function Feed() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const { showToast } = useToast()

  const [selectedVacancy, setSelectedVacancy] = useState(null)
  const [isApplying, setIsApplying] = useState(false)
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const handleApplyClick = (vacancy, event) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedVacancy(vacancy);
    setIsApplying(true);
  };

  const handleApplicationSuccess = (message) => {
    showToast(message, 'success');
    setIsApplying(false);
    setSelectedVacancy(null);
  };

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
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-surface-dark sm:text-3xl">Daily Feed</h1>
                  <p className="text-sm text-surface-muted">Central hub for all community updates and discussions.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="gap-2 !py-2 !px-4 text-xs font-bold"
                    onClick={() => setIsPostModalOpen(true)}
                  >
                    <Plus size={16} />
                    <span className="hidden xs:inline">Create Post</span>
                    <span className="xs:hidden">Post</span>
                  </Button>
                  <Button
                    variant="primary"
                    className="gap-2 !py-2 !px-4 text-xs font-bold shadow-lg shadow-primary/20"
                    onClick={() => setIsDiscussionModalOpen(true)}
                  >
                    <MessageSquare size={16} />
                    <span className="hidden xs:inline">Start Discussion</span>
                    <span className="xs:hidden">Discuss</span>
                  </Button>
                </div>
              </header>

              <div className="sticky top-[72px] z-20 bg-[#F9FAFB]/80 backdrop-blur-md py-4 border-b border-surface-border/50 -mx-4 px-4 sm:mx-0 sm:px-0">
                <FeedFilter value={filter} onChange={setFilter} />
              </div>

              <div className="mt-2">
                <FeedList
                  key={filter}
                  filter={filter}
                  onApplyClick={handleApplyClick}
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

      {selectedVacancy && (
        <VacancyApplicationModal
          vacancy={selectedVacancy}
          onClose={() => setSelectedVacancy(null)}
          onSuccess={handleApplicationSuccess}
        />
      )}

      <CreateDiscussionModal
        isOpen={isDiscussionModalOpen}
        onClose={() => setIsDiscussionModalOpen(false)}
      />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  )
}
