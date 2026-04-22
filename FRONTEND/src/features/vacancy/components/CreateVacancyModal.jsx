import { useState, useEffect } from 'react'
import vacancyService from '../service/vacancyService'
import Button from '../../../shared/components/ui/Button'
import { useToast } from '../../../shared/components/ui/ToastContext'
import ModalWrapper from '../../../shared/components/modals/ModalWrapper'
import ModalHeader from '../../../shared/components/modals/ModalHeader'
import getApiErrorMessage from '../../../utils/getApiErrorMessage'

export default function CreateVacancyModal({ isOpen, onClose, communityId, onVacancyCreated }) {
    const { showToast } = useToast()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState('OPEN')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Reset form when modal is opened/closed
    useEffect(() => {
        if (!isOpen) {
            setTitle('')
            setDescription('')
            setStatus('OPEN')
            setError('')
            setLoading(false)
        }
    }, [isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!title.trim()) {
            setError('Title is required.')
            return
        }
        if (!description.trim()) {
            setError('Description is required.')
            return
        }

        try {
            setLoading(true)
            await vacancyService.createVacancy({
                title,
                description,
                status,
                community: communityId, // Pass communityId
            })
            showToast('Vacancy created successfully.', 'success')
            onVacancyCreated() // Callback to refresh parent component
            onClose() // Close modal on success
        } catch (err) {
            console.error(err)
            const message = getApiErrorMessage(
                err,
                'Failed to create vacancy. Ensure you have proper permissions.'
            )
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <ModalHeader
                title="Create New Vacancy"
                subtitle="Find the next valuable member of your community team."
                onClose={onClose}
            />

            <div className="p-8">
                {error && <div className="mb-4 rounded-lg bg-red-50/50 p-3 text-sm text-red-600 border border-red-200/50">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-body text-surface-dark">Position Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full input-standard"
                            placeholder="e.g., Member"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-body text-surface-dark">Description</label>
                        <textarea
                            rows="5"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full resize-none input-standard"
                            placeholder="Describe the role, responsibilities, and qualifications..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-surface-border">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            isLoading={loading}
                            loadingText="Creating..."
                        >
                            Create Vacancy
                        </Button>
                    </div>
                </form>
            </div>
        </ModalWrapper>
    )
}