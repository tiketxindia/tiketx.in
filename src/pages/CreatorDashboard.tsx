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
  submission_rejection_reason?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  production_house_name?: string;
  preview_link?: string;
  expected_ticket_price?: string;
  planned_release_date?: string;
  message?: string;
  consent?: boolean;
  // New release scheduling fields
  scheduled_release_date?: string;
  final_currency?: string;
  final_ticket_price?: number;
  release_agreement?: boolean;
};
import UploadDocsModal from "@/components/UploadDocsModal";
import { openRazorpayModal } from "@/lib/razorpay";
// Timeline stages definition
type StageKey = 'submission' | 'review_submission' | 'onboarding' | 'review_onboarding' | 'release' | 'review_release' | 'sales' | 'closure';

function stageIndex(stage: StageKey): number {
  // Map review stages to their corresponding base stages for UI display
  const stageMapping: Record<string, string> = {
    'submission': 'submission',
    'review_submission': 'submission', // Review submission maps to submission stage for UI
    'onboarding': 'onboarding',
    'review_onboarding': 'onboarding', // Review onboarding maps to onboarding stage for UI
    'release': 'release',
    'review_release': 'release', // Review release maps to release stage for UI
    'release_scheduled': 'release', // Release scheduled also maps to release stage for UI
    'sales': 'sales',
    'sales_dashboard': 'sales', // Alternative name for sales
    'closure': 'closure',
    'set_closure': 'closure', // Alternative name for closure
  };
  
  const mappedStage = stageMapping[stage] || stage;
  return stages.findIndex(s => s.key === mappedStage);
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
    description: 'Complete onboarding requirements.',
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
  // Handler to re-open the submission form for editing
  const handleEditSubmission = (submission) => {
    // Implement navigation or modal logic to re-open the submission form
    // For example, open a modal or navigate to the edit page with submission data
    // This could be a modal or a route, depending on your app structure
    // Example:
    // navigate(`/edit-submission/${submission.id}`);
    // Or set state to open an edit modal
    // setEditModalOpen(true);
    // setSubmissionToEdit(submission);
    // Placeholder: alert for now
    alert('Open submission form for editing.');
  };
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Search, TrendingUp, Flag, ArrowRight, Calendar, FileText, Eye } from 'lucide-react';

