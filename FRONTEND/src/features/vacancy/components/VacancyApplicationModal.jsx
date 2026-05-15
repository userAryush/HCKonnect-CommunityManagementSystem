import { useState, useRef, useEffect } from 'react'
import { Upload, Send, FileText, Sparkles, ChevronDown, BarChart2 } from 'lucide-react'
import vacancyService from '../service/vacancyService'
import Button from '../../../shared/components/ui/Button'
import Dropdown from '../../../shared/components/ui/Dropdown'
import ModalWrapper from '../../../shared/components/modals/ModalWrapper'
import ModalHeader from '../../../shared/components/modals/ModalHeader'
import getApiErrorMessage from '../../../utils/getApiErrorMessage'
import { useAuth } from '../../authentication/components/AuthContext'
import { useToast } from '../../../shared/components/ui/ToastContext'

const AI_ASSIST_ACTIONS = [
  { action_type: 'improve', label: 'Improve writing' },
  { action_type: 'professional', label: 'Make it professional' },
  { action_type: 'academic', label: 'Make it academic' },
  { action_type: 'friendly', label: 'Make it friendly' },
  { action_type: 'grammar', label: 'Correct grammar' },
  { action_type: 'concise', label: 'Shorten' },
  { action_type: 'expand', label: 'Expand' },
  { action_type: 'engaging', label: 'More engaging' },
]

function buildJobDescriptionContext(vacancy) {
  const title = vacancy?.title || 'Role'
  const desc = vacancy?.description || ''
  return `Vacancy title: ${title}\n\nFull description:\n${desc}`.trim()
}

function matchScoreStyle(score) {
  if (score >= 80) {
    return {
      label: 'Strong profile match',
      ring: 'ring-emerald-500/30',
      bar: 'bg-emerald-500',
      text: 'text-emerald-800',
      bg: 'bg-emerald-50',
    }
  }
  if (score >= 60) {
    return {
      label: 'Moderate match — solid base',
      ring: 'ring-amber-500/30',
      bar: 'bg-amber-500',
      text: 'text-amber-900',
      bg: 'bg-amber-50',
    }
  }
  return {
    label: 'Room to strengthen your application',
    ring: 'ring-orange-500/30',
    bar: 'bg-orange-500',
    text: 'text-orange-900',
    bg: 'bg-orange-50',
  }
}

function penaltyKindLabel(kind) {
  const k = String(kind || '').toLowerCase()
  const map = {
    domain_alignment: 'Role & domain fit',
    projects: 'Projects & practical examples',
    skills: 'Skills & tools',
    writing: 'Writing clarity',
    other: 'Other',
  }
  return map[k] || 'Scoring note'
}

