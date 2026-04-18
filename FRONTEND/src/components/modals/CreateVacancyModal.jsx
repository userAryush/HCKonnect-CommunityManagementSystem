import { useState, useEffect } from 'react'
import vacancyService from '../../services/vacancyService'
import Button from '../shared/Button'
import { useToast } from '../../context/ToastContext'
import { X } from 'lucide-react'

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
            const message =
                err.response?.data?.detail ||
                err.response?.data?.error ||
                'Failed to create vacancy. Ensure you have proper permissions.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="!absolute top-4 right-4 !h-10 !w-10 !p-0"
                >
                    <X size={20} />
                </Button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-surface-dark">Create New Vacancy</h2>
                    <p className="text-sm text-surface-body">Find the next valuable member of your community team.</p>
                </div>

                {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-surface-dark">Position Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="e.g., Member"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-surface-dark">Description</label>
                        <textarea
                            rows="5"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full resize-none rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
        </div>
    )
}