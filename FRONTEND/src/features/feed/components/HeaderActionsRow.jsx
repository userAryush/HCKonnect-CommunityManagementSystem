import { useState } from 'react'
import { PenLine, MessageSquarePlus } from 'lucide-react'
import Button from '../../../shared/components/ui/Button'
import CreateDiscussionModal from '../../discussion/components/CreateDiscussionModal'
import CreatePostModal from '../../posts/components/CreatePostModal'

export default function HeaderActionsRow() {
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  return (
    <>
      <div className="inline-flex p-1 bg-slate-100/50 border border-surface-border rounded-xl gap-1 mb-8">
        <Button
          variant="ghost"
          onClick={() => setIsPostModalOpen(true)}
          className="!rounded-lg !px-4 !py-2 !text-surface-body hover:!text-primary hover:!bg-white hover:!shadow-sm hover:!border-surface-border/50 !border !border-transparent"
        >
          <span className="opacity-70 mr-2"><PenLine size={15} /></span>
          <span className="text-[13px] font-bold uppercase tracking-wider">Create Post</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setIsDiscussionModalOpen(true)}
          className="!rounded-lg !px-4 !py-2 !text-surface-body hover:!text-primary hover:!bg-white hover:!shadow-sm hover:!border-surface-border/50 !border !border-transparent"
        >
          <span className="opacity-70 mr-2"><MessageSquarePlus size={15} /></span>
          <span className="text-[13px] font-bold uppercase tracking-wider">Start Discussion</span>
        </Button>
      </div>

      <CreateDiscussionModal
        isOpen={isDiscussionModalOpen}
        onClose={() => setIsDiscussionModalOpen(false)}
      />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </>
  )
}
