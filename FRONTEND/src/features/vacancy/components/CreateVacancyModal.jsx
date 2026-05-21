import { useState, useEffect, useCallback, useRef } from 'react'
import vacancyService from '../service/vacancyService'
import Button from '../../../shared/components/ui/Button'
import Dropdown from '../../../shared/components/ui/Dropdown'
import { useToast } from '../../../shared/components/ui/ToastContext'
import ModalWrapper from '../../../shared/components/modals/ModalWrapper'
import ModalHeader from '../../../shared/components/modals/ModalHeader'
import getApiErrorMessage from '../../../utils/getApiErrorMessage'
import LimitedTextarea from '../../../shared/components/ui/LimitedTextarea'
import { DESCRIPTION_MAX_LENGTH } from '../../../shared/constants/descriptionLimits'
import { clampToMaxLength } from '../../../utils/descriptionUtils'
import { Sparkles, ChevronDown } from 'lucide-react'

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'short_concise', label: 'Short & Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'beginner_friendly', label: 'Beginner Friendly' },
]

const AI_ASSIST_ACTIONS = [
  { action_type: 'improve', label: 'Improve writing' },
  { action_type: 'professional', label: 'Make it professional' },
  { action_type: 'academic', label: 'Make it academic' },
  { action_type: 'friendly', label: 'Make it friendly' },
  { action_type: 'grammar', label: 'Correct grammar' },
  { action_type: 'concise', label: 'Shorten description' },
  { action_type: 'expand', label: 'Expand description' },
  { action_type: 'engaging', label: 'Make it more engaging' },
]

function buildGeneratePayload({ communityId, roleTitle, optionalAiInstructions, tone }) {
  return {
    community_id: communityId,
    role_title: roleTitle.trim(),
    optional_ai_instructions: optionalAiInstructions.trim(),
    tone,
  }
}

