import { useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket, Role, TicketStatus, Priority, User } from '../../types';
import Spinner from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

// --- Subcomponents ---

interface DetailItemProps {
  label: string;
  children: ReactNode;
}

const DetailItem = ({ label, children }: DetailItemProps) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-slate-700/50 last:border-0">
    <dt className="text-sm font-medium text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 flex items-center">{children}</dd>
  </div>
);

interface BadgeProps {
  text: string;
  color?: string;
}

const Badge = ({ text, color = 'bg-slate-700 text-slate-300' }: BadgeProps) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-md ${color}`}>{text}</span>
);

interface StatusBadgeProps {
  status: string; // Can come as a generic string initially
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colors: Record<string, string> = {
    [TicketStatus.OPEN]: 'bg-blue-500/20 text-blue-300',
    [TicketStatus.IN_PROGRESS]: 'bg-purple-500/20 text-purple-300',
    [TicketStatus.RESOLVED]: 'bg-emerald-500/20 text-emerald-300',
    [TicketStatus.CLOSED]: 'bg-gray-600/20 text-gray-400',
  };
  return <Badge text={status} color={colors[status] || 'bg-slate-700 text-slate-300'} />;
};

interface PriorityBadgeProps {
  priority?: string | null;
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  if (!priority) return <Badge text="Not Set" />;
  const colors: Record<string, string> = {
    [Priority.LOW]: 'bg-green-500/20 text-green-300',
    [Priority.MEDIUM]: 'bg-yellow-500/20 text-yellow-300',
    [Priority.HIGH]: 'bg-orange-500/20 text-orange-300',
    [Priority.URGENT]: 'bg-red-500/20 text-red-300',
  };
  return <Badge text={priority} color={colors[priority] || 'bg-slate-700 text-slate-300'} />;
};

// --- Main Component ---

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [moderatorMessage, setModeratorMessage] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const isAdmin = user?.role === Role.ADMIN;
  const isModerator = user?.role === Role.MODERATOR;

  useEffect(() => {
    if (!id) {
      setError('Invalid ticket ID.');
      setIsLoading(false);
      return;
    }

    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const fetchedTicket = await api.getTicketById(id);
        setTicket(fetchedTicket);
        
        // Initialize form
        setTitle(fetchedTicket.title);
        setDescription(fetchedTicket.description);
        setStatus(fetchedTicket.status);
        setPriority(fetchedTicket.priority || '');
        setModeratorMessage(fetchedTicket.moderatorMessage || '');
        
        // Safe handling of assignedTo
        if (fetchedTicket.assignedTo) {
            // If it is an object, it has _id; if it is a string, it is the ID directly
            const assignedId = typeof fetchedTicket.assignedTo === 'string' 
                ? fetchedTicket.assignedTo 
                : fetchedTicket.assignedTo._id;
            setAssignedToId(assignedId);
        } else {
            setAssignedToId('');
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch ticket details.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();

    if (isAdmin) {
      api.getAllUsers().then(setUsers).catch(console.error);
    }
  }, [id, isAdmin]);

  const handleSave = async () => {
    if (!ticket) return;
    try {
      let updatedTicket = ticket;

      // 1. Update general data (Admin)
      if (isAdmin) {
        updatedTicket = await api.updateTicket(ticket._id, {
          title,
          description,
          priority,
          assignedTo: assignedToId || null, // Send null if empty
        });
      }

      // 2. Update status (Admin/Moderator)
      if (isAdmin || isModerator) {
        updatedTicket = await api.updateTicketStatus(ticket._id, {
          status,
          moderatorMessage,
        });
      }

      setTicket(updatedTicket);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Failed to update ticket');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;
  if (!ticket) return <div className="text-center text-slate-400 mt-10">Ticket not found.</div>;

  // Visual logic for assigned user
  let assignedToName = 'Unassigned';
  let assignedBadgeColor = 'bg-slate-700 text-slate-300';

  if (ticket.assignedTo) {
      if (typeof ticket.assignedTo === 'string') {
          const foundUser = users.find(u => u._id === ticket.assignedTo);
          if (foundUser) {
              assignedToName = foundUser.name;
              assignedBadgeColor = 'bg-sky-900 text-sky-200';
          } else {
              assignedToName = 'Unknown User';
          }
      } else {
          assignedToName = ticket.assignedTo.name;
          assignedBadgeColor = 'bg-sky-900 text-sky-200';
      }
  }

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg overflow-hidden max-w-5xl mx-auto my-8 border border-slate-700">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-start bg-slate-900/30">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
             <StatusBadge status={ticket.status} />
          </div>
          <p className="text-sm text-slate-400">
            Created on {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}
          </p>
        </div>
        {(isAdmin || isModerator) && <Button onClick={() => setEditMode(true)}>Edit Ticket</Button>}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Contenido */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-lg font-semibold text-sky-400 mb-3 border-b border-slate-700 pb-1">Description</h2>
            <div className="text-slate-300 whitespace-pre-wrap bg-slate-700/20 p-4 rounded-md">
                {ticket.description}
            </div>
          </section>

          {/* AI Notes */}
          {ticket.aiNotes && (
            <section>
              <h2 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                ✨ AI Insights
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-lg text-slate-300 text-sm">
                {ticket.aiNotes}
              </div>
            </section>
          )}

          {/* Helpful Notes */}
          {ticket.helpfulNotes && (
            <section>
              <h2 className="text-lg font-semibold text-green-400 mb-3">Suggested Solutions</h2>
              <div className="bg-green-900/10 border border-green-500/30 p-4 rounded-lg text-slate-300 text-sm">
                {ticket.helpfulNotes}
              </div>
            </section>
          )}

          {/* Moderator Message */}
          {ticket.moderatorMessage && (
            <section>
              <h2 className="text-lg font-semibold text-amber-400 mb-3">Moderator Response</h2>
              <div className="bg-amber-900/10 border border-amber-500/30 p-4 rounded-lg text-slate-300">
                {ticket.moderatorMessage}
              </div>
            </section>
          )}
        </div>

        {/* Columna Derecha: Metadatos */}
        <div className="bg-slate-700/20 p-5 rounded-lg h-fit border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Ticket Details</h2>
          
          <div className="space-y-1">
            <DetailItem label="Priority">
                <PriorityBadge priority={ticket.priority} />
            </DetailItem>
            
            <DetailItem label="Assigned To">
                <Badge text={assignedToName} color={assignedBadgeColor} />
            </DetailItem>

            <DetailItem label="Skills">
                {/* CORRECTION: We use 'relatedSkills' or 'skills' as fallback */}
                {(ticket.relatedSkills?.length || ticket.skills?.length) ? (
                  <div className="flex flex-wrap gap-1">
                    {(ticket.relatedSkills || ticket.skills || []).map(skill => (
                      <span key={skill} className="px-2 py-0.5 text-xs bg-slate-600 rounded text-slate-200 border border-slate-500">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : <span className="text-slate-500 italic">None</span>}
            </DetailItem>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-lg space-y-4 w-full max-w-lg shadow-2xl border border-slate-600">
            <h2 className="text-xl font-bold text-white mb-4">Edit Ticket</h2>

            {isAdmin && (
              <>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Title</label>
                    <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-sky-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Description</label>
                    <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-sky-500 outline-none h-24"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Assignee</label>
                    <select
                    value={assignedToId || ''}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-sky-500 outline-none"
                    >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Priority</label>
                    <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-sky-500 outline-none"
                    >
                    <option value="">Select Priority</option>
                    {Object.values(Priority).map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                    </select>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Status</label>
                    <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-sky-500 outline-none"
                    >
                    {Object.values(TicketStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1">Moderator Message</label>
                <textarea
                value={moderatorMessage}
                onChange={(e) => setModeratorMessage(e.target.value)}
                className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-sky-500 outline-none h-20"
                placeholder="Add a note for the user..."
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;