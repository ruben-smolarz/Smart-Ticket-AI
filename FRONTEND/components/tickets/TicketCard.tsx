import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Priority, TicketStatus } from '../../types';


interface TicketCardProps {
  ticket: Ticket;
}

const PriorityBadge: React.FC<{ priority?: Priority }> = ({ priority }) => {
  if (!priority) return null;

  // Define colors with a safe fallback
  const colors: Record<string, string> = {
    [Priority.LOW]: 'bg-green-500/20 text-green-300',
    [Priority.MEDIUM]: 'bg-yellow-500/20 text-yellow-300',
    [Priority.HIGH]: 'bg-orange-500/20 text-orange-300',
    [Priority.URGENT]: 'bg-red-500/20 text-red-300',
  };

  // If the value does not match (e.g. uppercase vs lowercase), use gray
  const colorClass = colors[priority] || 'bg-slate-600 text-slate-300';

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {priority}
    </span>
  );
};

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const colors: Record<string, string> = {
    [TicketStatus.OPEN]: 'bg-blue-500/20 text-blue-300',
    [TicketStatus.IN_PROGRESS]: 'bg-purple-500/20 text-purple-300',
    [TicketStatus.RESOLVED]: 'bg-emerald-500/20 text-emerald-300', // Changed to emerald to differentiate from Low/Green
    [TicketStatus.CLOSED]: 'bg-gray-600/20 text-gray-400',
  };

  const colorClass = colors[status] || 'bg-slate-600 text-slate-300';

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${colorClass}`}>
      {status}
    </span>
  );
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  // Safe date formatting
  const formattedDate = ticket.createdAt 
    ? new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No date';

  return (
    <Link to={`/tickets/${ticket._id}`} className="block h-full">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 h-full flex flex-col justify-between hover:bg-slate-700/50 transition-all duration-300 border border-slate-700 hover:border-sky-500 group">
        <div>
          <div className="flex justify-between items-start mb-3 gap-2">
            {/* Truncate to prevent overflow on long titles */}
            <h3 className="text-lg font-bold text-white truncate w-full group-hover:text-sky-400 transition-colors">
              {ticket.title}
            </h3>
            <PriorityBadge priority={ticket.priority} />
          </div>
          
          <p className="text-sm text-slate-400 mb-4 line-clamp-2 h-10">
            {ticket.description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-4 border-t border-slate-700/50 pt-4">
          <StatusBadge status={ticket.status} />
          <span className="text-xs text-slate-500 font-medium">
            {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;