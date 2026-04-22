import React from 'react';
import { Share2 } from 'lucide-react';
import Button from '../ui/Button';

const ShareButton = ({ title, url, text, className = '', ...props }) => {
    const handleShare = async (e) => {
        e.stopPropagation();
        const shareData = {
            title: title || document.title,
            text: text || 'Check this out!',
            url: url || window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Fallback for failed share API or clipboard access
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard!');
            } catch (copyError) {
                console.error('Error copying to clipboard:', copyError);
                alert('Could not copy link. Please copy it manually.');
            }
        }
    };

    return (
        <Button
            onClick={handleShare}
            variant="ghost"
            className={`shrink-0 ${className}`}
            title="Share"
            {...props}
        >
            <Share2 size={16} />
        </Button>
    );
};

export default ShareButton;