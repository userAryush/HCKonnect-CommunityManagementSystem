import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

export default function UpcomingSchedule({ events }) {
    return (
        <div>
            <h3 className="text-title mb-4">Upcoming Schedule</h3>
            <div className="space-y-4">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="card-border flex flex-col sm:flex-row sm:items-center justify-between !p-4 gap-4"
                    >
                        <div className="flex items-center gap-4 flex-grow">
                            <div className="bg-primary/10 text-primary rounded-xl p-3 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-surface-dark line-clamp-1">{event.title}</h4>
                                <p className="text-metadata text-surface-muted flex items-center gap-1.5 mt-1">
                                    <span>
                                        {event.date
                                            ? new Date(event.date).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                              })
                                            : 'TBD'}
                                    </span>
                                    <span className="text-surface-muted/60">•</span>
                                    <span>{event.start_time || 'TBD'}</span>
                                    <span className="text-surface-muted/60">•</span>
                                    <span>{event.location || 'Online'}</span>
                                </p>
                            </div>
                        </div>
                        <Link to={`/events/${event.id}`}>
                            <Button variant="secondary" className="!px-4 !py-1.5 !text-xs whitespace-nowrap">
                                Manage
                            </Button>
                        </Link>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="card-border text-center text-surface-muted !py-8">
                        No upcoming events scheduled.
                    </div>
                )}
            </div>
        </div>
    );
}