export default function CreateVacancyModal({
  isOpen,
  onClose,
  communityId,
  onVacancyCreated,
}) {
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [optionalAiInstructions, setOptionalAiInstructions] = useState('')
  const [tone, setTone] = useState('friendly')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('OPEN')
  const [loading, setLoading] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [error, setError] = useState('')
  const descriptionBeforeAiRef = useRef(null)

  const resetForm = useCallback(() => {
    setTitle('')
    setOptionalAiInstructions('')
    setTone('friendly')
    setDescription('')
    setStatus('OPEN')
    setError('')
    setLoading(false)
    setAiBusy(false)
    descriptionBeforeAiRef.current = null
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  const snapshotForUndo = useCallback(() => {
    descriptionBeforeAiRef.current = description
  }, [description])

  const handleUndo = () => {
    if (descriptionBeforeAiRef.current === null) {
      showToast('Nothing to undo.', 'error')
      return
    }
    setDescription(descriptionBeforeAiRef.current)
    descriptionBeforeAiRef.current = null
    showToast('Reverted last AI change.', 'success')
  }

  const runGeneration = async (payload) => {
    const response = await vacancyService.generateJobDescription(payload)
    const generatedText = response?.response?.trim()
    if (!generatedText) {
      setError('AI did not return a description. Please try again.')
      return null
    }
    return generatedText
  }

  const handleGenerateDescription = async (isRegenerate = false) => {
    setError('')

    if (!communityId) {
      setError('Missing community. Open this dialog from your community dashboard.')
      return
    }
    if (!title.trim()) {
      setError('Add a role title first so AI can generate a relevant description.')
      return
    }

    const payload = buildGeneratePayload({
      communityId,
      roleTitle: title,
      optionalAiInstructions,
      tone,
    })

    try {
      setAiBusy(true)
      snapshotForUndo()
      const generatedText = await runGeneration(payload)
      if (!generatedText) return
      setDescription(clampToMaxLength(generatedText))
      showToast(isRegenerate ? 'Regenerated.' : 'Description generated — edit as you like.', 'success')
    } catch (err) {
      console.error(err)
      descriptionBeforeAiRef.current = null
      const message = getApiErrorMessage(err, 'Failed to generate description.')
      setError(message)
    } finally {
      setAiBusy(false)
    }
  }

  const handleRegenerate = () => {
    void handleGenerateDescription(true)
  }

  const handleCopyDescription = async () => {
    if (!description.trim()) {
      showToast('Nothing to copy yet.', 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(description)
      showToast('Copied to clipboard.', 'success')
    } catch {
      showToast('Could not copy. Select the text manually.', 'error')
    }
  }

  const handleEnhance = async (actionType) => {
    if (!communityId) {
      setError('Missing community.')
      return
    }
    if (!description.trim()) {
      showToast('Write or generate a description first, then use AI Assist.', 'error')
      return
    }
    setError('')
    try {
      setAiBusy(true)
      snapshotForUndo()
      const response = await vacancyService.enhanceVacancyText({
        community_id: communityId,
        text: description,
        action_type: actionType,
      })
      const next = response?.response?.trim()
      if (!next) {
        setError('AI did not return text. Please try again.')
        descriptionBeforeAiRef.current = null
        return
      }
      setDescription(clampToMaxLength(next))
      showToast('Updated.', 'success')
    } catch (err) {
      console.error(err)
      descriptionBeforeAiRef.current = null
      setError(getApiErrorMessage(err, 'AI Assist failed.'))
    } finally {
      setAiBusy(false)
    }
  }

  const assistActions = AI_ASSIST_ACTIONS.map((item) => ({
    label: item.label,
    onClick: () => void handleEnhance(item.action_type),
    disabled: aiBusy || !description.trim(),
  }))

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
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      setError(`Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`)
      return
    }

    try {
      setLoading(true)
      await vacancyService.createVacancy({
        title,
        description,
        status,
        community: communityId,
      })
      showToast('Vacancy created successfully.', 'success')
      onVacancyCreated?.()
      onClose()
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
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-6xl">
      <ModalHeader
        title="Create New Vacancy"
        subtitle="Write yourself or use AI — community context is loaded automatically."
        onClose={onClose}
      />

      <div className="p-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200/50 bg-red-50/50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-body text-surface-dark">Role title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-standard w-full"
              placeholder="e.g. Community Member, Events Lead"
            />
          </div>

          <div>
            <label className="mb-2 block text-body text-surface-dark">Tone for AI generation</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input-standard w-full"
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-body text-surface-dark">
              Extra instructions for AI <span className="font-normal text-surface-muted">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={optionalAiInstructions}
              onChange={(e) => setOptionalAiInstructions(e.target.value)}
              className="input-standard w-full resize-none"
              placeholder='e.g. "Make it beginner friendly" · "Keep it concise" · "Focus on collaboration"'
            />
          </div>

          <div>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <label className="block text-body text-surface-dark">Vacancy description</label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleGenerateDescription(false)}
                  disabled={loading || aiBusy}
                  isLoading={aiBusy}
                  loadingText="Working..."
                >
                  <Sparkles className="mr-1.5 inline" size={16} aria-hidden />
                  Generate with AI
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRegenerate}
                  disabled={loading || aiBusy || !title.trim()}
                  title="Re-run generation with the same settings"
                >
                  Regenerate
                </Button>
                <Button type="button" variant="secondary" onClick={() => void handleCopyDescription()}>
                  Copy
                </Button>
                <Button type="button" variant="secondary" onClick={handleUndo}>
                  Undo AI
                </Button>
                <Dropdown
                  align="right"
                  actions={assistActions}
                  trigger={
                    <button
                      type="button"
                      disabled={loading || aiBusy}
                      className="inline-flex items-center gap-1.5 rounded-button border border-surface-border bg-white px-4 py-2 text-sm font-semibold text-surface-dark transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      AI Assist
                      <ChevronDown size={16} aria-hidden />
                    </button>
                  }
                />
              </div>
            </div>
            <LimitedTextarea
              rows={10}
              value={description}
              onChange={setDescription}
              className="resize-y min-h-[180px]"
              placeholder="Write your own description, or use Generate with AI. Use AI Assist on the text anytime."
              helperText="AI uses your community name and profile description from the server — nothing extra to paste here."
            />
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-surface-border pt-4">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} isLoading={loading} loadingText="Creating...">
              Create Vacancy
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  )
}
