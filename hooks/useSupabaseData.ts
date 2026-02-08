import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useContacts(userId: string | undefined) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) console.error('Error fetching contacts:', error);
      setContacts(data || []);
      setLoading(false);
    };

    fetchContacts();
  }, [userId]);

  return { contacts, loading };
}

export function useDeals(userId: string | undefined) {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchDeals = async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', userId);
      
      if (error) console.error('Error fetching deals:', error);
      setDeals(data || []);
      setLoading(false);
    };

    fetchDeals();
  }, [userId]);

  return { deals, loading };
}

export function useOpportunities(userId: string | undefined) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchOpportunities = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', userId);
      
      if (error) console.error('Error fetching opportunities:', error);
      setOpportunities(data || []);
      setLoading(false);
    };

    fetchOpportunities();
  }, [userId]);

  return { opportunities, loading };
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });
      
      if (error) console.error('Error fetching conversations:', error);
      setConversations(data || []);
      setLoading(false);
    };

    fetchConversations();
  }, [userId]);

  return { conversations, loading };
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching notifications:', error);
      setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();
  }, [userId]);

  return { notifications, loading };
}

export function useActivities(userId: string | undefined) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching activities:', error);
      setActivities(data || []);
      setLoading(false);
    };

    fetchActivities();
  }, [userId]);

  return { activities, loading };
}

export function useCalendarEvents(userId: string | undefined) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });
      
      if (error) console.error('Error fetching calendar events:', error);
      setEvents(data || []);
      setLoading(false);
    };

    fetchEvents();
  }, [userId]);

  return { events, loading };
}
