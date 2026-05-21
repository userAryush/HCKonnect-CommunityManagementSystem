import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../../../shared/components/card/Card';
import CardHeader from '../../../shared/components/card/CardHeader';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import { useAuth } from '../../authentication/components/AuthContext';
import { canApplyToVacancy, vacancyApplyBlockedReason } from '../../../utils/vacancyUtils';
import { vacancyAuthorItem } from '../../../utils/userUtils';
import ExpandableDescription from '../../../shared/components/ui/ExpandableDescription';

export default function VacancyCard({ vacancy, onApply, isAdmin = false, onManage }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mayApply = canApplyToVacancy(user);
  const blockedReason = vacancyApplyBlockedReason(user);
  const { title, description, is_open, community_id, id } = vacancy;
  const authorItem = vacancyAuthorItem(vacancy);
  const detailHref =
    community_id && id ? `/community/${community_id}/vacancies/${id}` : null;

  const handleCardNavigate = () => {
    if (detailHref) navigate(detailHref);
  };

  return (
    <Card
      className={`group relative flex flex-col ${detailHref ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}`}
      onClick={handleCardNavigate}
      role={detailHref ? 'link' : undefined}
      tabIndex={detailHref ? 0 : undefined}
      onKeyDown={
        detailHref
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardNavigate();
              }
            }
          : undefined
      }
    >
      <CardHeader item={authorItem}>
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
        <ExpandableDescription
          text={description}
          className="mt-3 text-sm text-gray-500"
          as="p"
        />
      </div>

      <div
        className="mt-4 flex flex-col gap-4 border-t border-gray-50 pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {is_open && !isAdmin && mayApply && (
            <Button
              onClick={(e) => onApply(vacancy, e)}
              disabled={vacancy.has_applied}
              className={`w-full ${vacancy.has_applied
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none hover:bg-gray-100'
                : ''
                }`}
            >
              {vacancy.has_applied ? 'Applied' : 'Apply Now'}
            </Button>
          )}

          {is_open && !isAdmin && !mayApply && blockedReason && (
            <p className="w-full text-center text-xs text-surface-muted px-2 py-2">
              {blockedReason}
            </p>
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
