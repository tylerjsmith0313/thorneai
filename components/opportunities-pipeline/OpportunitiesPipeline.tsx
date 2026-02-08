import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface OpportunitiesPipelineProps {
  onClose: () => void;
}

export const OpportunitiesPipeline: React.FC<OpportunitiesPipelineProps> = ({ onClose }) => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchOpportunities = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('value', { ascending: false });
      
      if (error) {
        console.error('Error fetching opportunities:', error);
      } else {
        setOpportunities(data || []);
        setTotalValue(data?.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0) || 0);
      }
      setLoading(false);
    };

    fetchOpportunities();
  }, []);

  const stageOrder = { 'discovery': 1, 'proposal': 2, 'negotiation': 3, 'closing': 4 };
  const groupedByStage = opportunities.reduce((acc: any, opp: any) => {
    const stage = opp.stage || 'unknown';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(opp);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Opportunities Pipeline</h2>
            <p className="text-slate-600 text-sm mt-1">Total Pipeline Value: ${totalValue.toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading opportunities...</p>
        ) : opportunities.length === 0 ? (
          <p className="text-slate-500">No opportunities found. Create your first opportunity to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(groupedByStage).map(([stage, opps]: [string, any]) => (
              <div key={stage} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 capitalize">{stage}</h3>
                <div className="space-y-2">
                  {opps.map((opp: any) => (
                    <div key={opp.id} className="bg-white p-3 rounded border border-slate-100">
                      <p className="font-medium text-slate-900 text-sm truncate">{opp.title}</p>
                      <p className="text-xs text-slate-600 mt-1">${(opp.value || 0).toLocaleString()}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${(opp.probability || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600">{opp.probability * 100}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
