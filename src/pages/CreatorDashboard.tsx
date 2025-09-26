import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type Submission = {
  id: string;
  film_title: string;
  synopsis: string | null;
  submitted_at: string;
  status_stage: 'submission' | 'onboarding' | 'review' | 'sales' | 'closure' | null;
};

const stages = [
  { key: 'submission', label: 'Submission', icon: '✅' },
  { key: 'onboarding', label: 'Onboarding', icon: '⏳' },
  { key: 'review', label: 'Review', icon: '🔍' },
  { key: 'sales', label: 'Sales Dashboard', icon: '💰' },
  { key: 'closure', label: 'Closure', icon: '🏁' },
] as const;

type StageKey = typeof stages[number]['key'];

function stageIndex(stage: StageKey | null) {
  const idx = stages.findIndex(s => s.key === stage);
  return idx === -1 ? 0 : idx;
}

const CreatorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setAuthChecking(false);
        navigate('/bring-your-film');
        return;
      }
      setUser(data.user);
      setAuthChecking(false);
      setLoading(true);
      const { data: rows, error } = await supabase
        .from('film_submissions')
        .select('id, film_title, synopsis, submitted_at, status_stage')
        .eq('user_id', data.user.id)
        .order('submitted_at', { ascending: false });
      if (error) {
        toast({ title: 'Failed to load submissions', variant: 'destructive' });
      } else {
        setSubmissions((rows as any) || []);
      }
      setLoading(false);
    })();
  }, [navigate, toast]);

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <img src="/tiketx-logo-text.png" alt="TiketX" className="h-10 w-auto opacity-90" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2">Creator Dashboard</h1>
        <p className="text-center text-gray-300 mb-10">Track your film submissions and next steps.</p>

        {submissions.length === 0 ? (
          <div className="text-center text-gray-400">
            No submissions yet. <a href="/bring-your-film" className="underline">Submit your first film</a>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((s) => {
              const currentIdx = stageIndex((s.status_stage as StageKey) || 'submission');
              return (
                <div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{s.film_title}</h2>
                      <div className="text-sm text-gray-400">Submitted on {new Date(s.submitted_at).toLocaleDateString()}</div>
                    </div>
                    <a href="#" className="text-sm text-tiketx-blue underline">View Details</a>
                  </div>

                  <div className="mt-6">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                      {stages.map((stg, idx) => {
                        const isCompleted = idx < currentIdx;
                        const isActive = idx === currentIdx;
                        return (
                          <div key={stg.key} className="flex-1 min-w-[180px]">
                            <div className={`rounded-xl p-4 border ${isActive ? 'border-tiketx-violet bg-tiketx-violet/10' : isCompleted ? 'border-white/20 bg-white/5' : 'border-white/10 bg-black/30'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span>{stg.icon}</span>
                                <span className="font-semibold">{stg.label}</span>
                                {isCompleted && <span className="ml-2 text-green-400">Completed</span>}
                                {isActive && <span className="ml-2 text-tiketx-blue">Active</span>}
                              </div>
                              <div className="text-sm text-gray-300">
                                {stg.key === 'submission' && 'Film submitted with basic details.'}
                                {stg.key === 'onboarding' && 'Upload required documents and agreements.'}
                                {stg.key === 'review' && 'TiketX team will review your film and share feedback.'}
                                {stg.key === 'sales' && 'Track ticket sales, revenue and analytics once approved.'}
                                {stg.key === 'closure' && 'Access final reports and payout summary.'}
                              </div>
                              {isActive && stg.key === 'onboarding' && (
                                <div className="mt-3">
                                  <button className="px-4 py-2 rounded-lg bg-white text-black font-semibold">Upload documents</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard; 