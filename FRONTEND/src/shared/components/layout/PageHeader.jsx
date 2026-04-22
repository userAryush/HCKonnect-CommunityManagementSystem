import React from 'react';
import BackLink from './BackLink';

const PageHeader = ({ title, subtitle, backLinkTo, backLinkText, children }) => {
    return (
        <div className="mb-8">
            {backLinkTo && backLinkText && (
                <BackLink to={backLinkTo} text={backLinkText} className="mb-4" />
            )}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-surface-dark tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-2 text-surface-body">{subtitle}</p>}
                </div>
                {children && <div>{children}</div>}
            </div>
        </div>
    );
};

export default PageHeader;