import { useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import vacancyService from '../../services/vacancyService'
import { useToast } from '../../context/ToastContext'
import PageHeader from '../../components/shared/PageHeader'
import DashboardVacancyCard from '../../components/cards/DashboardVacancyCard'
import { DashboardVacancyCardSkeleton } from '../../components/shared/Skeleton'
import ConfirmationModal from '../../components/modals/ConfirmationModal'
import PaginationInfo from '../../components/shared/PaginationInfo'
import PaginationControls from '../../components/shared/PaginationControls'
import ManagementToolbar from '../../components/applicationmanagement/ManagementToolbar'
import CreateVacancyModal from '../../components/modals/CreateVacancyModal'
import Button from '../../components/shared/Button'
import getApiErrorMessage from '../../utils/getApiErrorMessage'

export default function VacanciesPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [vacancies, setVacancies] = useState([])
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

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        setLoading(true)
        let params = {}
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

        const data = await vacancyService.getVacancies(id, params)
        const fetchedVacancies = data.results || data || []
        setVacancies(fetchedVacancies)
      } catch (err) {
        console.error('Failed to load vacancies', err)
        showToast('Failed to load vacancies.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchVacancies()
  }, [id, showToast, activeFilter])

  const reloadVacancies = async () => {
    try {
      setLoading(true)
      let params = {}
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
      const data = await vacancyService.getVacancies(id, params)
      const fetchedVacancies = data.results || data || []
      setVacancies(fetchedVacancies)
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
      showToast('Vacancy permanently deleted.')
    } catch (err) {
      console.error('Failed to delete vacancy', err)
      showToast('Failed to delete vacancy.', 'error')
    } finally {
      setIsDeleting(false)
      setVacancyToDelete(null)
    }
  }

  // Pagination logic
  const paginatedVacancies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return vacancies.slice(startIndex, startIndex + itemsPerPage)
  }, [vacancies, currentPage, itemsPerPage])

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
          <PageHeader
            title="Manage Vacancies"
            subtitle="Review, sort, and manage all job vacancies for your community."
            backLinkTo={`/community/${id}/dashboard`}
            backLinkText="Dashboard"
          >
            <Button onClick={() => setCreateVacancyModalOpen(true)}>
              Create Vacancy
            </Button>
          </PageHeader>

          <ManagementToolbar
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            initialFilter={activeFilter}
          />

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
                totalItems={vacancies.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="mb-4"
              />
              <div className="space-y-4">
                {paginatedVacancies.map((vacancy) => (
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
                  totalItems={vacancies.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
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