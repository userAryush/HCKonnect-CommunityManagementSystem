import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../../shared/components/layout/Navbar'
import Footer from '../../../shared/components/layout/Footer'
import vacancyService from '../service/vacancyService'
import { useToast } from '../../../shared/components/ui/ToastContext'
import DashboardVacancyCard from '../components/DashboardVacancyCard'
import { DashboardVacancyCardSkeleton } from '../../../shared/components/layout/Skeleton'
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal'
import PaginationInfo from '../../../shared/components/pagination/PaginationInfo'
import PaginationControls from '../../../shared/components/pagination/PaginationControls'
import CreateVacancyModal from '../components/CreateVacancyModal'
import CreateButton from '../../../shared/components/ui/CreateButton'
import getApiErrorMessage from '../../../utils/getApiErrorMessage'
import BackLink from '../../../shared/components/layout/BackLink'

export default function VacanciesPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [vacancies, setVacancies] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [vacancyToDelete, setVacancyToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activeFilter, setActiveFilter] = useState('Newest')
  const [vacancyToClose, setVacancyToClose] = useState(null)
  const [vacancyActionLoadingId, setVacancyActionLoadingId] = useState(null)
  const [isCreateVacancyModalOpen, setCreateVacancyModalOpen] = useState(false)

  const filterOptions = [
    { label: 'Newest' },
    { label: 'Oldest' },
    { label: 'Open' },
    { label: 'Closed' },
    { label: 'All' },
  ]

  const buildFilterParams = () => {
    const params = { page: currentPage, pageSize: itemsPerPage }
    switch (activeFilter) {
      case 'Open':
        params.status = 'OPEN'
        break
      case 'Closed':
        params.status = 'CLOSED'
        break
      case 'Newest':
        params.sort = 'newest'
        break
      case 'Oldest':
        params.sort = 'oldest'
        break
      case 'All':
      default:
        params.status = 'ALL'
        break
    }
    return params
  }

  const fetchVacancies = async () => {
    try {
      setLoading(true)
      const data = await vacancyService.getVacancies(id, buildFilterParams())
      const fetchedVacancies = data.results || data || []
      setVacancies(fetchedVacancies)
      setTotalCount(data.count ?? fetchedVacancies.length)
    } catch (err) {
      console.error('Failed to load vacancies', err)
      showToast('Failed to load vacancies.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVacancies()
  }, [id, showToast, activeFilter, currentPage, itemsPerPage])

  const reloadVacancies = async () => {
    try {
      setLoading(true)
      const data = await vacancyService.getVacancies(id, buildFilterParams())
      const fetchedVacancies = data.results || data || []
      setVacancies(fetchedVacancies)
      setTotalCount(data.count ?? fetchedVacancies.length)
    } catch (err) {
      console.error('Failed to reload vacancies', err)
      showToast('Failed to refresh vacancies.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseVacancy = async () => {
    if (!vacancyToClose) return

    try {
      setVacancyActionLoadingId(vacancyToClose.id)
      await vacancyService.updateVacancy(vacancyToClose.id, { status: 'CLOSED' })
      await reloadVacancies()
      showToast(`"${vacancyToClose.title}" closed successfully.`, 'success')
      setVacancyToClose(null)
    } catch (err) {
      console.error('Failed to close vacancy', err)
      const message = getApiErrorMessage(err, 'Failed to close vacancy.')
      showToast(message, 'error')
    } finally {
      setVacancyActionLoadingId(null)
    }
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleDeleteRequest = (vacancy) => {
    setVacancyToDelete(vacancy)
  }

  const confirmDelete = async () => {
    if (!vacancyToDelete) return
    setIsDeleting(true)
    try {
      await vacancyService.deleteVacancy(vacancyToDelete.id)
      setVacancies((prev) => prev.filter((v) => v.id !== vacancyToDelete.id))
      setTotalCount((prev) => Math.max(0, prev - 1))
      showToast('Vacancy permanently deleted.')
    } catch (err) {
      console.error('Failed to delete vacancy', err)
      showToast('Failed to delete vacancy.', 'error')
    } finally {
      setIsDeleting(false)
      setVacancyToDelete(null)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-secondary text-surface-dark">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <div className="mb-1">
                  <BackLink to={`/community/${id}/dashboard`} text="Dashboard" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-surface-dark sm:text-3xl">Manage Vacancies</h1>
                  <p className="text-sm text-surface-muted">Review, sort, and manage all job vacancies for your community.</p>
                </div>
                <CreateButton onClick={() => setCreateVacancyModalOpen(true)}>
                  Create Vacancy
                </CreateButton>
              </header>

              {loading ? (
                <div className="space-y-4">
                  <DashboardVacancyCardSkeleton />
                  <DashboardVacancyCardSkeleton />
                  <DashboardVacancyCardSkeleton />
                </div>
              ) : vacancies.length === 0 ? (
                <div className="card-border text-center text-surface-muted !py-12">
                  No vacancies found for the selected filter.
                </div>
              ) : (
                <>
                  <PaginationInfo
                    totalItems={totalCount}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    className="mb-4"
                  />
                  <div className="space-y-4">
                    {vacancies.map((vacancy) => (
                      <DashboardVacancyCard
                        key={vacancy.id}
                        vacancy={vacancy}
                        communityId={id}
                        showDescription={true}
                        onDelete={handleDeleteRequest}
                        onAction={setVacancyToClose}
                        isActionLoading={vacancyActionLoadingId === vacancy.id}
                      />
                    ))}
                  </div>
                  <div className="mt-8">
                    <PaginationControls
                      totalItems={totalCount}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              )}
            </div>

            <aside className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
              <div className="bg-white rounded-standard border border-surface-border shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="block rounded-full bg-primary" style={{ width: '3px', height: '16px' }} />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-surface-muted">
                    Filters
                  </h3>
                </div>
                <div className="space-y-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleFilterChange(option.label)}
                      className={`w-full rounded-button px-4 py-2.5 text-left text-sm font-semibold transition-all ${activeFilter === option.label
                        ? 'bg-primary text-white'
                        : 'border border-surface-border bg-white text-surface-body hover:bg-secondary'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <CreateVacancyModal
        isOpen={isCreateVacancyModalOpen}
        onClose={() => setCreateVacancyModalOpen(false)}
        communityId={id}
        onVacancyCreated={() => {
        }}
      />

      <ConfirmationModal
        isOpen={!!vacancyToClose}
        onClose={() => {
          if (!vacancyActionLoadingId) setVacancyToClose(null)
        }}
        onConfirm={handleCloseVacancy}
        title="Close vacancy?"
        message={`Applicants will still be visible, but this vacancy will stop accepting new applications.`}
        confirmText="Close Vacancy"
        isLoading={Boolean(vacancyActionLoadingId)}
        loadingText="Closing..."
      />

      <ConfirmationModal
        isOpen={!!vacancyToDelete}
        onClose={() => setVacancyToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Vacancy?"
        message="This action is irreversible. All associated applications and data will be permanently deleted."
        confirmText="Delete"
        isLoading={isDeleting}
        loadingText="Deleting..."
      />
    </div>
  )
}