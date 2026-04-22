// Layout wrapper for authentication pages
// Centers content and applies consistent card styling + background theme

const AuthLayout = ({ children, cardWidthClass = "max-w-2xl" }) => {
    return (
        <div className="theme-original">
            <div className="flex min-h-screen w-full items-center justify-center bg-secondary px-6 py-12 antialiased">
                <div className={`w-full ${cardWidthClass}`}>
                    {/* //Main auth card container */}
                    <div className="card-border bg-surface p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/10 border border-white/20 backdrop-blur-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;