function CreatorDashboard() {
  // State for edit modal and submission being edited
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmission, setEditSubmission] = useState<Submission | null>(null);

  // Handler to open edit modal with prefilled details
  function handleEditSubmission(submission: Submission) {
    // Ensure all fields are present and non-undefined for modal prefill
    setEditSubmission({
      id: submission.id,
      film_title: submission.film_title ?? '',
      name: submission.name ?? '',
      email: submission.email ?? '',
      phone: submission.phone ?? '',
      country: submission.country ?? '',
      production_house_name: submission.production_house_name ?? '',
      synopsis: submission.synopsis ?? '',
      preview_link: submission.preview_link ?? '',
      expected_ticket_price: submission.expected_ticket_price ?? '',
      planned_release_date: submission.planned_release_date ?? '',
      message: submission.message ?? '',
      consent: submission.consent ?? false,
      status_stage: submission.status_stage,
      onboarding_instructions: submission.onboarding_instructions,
      onboarding_fee: submission.onboarding_fee,
      onboarding_fee_paid: submission.onboarding_fee_paid,
      onboarding_fee_paid_datetime: submission.onboarding_fee_paid_datetime,
      drive_link: submission.drive_link,
      agreed_terms: submission.agreed_terms,
      submission_rejection_reason: submission.submission_rejection_reason ?? '',
      submitted_at: submission.submitted_at,
    });
    setEditModalOpen(true);
  }

  // Handler to save edited submission (stub)
  async function handleSaveEdit(updated: Submission) {
    // Save changes to DB and reset status_stage to 'submission'
    const { error } = await supabase
      .from('film_submissions')
      .update({
        film_title: updated.film_title,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        country: updated.country,
        production_house_name: updated.production_house_name,
        synopsis: updated.synopsis,
        preview_link: updated.preview_link,
        expected_ticket_price: updated.expected_ticket_price,
        planned_release_date: updated.planned_release_date,
        message: updated.message,
        consent: updated.consent,
        status_stage: 'submission',
        // Do not clear submission_rejection_reason; preserve until next rejection
      })
      .eq('id', updated.id);
    setEditModalOpen(false);
    setEditSubmission(null);
    if (error) {
      toast({ title: 'Failed to resubmit film', variant: 'destructive' });
    } else {
      toast({ title: 'Film resubmitted successfully!', variant: 'default' });
      // Optionally refresh submissions
      const { data: rows } = await supabase
        .from('film_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });
      setSubmissions((rows as any) || []);
    }
  }
  // Opens the rejection reason popup for a submission
  function openRejectionReason(submission: Submission) {
    setShowRejectionReason({ open: true, reason: submission.submission_rejection_reason || "No reason provided." });
  }
  // State for rejection reason popup
  const [showRejectionReason, setShowRejectionReason] = useState<{ open: boolean; reason: string }>({ open: false, reason: "" });

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toLowerCase()) {
      case 'usd':
        return '$';
      case 'eur':
        return '€';
      case 'gbp':
        return '£';
      case 'jpy':
        return '¥';
      case 'inr':
      default:
        return '₹';
    }
  };

  // Function to fetch sales data for a specific film
  const fetchSalesData = async (submissionId: string) => {
    setLoadingSalesData(true);
    try {
      // First, get the submission to check for currency information
      const { data: submission, error: submissionError } = await supabase
        .from('film_submissions')
        .select('final_currency')
        .eq('id', submissionId)
        .single();

      // Determine currency and symbol
      let currency = 'INR';
      let currencySymbol = '₹';
      
      if (!submissionError && submission?.final_currency) {
        currency = submission.final_currency;
        currencySymbol = getCurrencySymbol(currency);
      }

      // Get the film associated with this submission
      const { data: films, error: filmError } = await supabase
        .from('films')
        .select('id, title, disable_gst')
        .eq('submission_id', submissionId);

      if (filmError || !films || films.length === 0) {
        console.log('No film found for this submission');
        setSalesData({
          ticketsSold: 0,
          totalRevenue: 0,
          netRevenue: 0,
          totalCommission: 0,
          tickets: [],
          currency,
          currencySymbol,
          disableGst: false
        });
        setLoadingSalesData(false);
        return;
      }

      const filmId = films[0].id;
      const filmDisableGst = films[0].disable_gst || false;

      // Fetch ticket sales data with commission information
      const { data: tickets, error: ticketsError } = await supabase
        .from('film_tickets')
        .select('*')
        .eq('film_id', filmId)
        .order('purchase_date', { ascending: false });

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        setSalesData({
          ticketsSold: 0,
          totalRevenue: 0,
          netRevenue: 0,
          totalCommission: 0,
          tickets: [],
          currency,
          currencySymbol,
          disableGst: filmDisableGst
        });
      } else {
        const ticketData = tickets || [];
        const ticketsSold = ticketData.length;
        const totalRevenue = ticketData.reduce((sum, ticket) => sum + (parseFloat(ticket.price) || 0), 0);
        
        // Calculate commission totals directly from stored data (including GST)
        const totalCommission = ticketData.reduce((sum, ticket) => sum + (parseFloat(ticket.total_commission_with_gst) || 0), 0);
        const netRevenue = ticketData.reduce((sum, ticket) => sum + (parseFloat(ticket.net_amount) || parseFloat(ticket.price) || 0), 0);

        setSalesData({
          ticketsSold,
          totalRevenue,
          netRevenue,
          totalCommission,
          tickets: ticketData,
          currency,
          currencySymbol,
          disableGst: filmDisableGst
        });
      }
    } catch (error) {
      console.error('Error in fetchSalesData:', error);
      setSalesData({
        ticketsSold: 0,
        totalRevenue: 0,
        netRevenue: 0,
        totalCommission: 0,
        tickets: [],
        currency: 'INR',
        currencySymbol: '₹',
        disableGst: false
      });
    }
    setLoadingSalesData(false);
  };

  // Function to fetch weekly earnings data for payout
  const fetchWeeklyEarnings = async (submissionId: string) => {
    setLoadingPayoutData(true);
    try {
      // Get the film associated with this submission
      const { data: films, error: filmError } = await supabase
        .from('films')
        .select('id, title, published_date')
        .eq('submission_id', submissionId);

      if (filmError || !films || films.length === 0) {
        console.log('No film found for this submission');
        setWeeklyEarnings([]);
        setLoadingPayoutData(false);
        return;
      }

      const filmId = films[0].id;

      // Fetch weekly earnings breakdown
      const { data: weeklyData, error: weeklyError } = await supabase
        .rpc('get_weekly_earnings_breakdown', { film_id_param: filmId });

      if (weeklyError) {
        console.error('Error fetching weekly earnings:', weeklyError);
        setWeeklyEarnings([]);
      } else {
        setWeeklyEarnings(weeklyData || []);
      }
    } catch (error) {
      console.error('Error in fetchWeeklyEarnings:', error);
      setWeeklyEarnings([]);
    }
    setLoadingPayoutData(false);
  };

  // Function to fetch payout eligibility and existing requests
  const fetchPayoutData = async (submissionId: string) => {
    setLoadingPayoutData(true);
    try {
      // Get the film associated with this submission
      const { data: films, error: filmError } = await supabase
        .from('films')
        .select('id, title, published_date')
        .eq('submission_id', submissionId);

      if (filmError || !films || films.length === 0) {
        console.log('No film found for this submission');
        setWeeklyEarnings([]);
        setPayoutRequests([]);
        setCurrentPayoutEligibility(null);
        setLoadingPayoutData(false);
        return;
      }

      const filmId = films[0].id;

      // Fetch current payout eligibility
      const { data: eligibilityData, error: eligibilityError } = await supabase
        .rpc('get_current_payout_eligibility', { p_film_id: filmId });

      if (eligibilityError) {
        console.error('Error fetching payout eligibility:', eligibilityError);
      } else {
        setCurrentPayoutEligibility(eligibilityData?.[0] || null);
      }

      // Fetch existing payout requests
      const { data: requestsData, error: requestsError } = await supabase
        .rpc('get_payout_requests', { p_film_id: filmId });

      if (requestsError) {
        console.error('Error fetching payout requests:', requestsError);
      } else {
        setPayoutRequests(requestsData || []);
      }

      // Fetch weekly earnings breakdown
      const { data: weeklyData, error: weeklyError } = await supabase
        .rpc('get_weekly_earnings_breakdown', { film_id_param: filmId });

      if (weeklyError) {
        console.error('Error fetching weekly earnings:', weeklyError);
        setWeeklyEarnings([]);
      } else {
        setWeeklyEarnings(weeklyData || []);
      }
    } catch (error) {
      console.error('Error in fetchPayoutData:', error);
      setWeeklyEarnings([]);
      setPayoutRequests([]);
      setCurrentPayoutEligibility(null);
    }
    setLoadingPayoutData(false);
  };

  // Function to create a payout request
  const createPayoutRequest = async (submissionId: string) => {
    try {
      // Get the film associated with this submission
      const { data: films, error: filmError } = await supabase
        .from('films')
        .select('id')
        .eq('submission_id', submissionId);

      if (filmError || !films || films.length === 0) {
        toast({
          title: "Error",
          description: "Film not found for this submission.",
        });
        return;
      }

      const filmId = films[0].id;

      // Create payout request
      const { data: requestData, error: requestError } = await supabase
        .rpc('create_payout_request', { p_film_id: filmId, p_submission_id: submissionId });

      if (requestError) {
        console.error('Error creating payout request:', requestError);
        toast({
          title: "Error",
          description: "Failed to create payout request. Please try again.",
        });
        return;
      }

      const result = requestData?.[0];
      if (result?.status === 'error') {
        toast({
          title: "Error",
          description: result.message,
        });
        return;
      }

      toast({
        title: "Payout Request Created",
        description: `Your payout request for ₹${result.total_amount} has been submitted successfully.`,
      });

      // Refresh payout data
      await fetchPayoutData(submissionId);
      
    } catch (error) {
      console.error('Error in createPayoutRequest:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

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

  // Schedule Release modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeReleaseSubmissionId, setActiveReleaseSubmissionId] = useState<string | null>(null);
  const [releaseDate, setReleaseDate] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [ticketPrice, setTicketPrice] = useState("");
  const [acceptReleaseTerms, setAcceptReleaseTerms] = useState(false);

  // Contact Support modal state
  const [showContactSupportModal, setShowContactSupportModal] = useState(false);

  // Sales Dashboard modal state
  const [showSalesDashboardModal, setShowSalesDashboardModal] = useState(false);
  const [activeSalesSubmissionId, setActiveSalesSubmissionId] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<{
    ticketsSold: number;
    totalRevenue: number;
    netRevenue: number;
    totalCommission: number;
    tickets: any[];
    currency: string;
    currencySymbol: string;
    disableGst: boolean;
  }>({
    ticketsSold: 0,
    totalRevenue: 0,
    netRevenue: 0,
    totalCommission: 0,
    tickets: [],
    currency: 'INR',
    currencySymbol: '₹',
    disableGst: false
  });
  const [loadingSalesData, setLoadingSalesData] = useState(false);

  // Payout Request modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [activePayoutSubmissionId, setActivePayoutSubmissionId] = useState<string | null>(null);
  const [weeklyEarnings, setWeeklyEarnings] = useState<any[]>([]);
  const [loadingPayoutData, setLoadingPayoutData] = useState(false);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [currentPayoutEligibility, setCurrentPayoutEligibility] = useState<any>(null);

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
            status_stage: 'review_onboarding',
          })
          .eq('id', activeSubmissionId);
        if (error) {
          toast({ title: 'Failed to save onboarding info', variant: 'destructive' });
        } else {
          toast({ title: 'Onboarding info saved', variant: 'default' });
          // Update local state immediately to reflect the status change
          setSubmissions(prevSubmissions => 
            prevSubmissions.map(sub => 
              sub.id === activeSubmissionId 
                ? { 
                    ...sub, 
                    status_stage: 'review_onboarding',
                    drive_link: driveLink,
                    agreed_terms: acceptTerms,
                    onboarding_fee: onboardingFee,
                    onboarding_fee_paid: true,
                    onboarding_fee_paid_datetime: new Date().toISOString()
                  }
                : sub
            )
          );
        }
        setShowUploadModal(false);
        setActiveSubmissionId(null);
      },
      onFailure: () => {
        toast({ title: 'Payment was not completed', variant: 'destructive' });
      }
    });
  }

  async function handleSubmitScheduleRelease() {
    if (!activeReleaseSubmissionId || !releaseDate || !ticketPrice || !selectedCurrency || !acceptReleaseTerms) {
      toast({ 
        title: 'Please fill all required fields', 
        description: 'Release date, currency, ticket price, and terms acceptance are required.',
        variant: 'destructive' 
      });
      return;
    }

    try {
      // Update the submission with release details using new dedicated columns
      const { error } = await supabase
        .from('film_submissions')
        .update({
          scheduled_release_date: releaseDate,
          final_currency: selectedCurrency,
          final_ticket_price: parseFloat(ticketPrice),
          release_agreement: acceptReleaseTerms,
          status_stage: 'review_release', // Move to review_release stage after scheduling
        })
        .eq('id', activeReleaseSubmissionId);

      if (error) {
        toast({ 
          title: 'Failed to schedule release', 
          description: 'Please try again.',
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Release scheduled successfully!', 
          description: `Your film will be released on ${new Date(releaseDate).toLocaleDateString()}.`,
          variant: 'default' 
        });
        
        // Update local state immediately
        setSubmissions(prevSubmissions => 
          prevSubmissions.map(sub => 
            sub.id === activeReleaseSubmissionId 
              ? { 
                  ...sub, 
                  status_stage: 'review_release',
                  scheduled_release_date: releaseDate,
                  final_currency: selectedCurrency,
                  final_ticket_price: parseFloat(ticketPrice),
                  release_agreement: acceptReleaseTerms
                }
              : sub
          )
        );

        // Reset modal state
        setShowScheduleModal(false);
        setActiveReleaseSubmissionId(null);
        setReleaseDate("");
        setSelectedCurrency("INR");
        setTicketPrice("");
        setAcceptReleaseTerms(false);
      }
    } catch (error) {
      toast({ 
        title: 'Error scheduling release', 
        description: 'An unexpected error occurred.',
        variant: 'destructive' 
      });
    }
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
      
      const fetchAndUpdateSubmissions = async () => {
        const { data: rows, error } = await supabase
          .from('film_submissions')
          .select(`
            id,
            film_title,
            synopsis,
            submitted_at,
            status_stage,
            onboarding_instructions,
            onboarding_fee,
            onboarding_fee_paid,
            onboarding_fee_paid_datetime,
            drive_link,
            agreed_terms,
            submission_rejection_reason,
            name,
            email,
            phone,
            country,
            production_house_name,
            preview_link,
            expected_ticket_price,
            planned_release_date,
            message,
            consent,
            scheduled_release_date,
            final_currency,
            final_ticket_price,
            release_agreement
          `)
          .eq('user_id', data.user.id)
          .order('submitted_at', { ascending: false });
          
        if (error) {
          toast({ title: 'Failed to load submissions', variant: 'destructive' });
        } else {
          // Auto-advance/revert between onboarding and review_onboarding based on payment status
          const updatedRows = [];
          let autoAdvancedCount = 0;
          let autoRevertedCount = 0;
          
          for (const submission of (rows as any) || []) {
            if (submission.status_stage === 'onboarding' && submission.onboarding_fee_paid === true) {
              // Automatically move to review_onboarding stage
              const { error: updateError } = await supabase
                .from('film_submissions')
                .update({ status_stage: 'review_onboarding' })
                .eq('id', submission.id);
              
              if (!updateError) {
                // Update the local data to reflect the change
                updatedRows.push({ ...submission, status_stage: 'review_onboarding' });
                autoAdvancedCount++;
              } else {
                console.error('Failed to auto-advance submission:', updateError);
                updatedRows.push(submission);
              }
            } else if (submission.status_stage === 'review_onboarding' && (submission.onboarding_fee_paid === false || submission.onboarding_fee_paid === null)) {
              // Automatically revert to onboarding stage
              const { error: updateError } = await supabase
                .from('film_submissions')
                .update({ status_stage: 'onboarding' })
                .eq('id', submission.id);
              
              if (!updateError) {
                // Update the local data to reflect the change
                updatedRows.push({ ...submission, status_stage: 'onboarding' });
                autoRevertedCount++;
              } else {
                console.error('Failed to auto-revert submission:', updateError);
                updatedRows.push(submission);
              }
            } else {
              updatedRows.push(submission);
            }
          }
          
          // Show notifications for auto-actions (only on initial load, not periodic checks)
          if (setLoading && autoAdvancedCount > 0) {
            toast({
              title: 'Status updated',
              description: `Your submission has been moved to review stage after payment completion.`,
              variant: 'default'
            });
          }
          
          if (setLoading && autoRevertedCount > 0) {
            toast({
              title: 'Status updated',
              description: `Your submission has been moved back to onboarding stage. Please complete the payment to proceed.`,
              variant: 'default'
            });
          }
          
          setSubmissions(updatedRows);
        }
      };
      
      // Initial fetch
      await fetchAndUpdateSubmissions();
      setLoading(false);
      
      // Set up periodic check every 30 seconds for real-time updates
      const interval = setInterval(fetchAndUpdateSubmissions, 30000);
      
      return () => clearInterval(interval);
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
      {/* Edit Submission Modal */}
      {editModalOpen && editSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl border border-gray-700 shadow-2xl p-8 w-full max-w-6xl transition-all duration-300" style={{ minHeight: 'auto', height: 'auto', maxHeight: '800px', overflowY: 'auto' }}>
            <h3 className="text-2xl font-bold mb-2 text-red-300">Edit Your Submission</h3>
            {editSubmission.submission_rejection_reason && (
              <div className="mb-6">
                <span className="text-red-300 font-semibold">Reject Reason:&nbsp;</span>
                <span className="italic text-red-200">{editSubmission.submission_rejection_reason}</span>
              </div>
            )}
            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const updated: Submission = {
                  ...editSubmission,
                  film_title: (form.film_title as any).value,
                  name: (form.name as any).value,
                  email: (form.email as any).value,
                  phone: (form.phone as any).value,
                  country: (form.country as any).value,
                  production_house_name: (form.production_house_name as any).value,
                  synopsis: (form.synopsis as any).value,
                  preview_link: (form.preview_link as any).value,
                  expected_ticket_price: (form.expected_ticket_price as any).value,
                  planned_release_date: (form.planned_release_date as any).value,
                  message: (form.message as any).value,
                  consent: (form.consent as any).checked,
                };
                handleSaveEdit(updated);
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Name *</label>
                  <input name="name" defaultValue={editSubmission.name} readOnly className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-gray-300 cursor-not-allowed" />
                  <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email *</label>
                  <input type="email" name="email" defaultValue={editSubmission.email} readOnly className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-gray-300 cursor-not-allowed" />
                  <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">WhatsApp (include country code) *</label>
                  <input type="tel" name="phone" defaultValue={editSubmission.phone} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Country *</label>
                  <input name="country" defaultValue={editSubmission.country} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Production House Name *</label>
                  <input name="production_house_name" defaultValue={editSubmission.production_house_name} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Film Title *</label>
                  <input name="film_title" defaultValue={editSubmission.film_title} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Synopsis (short) *</label>
                <textarea name="synopsis" defaultValue={editSubmission.synopsis} rows={4} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Private preview link (YouTube/Vimeo/Drive) *</label>
                <input name="preview_link" defaultValue={editSubmission.preview_link} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Expected Ticket Price (INR/USD) *</label>
                  <input name="expected_ticket_price" defaultValue={editSubmission.expected_ticket_price} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" placeholder="e.g. 199 INR" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Planned Release Date (optional)</label>
                  <input type="date" name="planned_release_date" defaultValue={editSubmission.planned_release_date} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Message (optional)</label>
                <textarea name="message" defaultValue={editSubmission.message} rows={3} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3" />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" name="consent" defaultChecked={!!editSubmission.consent} className="h-4 w-4" />
                <span className="text-sm text-gray-300">I agree to be contacted by TiketX about my submission *</span>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink text-white shadow-lg">Resubmit Film</button>
                <button type="button" className="px-6 py-3 rounded-xl font-bold bg-gray-700 text-white shadow-lg" onClick={() => { setEditModalOpen(false); setEditSubmission(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rejection Reason Popup */}
      {showRejectionReason.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-red-400/30">
            <h3 className="text-lg font-bold text-red-300 mb-2">Submission Rejection Reason</h3>
            <p className="text-sm text-gray-200 mb-4 whitespace-pre-line">{showRejectionReason.reason}</p>
            <button
              className="px-4 py-2 rounded-lg bg-red-700 text-white font-bold shadow hover:bg-red-600 transition"
              onClick={() => setShowRejectionReason({ open: false, reason: "" })}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="max-w-[96rem] mx-auto px-2 md:px-4 py-12">
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
                        <button
                          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-200 group-hover:scale-105 mr-6"
                          onClick={() => window.location.reload()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.06-.27 2.06-.75 2.93l1.46 1.46A7.963 7.963 0 0020 12c0-4.42-3.58-8-8-8zm-6.75 3.07l-1.46-1.46A7.963 7.963 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.06.27-2.06.75-2.93z" fill="currentColor"/></svg>
                          Refresh
                        </button>
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
                          // Handle review stages - treat them as active for their corresponding base stage
                          const isActive = idx === currentIdx || 
                            (stage.key === 'submission' && (s.status_stage === 'review_submission' || s.status_stage === 'submission_rejected')) ||
                            (stage.key === 'onboarding' && s.status_stage === 'review_onboarding') ||
                            (stage.key === 'release' && s.status_stage === 'review_release');
                          const isUpcoming = idx > currentIdx;
                          const IconComponent = stage.icon;
                          return (
                            <div key={stage.key} className="relative flex flex-col flex-1 min-w-0 max-w-xs mx-2">
                              <div className="flex flex-col items-center flex-1">
                                <div className={
                                  "relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 " +
                                  (s.status_stage === "submission_rejected" && stage.key === "submission"
                                    ? "bg-gradient-to-br from-red-500/30 via-red-400/20 to-red-300/20 shadow-lg"
                                    : isCompleted
                                    ? "bg-green-500 shadow-lg"
                                    : isActive
                                    ? "bg-gradient-to-r from-tiketx-blue to-tiketx-violet shadow-lg"
                                    : "bg-white/10 border-2 border-white/20")
                                }>
                                  {s.status_stage === "submission_rejected" && stage.key === "submission" && (
                                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 shadow-lg">
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <text x="8" y="12" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">!</text>
                                      </svg>
                                    </span>
                                  )}
                                  <IconComponent className={`w-8 h-8 ${isCompleted || (s.status_stage === 'submission_rejected' && stage.key === 'submission') ? 'text-white' : isActive ? 'text-white' : 'text-gray-400'}`} />
                                  {isCompleted && (<div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>)}
                                  {isActive && (<div className="absolute -top-1 -right-1 w-6 h-6 bg-tiketx-blue rounded-full flex items-center justify-center"><Clock className="w-4 h-4 text-white" /></div>)}
                                </div>
                                <div className={
                                  "w-full h-full min-h-[200px] p-6 rounded-2xl border transition-all duration-300 hover:scale-105 flex flex-col " +
                                  (s.status_stage === "submission_rejected" && stage.key === "submission"
                                    ? "bg-gradient-to-br from-red-500/20 via-red-400/12 to-red-300/12 border-red-400/30 shadow-lg"
                                    : isCompleted
                                    ? "bg-white/10 border-white/20 shadow-lg"
                                    : isActive
                                    ? "bg-gradient-to-br from-tiketx-blue/20 to-tiketx-violet/20 border-tiketx-blue/50 shadow-lg shadow-tiketx-blue/10"
                                    : "bg-white/5 border-white/10")
                                }>
                                  <div className="text-center flex flex-col h-full">
                                    <h3 className={`${isCompleted || isActive || (s.status_stage === "submission_rejected" && stage.key === "submission") ? "text-white" : "text-gray-400"} font-bold text-lg mb-2`}>{stage.label}</h3>
                                    <p className={`text-sm leading-relaxed mb-4 flex-1 ${isCompleted || isActive || (s.status_stage === "submission_rejected" && stage.key === "submission") ? "text-gray-200" : "text-gray-500"}`}>{stage.description}</p>
                                    <div className="flex justify-center mb-4">
                                      {stage.key === "submission" && (
                                        s.status_stage === "submission" ? (
                                          <span className="px-3 py-1 bg-yellow-900/60 text-yellow-300 rounded-full text-xs font-semibold border border-yellow-300/30">Acceptance Awaiting</span>
                                        ) : s.status_stage === "review_submission" ? (
                                          <span className="px-3 py-1 bg-blue-900/60 text-blue-200 rounded-full text-xs font-semibold border border-blue-300/30">In Review</span>
                                        ) : s.status_stage === "submission_rejected" ? (
                                          <div className="flex flex-col items-center gap-2 justify-center">
                                            <button
                                              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold shadow-lg hover:bg-red-700 transition mb-2"
                                              style={{ minWidth: '140px' }}
                                              onClick={() => handleEditSubmission(s)}
                                            >
                                              Edit Your Submission
                                            </button>
                                            <span className="px-3 py-1 bg-red-900/60 text-red-300 rounded-full text-xs font-semibold border border-red-300/30">Submission Rejected</span>
                                            <button
                                              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-transparent text-red-300 font-semibold underline hover:text-red-400 transition"
                                              style={{ minHeight: 'auto', minWidth: 'auto' }}
                                              onClick={async (e) => {
                                                e.preventDefault();
                                                const { data } = await supabase
                                                  .from('film_submissions')
                                                  .select('submission_rejection_reason')
                                                  .eq('id', s.id)
                                                  .single();
                                                setShowRejectionReason({ open: true, reason: data?.submission_rejection_reason || "No reason provided." });
                                              }}
                                              type="button"
                                            >
                                              <span>See Why?</span>
                                            </button>
                                          </div>
                                        ) : isCompleted ? (
                                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">Completed</span>
                                        ) : null
                                      )}
                                      {stage.key !== "submission" && isCompleted && (<span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">Completed</span>)}
                                      {/* Show release scheduled info and status for release stage */}
                                      {stage.key === "release" && (s.status_stage === "review_release" || s.status_stage === "release_scheduled") && (
                                        <div className="w-full space-y-3">
                                          {s.scheduled_release_date && (
                                            <div className="p-3 rounded-lg relative">
                                              <div className="text-xs text-blue-200 font-medium text-center">
                                                <div className="mb-1">
                                                  Scheduled On
                                                </div>
                                                <div className="mb-3 text-sm font-bold">
                                                  {new Date(s.scheduled_release_date).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                  })}
                                                </div>
                                                <div className="mb-1">
                                                  Ticket Price
                                                </div>
                                                <div className="text-sm font-bold">
                                                  {s.final_currency && s.final_ticket_price ? `${s.final_currency} ${s.final_ticket_price}` : 'Price TBD'}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          <div className="flex justify-center">
                                            {s.status_stage === "release_scheduled" ? (
                                              <span className="px-3 py-1 bg-green-900/60 text-green-200 rounded-full text-xs font-semibold border border-green-300/30">Scheduled</span>
                                            ) : (
                                              <span className="px-3 py-1 bg-blue-900/60 text-blue-200 rounded-full text-xs font-semibold border border-blue-300/30">Awaiting Release</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {/* Removed explicit 'Active' tag as per new requirements */}
                                      {stage.key !== "submission" && isUpcoming && (<span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold border border-gray-500/30">Upcoming</span>)}
                                    </div>
                                    {isActive && stage.key === "onboarding" && (
                                      (s.onboarding_fee_paid || s.status_stage === "review_onboarding") ? (
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
                                            }
                                            // No fallback steps - leave empty if no instructions provided
                                            setOnboardingSteps(steps);
                                          }}
                                        >
                                          Complete Onboarding
                                        </button>
                                      )
                                    )}
                                    {isActive && stage.key === "release" && s.status_stage === "release" && (
                                      <button
                                        className="w-full px-4 py-2 bg-gradient-to-r from-tiketx-blue to-tiketx-violet hover:from-tiketx-violet hover:to-tiketx-pink rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                        onClick={() => {
                                          setShowScheduleModal(true);
                                          setActiveReleaseSubmissionId(s.id);
                                          // Pre-fill with existing data from new dedicated fields
                                          setReleaseDate(s.scheduled_release_date || "");
                                          setSelectedCurrency(s.final_currency || "INR");
                                          setTicketPrice(s.final_ticket_price ? s.final_ticket_price.toString() : "");
                                          setAcceptReleaseTerms(s.release_agreement || false);
                                        }}
                                      >
                                        Schedule Release
                                      </button>
                                    )}
                                    {isActive && stage.key === "release" && s.status_stage === "review_release" && (
                                      <button
                                        className="w-full px-4 py-2 bg-gradient-to-r from-tiketx-blue to-tiketx-violet hover:from-tiketx-violet hover:to-tiketx-pink rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                        onClick={() => {
                                          setShowContactSupportModal(true);
                                        }}
                                      >
                                        Reschedule
                                      </button>
                                    )}
                                    {isActive && stage.key === "sales" && (s.status_stage === "sales_dashboard" || s.status_stage === "sales") && (
                                      <div className="space-y-3">
                                        <button
                                          className="w-full px-4 py-2 bg-gradient-to-r from-tiketx-blue to-tiketx-violet hover:from-tiketx-violet hover:to-tiketx-pink rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                          onClick={() => {
                                            setActiveSalesSubmissionId(s.id);
                                            fetchSalesData(s.id);
                                            setShowSalesDashboardModal(true);
                                          }}
                                        >
                                          View Sales
                                        </button>
                                        <button
                                          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                          onClick={() => {
                                            setActivePayoutSubmissionId(s.id);
                                            fetchPayoutData(s.id);
                                            setShowPayoutModal(true);
                                          }}
                                        >
                                          View Payout
                                        </button>
                                        <div className="text-center">
                                          <button
                                            className="text-sm text-tiketx-blue hover:text-tiketx-violet underline decoration-dotted underline-offset-2 transition-colors duration-200"
                                            onClick={() => {
                                              // Handle closure request logic here
                                              setShowContactSupportModal(true);
                                            }}
                                          >
                                            Request For Closure
                                          </button>
                                        </div>
                                      </div>
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
                    <div className="text-gray-400 text-center">Checklist not yet provided, Please wait..</div>
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

        {showScheduleModal && activeReleaseSubmissionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-black bg-opacity-75 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.85)] p-8 w-full max-w-2xl relative border-2 border-gray-900" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.85), 0 0 0 2px #23232a, 0 0 0 4px #35353c' }}>
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => {
                  setShowScheduleModal(false);
                  setActiveReleaseSubmissionId(null);
                  setReleaseDate("");
                  setSelectedCurrency("INR");
                  setTicketPrice("");
                  setAcceptReleaseTerms(false);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-left mb-2 text-white tracking-tight">
                Schedule Release for <span className="bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent font-extrabold drop-shadow-lg">{submissions.find(f => f.id === activeReleaseSubmissionId)?.film_title || ''}</span>
              </h2>
              <div className="text-base text-gray-400 text-left mb-8 font-light">Set your release date and ticket pricing details.</div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmitScheduleRelease();
              }} className="space-y-6">
                
                <div>
                  <label htmlFor="releaseDate" className="block font-semibold mb-2 text-gray-200 text-base tracking-tight">
                    Schedule Release Date *
                  </label>
                  <input
                    id="releaseDate"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-tiketx-blue focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="selectedCurrency" className="block font-semibold mb-2 text-gray-200 text-base tracking-tight">
                      Select Currency *
                    </label>
                    <select
                      id="selectedCurrency"
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-tiketx-blue focus:outline-none transition-colors"
                      required
                    >
                      <option value="INR">INR (Indian Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ticketPrice" className="block font-semibold mb-2 text-gray-200 text-base tracking-tight">
                      Ticket Price *
                    </label>
                    <input
                      id="ticketPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="e.g. 199 or 5.99"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-tiketx-blue focus:outline-none transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter amount only (currency selected above)</p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <div className="flex items-start mb-6">
                    <input
                      id="acceptReleaseTerms"
                      type="checkbox"
                      checked={acceptReleaseTerms}
                      onChange={(e) => setAcceptReleaseTerms(e.target.checked)}
                      className="mr-3 accent-tiketx-blue w-5 h-5 mt-0.5"
                      required
                    />
                    <label htmlFor="acceptReleaseTerms" className="text-sm text-gray-200 leading-relaxed">
                      I accept the <span className="text-tiketx-blue underline cursor-pointer">terms and conditions for release</span> and understand that once scheduled, the release date cannot be changed without admin approval. *
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 text-white shadow-lg transition-colors"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setActiveReleaseSubmissionId(null);
                      setReleaseDate("");
                      setSelectedCurrency("INR");
                      setTicketPrice("");
                      setAcceptReleaseTerms(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!releaseDate || !selectedCurrency || !ticketPrice || !acceptReleaseTerms}
                    className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-tiketx-blue to-tiketx-violet hover:from-tiketx-violet hover:to-tiketx-pink text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Schedule Release
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showContactSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-black bg-opacity-75 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.85)] p-8 w-full max-w-md relative border-2 border-gray-900" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.85), 0 0 0 2px #23232a, 0 0 0 4px #35353c' }}>
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowContactSupportModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2 text-white tracking-tight">
                Contact <span className="bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent font-extrabold drop-shadow-lg">TiketX Support</span>
              </h2>
              <div className="text-base text-gray-400 text-center mb-8 font-light">
                To reschedule your release, please contact our support team
              </div>
              
              <div className="space-y-4">
                <a
                  href="https://wa.me/919346224895"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/>
                  </svg>
                  WhatsApp Support
                </a>
                
                <a
                  href="tel:+919346224895"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call: +91 9346224895
                </a>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-300 text-center">
                  Our support team will help you reschedule your release date and update pricing if needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {showSalesDashboardModal && activeSalesSubmissionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-black bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.85)] p-8 w-full max-w-6xl max-h-[85vh] overflow-y-auto relative border-2 border-gray-900" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.85), 0 0 0 2px #23232a, 0 0 0 4px #35353c' }}>
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl z-10"
                onClick={() => {
                  setShowSalesDashboardModal(false);
                  setActiveSalesSubmissionId(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-left mb-2 text-white tracking-tight">
                Sales Dashboard for <span className="bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent font-extrabold drop-shadow-lg">
                  {submissions.find(f => f.id === activeSalesSubmissionId)?.film_title || ''}
                </span>
              </h2>
              <div className="text-base text-gray-400 text-left mb-8 font-light">
                Track your film's performance and detailed sales information
              </div>

              {loadingSalesData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tiketx-blue"></div>
                  <span className="ml-4 text-gray-300">Loading sales data...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Sales Insights Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-tiketx-blue/20 to-tiketx-violet/20 rounded-2xl p-6 border border-tiketx-blue/30">
                      <div className="flex items-center space-x-4">
                        <div className="bg-tiketx-blue/30 rounded-full p-3">
                          <svg className="w-8 h-8 text-tiketx-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Tickets Sold</h3>
                          <p className="text-3xl font-bold text-tiketx-blue">{salesData.ticketsSold}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-tiketx-violet/20 to-tiketx-pink/20 rounded-2xl p-6 border border-tiketx-violet/30">
                      <div className="flex items-center space-x-4">
                        <div className="bg-tiketx-violet/30 rounded-full p-3 flex items-center justify-center w-14 h-14">
                          <span className="text-2xl font-bold text-tiketx-violet">
                            {salesData.currencySymbol}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Gross Revenue</h3>
                          <p className="text-3xl font-bold text-tiketx-violet">{salesData.currencySymbol}{salesData.totalRevenue.toLocaleString()}</p>
                          <p className="text-xs text-gray-400 mt-1">Before commissions</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-2xl p-6 border border-green-500/30">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-500/30 rounded-full p-3 flex items-center justify-center w-14 h-14">
                          <span className="text-2xl font-bold text-green-400">
                            ₹
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Net Revenue</h3>
                          <p className="text-3xl font-bold text-green-400">{salesData.currencySymbol}{salesData.netRevenue.toLocaleString()}</p>
                          {salesData.disableGst ? (
                            <p className="text-xs text-gray-400 mt-1">Gross Revenue - Commission</p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">Gross Revenue - Commission</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sales Table */}
                  <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-800/70 border-b border-gray-700">
                      <h3 className="text-xl font-semibold text-white">Detailed Sales Records</h3>
                      <p className="text-sm text-gray-400">All ticket purchases for this film</p>
                    </div>
                    
                    {salesData.tickets.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="text-lg font-semibold text-gray-300 mb-2">No Sales Data</h4>
                        <p className="text-gray-500">No tickets have been sold for this film yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800/30">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Purchase Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expiry Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket Price</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {salesData.disableGst ? 'Commission' : 'Commission (incl GST)'}
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Your Earnings</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {salesData.tickets.map((ticket, index) => {
                              // Helper function to format date and time in IST
                              const formatDateTimeIST = (dateString: string) => {
                                if (!dateString) return 'N/A';
                                const utcDate = new Date(dateString);
                                // Convert to IST (UTC + 5:30)
                                const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                                const formatted = istDate.toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                  timeZone: 'Asia/Kolkata'
                                });
                                // Convert am/pm to uppercase AM/PM
                                return formatted.replace(/am|pm/gi, (match) => match.toUpperCase());
                              };

                              return (
                                <tr key={ticket.id} className={index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/40'}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                                    {ticket.tiket_id || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {formatDateTimeIST(ticket.purchase_date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {formatDateTimeIST(ticket.expiry_date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      ticket.is_active 
                                        ? 'bg-green-800/30 text-green-300 border border-green-700' 
                                        : 'bg-red-800/30 text-red-300 border border-red-700'
                                    }`}>
                                      {ticket.is_active ? 'Active' : 'Expired'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-300">
                                    {salesData.currencySymbol}{ticket.price || 0}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-300">
                                    {salesData.disableGst ? (
                                      <span className="text-orange-400 font-semibold">
                                        {ticket.commission_rate ? `${(parseFloat(ticket.commission_rate) * 100).toFixed(0)}%` : '0%'} (₹{parseFloat(ticket.total_commission_with_gst || ticket.commission_amount || 0).toFixed(2)})
                                      </span>
                                    ) : (
                                      <div className="flex flex-col">
                                        <span className="text-orange-400 font-semibold">
                                          {ticket.commission_rate ? `${(parseFloat(ticket.commission_rate) * 100).toFixed(0)}%` : '0%'} (₹{parseFloat(ticket.total_commission_with_gst || 0).toFixed(2)})
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                          ₹{parseFloat(ticket.commission_amount || 0).toFixed(2)} + ₹{parseFloat(ticket.commission_gst_amount || 0).toFixed(2)} GST
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                                    {salesData.currencySymbol}{parseFloat(ticket.net_amount || ticket.price || 0).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payout Request Modal */}
        {showPayoutModal && activePayoutSubmissionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-black bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.85)] p-8 w-full max-w-6xl max-h-[95vh] overflow-y-auto relative border-2 border-gray-900" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.85), 0 0 0 2px #23232a, 0 0 0 4px #35353c' }}>
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl z-10"
                onClick={() => {
                  setShowPayoutModal(false);
                  setActivePayoutSubmissionId(null);
                  setWeeklyEarnings([]);
                  setPayoutRequests([]);
                  setCurrentPayoutEligibility(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>

              <h2 className="text-2xl md:text-3xl font-extrabold text-left mb-2 text-white tracking-tight">
                Weekly Payout Request for <span className="bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent font-extrabold drop-shadow-lg">
                  {submissions.find(f => f.id === activePayoutSubmissionId)?.film_title || ''}
                </span>
              </h2>
              <div className="text-base text-gray-400 text-left mb-8 font-light">
                Weekly earnings breakdown and payout eligibility
              </div>

              {loadingPayoutData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tiketx-blue"></div>
                  <span className="ml-4 text-gray-300">Loading payout data...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-2xl p-6 border border-green-500/30">
                      <h3 className="text-lg font-semibold text-white mb-2">Available for Payout</h3>
                      <p className="text-3xl font-bold text-green-400">
                        ₹{currentPayoutEligibility?.total_eligible_amount || '0.00'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Ready for payout</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl p-6 border border-yellow-500/30">
                      <h3 className="text-lg font-semibold text-white mb-2">Pending Request</h3>
                      <p className="text-3xl font-bold text-yellow-400">
                        ₹{currentPayoutEligibility?.pending_amount || '0.00'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {currentPayoutEligibility?.has_pending_request ? 'In progress' : 'None'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-tiketx-blue/20 to-tiketx-violet/20 rounded-2xl p-6 border border-tiketx-blue/30">
                      <h3 className="text-lg font-semibold text-white mb-2">Available Weeks</h3>
                      <p className="text-3xl font-bold text-tiketx-blue">{currentPayoutEligibility?.weeks_available || 0}</p>
                      <p className="text-xs text-gray-400 mt-1">Eligible weeks</p>
                    </div>
                  </div>

                  {/* Payout Requests History */}
                  {payoutRequests.length > 0 && (
                    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                      <div className="px-6 py-4 bg-gray-800/70 border-b border-gray-700">
                        <h3 className="text-xl font-semibold text-white">Payout Requests History</h3>
                        <p className="text-sm text-gray-400">Track your payout request status</p>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800/30">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Request Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Weeks</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Period</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {payoutRequests.map((request, index) => (
                              <tr key={request.id} className={index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/40'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {new Date(request.requested_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                                  ₹{parseFloat(request.request_amount || 0).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {request.total_weeks_included} weeks
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {new Date(request.week_start_date).toLocaleDateString()} - {new Date(request.week_end_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    request.status === 'completed' 
                                      ? 'bg-green-800/30 text-green-300 border border-green-700'
                                      : request.status === 'approved'
                                      ? 'bg-blue-800/30 text-blue-300 border border-blue-700'
                                      : request.status === 'processing'
                                      ? 'bg-purple-800/30 text-purple-300 border border-purple-700'
                                      : request.status === 'rejected'
                                      ? 'bg-red-800/30 text-red-300 border border-red-700'
                                      : 'bg-yellow-800/30 text-yellow-300 border border-yellow-700'
                                  }`}>
                                    {request.status === 'completed' ? 'Paid' 
                                      : request.status === 'approved' ? 'Approved'
                                      : request.status === 'processing' ? 'Processing'
                                      : request.status === 'rejected' ? 'Rejected'
                                      : 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Weekly Breakdown Table */}
                  <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-800/70 border-b border-gray-700">
                      <h3 className="text-xl font-semibold text-white">Weekly Earnings Breakdown</h3>
                      <p className="text-sm text-gray-400">Payouts are processed weekly for completed weeks</p>
                    </div>
                    
                    {weeklyEarnings.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-gray-500">No earnings data available yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800/30">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Week</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Period</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tickets</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gross Revenue</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Commission</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Net Earnings</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {weeklyEarnings.map((week, index) => (
                              <tr key={week.week_number} className={index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/40'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-300">
                                  Week {week.week_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {new Date(week.week_start_date).toLocaleDateString()} - {new Date(week.week_end_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {week.tickets_sold}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-300">
                                  ₹{parseFloat(week.gross_revenue || 0).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-300">
                                  ₹{parseFloat(week.total_commission || 0).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                                  ₹{parseFloat(week.net_earnings || 0).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    week.payout_status === 'eligible' 
                                      ? 'bg-green-800/30 text-green-300 border border-green-700' 
                                      : 'bg-yellow-800/30 text-yellow-300 border border-yellow-700'
                                  }`}>
                                    {week.payout_status === 'eligible' ? 'Eligible' : 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Payout Request Button */}
                  <div className="flex justify-center pt-6 space-x-4">
                    {currentPayoutEligibility?.has_pending_request ? (
                      <div className="text-center">
                        <div className="px-8 py-3 bg-yellow-600/30 border border-yellow-500 rounded-xl font-bold text-yellow-300">
                          Payout Request Pending (₹{currentPayoutEligibility?.pending_amount || '0.00'})
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Your request is being processed</p>
                      </div>
                    ) : currentPayoutEligibility?.total_eligible_amount > 0 ? (
                      <button
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => createPayoutRequest(activePayoutSubmissionId!)}
                      >
                        Create Payout Request (₹{currentPayoutEligibility?.total_eligible_amount || '0.00'})
                      </button>
                    ) : (
                      <div className="text-center">
                        <div className="px-8 py-3 bg-gray-600/30 border border-gray-500 rounded-xl font-bold text-gray-400">
                          No Eligible Earnings Yet
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Earnings become eligible after each week completes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;