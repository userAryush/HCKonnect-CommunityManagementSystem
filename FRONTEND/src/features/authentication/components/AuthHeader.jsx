import logo from '../../../assets/favicon.png';
import { Link } from 'react-router-dom';

const AuthHeader = ({ title, subtitle }) => {
    return (
        <div className="mb-8 text-center">
            <Link to="/">
                <img
                    src={logo}
                    alt="HCKonnect"
                    className="mx-auto h-12 w-12 mb-4 cursor-pointer"
                />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold text-surface-dark">
                {title}
            </h1>
            <p className="mt-1 text-sm text-surface-body">
                {subtitle}
            </p>
        </div>
    );
};

export default AuthHeader;