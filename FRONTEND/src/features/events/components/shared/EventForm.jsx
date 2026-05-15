import { useState } from 'react'
import { Plus, Trash2, Sparkles, ChevronDown } from 'lucide-react'
import Button from '../../../../shared/components/ui/Button'
import Dropdown from '../../../../shared/components/ui/Dropdown'
import { useToast } from '../../../../shared/components/ui/ToastContext'
import getApiErrorMessage from '../../../../utils/getApiErrorMessage'
import eventService from '../../service/eventService'

const EVENT_AI_ACTIONS = [
  { action_type: 'improve', label: 'Improve writing' },
  { action_type: 'grammar', label: 'Fix grammar' },
  { action_type: 'concise', label: 'Shorten' },
  { action_type: 'expand', label: 'Expand' },
  { action_type: 'friendly', label: 'Friendlier tone' },
]

const AI_ASSIST_TRIGGER_CLASS =
  'inline-flex items-center gap-1.5 rounded-button border border-surface-border bg-white px-4 py-2 text-sm font-semibold text-surface-dark transition-colors hover:bg-secondary disabled:opacity-50'

function buildEventContextBlock(formData) {
  const lines = [
    formData.title?.trim() && `Event title: ${formData.title.trim()}`,
    formData.date && `Date: ${formData.date}`,
    formData.start_time && `Start time: ${formData.start_time}`,
    formData.end_time && `End time: ${formData.end_time}`,
    formData.format && `Format: ${formData.format}`,
    formData.location?.trim() && `Location: ${formData.location.trim()}`,
  ].filter(Boolean)
  return lines.join('\n')
}

function buildDescriptionEnhanceText(formData) {
  return `${buildEventContextBlock(formData)}

Draft event description:
${(formData.description || '').trim()}`
}

function buildExpectationsEnhanceText(formData, draftLine) {
  const existing = Array.isArray(formData.what_to_expect)
    ? formData.what_to_expect.filter(Boolean).join('\n')
    : ''
  return `${buildEventContextBlock(formData)}

Event description (may be brief):
${(formData.description || '').trim()}

Existing expectation lines:
${existing || '(none yet)'}

Draft expectation line to improve:
${(draftLine || '').trim()}`
}

function parseExpectationLines(raw) {
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim())
    .filter((line) => line.length > 1)
}

