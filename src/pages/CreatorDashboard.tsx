import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Search, TrendingUp, Flag, ArrowRight, Calendar, FileText, Eye } from 'lucide-react';

type Submission = {
  id: string;
  film_title: string;
  synopsis: string | null;
  submitted_at: string;
  status_stage: 'submission' | 'onboarding' | 'review' | 'sales' | 'closure' | null;
};

const stages = [
  { 
    key: 'submission', 
    label: 'Submission', 
    icon: CheckCircle,
    description: 'Film submitted with basic details.',
    color: 'from-green-500 to-emerald-600'
  },
  { 
    key: 'onboarding', 
    label: 'Onboarding', 
    icon: FileText,
    description: 'Upload required documents and agreements.',
    color: 'from-blue-500 to-cyan-600'
  },
  { 
    key: 'review', 
    label: 'Review', 
    icon: Search,
    description: 'TiketX team will review your film and share feedback.',
    color: 'from-purple-500 to-violet-600'
  },
  { 
    key: 'sales', 
    label: 'Sales Dashboard', 
    icon: TrendingUp,
    description: 'Track ticket sales, revenue and analytics once approved.',
    color: 'from-orange-500 to-amber-600'
  },
  { 
    key: 'closure', 
    label: 'Closure', 
    icon: Flag,
    description: 'Access final reports and payout summary.',
    color: 'from-pink-500 to-rose-600'
  },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-20">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <img src="/tiketx-logo-text.png" alt="TiketX" className="h-14 w-auto opacity-95" />
              <div className="absolute -inset-2 bg-gradient-to-r from-tiketx-blue/20 via-tiketx-violet/20 to-tiketx-pink/20 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>
          
          {/* Main Title */}
          <div className="relative mb-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight">
              Creator Dashboard
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-tiketx-blue/10 via-tiketx-violet/10 to-tiketx-pink/10 rounded-3xl blur-2xl -z-10"></div>
          </div>
          
          {/* Subtitle */}
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
              Track your film submissions and monitor your journey from
              <br />
              <span className="bg-gradient-to-r from-tiketx-blue to-tiketx-violet bg-clip-text text-transparent font-semibold">submission to success</span>
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-tiketx-blue to-transparent"></div>
            <div className="w-2 h-2 bg-tiketx-violet rounded-full animate-pulse"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-tiketx-pink to-transparent"></div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-tiketx-blue to-tiketx-violet rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No Submissions Yet</h3>
              <p className="text-gray-400 mb-8">Start your journey by submitting your first film to TiketX</p>
              <a 
                href="/bring-your-film" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink rounded-2xl font-semibold text-white hover:scale-105 transition-transform duration-200 shadow-lg"
              >
                Submit Your Film
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {submissions.map((s) => {
              const currentIdx = stageIndex((s.status_stage as StageKey) || 'submission');
              const progressPercentage = ((currentIdx + 1) / stages.length) * 100;
              
              return (
                <div key={s.id} className="group">
                  {/* Submission Card */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all duration-300 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-tiketx-blue to-tiketx-violet rounded-2xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {s.film_title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold mb-2">{s.film_title}</h2>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>Submitted on {new Date(s.submitted_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          </div>
                        </div>
                        {s.synopsis && (
                          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                            {s.synopsis}
                          </p>
                        )}
                      </div>
                      <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-200 group-hover:scale-105">
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold">View Details</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-300">Overall Progress</span>
                        <span className="text-sm font-bold text-white">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute top-8 left-0 right-0 h-0.5 bg-white/10 hidden lg:block" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {stages.map((stage, idx) => {
                          const isCompleted = idx < currentIdx;
                          const isActive = idx === currentIdx;
                          const isUpcoming = idx > currentIdx;
                          const IconComponent = stage.icon;
                          
                          return (
                            <div key={stage.key} className="relative flex flex-col">
                              {/* Timeline Node */}
                              <div className="flex flex-col items-center flex-1">
                                <div className={`
                                  relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
                                  ${isCompleted 
                                    ? `bg-gradient-to-r ${stage.color} shadow-lg shadow-${stage.color.split('-')[1]}-500/25` 
                                    : isActive 
                                    ? 'bg-gradient-to-r from-tiketx-blue to-tiketx-violet shadow-lg shadow-tiketx-blue/25' 
                                    : 'bg-white/10 border-2 border-white/20'
                                  }
                                `}>
                                  <IconComponent className={`w-8 h-8 ${
                                    isCompleted || isActive ? 'text-white' : 'text-gray-400'
                                  }`} />
                                  
                                  {/* Status Indicator */}
                                  {isCompleted && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                  
                                  {isActive && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-tiketx-blue rounded-full flex items-center justify-center">
                                      <Clock className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Stage Card */}
                                <div className={`
                                  w-full h-full min-h-[200px] p-6 rounded-2xl border transition-all duration-300 hover:scale-105 flex flex-col
                                  ${isCompleted 
                                    ? 'bg-white/10 border-white/20 shadow-lg' 
                                    : isActive 
                                    ? 'bg-gradient-to-br from-tiketx-blue/20 to-tiketx-violet/20 border-tiketx-blue/50 shadow-lg shadow-tiketx-blue/10' 
                                    : 'bg-white/5 border-white/10'
                                  }
                                `}>
                                  <div className="text-center flex flex-col h-full">
                                    <h3 className={`font-bold text-lg mb-2 ${
                                      isCompleted || isActive ? 'text-white' : 'text-gray-400'
                                    }`}>
                                      {stage.label}
                                    </h3>
                                    
                                    <p className={`text-sm leading-relaxed mb-4 flex-1 ${
                                      isCompleted || isActive ? 'text-gray-200' : 'text-gray-500'
                                    }`}>
                                      {stage.description}
                                    </p>

                                    {/* Status Badge */}
                                    <div className="flex justify-center mb-4">
                                      {isCompleted && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                                          Completed
                                        </span>
                                      )}
                                      {isActive && (
                                        <span className="px-3 py-1 bg-tiketx-blue/20 text-tiketx-blue rounded-full text-xs font-semibold border border-tiketx-blue/30">
                                          Active
                                        </span>
                                      )}
                                      {isUpcoming && (
                                        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold border border-gray-500/30">
                                          Upcoming
                                        </span>
                                      )}
                                    </div>

                                    {/* Action Button */}
                                    {isActive && stage.key === 'onboarding' && (
                                      <button className="w-full px-4 py-2 bg-gradient-to-r from-tiketx-blue to-tiketx-violet hover:from-tiketx-violet hover:to-tiketx-pink rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                        Upload Documents
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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