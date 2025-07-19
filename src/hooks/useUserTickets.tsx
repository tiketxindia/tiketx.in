import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Ticket {
  film_id: string;
  expiry_date: string;
}

interface UserTicketsContextType {
  userTickets: Record<string, Ticket>;
  loading: boolean;
  refreshTickets: () => Promise<void>;
}

const CACHE_KEY = 'tiketx_user_tickets';
const CACHE_TS_KEY = 'tiketx_user_tickets_ts';
const CACHE_USER_KEY = 'tiketx_user_id';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const UserTicketsContext = createContext<UserTicketsContextType | undefined>(undefined);

export const useUserTickets = () => {
  const ctx = useContext(UserTicketsContext);
  if (!ctx) throw new Error('useUserTickets must be used within UserTicketsProvider');
  return ctx;
};

function getCachedTickets(userId: string | null): Record<string, Ticket> | null {
  if (!userId) return null;
  try {
    const cachedUser = localStorage.getItem(CACHE_USER_KEY);
    if (cachedUser !== userId) return null;
    const ts = localStorage.getItem(CACHE_TS_KEY);
    if (!ts || Date.now() - parseInt(ts, 10) > CACHE_DURATION) return null;
    const data = localStorage.getItem(CACHE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function setCachedTickets(userId: string, tickets: Record<string, Ticket>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tickets));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
    localStorage.setItem(CACHE_USER_KEY, userId);
  } catch {}
}

function clearCachedTickets() {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TS_KEY);
    localStorage.removeItem(CACHE_USER_KEY);
  } catch {}
}

export const UserTicketsProvider = ({ children }: { children: ReactNode }) => {
  const [userTickets, setUserTickets] = useState<Record<string, Ticket>>({});
  const [loading, setLoading] = useState(true);
  const expiryTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const userIdRef = useRef<string | null>(null);

  // Helper to clear all timeouts
  const clearAllTimeouts = () => {
    Object.values(expiryTimeouts.current).forEach(clearTimeout);
    expiryTimeouts.current = {};
  };

  // Remove expired ticket from state and update cache
  const expireTicket = (film_id: string) => {
    setUserTickets(prev => {
      const copy = { ...prev };
      delete copy[film_id];
      // Update cache
      if (userIdRef.current) setCachedTickets(userIdRef.current, copy);
      return copy;
    });
  };

  // Set up expiry timeouts for all tickets
  const setupExpiryTimeouts = (tickets: Record<string, Ticket>) => {
    clearAllTimeouts();
    Object.values(tickets).forEach(ticket => {
      const msUntilExpiry = new Date(ticket.expiry_date).getTime() - Date.now();
      if (msUntilExpiry > 0) {
        expiryTimeouts.current[ticket.film_id] = setTimeout(() => {
          expireTicket(ticket.film_id);
        }, msUntilExpiry);
      } else {
        // Already expired
        expireTicket(ticket.film_id);
      }
    });
  };

  // Fetch tickets from Supabase and update cache
  const fetchTickets = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setUserTickets({});
      clearCachedTickets();
      setLoading(false);
      return;
    }
    userIdRef.current = user.id;
    const { data: tickets, error } = await supabase
      .from('film_tickets')
      .select('film_id, expiry_date')
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (!error && tickets) {
      const ticketMap: Record<string, Ticket> = {};
      tickets.forEach((t: Ticket) => {
        ticketMap[t.film_id] = t;
      });
      setUserTickets(ticketMap);
      setCachedTickets(user.id, ticketMap);
      setupExpiryTimeouts(ticketMap);
    } else {
      setUserTickets({});
      clearCachedTickets();
      clearAllTimeouts();
    }
    setLoading(false);
  };

  // On mount: try cache, then fetch if needed
  useEffect(() => {
    let unsub: any;
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setUserTickets({});
        clearCachedTickets();
        setLoading(false);
        return;
      }
      userIdRef.current = user.id;
      const cached = getCachedTickets(user.id);
      if (cached) {
        setUserTickets(cached);
        setupExpiryTimeouts(cached);
        setLoading(false);
      } else {
        await fetchTickets();
      }
      // Listen for auth state changes
      unsub = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          fetchTickets();
        }
        if (event === 'SIGNED_OUT') {
          clearCachedTickets();
        }
      });
    })();
    return () => {
      if (unsub && unsub.subscription) unsub.subscription.unsubscribe();
      clearAllTimeouts();
    };
    // eslint-disable-next-line
  }, []);

  // Optional: background interval to check expiry (for long-lived tabs)
  useEffect(() => {
    const interval = setInterval(() => {
      setUserTickets(prev => {
        const now = Date.now();
        const updated: Record<string, Ticket> = {};
        Object.values(prev).forEach(ticket => {
          if (new Date(ticket.expiry_date).getTime() > now) {
            updated[ticket.film_id] = ticket;
          }
        });
        // Update cache if changed
        if (userIdRef.current) setCachedTickets(userIdRef.current, updated);
        return updated;
      });
    }, 60000); // every 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <UserTicketsContext.Provider value={{ userTickets, loading, refreshTickets: fetchTickets }}>
      {children}
    </UserTicketsContext.Provider>
  );
}; 