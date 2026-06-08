import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket } from '../../types';
import Spinner from '../common/Spinner';
import TicketCard from './TicketCard';
import Button from '../common/Button';

const TicketsListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const fetchedTickets = await api.getTickets();
        setTickets(fetchedTickets);
      } catch (err) {
        // TS CORRECTION: Safe error handling
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 mt-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Support Tickets</h1>
        <Link to="/tickets/new">
          <Button>Create New Ticket</Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-slate-800 rounded-lg border border-slate-700 dashed">
          <p className="text-slate-400 mb-4 text-lg">You haven't created any tickets yet.</p>
          <Link to="/tickets/new">
             <Button variant="secondary">Create your first ticket</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsListPage;