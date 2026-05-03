import { Link } from 'react-router-dom';

export default function QuickActions({ actions }) {
    return (
        <div>
            <h3 className="text-title mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {actions.map((action) => {
                    const ActionElement = action.path === '#' ? 'button' : Link;
                    return (
                        <ActionElement
                            key={action.label}
                            to={action.path !== '#' ? action.path : undefined}
                            onClick={action.onClick}
                            className={`card-border flex flex-col items-center justify-center text-center gap-3 group !p-5 transition-colors ${action.hoverClass.split(' ').slice(0, 2).join(' ')}`}
                        >
                            <div
                                className={`bg-secondary rounded-full p-3 group-hover:text-white transition-colors ${action.colorIcon} ${action.hoverClass.split(' ')[2]}`}
                            >
                                {action.icon}
                            </div>
                            <span className="text-sm font-semibold text-surface-dark">{action.label}</span>
                        </ActionElement>
                    );
                })}
            </div>
        </div>
    );
}
