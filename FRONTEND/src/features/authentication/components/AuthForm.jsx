// Reusable form wrapper for authentication pages (login/register)
const AuthForm = ({ children, onSubmit, className = "w-full" }) => {
    return (
        <form
            onSubmit={onSubmit}
            className={`flex flex-col gap-4 ${className}`}>
            {children}
        </form>
    );
};

export default AuthForm;