import React from 'react';
import UserInfo from './UserInfo';
import { formatTimeAgo } from '../../../utils/timeFormatter';
import { getRoleLabel } from '../../../utils/userUtils';

const CardHeader = ({ item, children, actions }) => {
    const secondaryText = `${getRoleLabel(item)} • ${formatTimeAgo(item.created_at || item.createdAt || new Date())}`;

    return (
        <header className="flex items-start justify-between mb-4">
            <UserInfo item={item} secondaryText={secondaryText} />
            <div className="flex items-center gap-2">
                {children}
                {actions}
            </div>
        </header>
    );
};

export default CardHeader;