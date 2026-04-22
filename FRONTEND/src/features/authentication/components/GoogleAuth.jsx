import { useEffect, useRef, useState } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import FieldError from './FieldError';
import Button from '../../../shared/components/ui/Button';

function GoogleIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
            {/* Google logo colors split into 4 paths */}
            <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.39a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.97-4.34 2.97-7.3Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.47l-3.24-2.52c-.9.6-2.04.96-3.37.96-2.59 0-4.79-1.75-5.57-4.1H3.08v2.6A9.99 9.99 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.43 13.87A6.02 6.02 0 0 1 6.12 12c0-.65.11-1.28.31-1.87v-2.6H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.47l3.35-2.6Z" />
            <path fill="#EA4335" d="M12 6.04c1.47 0 2.78.5 3.81 1.48l2.85-2.85C16.95 3.08 14.69 2 12 2A9.99 9.99 0 0 0 3.08 7.53l3.35 2.6c.78-2.35 2.98-4.1 5.57-4.1Z" />
        </svg>
    );
}

function GoogleAuth({ onSuccess, onError, loading, error, label }) {
    // refs for DOM elements (Google button container + wrapper div)
    const containerRef = useRef(null);
    const googleButtonRef = useRef(null);

    // keep latest callback refs so Google API always gets updated handlers
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    // store dynamic button width based on container size
    const [buttonWidth, setButtonWidth] = useState(320);
    const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

    // always keep refs updated with latest props
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;

    useEffect(() => {
        if (!containerRef.current || typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        // update button width based on container width
        const updateWidth = () => {
            if (containerRef.current) {
                setButtonWidth(Math.max(240, Math.floor(containerRef.current.offsetWidth)));
            }
        };

        updateWidth();
        // listen for resize changes in container
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // decide button text
    const buttonText = label.toLowerCase().includes('sign up')
        ? 'signup_with'
        : 'signin_with';


    useEffect(() => {
        if (!scriptLoadedSuccessfully || !googleButtonRef.current || typeof window === 'undefined') {
            return undefined;
        }

        const google = window.google?.accounts?.id;

        if (!google) {
            return undefined;
        }
        // global object to store auth callbacks safely
        if (!window.__hckonnectGoogleAuth) {
            window.__hckonnectGoogleAuth = {};
        }

        // store latest success/error handlers
        window.__hckonnectGoogleAuth.onSuccess = onSuccessRef;
        window.__hckonnectGoogleAuth.onError = onErrorRef;

        if (window.__hckonnectGoogleAuth.clientId !== clientId) {
            google.initialize({
                client_id: clientId,
                use_fedcm_for_button: true,
                callback: (credentialResponse) => {
                    if (!credentialResponse?.credential) {
                        window.__hckonnectGoogleAuth?.onError?.current?.();
                        return;
                    }

                    window.__hckonnectGoogleAuth?.onSuccess?.current?.({
                        credential: credentialResponse.credential,
                        credentialType: 'id_token',
                    });
                },
            });

            window.__hckonnectGoogleAuth.clientId = clientId;
        }

        googleButtonRef.current.innerHTML = '';// clear previous render before re-rendering button
        google.renderButton(googleButtonRef.current, {
            text: buttonText,
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: String(buttonWidth),
        });

        return () => {
            // cleanup old button on unmount or re-render
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML = '';
            }
        };
    }, [buttonText, buttonWidth, clientId, scriptLoadedSuccessfully]);

    return (
        <div className="w-full">
            <div ref={containerRef} className="relative w-full">
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full py-3 text-sm font-semibold shadow-md"
                    isLoading={loading}
                    loadingText={label}
                    disabled={loading}
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        <GoogleIcon />
                        <span>{label}</span>
                    </span>
                </Button>
                {/* real Google button sits underneath but hidden */}
                <div
                    className={`absolute inset-0 overflow-hidden ${loading ? 'pointer-events-none' : ''}`}
                    aria-hidden="true"
                >
                    <div className="flex h-full w-full items-center justify-center opacity-0">
                        <div ref={googleButtonRef} />
                    </div>
                </div>

                {loading ? (
                    <div className="absolute inset-0 rounded-md bg-white/40" aria-hidden="true" />
                ) : null}
            </div>

            <FieldError message={error} />
        </div>
    );
}

export default GoogleAuth;
