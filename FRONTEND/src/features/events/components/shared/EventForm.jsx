import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../../../shared/components/ui/Button'

export default function EventForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
  isLoading = false,
  submitText = 'Save',
  loadingText = 'Saving...'
}) {
  const [speakerInput, setSpeakerInput] = useState({ name: '', profession: '' })
  const [w2eInput, setW2eInput] = useState('')

  const labelStyle = 'mb-2 block text-sm font-bold text-zinc-800'
  const inputStyle = 'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
  const subLabelStyle = 'text-xs font-normal text-zinc-500 ml-2'

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

  if (isLoading) {
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

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-zinc-900">Event Details</h2>
        <div className="space-y-6">
          <div>
            <label className={labelStyle}>Event Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={inputStyle}
              placeholder="e.g. Intro to AI Workshop"
              required
            />
          </div>

          <div>
            <label className={labelStyle}>Description <span className="text-red-500">*</span></label>
            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${inputStyle} resize-none`}
              placeholder="Describe your event in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelStyle}>Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Start Time <span className="text-red-500">*</span></label>
              <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>End Time</label>
              <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className={inputStyle} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={inputStyle}
              placeholder="e.g. Tech Auditorium or Zoom Link"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelStyle}>Format</label>
              <select name="format" value={formData.format} onChange={handleInputChange} className={inputStyle}>
                <option value="On-site">On-site</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Capacity <span className={subLabelStyle}>(Optional)</span></label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleInputChange}
                className={inputStyle}
                placeholder="e.g. 100"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Event Image <span className={subLabelStyle}>(Optional)</span></label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer`}
            />
          </div>

          <div>
            <label className={labelStyle}>Speakers <span className={subLabelStyle}>(Optional)</span></label>
            <div className="flex gap-2 mb-2">
              <input
                placeholder="Speaker's Name"
                value={speakerInput.name}
                onChange={(e) => setSpeakerInput((prev) => ({ ...prev, name: e.target.value }))}
                className={`${inputStyle} py-2`}
              />
              <input
                placeholder="Profession or Title"
                value={speakerInput.profession}
                onChange={(e) => setSpeakerInput((prev) => ({ ...prev, profession: e.target.value }))}
                className={`${inputStyle} py-2`}
              />
              <button type="button" onClick={addSpeaker} className="bg-zinc-800 text-white px-4 rounded-xl text-sm font-bold hover:bg-zinc-900 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.speakers.map((speaker, idx) => (
                <div key={idx} className="bg-zinc-100 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 border border-zinc-200">
                  <span className="font-bold">{speaker.name}</span>
                  <span className="text-xs text-zinc-500">({speaker.profession})</span>
                  <button type="button" onClick={() => removeSpeaker(idx)} className="text-red-500 hover:text-red-700 ml-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelStyle}>What to Expect <span className={subLabelStyle}>(Optional)</span></label>
            <div className="flex gap-2 mb-2">
              <input
                placeholder="e.g. Live coding session, Networking..."
                value={w2eInput}
                onChange={(e) => setW2eInput(e.target.value)}
                className={`${inputStyle} py-2`}
              />
              <button type="button" onClick={addW2E} className="bg-zinc-800 text-white px-4 rounded-xl text-sm font-bold hover:bg-zinc-900 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-sm text-zinc-600 mt-3">
              {formData.what_to_expect.map((item, idx) => (
                <li key={idx} className="group flex items-center">
                  <span>{item}</span>
                  <button type="button" onClick={() => removeW2E(idx)} className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={onSubmit}
          isLoading={isSubmitting}
          loadingText={loadingText}
          className="!rounded-xl !px-8 !py-3 !text-sm !font-bold"
        >
          {submitText}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="!rounded-xl !px-8 !py-3 !text-sm !font-bold"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
