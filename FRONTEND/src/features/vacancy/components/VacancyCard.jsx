import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../../../shared/components/card/Card';
import CardHeader from '../../../shared/components/card/CardHeader';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import { useAuth } from '../../authentication/components/AuthContext';

export default function VacancyCard({ vacancy, onApply, isAdmin = false, onManage }) {
  const { user } = useAuth();
  const isMemberOfCommunity = user && user.role === 'student' && !!user.membership;
  const { title, description, is_open } = vacancy;

  return (
    <Card className="group relative flex flex-col">
      <CardHeader item={vacancy}>
        <Badge variant="orange">Vacancy</Badge>
        <Badge variant={is_open ? 'success' : 'red'} className="flex items-center gap-1">
          {is_open ? (
            <>
              <CheckCircle size={12} /> Open
            </>
          ) : (
            <>
              <XCircle size={12} /> Closed
            </>
          )}
        </Badge>
      </CardHeader>

      <div className="flex-1">
        <div className="border-l-2 border-primary pl-3.5" style={{ borderRadius: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
            Open position
          </p>
          <h3 className="text-base font-semibold text-surface-dark leading-snug transition-colors duration-200 capitalize">
            {title}
          </h3>
        </div>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-2">
          {is_open && !isAdmin && (
            <Button
              onClick={(e) => onApply(vacancy, e)}
              disabled={vacancy.has_applied || isMemberOfCommunity}
              className={`w-full ${vacancy.has_applied || isMemberOfCommunity
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none hover:bg-gray-100'
                : ''
                }`}
            >
              {vacancy.has_applied ? 'Applied' : isMemberOfCommunity ? 'Already a Member' : 'Apply Now'}
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => onManage(vacancy)}
              className="w-full border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            >
              Manage Vacancy
            </Button>
          )}

          {!is_open && !isAdmin && (
            <Button
              variant="secondary"
              disabled
              className="w-full bg-gray-100 text-gray-400 hover:bg-gray-100"
            >
              Applications Closed
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
