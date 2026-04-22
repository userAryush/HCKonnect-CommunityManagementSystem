import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Dropdown from '../ui/Dropdown';

const CardActionMenu = ({ canEdit, onEdit, canDelete, onDelete }) => {
    if (!canEdit && !canDelete) {
        return null;
    }

    const actions = [];

    if (canEdit) {
        actions.push({
            label: 'Edit',
            icon: <Edit size={14} />,
            onClick: onEdit,
        });
    }

    if (canDelete) {
        actions.push({
            label: 'Delete',
            icon: <Trash2 size={14} />,
            onClick: onDelete,
            variant: 'danger',
        });
    }

    return <Dropdown actions={actions} />;
};

export default CardActionMenu;