function BulletList({ title, items, emptyNote }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : []
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-surface-muted">{title}</h4>
      {list.length === 0 ? (
        <p className="text-sm text-surface-muted">{emptyNote}</p>
      ) : (
        <ul className="list-inside list-disc space-y-1.5 text-sm text-surface-body">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function VacancyApplicationModal({ vacancy, onClose, onSuccess }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [resume, setResume] = useState(null)
  const [message, setMessage] = useState('')
  const [resumeTextForAnalysis, setResumeTextForAnalysis] = useState('')
  const [extraAiPrompt, setExtraAiPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [analysisError, setAnalysisError] = useState('')
  const messageBeforeAiRef = useRef(null)

  useEffect(() => {
    setAnalysis(null)
    setAnalysisError('')
  }, [vacancy?.id])

  const snapshotMessage = () => {
    messageBeforeAiRef.current = message
  }

  const handleUndo = () => {
    if (messageBeforeAiRef.current === null) {
      showToast('Nothing to undo.', 'error')
      return
    }
    setMessage(messageBeforeAiRef.current)
    messageBeforeAiRef.current = null
    showToast('Reverted last AI change.', 'success')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.')
        return
      }
      setResume(file)
      setError('')
    }
  }

  const buildProfilePayload = () => {
    const name =
      [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
      user?.username ||
      'Applicant'
    return {
      name,
      background: (user?.bio || '').trim() || 'Student applicant; see resume and cover letter.',
      motivation:
        'I am excited to contribute, learn with peers, and support this community.',
      community_name: vacancy.community_name || 'Community',
    }
  }

  const handleGenerateCoverLetter = async () => {
    setError('')
    try {
      setAiBusy(true)
      snapshotMessage()
      const data = await vacancyService.generateCoverLetter({
        profile: buildProfilePayload(),
        job_description: buildJobDescriptionContext(vacancy),
        optional_ai_instructions: extraAiPrompt.trim(),
      })
      const text = data?.response?.trim()
      if (!text) {
        setError('AI did not return a cover letter. Try again.')
        messageBeforeAiRef.current = null
        return
      }
      setMessage(text)
      showToast('Cover letter generated — review and edit before submitting.', 'success')
    } catch (err) {
      console.error(err)
      messageBeforeAiRef.current = null
      setError(getApiErrorMessage(err, 'Failed to generate cover letter.'))
    } finally {
      setAiBusy(false)
    }
  }

  const handleAssist = async (actionType) => {
    if (!message.trim()) {
      showToast('Write something in the cover letter first, or generate with AI.', 'error')
      return
    }
    setError('')
    try {
      setAiBusy(true)
      snapshotMessage()
      const data = await vacancyService.enhanceApplicationText({
        text: message,
        action_type: actionType,
      })
      const text = data?.response?.trim()
      if (!text) {
        setError('AI did not return text.')
        messageBeforeAiRef.current = null
        return
      }
      setMessage(text)
      showToast('Updated.', 'success')
    } catch (err) {
      console.error(err)
      messageBeforeAiRef.current = null
      setError(getApiErrorMessage(err, 'AI assist failed.'))
    } finally {
      setAiBusy(false)
    }
  }

  const assistActions = AI_ASSIST_ACTIONS.map((item) => ({
    label: item.label,
    onClick: () => void handleAssist(item.action_type),
    disabled: aiBusy || analyzing || !message.trim(),
  }))

  const handleCopyMessage = async () => {
    if (!message.trim()) {
      showToast('Nothing to copy.', 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(message)
      showToast('Copied.', 'success')
    } catch {
      showToast('Could not copy.', 'error')
    }
  }

  const handleAnalyzeApplication = async () => {
    setAnalysisError('')
    setAnalysis(null)
    if (!message.trim()) {
      setAnalysisError('Add a cover letter first.')
      return
    }
    if (!resumeTextForAnalysis.trim()) {
      setAnalysisError('Paste your resume as text below so the AI can read it (PDFs are not parsed automatically).')
      return
    }
    try {
      setAnalyzing(true)
      const data = await vacancyService.analyzeApplication({
        role_description: buildJobDescriptionContext(vacancy),
        community_focus: (vacancy?.community_focus || '').trim(),
        resume_text: resumeTextForAnalysis.trim(),
        cover_letter: message.trim(),
      })
      const scoreRaw = data?.final_score ?? data?.match_score
      if (data && (typeof scoreRaw === 'number' || typeof scoreRaw === 'string')) {
        const penaltiesRaw = Array.isArray(data.penalties) ? data.penalties : []
        const penalties = penaltiesRaw
          .map((p) => ({
            kind: typeof p?.kind === 'string' ? p.kind : '',
            reason: typeof p?.reason === 'string' ? p.reason : '',
            deduction: Number(p?.deduction),
          }))
          .filter((p) => p.reason && Number.isFinite(p.deduction) && p.deduction > 0)

        const normalized = {
          ...data,
          base_score: Number.isFinite(Number(data.base_score)) ? Number(data.base_score) : 100,
          final_score: Number(scoreRaw),
          match_score: Number(scoreRaw),
          penalties,
        }
        if (!Number.isFinite(normalized.final_score)) {
          setAnalysisError('Unexpected response from analysis. Try again.')
          return
        }
        setAnalysis(normalized)
        showToast('Analysis ready.', 'success')
      } else {
        setAnalysisError('Unexpected response from analysis. Try again.')
      }
    } catch (err) {
      console.error(err)
      setAnalysisError(getApiErrorMessage(err, 'Analysis failed.'))
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Please write a cover letter (or generate one with AI).')
      return
    }
    if (!resume) {
      setError('Resume is required (PDF or DOC, max 5MB).')
      return
    }

    try {
      setLoading(true)
      setError('')

      const formData = new FormData()
      formData.append('vacancy', vacancy.id)
      formData.append('resume', resume)
      formData.append('message', message)

      await vacancyService.applyToVacancy(formData)
      onSuccess('Application submitted successfully!')
      onClose()
    } catch (err) {
      console.error(err)
      const errorMsg = getApiErrorMessage(
        err,
        'Failed to submit application. You may have already applied.'
      )
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const score = analysis?.final_score ?? analysis?.match_score ?? 0
  const tier = matchScoreStyle(score)

  return (
    <ModalWrapper isOpen={!!vacancy} onClose={onClose} className="max-w-6xl">
      <ModalHeader
        title="Apply for position"
        subtitle={vacancy.title}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="space-y-6 p-8">
        {error && (
          <div className="rounded-xl bg-red-50/50 p-4 text-body text-red-600">{error}</div>
        )}

        <div className="space-y-2">
          <label className="text-body text-surface-dark">Cover letter</label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the community why you are a good fit…"
            className="w-full rounded-2xl input-standard p-4 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              disabled={aiBusy || analyzing || loading}
              isLoading={aiBusy}
              loadingText="Working…"
              onClick={() => void handleGenerateCoverLetter()}
            >
              <Sparkles size={16} className="mr-1.5 inline" aria-hidden />
              Generate cover letter
            </Button>
            <Dropdown
              align="right"
              actions={assistActions}
              trigger={
                <button
                  type="button"
                  disabled={aiBusy || analyzing || loading}
                  className="inline-flex items-center gap-1.5 rounded-button border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-surface-dark hover:bg-secondary disabled:opacity-50"
                >
                  AI assist
                  <ChevronDown size={14} aria-hidden />
                </button>
              }
            />
            <Button type="button" variant="secondary" className="!px-3 !py-2 !text-xs" onClick={() => void handleCopyMessage()}>
              Copy
            </Button>
            <Button type="button" variant="secondary" className="!px-3 !py-2 !text-xs" onClick={handleUndo}>
              Undo AI
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-body text-surface-dark">
            Extra instructions for AI <span className="font-normal text-surface-muted">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={extraAiPrompt}
            onChange={(e) => setExtraAiPrompt(e.target.value)}
            placeholder='e.g. "Sound humble but confident" · "Mention teamwork" · "Keep under 200 words"'
            className="w-full rounded-2xl input-standard p-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-body text-surface-dark">Resume (required — PDF or DOC, max 5MB)</label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
                resume ? 'border-primary bg-primary/5' : 'border-surface-border hover:border-primary hover:bg-secondary'
              }`}
            >
              {resume ? (
                <div className="flex items-center gap-3 text-primary">
                  <FileText size={32} />
                  <div className="text-left">
                    <p className="text-body text-surface-dark">{resume.name}</p>
                    <p className="text-xs">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mb-2 text-surface-muted" />
                  <p className="text-body text-surface-dark">Click to upload resume</p>
                  <p className="text-xs text-surface-muted">PDF, DOC or DOCX up to 5MB</p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-surface-border bg-secondary/30 p-4">
          <label className="text-body text-surface-dark">Resume text for AI analysis</label>
          <p className="text-xs text-surface-muted">
            Paste the plain text of your resume here so we can compare it to the role. Your uploaded file is still what you submit; this box is only for the analyzer.
          </p>
          <textarea
            rows={5}
            value={resumeTextForAnalysis}
            onChange={(e) => setResumeTextForAnalysis(e.target.value)}
            placeholder="Paste education, experience, skills, projects…"
            className="w-full rounded-xl input-standard p-3 text-sm"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={analyzing || aiBusy || loading}
            isLoading={analyzing}
            loadingText="Analyzing…"
            onClick={() => void handleAnalyzeApplication()}
            className="w-full sm:w-auto"
          >
            <BarChart2 size={16} className="mr-2 inline" aria-hidden />
            Analyze my application
          </Button>
          {analysisError && <p className="text-sm text-red-600">{analysisError}</p>}
        </div>

        {analysis && (
          <div
            className={`space-y-5 rounded-2xl border border-surface-border p-5 ring-2 ${tier.ring} ${tier.bg}`}
            role="region"
            aria-label="Application analysis"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-surface-muted">Role compatibility</p>
                <p className={`mt-1 text-sm font-semibold ${tier.text}`}>{tier.label}</p>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  {analysis.penalties?.length > 0 && typeof analysis.base_score === 'number' && (
                    <p className="text-xs text-surface-muted">
                      Base score{' '}
                      <span className="font-semibold tabular-nums">{analysis.base_score}</span>
                      {' '}— adjustments below.
                    </p>
                  )}
                  <div>
                    <span className={`text-3xl font-bold tabular-nums ${tier.text}`}>{score}</span>
                    <span className={`text-sm font-medium ${tier.text}`}>/ 100</span>
                  </div>
                </div>
              </div>
            </div>
            {analysis.penalties?.length > 0 && (
              <div className="rounded-xl border border-surface-border/80 bg-white/60 p-4">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-surface-muted">
                  Score adjustments
                </h4>
                <ul className="space-y-2 text-sm text-surface-body">
                  {analysis.penalties.map((p, i) => (
                    <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-surface-border/40 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-surface-muted">
                          {penaltyKindLabel(p.kind)}
                        </p>
                        <p className="mt-0.5">{p.reason}</p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-red-700">−{p.deduction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/80">
              <div
                className={`h-full rounded-full transition-all ${tier.bar}`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
            <p className="text-sm leading-relaxed text-surface-body">{analysis.overall_summary}</p>
            <div className="grid gap-6 border-t border-surface-border/60 pt-4 sm:grid-cols-2">
              <BulletList title="Strengths" items={analysis.strengths} emptyNote="None listed." />
              <BulletList
                title="Improvement areas"
                items={analysis.improvement_areas}
                emptyNote="None listed."
              />
              <BulletList
                title="Gaps to address"
                items={analysis.missing_skills_or_traits}
                emptyNote="None listed."
              />
              <BulletList title="Suggestions" items={analysis.suggestions} emptyNote="None listed." />
            </div>
            <p className="text-xs text-surface-muted">
              This is informational feedback on profile match and application strength — not a hiring decision or prediction.
            </p>
          </div>
        )}

        <div className="flex gap-4 border-t border-surface-border pt-4">
          <Button variant="outline" type="button" onClick={onClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || aiBusy || analyzing}
            isLoading={loading}
            loadingText="Submitting…"
            className="h-12 w-2/3"
          >
            <Send size={18} className="mr-2" />
            Submit application
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
