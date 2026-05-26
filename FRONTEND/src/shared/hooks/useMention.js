import { useState, useRef, useCallback } from 'react';

const DEBOUNCE_MS = 250;

/**
 * Handles @mention detection, debounced user search, dropdown state,
 * and keyboard navigation. Attach to any textarea.
 *
 * @param {function} searchFn  - (query: string) => Promise<User[]>
 */
export function useMention({ searchFn }) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mentionedUsers, setMentionedUsers] = useState([]);

    // Cursor index in the textarea where the triggering @ starts
    const mentionStartRef = useRef(-1);
    const debounceTimer = useRef(null);

    const _search = useCallback(async (query) => {
        if (!query && query !== '') {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }
        try {
            const results = await searchFn(query);
            setSuggestions(results);
            setIsOpen(results.length > 0);
            setActiveIndex(0);
        } catch {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [searchFn]);

    const _debounced = useCallback((query) => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => _search(query), DEBOUNCE_MS);
    }, [_search]);

    /**
     * Call on every textarea value+cursor change.
     * Returns nothing; the caller reads `isOpen`, `suggestions`, etc. from state.
     */
    const onTextChange = useCallback((value, cursorPos) => {
        const textBefore = value.slice(0, cursorPos);
        // Match @ followed by word chars (or nothing) immediately before cursor
        const match = textBefore.match(/@(\w*)$/);
        if (match) {
            mentionStartRef.current = cursorPos - match[0].length;
            _debounced(match[1]);
        } else {
            mentionStartRef.current = -1;
            clearTimeout(debounceTimer.current);
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [_debounced]);

    /**
     * Call when the user picks a suggestion.
     * Returns { newValue, newCursor } so the caller can update the textarea.
     */
    const selectUser = useCallback((user, currentValue, cursorPos) => {
        const before = currentValue.slice(0, mentionStartRef.current);
        const after = currentValue.slice(cursorPos);
        const inserted = `@${user.username} `;
        const newValue = before + inserted + after;
        const newCursor = before.length + inserted.length;

        setMentionedUsers((prev) =>
            prev.find((u) => u.id === user.id) ? prev : [...prev, user]
        );
        setSuggestions([]);
        setIsOpen(false);
        mentionStartRef.current = -1;

        return { newValue, newCursor };
    }, []);

    /**
     * Call on textarea keydown.
     * Returns true if the key was consumed by mention navigation (caller should preventDefault).
     */
    const onKeyDown = useCallback((e, currentValue, cursorPos, onSelectAtIndex) => {
        if (!isOpen || suggestions.length === 0) return false;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
            return true;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
            return true;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            onSelectAtIndex(activeIndex);
            return true;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            setSuggestions([]);
            setIsOpen(false);
            return true;
        }
        return false;
    }, [isOpen, suggestions, activeIndex]);

    const clearMentionedUsers = useCallback(() => setMentionedUsers([]), []);

    const mentionedUserIds = mentionedUsers.map((u) => u.id);

    return {
        suggestions,
        isOpen,
        activeIndex,
        mentionedUsers,
        mentionedUserIds,
        onTextChange,
        selectUser,
        onKeyDown,
        clearMentionedUsers,
    };
}
