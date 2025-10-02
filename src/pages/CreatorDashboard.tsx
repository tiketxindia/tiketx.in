import React, { useState, useRef, useEffect } from 'react';
// Minimal Submission type definition
type Submission = {
  id: string;
  film_title: string;
  submitted_at: string;
  synopsis?: string;
  status_stage: string;
  onboarding_instructions?: string | string[];
  onboarding_fee?: number;
  onboarding_fee_paid?: boolean;
  onboarding_fee_paid_datetime?: string;
  drive_link?: string;
  agreed_terms?: boolean;
};
import UploadDocsModal from "@/components/UploadDocsModal";
import { openRazorpayModal } from "@/lib/razorpay";
// Timeline stages definition
type StageKey = 'submission' | 'onboarding' | 'release' | 'sales' | 'closure';

function stageIndex(stage: StageKey): number {
  return stages.findIndex(s => s.key === stage);
}
const stages = [
  {
    key: 'submission',
    label: 'Submission',
    description: 'Submit your film for review.',
    color: 'from-tiketx-blue to-tiketx-violet',
    icon: FileText,
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    description: 'Complete onboarding requirements. Includes a one-time onboarding fee (refundable if not released).',
    color: 'from-green-400 to-green-700',
    icon: TrendingUp,
  },
  {
    key: 'release',
    label: 'Release',
    description: 'Your film will be released and made available to viewers.',
    color: 'from-yellow-400 to-yellow-700',
    icon: Flag,
  },
  {
    key: 'sales',
    label: 'Sales Dashboard',
    description: 'Track your film’s sales and performance.',
    color: 'from-pink-400 to-pink-700',
    icon: Search,
  },
  {
    key: 'closure',
    label: 'Closure',
    description: 'Wrap up and finalize your film’s journey on TiketX.',
    color: 'from-gray-400 to-gray-700',
    icon: CheckCircle,
  },
];

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Search, TrendingUp, Flag, ArrowRight, Calendar, FileText, Eye } from 'lucide-react';

function CreatorDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSubmission, setViewSubmission] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // Onboarding modal state and helpers
  // Track which submission's onboarding modal is open
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  // Steps for the currently active submission
  const [onboardingSteps, setOnboardingSteps] = useState<{ id: number; label: string; completed: boolean }[]>([]);
  const [driveLink, setDriveLink] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  function handleStepComplete(idx: number) {
    setOnboardingSteps(steps => steps.map((step, i) => i === idx ? { ...step, completed: !step.completed } : step));
  }
  async function handleSubmitOnboarding() {
    if (!activeSubmissionId) return;
    // Fetch onboarding fee (default Rs. 2000)
    const onboardingFee = 2000;
    // Create Razorpay order (simulate, or call backend if needed)
    // For demo, just use amount in paise
    openRazorpayModal({
      amount: onboardingFee * 100,
      name: "TiketX Onboarding Fee",
      description: "Onboarding fee for film submission",
      order_id: undefined,
      onSuccess: async (payment) => {
        // Save onboarding info only after payment
        const { error } = await supabase
          .from('film_submissions')
          .update({
            drive_link: driveLink,
            agreed_terms: acceptTerms,
            onboarding_fee: onboardingFee,
            onboarding_fee_paid: true,
            onboarding_fee_paid_datetime: new Date().toISOString(),
            status_stage: 'review',
          })
          .eq('id', activeSubmissionId);
        if (error) {
          toast({ title: 'Failed to save onboarding info', variant: 'destructive' });
        } else {
          toast({ title: 'Onboarding info saved', variant: 'default' });
        }
        setShowUploadModal(false);
        setActiveSubmissionId(null);
      },
      onFailure: () => {
        toast({ title: 'Payment was not completed', variant: 'destructive' });
      }
    });
  }

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
  .select('id, film_title, synopsis, submitted_at, status_stage, onboarding_instructions, onboarding_fee, onboarding_fee_paid, onboarding_fee_paid_datetime, drive_link, agreed_terms')
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
        <div>
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
                return (
                  <div key={s.id} className="group">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all duration-300 shadow-2xl">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                          <div className="mb-6">
                            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#3ABDFE] to-[#FF7D52] bg-clip-text text-transparent mb-4 tracking-tight">{s.film_title}</h2>
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                                <Calendar className="w-4 h-4 text-tiketx-blue" />
                                <span className="text-sm font-semibold text-gray-300">Submitted on {new Date(s.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              </div>
                            </div>
                            {s.synopsis && (
                              <div className="mt-4">
                                <p className="text-gray-300 text-base leading-relaxed">{s.synopsis}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-200 group-hover:scale-105" onClick={async () => {
                          setViewLoading(true);
                          setViewModalOpen(true);
                          const { data, error } = await supabase.from('film_submissions').select('*').eq('id', s.id).single();
                          if (!error && data) {
                            setViewSubmission(data);
                          } else {
                            setViewSubmission(null);
                            toast({ title: 'Failed to load submission details', variant: 'destructive' });
                          }
                          setViewLoading(false);
                        }}>View Details <Eye className="w-5 h-5" /></button>
                      </div>
                      <div className="flex flex-row gap-8 justify-center items-stretch mt-8">
                        {stages.map((stage, idx) => {
                          const isCompleted = idx < currentIdx;
                          // Treat 'review_submission' as active for Submission stage
                          const isActive = idx === currentIdx || (stage.key === 'submission' && s.status_stage === 'review_submission');
                          const isUpcoming = idx > currentIdx;
                          const IconComponent = stage.icon;
                          return (
                            <div key={stage.key} className="relative flex flex-col flex-1 min-w-0 max-w-xs mx-2">
                              <div className="flex flex-col items-center flex-1">
                                <div className={"relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 " + (isCompleted ? "bg-green-500 shadow-lg" : isActive ? "bg-gradient-to-r from-tiketx-blue to-tiketx-violet shadow-lg" : "bg-white/10 border-2 border-white/20") }>
                                  <IconComponent className={`w-8 h-8 ${isCompleted ? 'text-white' : isActive ? 'text-white' : 'text-gray-400'}`} />
                                  {isCompleted && (<div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>)}
                                  {isActive && (<div className="absolute -top-1 -right-1 w-6 h-6 bg-tiketx-blue rounded-full flex items-center justify-center"><Clock className="w-4 h-4 text-white" /></div>)}
                                </div>
                                <div className={"w-full h-full min-h-[200px] p-6 rounded-2xl border transition-all duration-300 hover:scale-105 flex flex-col " + (isCompleted ? "bg-white/10 border-white/20 shadow-lg" : isActive ? "bg-gradient-to-br from-tiketx-blue/20 to-tiketx-violet/20 border-tiketx-blue/50 shadow-lg shadow-tiketx-blue/10" : "bg-white/5 border-white/10") }>
                                  <div className="text-center flex flex-col h-full">
                                    <h3 className={`${isCompleted || isActive ? "text-white" : "text-gray-400"} font-bold text-lg mb-2`}>{stage.label}</h3>
                                    <p className={`text-sm leading-relaxed mb-4 flex-1 ${isCompleted || isActive ? "text-gray-200" : "text-gray-500"}`}>{stage.description}</p>
                                    <div className="flex justify-center mb-4">
                                      {stage.key === "submission" && (
                                        s.status_stage === "submission" ? (
                                          <span className="px-3 py-1 bg-yellow-900/60 text-yellow-300 rounded-full text-xs font-semibold border border-yellow-300/30">Acceptance Awaiting</span>
                                        ) : s.status_stage === "review_submission" ? (
                                          <span className="px-3 py-1 bg-blue-900/60 text-blue-200 rounded-full text-xs font-semibold border border-blue-300/30">In Review</span>
                                        ) : s.status_stage === "onboarding" ? (
                                          <span className="px-3 py-1 bg-green-900/60 text-green-300 rounded-full text-xs font-semibold border border-green-300/30">Submission Accepted</span>
                                        ) : (
                                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">Completed</span>
                                        )
                                      )}
                                      {stage.key !== "submission" && isCompleted && (<span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">Completed</span>)}
                                      {/* Removed explicit 'Active' tag as per new requirements */}
                                      {stage.key !== "submission" && isUpcoming && (<span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold border border-gray-500/30">Upcoming</span>)}
                                    </div>
                                    {isActive && stage.key === "onboarding" && (
                                      s.onboarding_fee_paid ? (
                                        <span className="px-3 py-1 bg-yellow-900/60 text-yellow-300 rounded-full text-xs font-semibold border border-yellow-300/30">Awaiting Review</span>
                                      ) : (
                                        <button
                                          className="w-full px-4 py-2 bg-gradient-to-r from-tiketx-blue to-tiketx-violet hover:from-tiketx-violet hover:to-tiketx-pink rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                          onClick={() => {
                                            setShowUploadModal(true);
                                            setActiveSubmissionId(s.id);
                                            // Parse onboarding instructions for this submission
                                            let steps: { id: number; label: string; completed: boolean }[] = [];
                                            if (s.onboarding_instructions) {
                                              try {
                                                // Try to parse as JSON array
                                                const arr = typeof s.onboarding_instructions === 'string' ? JSON.parse(s.onboarding_instructions) : s.onboarding_instructions;
                                                if (Array.isArray(arr)) {
                                                  steps = arr.map((label: string, idx: number) => ({ id: idx + 1, label, completed: false }));
                                                }
                                              } catch {
                                                // Fallback: treat as single string
                                                steps = [{ id: 1, label: Array.isArray(s.onboarding_instructions) ? s.onboarding_instructions.join(', ') : String(s.onboarding_instructions), completed: false }];
                                              }
                                            } else {
                                              // Fallback: default steps
                                              steps = [
                                                { id: 1, label: "Fill out personal details", completed: false },
                                                { id: 2, label: "Upload identity proof", completed: false },
                                                { id: 3, label: "Provide payment info", completed: false },
                                              ];
                                            }
                                            setOnboardingSteps(steps);
                                          }}
                                        >
                                          Complete Onboarding
                                        </button>
                                      )
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
                );
              })}
            </div>
          )}
        </div>
        {showUploadModal && activeSubmissionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
  <div className="bg-black bg-opacity-75 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.85)] p-8 w-full max-w-5xl min-h-[400px] relative border-2 border-gray-900 flex flex-col justify-center" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.85), 0 0 0 2px #23232a, 0 0 0 4px #35353c' }}>
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => { setShowUploadModal(false); setActiveSubmissionId(null); }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl md:text-3xl font-extrabold text-left mb-2 text-white tracking-tight">
                Onboarding of <span className="bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent font-extrabold drop-shadow-lg">{submissions.find(f => f.id === activeSubmissionId)?.film_title || ''}</span>
              </h2>
              <div className="text-base text-gray-400 text-left mb-8 font-light">Please complete the onboarding steps below to proceed.</div>
              <div className="mb-8">
                <div className="bg-[#23232a] bg-opacity-90 rounded-2xl p-8 flex flex-col gap-4 shadow-md border border-gray-800">
                  <div className="text-lg font-bold text-white mb-2 tracking-tight">Onboarding checklist</div>
                  {onboardingSteps.length === 0 ? (
                    <div className="text-gray-400 text-center">No onboarding instructions provided for this film.</div>
                  ) : (
                    onboardingSteps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleStepComplete(idx)}
                          aria-label={step.label}
                          className={`w-7 h-7 flex items-center justify-center rounded-full border-2 transition-colors duration-200 focus:outline-none shadow-sm ${step.completed ? 'border-green-500 bg-green-500' : 'border-gray-500 bg-gray-800 hover:border-tiketx-blue hover:bg-gray-700'}`}
                        >
                          {step.completed ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#fff" strokeWidth="2" />
                              <polyline points="7,12 11,16 17,9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="#888" strokeWidth="3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                          )}
                        </button>
                        <span className="text-base text-gray-100 font-medium leading-snug tracking-tight">{step.label}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="driveLink" className="block font-semibold mb-2 text-gray-200 text-base tracking-tight">Google Drive Private Link</label>
                <div className="flex items-center gap-3">
                  <input
                    id="driveLink"
                    type="url"
                    className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-tiketx-blue bg-gray-800 text-white placeholder-gray-400 border-gray-700 text-base font-medium tracking-tight"
                    placeholder="Paste your Google Drive private link here"
                    value={driveLink}
                    onChange={e => setDriveLink(e.target.value)}
                  />
                  <img src="/google-drive-logo.png" alt="Google Drive" className="w-8 h-8 drop-shadow" />
                </div>
              </div>
              <div className="w-full border-t border-gray-700 my-8"></div>
              <div className="mb-8">
                <div className="text-lg font-bold text-white mb-2 tracking-tight">Payment Information</div>
                <div className="text-sm text-gray-400 font-medium leading-relaxed">
                  An onboarding fee of <span className="font-bold text-white">Rs. 2000</span> is required. If your film is not released, rejected, or withdrawn, this fee will be refunded.
                </div>
              </div>
              <div className="flex items-center mb-8">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="mr-3 accent-tiketx-blue w-5 h-5"
                />
                <label htmlFor="acceptTerms" className="text-base text-gray-200 font-medium">I accept the <a href="/terms" target="_blank" className="underline text-tiketx-blue">terms and conditions</a></label>
              </div>
              <button
                className="w-full px-6 py-4 bg-gradient-to-r from-tiketx-blue to-tiketx-pink hover:from-tiketx-violet hover:to-tiketx-pink rounded-2xl font-bold text-white text-lg transition-all duration-200 hover:scale-105 shadow-xl disabled:opacity-50 tracking-tight flex items-center justify-center gap-2"
                onClick={handleSubmitOnboarding}
                disabled={
                  !acceptTerms || !driveLink || onboardingSteps.length === 0 || !onboardingSteps.every(s => s.completed)
                }
              >
                <span>Submit & Pay</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="7" y="11" width="10" height="7" rx="2" stroke="currentColor"/><path d="M12 15v2" stroke="currentColor" strokeLinecap="round"/><path d="M9 11V7a3 3 0 1 1 6 0v4" stroke="currentColor"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;