import React from 'react';
import { Briefcase, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../shared/Badge';
import { useAuth } from '../../context/AuthContext';

export default function VacancyCard({ vacancy, onApply, isAdmin = false, onManage }) {
  const { user } = useAuth();
  const isMemberOfCommunity = user && user.role === 'student' && !!user.membership;
  const { title, description, is_open, deadline, community_name } = vacancy;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#75C043]/10 text-[#75C043]">
          <Briefcase size={24} />
        </div>
        <Badge variant={is_open ? 'success' : 'error'} className="flex items-center gap-1">
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
      </div>

      <div className="flex-1">
        <h3 className="mb-1 text-lg font-bold text-[#0d1f14] group-hover:text-[#75C043] transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="mb-3 text-sm font-medium text-gray-500">{community_name}</p>
        <p className="mb-4 line-clamp-3 text-sm text-[#4b4b4b] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-gray-50 pt-4">
        {deadline && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Calendar size={14} />
            <span>Deadline: {new Date(deadline).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {is_open && !isAdmin && (
            <button
              onClick={() => !vacancy.has_applied && !isMemberOfCommunity && onApply(vacancy)}
              disabled={vacancy.has_applied || isMemberOfCommunity}
              className={`w-full rounded-xl py-2.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                vacancy.has_applied || isMemberOfCommunity
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-[#75C043] text-white shadow-[#75C043]/20 hover:bg-[#68ae3b] hover:shadow-xl'
              }`}
            >
              {vacancy.has_applied ? 'Applied' : isMemberOfCommunity ? 'Already a Member' : 'Apply Now'}
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={() => onManage(vacancy)}
              className="w-full rounded-xl border border-[#75C043] bg-transparent py-2.5 text-sm font-bold text-[#75C043] transition-all hover:bg-[#75C043]/5 active:scale-95"
            >
              Manage Vacancy
            </button>
          )}
          
          {!is_open && !isAdmin && (
            <button
              disabled
              className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-bold text-gray-400 cursor-not-allowed"
            >
              Applications Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
