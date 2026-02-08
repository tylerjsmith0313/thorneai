import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ContactsBreakdownProps {
  onClose: () => void;
}

export const ContactsBreakdown: React.FC<ContactsBreakdownProps> = ({ onClose }) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });

  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Error fetching contacts:', error);
      } else {
        setContacts(data || []);
        setStats({
          total: data?.length || 0,
          verified: data?.filter((c: any) => c.is_verified).length || 0,
          unverified: data?.filter((c: any) => !c.is_verified).length || 0
        });
      }
      setLoading(false);
    };

    fetchContacts();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Contacts Breakdown</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-100 p-4 rounded-lg">
            <p className="text-slate-600 text-sm font-medium">Total Contacts</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-emerald-100 p-4 rounded-lg">
            <p className="text-emerald-700 text-sm font-medium">Verified</p>
            <p className="text-2xl font-bold text-emerald-900">{stats.verified}</p>
          </div>
          <div className="bg-amber-100 p-4 rounded-lg">
            <p className="text-amber-700 text-sm font-medium">Unverified</p>
            <p className="text-2xl font-bold text-amber-900">{stats.unverified}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <p className="text-slate-500">No contacts found. Create your first contact to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact: any) => (
                  <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{contact.first_name} {contact.last_name}</td>
                    <td className="py-3 px-3 text-slate-600">{contact.email}</td>
                    <td className="py-3 px-3 text-slate-600">{contact.company || '-'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contact.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {contact.status || 'Unspecified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
