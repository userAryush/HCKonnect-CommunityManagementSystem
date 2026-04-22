import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, getDisplayName, getProfileImage } from '../../../utils/userUtils';

const UserInfo = ({ item, secondaryText }) => {
    const navigate = useNavigate();

    const handleUserClick = (e) => {
        e.stopPropagation();
        const authorId = item.author || item.created_by;
        const communityId = item.community?.id || item.community;

        let route;
        if (item.author_role === 'community' && authorId) {
            route = `/community/${authorId}`;
        } else if (authorId) {
            route = `/profile/${authorId}`;
        } else if (communityId) {
            route = `/community/${communityId}`;
        }
        if (route) {
            navigate(route);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold overflow-hidden border border-zinc-200 uppercase text-xs tracking-wider">
                {getProfileImage(item) ? (
                    <img src={getProfileImage(item)} alt={getDisplayName(item)} className="h-full w-full object-cover" />
                ) : (
                    <span>{getInitials(getDisplayName(item))}</span>
                )}
            </div>
            <div>
                <p
                    className="text-sm font-semibold text-surface-dark cursor-pointer transition-all duration-200 ease-out hover:font-bold"
                    onClick={handleUserClick}
                >
                    {getDisplayName(item)}
                </p>
                {secondaryText && (
                    <p className="text-metadata">{secondaryText}</p>
                )}
            </div>
        </div>
    );
};

export default UserInfo;