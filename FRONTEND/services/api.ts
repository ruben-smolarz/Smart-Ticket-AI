import { Ticket, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Interfaces ---
interface LoginData {
  email: string;
  password: string;
}

interface SignupData extends LoginData {
  name: string;
}

interface UpdateUserData {
  email: string;
  role?: string;
  skills?: string[];
}

interface UpdateTicketData {
  title: string;
  description: string;
  assignedTo?: string | null;
  priority?: string;
}

interface UpdateStatusData {
  status: string;
  moderatorMessage?: string;
}

interface CreateTicketData {
  title: string;
  description: string;
}

// --- Helpers ---

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  // Stricter typing for headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handling of expired or invalid session
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      
      // UX Improvement: Throw error to stop immediate frontend execution
      // and prevent it from trying to process non-existent data.
      throw new Error('Session expired');
    }
    
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'API request failed');
  }

  return response;
};

// --- API Methods ---

export const api = {
  login: async (credentials: LoginData): Promise<{ token: string; user: User }> => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  signup: async (userData: SignupData): Promise<{ token: string; user: User }> => {
    const response = await fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  /* * NOTE: This endpoint requires you to add router.get('/profile', authenticate, getProfile) 
   * in your backend (users.js) if you want to use it. If using the optimized AuthProvider,
   * this is not strictly necessary for the initial boot.
   */
  getProfile: async (): Promise<User> => {
    const response = await fetchWithAuth('/auth/profile');
    return response.json();
  },

  getTickets: async (): Promise<Ticket[]> => {
    const response = await fetchWithAuth('/tickets');
    return response.json();
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await fetchWithAuth(`/tickets/${id}`);
    const data = await response.json();
    // The backend returns { ticket: {...} }
    return data.ticket;
  },

  createTicket: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await fetchWithAuth('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData.ticket;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await fetchWithAuth('/auth/users');
    return response.json();
  },

  updateUser: async (data: UpdateUserData): Promise<User> => {
    const response = await fetchWithAuth('/auth/update-user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // The backend in updateUser returns { message: "...", user: {...} }
    const resData = await response.json();
    return resData.user || resData; // Fallback for security
  },

  updateTicket: async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    const response = await fetchWithAuth(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData.ticket;
  },

  updateTicketStatus: async (id: string, data: UpdateStatusData): Promise<Ticket> => {
    const response = await fetchWithAuth(`/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData.ticket;
  },
};