export default function EventForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
  isLoading = false,
  submitText = 'Save',
  loadingText = 'Saving...',
  showEventAi = false,
  layoutVariant = 'page',
}) {
  const { showToast } = useToast()
  const [speakerInput, setSpeakerInput] = useState({ name: '', profession: '' })
  const [w2eInput, setW2eInput] = useState('')
  const [aiBusy, setAiBusy] = useState(null)

  const isModalLayout = layoutVariant === 'modal'

  const labelClass = isModalLayout
    ? 'mb-2 block text-body text-surface-dark'
    : 'mb-2 block text-sm font-bold text-zinc-800'

  const inputClass = isModalLayout
    ? 'input-standard w-full'
    : 'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'

  const subLabelClass = isModalLayout
    ? 'text-xs font-normal text-surface-muted ml-2'
    : 'text-xs font-normal text-zinc-500 ml-2'

  const chipClass = isModalLayout
    ? 'bg-secondary rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 border border-surface-border text-surface-body'
    : 'bg-zinc-100 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 border border-zinc-200'

  const listTextClass = isModalLayout ? 'text-sm text-surface-body' : 'text-sm text-zinc-600'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }))
  }

  const addSpeaker = () => {
    if (speakerInput.name && speakerInput.profession) {
      setFormData((prev) => ({ ...prev, speakers: [...prev.speakers, speakerInput] }))
      setSpeakerInput({ name: '', profession: '' })
    }
  }

  const removeSpeaker = (index) => {
    setFormData((prev) => ({ ...prev, speakers: prev.speakers.filter((_, i) => i !== index) }))
  }

  const addW2E = () => {
    if (w2eInput.trim()) {
      setFormData((prev) => ({ ...prev, what_to_expect: [...prev.what_to_expect, w2eInput] }))
      setW2eInput('')
    }
  }

  const removeW2E = (index) => {
    setFormData((prev) => ({ ...prev, what_to_expect: prev.what_to_expect.filter((_, i) => i !== index) }))
  }

  const eventGeneratePayload = () => ({
    title: formData.title.trim(),
    date: formData.date || '',
    start_time: formData.start_time || '',
    end_time: formData.end_time || '',
    format: formData.format || '',
    location: (formData.location || '').trim(),
    description: (formData.description || '').trim(),
    existing_expectations: Array.isArray(formData.what_to_expect)
      ? formData.what_to_expect.filter(Boolean).join('\n')
      : '',
  })

  const handleDescriptionAssist = async (actionType) => {
    if (!formData.description?.trim()) {
      showToast('Write a short description first, then use AI assist.', 'error')
      return
    }
    setAiBusy('desc-assist')
    try {
      const data = await eventService.enhanceEventText({
        text: buildDescriptionEnhanceText(formData),
        action_type: actionType,
        domain: 'event_description',
      })
      const next = data?.response?.trim()
      if (!next) {
        showToast('AI did not return text. Try again.', 'error')
        return
      }
      setFormData((prev) => ({ ...prev, description: next }))
      showToast('Description updated — review before saving.', 'success')
    } catch (err) {
      console.error(err)
      showToast(getApiErrorMessage(err, 'AI assist failed.'), 'error')
    } finally {
      setAiBusy(null)
    }
  }

  const handleDescriptionGenerate = async () => {
    if (!formData.title?.trim()) {
      showToast('Add an event title first so the AI can draft a description.', 'error')
      return
    }
    setAiBusy('desc-gen')
    try {
      const data = await eventService.generateEventCopy({
        target: 'description',
        ...eventGeneratePayload(),
      })
      const next = data?.response?.trim()
      if (!next) {
        showToast('AI did not return a description. Try again.', 'error')
        return
      }
      setFormData((prev) => ({ ...prev, description: next }))
      showToast('Description generated — edit to match your event.', 'success')
    } catch (err) {
      console.error(err)
      showToast(getApiErrorMessage(err, 'Generation failed.'), 'error')
    } finally {
      setAiBusy(null)
    }
  }

  const handleExpectationsAssist = async (actionType) => {
    if (!w2eInput.trim()) {
      showToast('Type a draft expectation line first, then use AI assist.', 'error')
      return
    }
    setAiBusy('exp-assist')
    try {
      const data = await eventService.enhanceEventText({
        text: buildExpectationsEnhanceText(formData, w2eInput),
        action_type: actionType,
        domain: 'event_expectations',
      })
      const next = data?.response?.trim()
      if (!next) {
        showToast('AI did not return text. Try again.', 'error')
        return
      }
      setW2eInput(next)
      showToast('Line updated — add it when ready.', 'success')
    } catch (err) {
      console.error(err)
      showToast(getApiErrorMessage(err, 'AI assist failed.'), 'error')
    } finally {
      setAiBusy(null)
    }
  }

  const handleExpectationsGenerate = async () => {
    if (!formData.title?.trim()) {
      showToast('Add an event title first.', 'error')
      return
    }
    setAiBusy('exp-gen')
    try {
      const data = await eventService.generateEventCopy({
        target: 'what_to_expect',
        ...eventGeneratePayload(),
      })
      const lines = parseExpectationLines(data?.response)
      if (!lines.length) {
        showToast('AI did not return expectation lines. Try again.', 'error')
        return
      }
      setFormData((prev) => ({
        ...prev,
        what_to_expect: [...(prev.what_to_expect || []), ...lines],
      }))
      showToast(`Added ${lines.length} suggestions — remove any you do not want.`, 'success')
    } catch (err) {
      console.error(err)
      showToast(getApiErrorMessage(err, 'Generation failed.'), 'error')
    } finally {
      setAiBusy(null)
    }
  }

  const descAssistActions = EVENT_AI_ACTIONS.map((item) => ({
    label: item.label,
    onClick: () => void handleDescriptionAssist(item.action_type),
    disabled: Boolean(aiBusy) || isSubmitting || isLoading,
  }))

  const expAssistActions = EVENT_AI_ACTIONS.map((item) => ({
    label: item.label,
    onClick: () => void handleExpectationsAssist(item.action_type),
    disabled: Boolean(aiBusy) || isSubmitting || isLoading,
  }))

  const aiDisabled = Boolean(aiBusy) || isSubmitting || isLoading

  if (isLoading) {
    if (isModalLayout) {
      return (
        <div className="animate-pulse space-y-5">
          <div className="h-7 w-48 rounded bg-secondary" />
          <div className="h-24 rounded-2xl bg-secondary" />
          <div className="h-28 rounded-2xl bg-secondary" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-12 rounded-xl bg-secondary" />
            <div className="h-12 rounded-xl bg-secondary" />
            <div className="h-12 rounded-xl bg-secondary" />
          </div>
        </div>
      )
    }
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm animate-pulse">
        <div className="h-7 w-48 rounded bg-zinc-200 mb-8" />
        <div className="space-y-5">
          <div className="h-24 rounded-xl bg-zinc-100" />
          <div className="h-28 rounded-xl bg-zinc-100" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-12 rounded-xl bg-zinc-100" />
            <div className="h-12 rounded-xl bg-zinc-100" />
            <div className="h-12 rounded-xl bg-zinc-100" />
          </div>
          <div className="h-12 rounded-xl bg-zinc-100" />
          <div className="h-12 rounded-xl bg-zinc-100" />
        </div>
      </div>
    )
  }

  const formFields = (
    <div className="space-y-6">
      <div>
        <label className={labelClass}>
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={inputClass}
          placeholder="e.g. Intro to AI Workshop"
          required
        />
      </div>

      <div>
        <label className={labelClass}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={isModalLayout ? 6 : 5}
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className={`${inputClass} resize-y min-h-[120px]`}
          placeholder="Describe your event in detail..."
          required
        />
        {showEventAi && (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={aiDisabled}
                isLoading={aiBusy === 'desc-gen'}
                loadingText="Generating…"
                onClick={() => void handleDescriptionGenerate()}
              >
                <Sparkles className="mr-1.5 inline" size={16} aria-hidden />
                Generate description
              </Button>
              <Dropdown
                align="right"
                actions={descAssistActions}
                trigger={
                  <button type="button" disabled={aiDisabled} className={AI_ASSIST_TRIGGER_CLASS}>
                    <Sparkles size={16} aria-hidden />
                    AI assist
                    <ChevronDown size={16} aria-hidden />
                  </button>
                }
              />
            </div>
            <p className="text-xs text-surface-muted">Uses title, schedule, and location as context.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>
            Date <span className="text-red-500">*</span>
          </label>
          <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleInputChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>End Time</label>
          <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={inputClass}
          placeholder="e.g. Tech Auditorium or Zoom Link"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Format</label>
          <select name="format" value={formData.format} onChange={handleInputChange} className={inputClass}>
            <option value="On-site">On-site</option>
            <option value="Online">Online</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Capacity <span className={subLabelClass}>(Optional)</span>
          </label>
          <input
            type="number"
            name="max_participants"
            value={formData.max_participants}
            onChange={handleInputChange}
            className={inputClass}
            placeholder="e.g. 100"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Event Image <span className={subLabelClass}>(Optional)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer`}
        />
      </div>

      <div>
        <label className={labelClass}>
          Speakers <span className={subLabelClass}>(Optional)</span>
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          <input
            placeholder="Speaker's Name"
            value={speakerInput.name}
            onChange={(e) => setSpeakerInput((prev) => ({ ...prev, name: e.target.value }))}
            className={`${inputClass} min-w-0 flex-1 py-2 sm:max-w-[200px]`}
          />
          <input
            placeholder="Profession or Title"
            value={speakerInput.profession}
            onChange={(e) => setSpeakerInput((prev) => ({ ...prev, profession: e.target.value }))}
            className={`${inputClass} min-w-0 flex-1 py-2 sm:max-w-[200px]`}
          />
          <Button type="button" variant="secondary" className="!px-3" onClick={addSpeaker} aria-label="Add speaker">
            <Plus size={18} aria-hidden />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {formData.speakers.map((speaker, idx) => (
            <div key={idx} className={chipClass}>
              <span className="font-semibold">{speaker.name}</span>
              <span className={isModalLayout ? 'text-xs text-surface-muted' : 'text-xs text-zinc-500'}>
                ({speaker.profession})
              </span>
              <button
                type="button"
                onClick={() => removeSpeaker(idx)}
                className="ml-1 text-red-500 transition hover:text-red-700"
                aria-label="Remove speaker"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          What to Expect <span className={subLabelClass}>(Optional)</span>
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          <input
            placeholder="e.g. Live coding session, Networking..."
            value={w2eInput}
            onChange={(e) => setW2eInput(e.target.value)}
            className={`${inputClass} min-w-0 flex-1 py-2`}
          />
          <Button type="button" variant="secondary" className="!px-3" onClick={addW2E} aria-label="Add expectation">
            <Plus size={18} aria-hidden />
          </Button>
        </div>
        {showEventAi && (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={aiDisabled}
                isLoading={aiBusy === 'exp-gen'}
                loadingText="Generating…"
                onClick={() => void handleExpectationsGenerate()}
              >
                <Sparkles className="mr-1.5 inline" size={16} aria-hidden />
                Generate ideas
              </Button>
              <Dropdown
                align="right"
                actions={expAssistActions}
                trigger={
                  <button type="button" disabled={aiDisabled} className={AI_ASSIST_TRIGGER_CLASS}>
                    <Sparkles size={16} aria-hidden />
                    AI assist
                    <ChevronDown size={16} aria-hidden />
                  </button>
                }
              />
            </div>
            <p className="text-xs text-surface-muted">Generate appends suggestions; assist polishes the line above.</p>
          </div>
        )}
        <ul className={`mt-3 list-inside list-disc space-y-1 pl-1 ${listTextClass}`}>
          {formData.what_to_expect.map((item, idx) => (
            <li key={idx} className="group flex items-center">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeW2E(idx)}
                className="ml-2 text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove expectation"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <div className={isModalLayout ? 'space-y-6' : 'space-y-8'}>
      {isModalLayout ? (
        formFields
      ) : (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-zinc-900">Event Details</h2>
          {formFields}
        </div>
      )}

      <div
        className={
          isModalLayout
            ? 'flex flex-col-reverse items-stretch justify-end gap-3 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:gap-4'
            : 'flex items-center gap-4'
        }
      >
        {isModalLayout ? (
          <>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || Boolean(aiBusy)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              isLoading={isSubmitting}
              loadingText={loadingText}
              disabled={Boolean(aiBusy)}
            >
              {submitText}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={onSubmit}
              isLoading={isSubmitting}
              loadingText={loadingText}
              disabled={Boolean(aiBusy)}
              className="!rounded-xl !px-8 !py-3 !text-sm !font-bold"
            >
              {submitText}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || Boolean(aiBusy)}
              className="!rounded-xl !px-8 !py-3 !text-sm !font-bold"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
