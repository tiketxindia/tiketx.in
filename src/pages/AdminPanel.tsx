import OnboardingChecklistEditor from "../components/OnboardingChecklistEditor";
// ...existing imports...

// ...existing imports...
// ...existing code...
import { useEffect, useState } from 'react';
import { Upload, Image, Users, BarChart3, Settings, Plus, Edit, Trash2, CheckCircle, Film, GripVertical, Ticket, DollarSign } from 'lucide-react';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { DndContext } from '@dnd-kit/core';
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { closestCenter } from '@dnd-kit/core';
import ReviewSubmissionModal from '../components/ReviewSubmissionModal';
// ...existing code...

function renderProgressBar(status_stage: string) {
  const stages = [
    "submission",
    "review_submission",
    "onboarding",
    "review_onboarding",
    "release",
    "review_release",
    "release_scheduled",
    "sales_dashboard",
    "set_closure",
  ];
  // If rejected, cross only at failed stage, ticks for completed, default for others
  let failedStageIndex = -1;
  if (status_stage === "submission_rejected") {
    failedStageIndex = stages.indexOf("review_submission");
  }
  // For other status, completed stages are those before currentStageIndex
  const currentStageIndex = stages.indexOf(status_stage);
  return (
    <div className="flex items-center justify-between w-full px-4 py-6">
      {stages.map((stage, idx) => {
        let dotClass = "bg-gradient-to-br from-blue-900 to-blue-700 border-2 border-blue-400";
        let icon = null;
        // Show tick for completed stages (before failed or current)
        if (
          (failedStageIndex !== -1 && idx < failedStageIndex) ||
          (failedStageIndex === -1 && idx < currentStageIndex)
        ) {
          dotClass = "bg-gradient-to-br from-green-700 to-green-500 border-2 border-green-400";
          icon = <Check className="text-white w-6 h-6" />;
        }
        // Show cross only at failed stage
        if (failedStageIndex !== -1 && idx === failedStageIndex) {
          dotClass = "bg-gradient-to-br from-red-700 to-red-500 border-2 border-red-400";
          icon = <X className="text-white w-6 h-6" />;
        }
        return (
          <>
            <div key={stage} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${dotClass}`}>{icon}</div>
              <span className="text-xs mt-2 text-gray-300 font-semibold">{stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            {idx < stages.length - 1 && <div key={stage+"-bar"} className="h-1 w-8 bg-gradient-to-r from-blue-900 to-blue-700 mx-1 rounded" />}
          </>
        );
      })}
    </div>
  );
}
// ...existing code continues...

async function uploadToMux(url, file, onProgress): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error('Mux upload failed'));
      }
    };
    xhr.onerror = function () {
      reject(new Error('Mux upload failed'));
    };
    xhr.send(file);
  });
}

// Poll Supabase Edge Function for playback ID after upload
async function pollMuxPlaybackIdEdge(uploadId) {
  // Use the deployed Supabase Edge Function URL for local dev and production
  const functionUrl =
    window.location.hostname === 'localhost'
      ? 'https://pibbyyltgdtkzfjbqixw.functions.supabase.co/poll-mux-playback-id'
      : '/functions/v1/poll-mux-playback-id';

  // Get the current user's access token from Supabase Auth
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('Not authenticated');

  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ upload_id: uploadId }),
  });
  if (!res.ok) throw new Error('Failed to get Mux playback ID');
  const data = await res.json();
  return data.playback_id;
}

// Helper to delete a Mux asset by playback ID
async function deleteMuxAssetByPlaybackId(playbackId) {
  if (!playbackId) return;
  // Use the deployed Supabase Edge Function URL for local dev and production
  const functionUrl =
    window.location.hostname === 'localhost'
      ? 'https://pibbyyltgdtkzfjbqixw.functions.supabase.co/delete-mux-asset'
      : '/functions/v1/delete-mux-asset';
  // Get the current user's access token from Supabase Auth
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('Not authenticated');
  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ playback_id: playbackId }),
  });
  if (!res.ok) throw new Error('Failed to delete Mux asset');
  return await res.json();
}

const AdminPanel = () => {
  // Temp checklist steps for onboarding modal
  const [tempChecklistSteps, setTempChecklistSteps] = useState([]);
    // State for review submission modal
    const [showReviewModal, setShowReviewModal] = useState<{ open: boolean, sub: any | null }>({ open: false, sub: null });
  // Onboarding modal state
  const [showOnboardingModal, setShowOnboardingModal] = useState<{ open: boolean, subId: string | null }>({ open: false, subId: null });
  
  // Review Onboarding modal state
  const [showReviewOnboardingModal, setShowReviewOnboardingModal] = useState<{ open: boolean, sub: any | null }>({ open: false, sub: null });
  
  // Review Release modal state
  const [showReviewReleaseModal, setShowReviewReleaseModal] = useState<{ open: boolean, sub: any | null }>({ open: false, sub: null });
  
  // Admin release form state
  const [adminReleaseDate, setAdminReleaseDate] = useState('');
  const [adminTicketPrice, setAdminTicketPrice] = useState('');
  
  useEffect(() => {
    // Prevent browser caching of admin panel
    document.cookie = 'Cache-Control=no-store, no-cache, must-revalidate';
    if (typeof window !== 'undefined') {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-store, no-cache, must-revalidate';
      document.head.appendChild(meta);
    }
  }, []);

  // Initialize tempChecklistSteps when modal opens
  useEffect(() => {
    if (showOnboardingModal.open && showOnboardingModal.subId) {
      const sub = filmSubmissions.find(s => s.id === showOnboardingModal.subId);
      if (sub) {
        const steps = Array.isArray(sub.onboarding_instructions)
          ? sub.onboarding_instructions
          : (sub.onboarding_instructions ? JSON.parse(sub.onboarding_instructions) : []);
        setTempChecklistSteps(steps);
      }
    }
  }, [showOnboardingModal.open, showOnboardingModal.subId]);
  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAuthChecked(false);
    window.location.reload();
  };
  // Move renderContent above JSX usage
  // Remove duplicate renderContent, keep only the main one below (around line 842)
  // Helper for signed URLs
  const getSignedUrl = async (filePath: string, type: string) => {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('films').createSignedUrl(filePath, 1576800000);
    if (signedUrlError || !signedUrlData) {
      alert(`Failed to get ${type} thumbnail URL`);
      setSavingFilm(false);
      return null;
    }
    return signedUrlData.signedUrl;
  };
  // Move renderContent above its usage
  // Admin authentication state
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'tiketxindia@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        window.location.replace('/admin/login');
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [banners, setBanners] = useState<any[]>([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState<any>({
    title: '',
    title_image: '',
    year: '',
    language: '',
    duration: '',
    certificate: '',
    description: '',
    genres: '',
    banner_image: '',
    enabled: true,
    imageFile: null,
    titleImageFile: null,
    enable_title_image: false,
    custom_tag: '',
    trailerFile: null,
    enable_trailer: false,
    filmid: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingTrailer, setUploadingTrailer] = useState(false);
  const [removingImage, setRemovingImage] = useState<'banner' | 'title' | 'trailer' | null>(null);
  const [removingFilmImage, setRemovingFilmImage] = useState<null | 'trailer_image' | 'trailer_thumbnail' | 'vertical' | 'horizontal' | 'fullsize'>(null);
  const [uploadTrailerProgress, setUploadTrailerProgress] = useState<number | null>(null);
  const [deleteTrailerProgress, setDeleteTrailerProgress] = useState<number | null>(null);
  const [deleteTrailerStatus, setDeleteTrailerStatus] = useState<'idle' | 'deleting' | 'deleted'>("idle");

  const [films, setFilms] = useState<any[]>([]);
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [editingFilmId, setEditingFilmId] = useState<string | null>(null);
  const [filmForm, setFilmForm] = useState<any>({
    title: '',
    synopsis: '',
    genres: [],
    trailer_thumbnail: '',
    film_thumbnail_fullsize: '',
    film_thumbnail_vertical: '',
    film_thumbnail_horizontal: '',
    has_ticket: false,
    ticket_price: '',
    ticket_expiry_hours: '',
    platform_fee_percentage: '',
    gst_on_platform_fee: '',
    commission_fee_percentage: '',
    gst_on_commission_fee: '',
    disable_gst: false,
    film_expiry_date: '',
    closure_expiry_date: '',
    runtime: '',
    language: '',
    quality: '',
    has_funding: false,
    release_year: '',
    is_trailer_enabled: false,
    film_playback_id: '',
    custom_tag: '',
    trailer_link: '',
    censor_certificate: '',
    submission_id: '',
    scheduled_release_datetime: '',
    is_published: false,
  });

  // Remove cast_ids and crew_ids from filmForm state
  // Add state for cast and crew selection with roles and character names
  const [cast, setCast] = useState([]); // [{creator_id, character_name, order}]
  const [crew, setCrew] = useState([]); // [{creator_id, role, order}]
  const [creators, setCreators] = useState([]);
  
  // Commission slabs state
  const [commissionSlabs, setCommissionSlabs] = useState([]); // [{min_tickets, max_tickets, commission_percentage}]
  const [newSlab, setNewSlab] = useState({ min_tickets: '', max_tickets: '', commission_percentage: '' });

  // Add state for creator modal and form at the top of AdminPanel
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [creatorForm, setCreatorForm] = useState({ id: null, name: '', profile_image: '', imageFile: null, bio: '' });
  const [savingCreator, setSavingCreator] = useState(false);

  // Fetch creators on mount
  useEffect(() => {
    async function fetchCreators() {
      const { data, error } = await supabase.from('creators').select('id, name, profile_image').order('name');
      if (!error && data) setCreators(data);
    }
    fetchCreators();
  }, []);

  const { toast } = useToast();
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingFilm, setSavingFilm] = useState(false);

  // Add state for image removal confirmation
  const [confirmRemove, setConfirmRemove] = useState<{ type: 'banner' | 'title' | 'trailer' | null, open: boolean }>({ type: null, open: false });
  const [pendingRemove, setPendingRemove] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  // Drag-and-drop state for banners
  const [draggingBannerId, setDraggingBannerId] = useState<string | number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // Update order in DB after drag-and-drop
  async function updateBannerOrder(newBanners: any[]) {
    // Assign new order values to all banners
    const normalized = newBanners.map((banner, idx) => ({ ...banner, order: idx + 1 }));
    setBanners(normalized);
    const updates = normalized.map(b => ({ id: b.id, order: b.order }));
    const { error } = await supabase.from('banners').upsert(updates, { onConflict: 'id' });
    if (!error) {
      toast({
        title: (
          <span className="flex items-center gap-2">
            <CheckCircle className="text-green-500 w-5 h-5" />
            Order updated successfully
          </span>
        ),
        duration: 2500,
      });
      fetchBanners();
    }
  }

  useEffect(() => {
    if (activeTab === 'banners') {
      fetchBanners();
    }
  }, [activeTab]);

  async function fetchBanners(log = false) {
    const { data, error } = await supabase.from('banners').select('*');
    if (!error && data) {
      // Always sort by order, then normalize order values
      const sorted = data.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const normalized = sorted.map((b, i) => ({ ...b, order: i + 1 }));
      if (log) console.log('Fetched banners:', normalized);
      setBanners(normalized);
      // If any order values were changed, update in DB
      const needsUpdate = normalized.some((b, i) => b.order !== sorted[i].order);
      if (needsUpdate) {
        await supabase.from('banners').upsert(normalized.map(b => ({ id: b.id, order: b.order })), { onConflict: 'id' });
      }
      return normalized;
    }
    return null;
  }

  async function fetchFilms() {
    const { data, error } = await supabase.from('films').select('*').order('release_year', { ascending: false });
    if (!error && data) setFilms(data);
  }

  useEffect(() => {
    if (activeTab === 'films') {
      fetchFilms();
      
      // Auto-refresh films every 30 seconds to show updated status
      const interval = setInterval(() => {
        fetchFilms();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Helper to extract storage path from signed URL
  function getStoragePathFromUrl(url: string) {
    // Extract only the path inside the bucket (after 'banners/')
    // Example: https://xyz.supabase.co/storage/v1/object/public/banners/titleImages/filename.png
    // Should return: 'titleImages/filename.png' or 'filename.png'
    const match = url.match(/banners\/(.+?)(\?|$)/);
    return match ? match[1] : null;
  }

  // Helper to extract storage path from signed URL for films bucket
  function getFilmStoragePathFromUrl(url: string) {
    // Example: https://xyz.supabase.co/storage/v1/object/public/films/trailerImages/filename.png
    // Should return: 'trailerImages/filename.png' or 'filename.png'
    const match = url.match(/films\/(.+?)(\?|$)/);
    return match ? match[1] : null;
  }

  // Add Banner trailer upload handler using Mux direct upload
  async function handleBannerTrailerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTrailer(true);
    setUploadTrailerProgress(0);
    try {
      // Remove old trailer from Mux if present (deleteMuxAssetByPlaybackId)
      if (bannerForm.trailerFile && !bannerForm.trailerFile.startsWith('http')) {
        await deleteMuxAssetByPlaybackId(bannerForm.trailerFile);
      }
    // 1. Get Mux direct upload URL from Edge Function
    // TODO: Implement getMuxDirectUploadUrl and assign uploadRes
    // const uploadRes = await getMuxDirectUploadUrl();
    // const url = uploadRes.url;
    // const id = uploadRes.upload_id || uploadRes.id;
    // if (!id) throw new Error('No upload_id returned from Mux upload function');
    // 2. Upload file to Mux
    // await uploadToMux(url, file, (percent) => setUploadTrailerProgress(percent));
    // 3. Poll for asset status and get playback_id
    // setUploadTrailerProgress(100);
  // const playback_id = await pollMuxPlaybackIdEdge(id); // TODO: Provide id from upload logic
      // 4. Save playback_id as the trailer URL (for playback)
  // setBannerForm(f => ({ ...f, trailerFile: playback_id })); // TODO: Provide playback_id from upload logic
    } catch (err) {
      alert('Trailer upload failed: ' + err.message);
    }
    setUploadingTrailer(false);
    setUploadTrailerProgress(null);
  }

  async function handleBannerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setSavingBanner(true);
    let bannerImageUrl = bannerForm.banner_image;
    let titleImageUrl = bannerForm.title_image;
    let trailerUrl = bannerForm.trailerFile;

    try {
      let genresArray = [];
      if (Array.isArray(bannerForm.genres)) {
        genresArray = bannerForm.genres;
      } else if (typeof bannerForm.genres === 'string' && bannerForm.genres.trim() !== '') {
        genresArray = bannerForm.genres.split(',').map((g: string) => g.trim());
      }
      const { imageFile, titleImageFile, trailerFile, ...payload } = {
        ...bannerForm,
        banner_image: bannerImageUrl,
        title_image: titleImageUrl,
        genres: genresArray,
        enabled: !!bannerForm.enabled,
        enable_title_image: !!bannerForm.enable_title_image,
        custom_tag: bannerForm.custom_tag,
        trailerFile: trailerUrl,
        enable_trailer: !!bannerForm.enable_trailer,
        filmid: bannerForm.filmid || null,
      };
      console.log('Banner payload:', payload);
      let error;
      if (editingBannerId) {
        ({ error } = await supabase.from('banners').update(payload).eq('id', editingBannerId));
      } else {
        // Insert new banner at the top: increment all existing orders by 1, then insert new with order=1
        const { data: allBanners, error: fetchErr } = await supabase.from('banners').select('id, order');
        if (!fetchErr && allBanners && allBanners.length > 0) {
          const updates = allBanners.map(b => ({ id: b.id, order: (b.order || 1) + 1 }));
          await supabase.from('banners').upsert(updates, { onConflict: 'id' });
        }
        ({ error } = await supabase.from('banners').insert([{ ...payload, order: 1 }]));
      }
      if (!error) {
        // Wait a short delay to ensure DB is updated and new banner is included
        await new Promise(res => setTimeout(res, 300));
        let bannersFetched = await fetchBanners(true); // pass flag to log
        // If the new banner (order=1) is not at the top, retry fetch after 300ms
        if (!bannersFetched || !bannersFetched[0] || bannersFetched[0].order !== 1) {
          await new Promise(res => setTimeout(res, 300));
          await fetchBanners(true);
        }
        setShowBannerModal(false);
        setBannerForm({
          title: '', title_image: '', year: '', language: '', duration: '', certificate: '', description: '', genres: '', banner_image: '', enabled: true, imageFile: null, titleImageFile: null,
          enable_title_image: false,
          custom_tag: '',
          trailerFile: null,
          enable_trailer: false,
          filmid: '',
        });
        setEditingBannerId(null);
        toast({
          title: (
            <span className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              {editingBannerId ? 'Changes saved successfully.' : 'Added successfully.'}
            </span>
          ),
          duration: 3500,
        });
      } else {
        console.error('Insert error:', error.message, error);
        setErrorModal({ open: true, message: 'Failed to save banner' });
      }
    } finally {
      setSavingBanner(false);
      setUploading(false);
    }
  }

  async function handleDeleteBanner(id: number) {
    if (!window.confirm('Delete this banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (!error) {
      setShowBannerModal(false);
      setSavingBanner(false);
      setUploading(false);
      await fetchBanners();
    }
  }

  function handleEditBanner(banner: any) {
    setBannerForm({
      ...banner,
      genres: Array.isArray(banner.genres) ? banner.genres.join(', ') : banner.genres || '',
      imageFile: null,
      titleImageFile: null,
      enable_title_image: !!banner.enable_title_image,
      custom_tag: banner.custom_tag || '',
      trailerFile: null,
      enable_trailer: !!banner.enable_trailer,
    });
    setEditingBannerId(banner.id);
    setShowBannerModal(true);
  }

  // Remove image handler for both banner and title images
  async function handleRemoveImage(imageType: 'banner' | 'title' | 'trailer') {
    const removeType = confirmRemove.type;
    if (!removeType) return;
    const removeUrl = removeType === 'banner' ? bannerForm.banner_image : removeType === 'title' ? bannerForm.title_image : bannerForm.trailerFile;
    if (!removeUrl) {
      setBannerForm(f => ({
        ...f,
        [removeType === 'banner' ? 'banner_image' : removeType === 'title' ? 'title_image' : 'trailerFile']: null,
      }));
      setPendingRemove(false);
      setConfirmRemove({ type: null, open: false });
      return;
    }
    setPendingRemove(true);
    if (removeType === 'trailer' && removeUrl && !removeUrl.startsWith('http')) {
      setDeleteTrailerProgress(0);
      setDeleteTrailerStatus('deleting');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setDeleteTrailerProgress(Math.min(progress, 90));
      }, 80);
      try {
  await deleteMuxAssetByPlaybackId(removeUrl);
        if (editingBannerId) {
          await supabase.from('banners').update({ trailerFile: null }).eq('id', editingBannerId);
        }
        clearInterval(interval);
        setDeleteTrailerProgress(100);
        setDeleteTrailerStatus('deleted');
        setTimeout(() => {
          setDeleteTrailerProgress(null);
          setDeleteTrailerStatus('idle');
        }, 1200);
        toast({
          title: "Trailer removed successfully. This change is already saved.",
          duration: 3500,
        });
      } catch (err) {
        clearInterval(interval);
        setDeleteTrailerProgress(null);
        setDeleteTrailerStatus('idle');
        toast({
          title: "Failed to remove trailer.",
          description: err.message,
          variant: "destructive",
        });
        setPendingRemove(false);
        setConfirmRemove({ type: null, open: false });
        return;
      }
    }
    if (removeUrl.startsWith('http') && removeUrl.includes('supabase.co')) {
      const path = getStoragePathFromUrl(removeUrl);
      if (path) {
        setRemovingImage(removeType);
        const { error } = await supabase.storage.from('banners').remove([path]);
        setRemovingImage(null);
        if (!error) {
          toast({
            title: removeType === 'title'
              ? "Title image removed successfully. This change is already saved."
              : removeType === 'banner'
                ? "Banner image removed successfully. This change is already saved."
                : "Image removed successfully. This change is already saved.",
            duration: 3500,
          });
        } else {
          toast({
            title: "Failed to remove image.",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
    setBannerForm(f => ({
      ...f,
      [removeType === 'banner' ? 'banner_image' : removeType === 'title' ? 'title_image' : 'trailerFile']: null,
    }));
    setPendingRemove(false);
    setConfirmRemove({ type: null, open: false });
  }

  async function handleFilmSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingFilm(true);
    let trailerThumbUrl = filmForm.trailer_thumbnail;
    let fullsizeThumbUrl = filmForm.film_thumbnail_fullsize;
    let verticalThumbUrl = filmForm.film_thumbnail_vertical;
    let horizontalThumbUrl = filmForm.film_thumbnail_horizontal;
    let releaseYear = filmForm.release_year;
    let createdDate = filmForm.created_date;
    let modifiedDate = filmForm.modified_date;
    let videoTrailer = filmForm.trailerFile;

    // Fix trailer_thumbnail upload logic to ensure it uploads to 'films/trailerImages' and value is saved in 'trailer_thumbnail'
    if (filmForm.trailerThumbFile) {
      const file = filmForm.trailerThumbFile;
      const fileExt = file.name.split('.').pop();
      const filePath = `trailerImages/${Date.now()}_thumb.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('films').upload(filePath, file);
      if (uploadError) {
        alert('Trailer thumbnail upload failed');
        setSavingFilm(false);
        return;
      }
      // Ensure this code is inside an async function
      const getSignedUrl = async (filePath: string, type: string) => {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('films').createSignedUrl(filePath, 1576800000);
        if (signedUrlError || !signedUrlData) {
          alert(`Failed to get ${type} thumbnail URL`);
          setSavingFilm(false);
          return null;
        }
        return signedUrlData.signedUrl;
      };
  trailerThumbUrl = await getSignedUrl(filePath, 'trailer');
    }
    // Upload fullsize thumbnail
    if (filmForm.fullsizeThumbFile) {
      const file = filmForm.fullsizeThumbFile;
      const fileExt = file.name.split('.').pop();
      const filePath = `fullsizeThumbs/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('films').upload(filePath, file);
      if (uploadError) {
        alert('Fullsize thumbnail upload failed');
        setSavingFilm(false);
        return;
      }
  fullsizeThumbUrl = await getSignedUrl(filePath, 'fullsize');
    }
    // Upload vertical thumbnail
    if (filmForm.verticalThumbFile) {
      const file = filmForm.verticalThumbFile;
      const fileExt = file.name.split('.').pop();
      const filePath = `verticalThumbs/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('films').upload(filePath, file);
      if (uploadError) {
        alert('Vertical thumbnail upload failed');
        setSavingFilm(false);
        return;
      }
  verticalThumbUrl = await getSignedUrl(filePath, 'vertical');
    }
    // Upload horizontal thumbnail
    if (filmForm.horizontalThumbFile) {
      const file = filmForm.horizontalThumbFile;
      const fileExt = file.name.split('.').pop();
      const filePath = `horizontalThumbs/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('films').upload(filePath, file);
      if (uploadError) {
        alert('Horizontal thumbnail upload failed');
        setSavingFilm(false);
        return;
      }
  horizontalThumbUrl = await getSignedUrl(filePath, 'horizontal');
    }

    // Prepare genres as array
    let genresArray = [];
    if (Array.isArray(filmForm.genres)) {
      genresArray = filmForm.genres;
    } else if (typeof filmForm.genres === 'string' && filmForm.genres.trim() !== '') {
      genresArray = filmForm.genres.split(',').map((g: string) => g.trim());
    }

    const runtimeValue = filmForm.runtime === "" ? null : Number(filmForm.runtime);
    const ticketPriceValue = filmForm.ticket_price === "" ? null : Number(filmForm.ticket_price);
    const ticketExpiryHoursValue = filmForm.ticket_expiry_hours === "" ? null : Number(filmForm.ticket_expiry_hours);
    
    // Process financial fields
    const platformFeeValue = filmForm.platform_fee_percentage === "" ? null : Number(filmForm.platform_fee_percentage);
    const gstOnPlatformFeeValue = filmForm.disable_gst ? 0 : (filmForm.gst_on_platform_fee === "" ? null : Number(filmForm.gst_on_platform_fee));
    const commissionFeeValue = filmForm.commission_fee_percentage === "" ? null : Number(filmForm.commission_fee_percentage);
    const gstOnCommissionFeeValue = filmForm.disable_gst ? 0 : (filmForm.gst_on_commission_fee === "" ? null : Number(filmForm.gst_on_commission_fee));

    // Determine publication status based on scheduling rules
    let shouldBePublished = filmForm.is_published;
    let scheduledDateTimeUTC = filmForm.scheduled_release_datetime;
    
    if (filmForm.scheduled_release_datetime) {
      // The datetime-local input gives us the time as the user entered it
      // We need to treat this as IST time and convert to UTC for storage
      
      // Parse the datetime string as if it's in IST
      const [datePart, timePart] = filmForm.scheduled_release_datetime.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      // Create a UTC date object, treating the input as if it were UTC
      // This gives us a "neutral" time that we can then adjust
      const neutralDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      
      // Now convert from IST to UTC by subtracting 5 hours 30 minutes (IST is UTC+5:30)
      const utcDate = new Date(neutralDate.getTime() - (5.5 * 60 * 60 * 1000));
      scheduledDateTimeUTC = utcDate.toISOString();
      
      // For comparison, we need to compare with IST time
      // Get current time in IST
      const nowUTC = new Date();
      const nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));
      
      // If scheduled for future (in IST), override is_published to false
      if (neutralDate > nowIST) {
        shouldBePublished = false;
      }
      // If scheduled for past/present (in IST) and not manually set to unpublished, auto-publish
      else if (neutralDate <= nowIST && filmForm.is_published !== false) {
        shouldBePublished = true;
      }
    }

    // Build payload
    const rawPayload = {
      ...filmForm,
      scheduled_release_datetime: scheduledDateTimeUTC,
      genres: genresArray,
      trailer_thumbnail: trailerThumbUrl,
      film_thumbnail_fullsize: fullsizeThumbUrl,
      film_thumbnail_vertical: verticalThumbUrl,
      film_thumbnail_horizontal: horizontalThumbUrl,
      film_playback_id: filmForm.film_playback_id,
      custom_tag: filmForm.custom_tag,
      language: typeof filmForm.language === 'string' ? filmForm.language : Array.isArray(filmForm.language) ? filmForm.language.join(', ') : '',
      runtime: runtimeValue,
      ticket_price: ticketPriceValue,
      ticket_expiry_hours: ticketExpiryHoursValue,
      platform_fee_percentage: platformFeeValue,
      gst_on_platform_fee: gstOnPlatformFeeValue,
      commission_fee_percentage: commissionFeeValue,
      gst_on_commission_fee: gstOnCommissionFeeValue,
      disable_gst: filmForm.disable_gst,
      is_published: shouldBePublished,
    };
    // Remove file-related fields not in DB
    const {
      fullsizeThumbFile,
      trailerThumbFile,
      horizontalThumbFile,
      trailerFile,
      verticalThumbFile,
      ...payload
    } = rawPayload;

    // Clean up date fields - convert empty strings to null for database compatibility
    if (payload.scheduled_release_datetime === '') {
      payload.scheduled_release_datetime = null;
    }
    if (payload.closure_expiry_date === '') {
      payload.closure_expiry_date = null;
    }

    console.log('Film payload:', payload);

    let error;
    let filmId = editingFilmId;
    if (editingFilmId) {
      ({ error } = await supabase.from('films').update(payload).eq('id', editingFilmId));
    } else {
      const { data, error: insertError } = await supabase.from('films').insert([payload]).select('id').single();
      error = insertError;
      if (data && data.id) filmId = data.id;
    }
    if (!error && filmId) {
      // Remove previous mappings for this film
      await supabase.from('creator_movie_map').delete().eq('movie_id', filmId);
      // Upsert cast
      for (const entry of cast) {
        if (entry.creator_id) {
          await supabase.from('creator_movie_map').insert({
            creator_id: entry.creator_id,
            movie_id: filmId,
            role: 'Actor',
            character_name: entry.character_name || null,
            order: entry.order ? Number(entry.order) : null,
          });
        }
      }
      // Upsert crew
      for (const entry of crew) {
        if (entry.creator_id && entry.role) {
          await supabase.from('creator_movie_map').insert({
            creator_id: entry.creator_id,
            movie_id: filmId,
            role: entry.role,
            character_name: null,
            order: entry.order ? Number(entry.order) : null,
          });
        }
      }

      // Handle commission slabs
      try {
        // Remove existing commission slabs for this film
        const { error: deleteError } = await supabase.from('commission_slabs').delete().eq('film_id', filmId);
        if (deleteError) {
          console.error('Error deleting existing commission slabs:', deleteError);
        }
        
        // Insert new commission slabs
        if (commissionSlabs.length > 0) {
          console.log('Raw commission slabs from state:', JSON.stringify(commissionSlabs, null, 2));
          
          const slabsToInsert = commissionSlabs.map(slab => ({
            film_id: filmId,
            min_tickets: parseInt(slab.min_tickets),
            max_tickets: slab.max_tickets ? parseInt(slab.max_tickets) : null,
            commission_percentage: parseFloat(slab.commission_percentage)
          }));
          
          console.log('Commission slabs to insert:', JSON.stringify(slabsToInsert, null, 2));
          
          const { error: slabError } = await supabase
            .from('commission_slabs')
            .insert(slabsToInsert);
            
          if (slabError) {
            console.error('Error saving commission slabs:', slabError);
            toast({
              title: "Warning",
              description: "Film saved but commission slabs could not be saved: " + slabError.message,
              variant: "destructive",
            });
          }
        }
      } catch (slabErr) {
        console.error('Commission slab operation failed:', slabErr);
        toast({
          title: "Warning", 
          description: "Film saved but commission slabs could not be saved",
          variant: "destructive",
        });
      }

      // Log audit trail for scheduling events
      try {
        const currentTime = new Date().toISOString();
        
        // Check if this is a new scheduling event
        if (filmForm.scheduled_release_datetime && !shouldBePublished) {
          const action = editingFilmId ? 'rescheduled' : 'scheduled';
          await supabase.from('film_events').insert({
            film_id: filmId,
            action: action,
            event_datetime: currentTime,
            scheduled_for: scheduledDateTimeUTC,
            metadata: {
              film_title: filmForm.title,
              scheduled_via: 'admin_panel'
            }
          });
        } else if (editingFilmId && !filmForm.scheduled_release_datetime) {
          // Film scheduling was removed
          await supabase.from('film_events').insert({
            film_id: filmId,
            action: 'unscheduled',
            event_datetime: currentTime,
            metadata: {
              film_title: filmForm.title,
              unscheduled_via: 'admin_panel'
            }
          });
        }
      } catch (auditError) {
        console.error('Failed to log audit event:', auditError);
        // Don't fail the film save, just log the error
      }

      // Handle scheduling for the film
      try {
        if (filmForm.scheduled_release_datetime && !shouldBePublished) {
          // Film is scheduled for future - create/update the scheduled job
          const { data: scheduleResult, error: scheduleError } = await supabase
            .rpc('schedule_film_publication', { film_id: filmId });
          
          if (scheduleError) {
            console.error('Error scheduling film publication:', scheduleError);
            toast({
              title: "Warning",
              description: "Film saved but scheduling failed. Please contact support.",
              variant: "destructive",
            });
          } else {
            console.log('Film publication scheduled:', scheduleResult);
          }
        } else if (editingFilmId) {
          // Film is being updated and no future schedule - unschedule any existing job
          const { data: unscheduletResult, error: unscheduleError } = await supabase
            .rpc('unschedule_film_publication', { film_id: filmId });
          
          if (unscheduleError) {
            console.error('Error unscheduling film publication:', unscheduleError);
          } else {
            console.log('Film publication unscheduled:', unscheduletResult);
          }
        }
      } catch (scheduleErr) {
        console.error('Scheduling operation failed:', scheduleErr);
      }

      // Handle closure scheduling for the film
      try {
        if (filmForm.closure_expiry_date) {
          // Film has closure date - create/update the scheduled closure job
          const { data: closureResult, error: closureError } = await supabase
            .rpc('schedule_film_closure', { film_id: filmId });
          
          if (closureError) {
            console.error('Error scheduling film closure:', closureError);
            toast({
              title: "Warning",
              description: "Film saved but closure scheduling failed. Please contact support.",
              variant: "destructive",
            });
          } else {
            console.log('Film closure scheduled:', closureResult);
          }
        } else if (editingFilmId) {
          // Film is being updated and no closure date - unschedule any existing closure job
          const { data: unscheduleClosureResult, error: unscheduleClosureError } = await supabase
            .rpc('unschedule_film_closure', { film_id: filmId });
          
          if (unscheduleClosureError) {
            console.error('Error unscheduling film closure:', unscheduleClosureError);
          } else {
            console.log('Film closure unscheduled:', unscheduleClosureResult);
          }
        }
      } catch (closureErr) {
        console.error('Closure scheduling operation failed:', closureErr);
      }
      setShowFilmModal(false);
      setFilmForm({
        title: '',
        synopsis: '',
        genres: [],
        trailer_thumbnail: '',
        film_thumbnail_fullsize: '',
        film_thumbnail_vertical: '',
        film_thumbnail_horizontal: '',
        has_ticket: false,
        ticket_price: '',
        ticket_expiry_hours: '',
        platform_fee_percentage: '',
        gst_on_platform_fee: '',
        commission_fee_percentage: '',
        gst_on_commission_fee: '',
        disable_gst: false,
        film_expiry_date: '',
        closure_expiry_date: '',
        runtime: '',
        language: '',
        quality: '',
        has_funding: false,
        release_year: '',
        is_trailer_enabled: false,
        film_playback_id: '',
        custom_tag: '',
        trailer_link: '',
        censor_certificate: '',
        submission_id: '',
        scheduled_release_datetime: '',
        is_published: false,
      });
      setCast([]);
      setCrew([]);
      setCommissionSlabs([]);
      setNewSlab({ min_tickets: '', max_tickets: '', commission_percentage: '' });
      setEditingFilmId(null);
      fetchFilms();
      toast({
        title: (
          <span className="flex items-center gap-2">
            <CheckCircle className="text-green-500 w-5 h-5" />
            {editingFilmId ? 'Changes saved successfully.' : 'Added successfully.'}
          </span>
        ),
        duration: 3500,
      });
    } else if (error) {
      alert('Failed to save film');
    }
    setSavingFilm(false);
  }

  async function handleDeleteFilm(id: string) {
    if (!window.confirm('Delete this film?')) return;
    const { error } = await supabase.from('films').delete().eq('id', id);
    if (!error) fetchFilms();
  }

  async function handleEditFilm(film: any) {
    // Fetch the latest film data to ensure we have current publication status
    const { data: latestFilm, error } = await supabase
      .from('films')
      .select('*')
      .eq('id', film.id)
      .single();
    
    const filmData = latestFilm || film;
    
    setFilmForm({
      ...filmData,
      title: filmData.title ?? '',
      synopsis: filmData.synopsis ?? '',
      genres: Array.isArray(filmData.genres) ? filmData.genres.join(', ') : (filmData.genres ?? ''),
      ticket_expiry_hours: filmData.ticket_expiry_hours ? filmData.ticket_expiry_hours.toString() : '',
      platform_fee_percentage: filmData.platform_fee_percentage ? filmData.platform_fee_percentage.toString() : '',
      gst_on_platform_fee: filmData.disable_gst ? '0' : (filmData.gst_on_platform_fee ? filmData.gst_on_platform_fee.toString() : ''),
      commission_fee_percentage: filmData.commission_fee_percentage ? filmData.commission_fee_percentage.toString() : '',
      gst_on_commission_fee: filmData.disable_gst ? '0' : (filmData.gst_on_commission_fee ? filmData.gst_on_commission_fee.toString() : ''),
      trailer_thumbnail: filmData.trailer_thumbnail ?? '',
      film_thumbnail_fullsize: filmData.film_thumbnail_fullsize ?? '',
      film_thumbnail_vertical: filmData.film_thumbnail_vertical ?? '',
      film_thumbnail_horizontal: filmData.film_thumbnail_horizontal ?? '',
      trailerThumbFile: null,
      fullsizeThumbFile: null,
      horizontalThumbFile: null,
      film_playback_id: filmData.film_playback_id ?? '',
      custom_tag: filmData.custom_tag ?? '',
      trailerFile: null,
      language: filmData.language ?? '',
      submission_id: filmData.submission_id ?? '',
      scheduled_release_datetime: filmData.scheduled_release_datetime ? 
        (() => {
          // Convert UTC from database back to IST for display
          const utcDate = new Date(filmData.scheduled_release_datetime);
          
          // Add 5.5 hours to convert UTC back to IST
          const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
          
          // Format as YYYY-MM-DDTHH:MM for datetime-local input
          const year = istDate.getUTCFullYear();
          const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(istDate.getUTCDate()).padStart(2, '0');
          const hours = String(istDate.getUTCHours()).padStart(2, '0');
          const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
          
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        })() : '',
      closure_expiry_date: filmData.closure_expiry_date ?? '',
      is_published: filmData.is_published ?? false,
    });
    setEditingFilmId(filmData.id);
    
    // Load commission slabs for this film
    const { data: slabs } = await supabase
      .from('commission_slabs')
      .select('*')
      .eq('film_id', filmData.id)
      .order('min_tickets', { ascending: true });
    
    if (slabs) {
      setCommissionSlabs(slabs.map(slab => ({
        id: slab.id,
        min_tickets: slab.min_tickets.toString(),
        max_tickets: slab.max_tickets ? slab.max_tickets.toString() : '',
        commission_percentage: slab.commission_percentage.toString()
      })));
    }
    
    fetchFilmSubmissions();
    setShowFilmModal(true);
  }

  // Remove image handler for film images
  async function handleRemoveFilmImage(type: 'trailer_thumbnail' | 'vertical' | 'horizontal' | 'fullsize') {
    let url = '';
    let field = '';
    if (type === 'trailer_thumbnail') {
      url = filmForm.trailer_thumbnail;
      field = 'trailer_thumbnail';
    } else if (type === 'vertical') {
      url = filmForm.film_thumbnail_vertical;
      field = 'film_thumbnail_vertical';
    } else if (type === 'horizontal') {
      url = filmForm.film_thumbnail_horizontal;
      field = 'film_thumbnail_horizontal';
    } else if (type === 'fullsize') {
      url = filmForm.film_thumbnail_fullsize;
      field = 'film_thumbnail_fullsize';
    }
    if (!url) return;
    const path = getFilmStoragePathFromUrl(url);
    if (path) {
      setRemovingFilmImage(type);
      const { error } = await supabase.storage.from('films').remove([path]);
      setRemovingFilmImage(null);
      if (error) {
        alert('Failed to delete from storage: ' + error.message);
        return;
      }
    }
    setFilmForm(f => ({ ...f, [field]: null }));
  }

  const tabs = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
  { id: 'banners', label: 'Homepage Banners', icon: Image },
  { id: 'films', label: 'Films', icon: Film },
  { id: 'sections', label: 'Homepage Sections', icon: Settings },
  { id: 'creators', label: 'Manage Creators', icon: Users },
  { id: 'submissions', label: 'Film Submissions', icon: Ticket },
  { id: 'sales', label: 'Viewers & Sales', icon: BarChart3 },
  { id: 'payouts', label: 'Creator Payouts', icon: DollarSign }
  ];
  // State for film submissions
  const [filmSubmissions, setFilmSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Function to fetch film submissions
  async function fetchFilmSubmissions() {
    setLoadingSubmissions(true);
    try {
      const { data, error } = await supabase
        .from('film_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (!error && data) {
        setFilmSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching film submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'submissions') {
      setLoadingSubmissions(true);
      supabase.from('film_submissions').select('*').order('submitted_at', { ascending: false })
        .then(async ({ data, error }) => {
          if (!error && data) {
            // Auto-advance/revert between onboarding and review_onboarding based on payment status
            const updatedData = [];
            let autoAdvancedCount = 0;
            let autoRevertedCount = 0;
            
            for (const submission of data) {
              if (submission.status_stage === 'onboarding' && submission.onboarding_fee_paid === true) {
                // Automatically move to review_onboarding stage
                const { error: updateError } = await supabase
                  .from('film_submissions')
                  .update({ status_stage: 'review_onboarding' })
                  .eq('id', submission.id);
                
                if (!updateError) {
                  // Update the local data to reflect the change
                  updatedData.push({ ...submission, status_stage: 'review_onboarding' });
                  autoAdvancedCount++;
                } else {
                  console.error('Failed to auto-advance submission:', updateError);
                  updatedData.push(submission);
                }
              } else if (submission.status_stage === 'review_onboarding' && (submission.onboarding_fee_paid === false || submission.onboarding_fee_paid === null)) {
                // Automatically revert to onboarding stage
                const { error: updateError } = await supabase
                  .from('film_submissions')
                  .update({ status_stage: 'onboarding' })
                  .eq('id', submission.id);
                
                if (!updateError) {
                  // Update the local data to reflect the change
                  updatedData.push({ ...submission, status_stage: 'onboarding' });
                  autoRevertedCount++;
                } else {
                  console.error('Failed to auto-revert submission:', updateError);
                  updatedData.push(submission);
                }
              } else {
                updatedData.push(submission);
              }
            }
            
            // Show notifications for auto-actions
            if (autoAdvancedCount > 0) {
              toast({
                title: 'Auto-advancement completed',
                description: `${autoAdvancedCount} submission(s) automatically moved to Review Onboarding stage after payment completion.`,
                variant: 'default'
              });
            }
            
            if (autoRevertedCount > 0) {
              toast({
                title: 'Auto-reversion completed',
                description: `${autoRevertedCount} submission(s) automatically moved back to Onboarding stage after payment reversal.`,
                variant: 'default'
              });
            }
            
            setFilmSubmissions(updatedData);
          }
          setLoadingSubmissions(false);
        });
    }
  }, [activeTab, toast]);

  const sections = [
    { id: 1, name: 'Trending Now', filmCount: 8, order: 1 },
    { id: 2, name: 'Director\'s Picks', filmCount: 5, order: 2 },
    { id: 3, name: 'Regional Favourites', filmCount: 12, order: 3 }
  ];

  // Main renderContent function (only one definition)
  const renderContent = () => {
    switch (activeTab) {
      case 'submissions':
        const stages = [
          { key: 'submission', label: 'Submission', color: 'bg-blue-500' },
          { key: 'review_submission', label: 'Review Submission', color: 'bg-blue-300' },
          { key: 'onboarding', label: 'Onboarding', color: 'bg-purple-500' },
          { key: 'review_onboarding', label: 'Review Onboarding', color: 'bg-purple-300' },
          { key: 'release', label: 'Release', color: 'bg-yellow-500' },
          { key: 'review_release', label: 'Review Release', color: 'bg-yellow-300' },
          { key: 'release_scheduled', label: 'Release Scheduled', color: 'bg-orange-500' },
          { key: 'sales', label: 'Sales Dashboard', color: 'bg-green-500' },
          { key: 'closure', label: 'Set Closure', color: 'bg-gray-500' },
        ];

        async function handleStageChange(subId, nextStage) {
          // Allow advancement if UI control is present (button is rendered)
          const sub = filmSubmissions.find(s => s.id === subId);
          const currentStageIdx = stages.findIndex(s => s.key === sub.status_stage);
          const allowed = true; // UI controls only render when allowed
          if (!allowed) {
            alert('Advancement only allowed at review checkpoints.');
            return;
          }
          const { error } = await supabase.from('film_submissions').update({ status_stage: nextStage }).eq('id', subId);
          if (error) {
            alert('Failed to update status: ' + error.message);
            console.error('Supabase update error:', error);
            return;
          }
          setFilmSubmissions(filmSubmissions => filmSubmissions.map(sub => sub.id === subId ? { ...sub, status_stage: nextStage } : sub));
        }

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Film Submissions</h2>
            {loadingSubmissions ? (
              <div className="text-center py-8 text-lg text-gray-400">Loading submissions...</div>
            ) : filmSubmissions.length === 0 ? (
              <div className="text-center py-8 text-lg text-gray-400">No submissions found.</div>
            ) : (
              <div className="flex flex-col gap-8">
                {filmSubmissions.map(sub => {
                  const currentStageIdx = stages.findIndex(s => s.key === sub.status_stage);
                  return (
                    <div key={sub.id} className="relative px-8 py-10 rounded-3xl bg-gradient-to-br from-black/90 via-black/70 to-tiketx-blue/20 border border-white/10 shadow-2xl backdrop-blur-xl" style={{boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45), 0 1.5px 8px 0 rgba(30,64,175,0.12)'}}>
                      {/* Film title and submitter info at top */}
                      <div className="mb-10">
                        <h3 className="font-extrabold text-3xl mb-2 text-blue-300 drop-shadow-xl tracking-tight">{sub.film_title}</h3>
                        <div className="text-lg text-gray-200 font-medium">Submitted by: <span className="font-bold text-white/95">{sub.name}</span> <span className="text-xs text-gray-400">({sub.email})</span></div>
                      </div>
                      {/* Timeline and controls */}
                      <div className="flex flex-col gap-10 md:gap-8">
                        <div className="flex flex-row items-center justify-center relative z-10 mb-10 gap-0">
                          {stages.map((stage, idx) => (
                            <div key={stage.key} className="flex flex-col items-center flex-1 min-w-[110px] relative">
                              <div className="flex flex-col items-center w-full relative">
                                {/* Review Submission stage dot click handler */}
                                {stage.key === 'review_submission' && (
                                  <button
                                    className={`absolute w-10 h-10 top-0 left-1/2 -translate-x-1/2 z-20 bg-transparent cursor-pointer`}
                                    style={{ outline: 'none', border: 'none' }}
                                    onClick={() => setShowReviewModal({ open: true, sub })}
                                    aria-label="Review Submission"
                                  />
                                )}
                                {stage.key === 'onboarding' && (
                                  <button
                                    className={`absolute w-10 h-10 top-0 left-1/2 -translate-x-1/2 z-20 bg-transparent cursor-pointer`}
                                    style={{ outline: 'none', border: 'none' }}
                                    onClick={() => setShowOnboardingModal({ open: true, subId: sub.id })}
                                    aria-label="Edit onboarding instructions"
                                  />
                                )}
                                {stage.key === 'review_onboarding' && (
                                  <button
                                    className={`absolute w-10 h-10 top-0 left-1/2 -translate-x-1/2 z-20 bg-transparent cursor-pointer`}
                                    style={{ outline: 'none', border: 'none' }}
                                    onClick={() => setShowReviewOnboardingModal({ open: true, sub })}
                                    aria-label="Review Onboarding"
                                  />
                                )}
                                {/* Connecting line to next dot, rendered behind the dot */}
                                {idx < stages.length - 1 && (
                                  <div className="absolute top-5 left-1/2 w-[calc(100%-2.5rem)] h-2 -z-10 flex items-center pointer-events-none" style={{ marginLeft: '20px' }}>
                                    <div className={`h-2 w-full rounded-full ${idx < currentStageIdx ? 'bg-gradient-to-r from-tiketx-violet via-tiketx-pink to-tiketx-blue opacity-80' : 'bg-gray-700 opacity-40'} transition-all duration-300`} />
                                  </div>
                                )}
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-300 shadow-xl bg-gradient-to-br from-black/80 to-tiketx-blue/30 ${idx < currentStageIdx ? stage.color + ' ring-4 ring-tiketx-pink/30' : idx === currentStageIdx ? stage.color + ' ring-4 ring-tiketx-pink/30 animate-pulse' : 'border-gray-700'}`}
                                     style={idx === currentStageIdx ? { boxShadow: '0 0 16px 4px #a78bfa, 0 0 32px 8px #6366f1' } : {}}>
                                  {stage.key === 'review_submission' && sub.status_stage === 'submission_rejected' ? (
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-red-700 to-red-800 shadow-[0_2px_8px_0_rgba(255,0,0,0.25)] border border-red-400/60">
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 6L14 14M14 6L6 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                  ) : idx < currentStageIdx ? (
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-[0_2px_8px_0_rgba(0,255,128,0.25)] border border-green-400/60" style={{boxShadow:'0 2px 8px 0 rgba(0,255,128,0.25), 0 0 0 2px #3be87a'}}>
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 10.5L9 14.5L15 7.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                  ) : idx === currentStageIdx ? (
                                    <span className="w-5 h-5 rounded-full block bg-white/90 shadow-lg" />
                                  ) : null}
                                </div>
                                <span className={`text-base font-semibold tracking-wide text-center mt-2 ${idx === currentStageIdx ? 'text-tiketx-blue drop-shadow-lg' : 'text-gray-400'}`}>{stage.label}</span>
                                {/* Show admin review controls at review checkpoints */}
                                {/* No review action buttons here; only use sidebar controls */}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Controls */}
                        <div className="flex flex-col gap-4 min-w-[180px] items-end">
                          <div className="flex flex-row gap-2 items-center">
                            {currentStageIdx < stages.length - 1 && (
                              <button
                                className="bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink px-4 py-2 rounded-lg text-sm font-bold text-white shadow hover:scale-105 transition-all duration-200"
                                onClick={() => {
                                  // If moving from review_release to release_scheduled, show modal
                                  if (sub.status_stage === 'review_release' && stages[currentStageIdx + 1].key === 'release_scheduled') {
                                    // Initialize form state with current values
                                    setAdminReleaseDate(sub.scheduled_release_date?.split('T')[0] || '');
                                    setAdminTicketPrice(sub.final_ticket_price?.toString() || '');
                                    setShowReviewReleaseModal({ open: true, sub });
                                  } else {
                                    handleStageChange(sub.id, stages[currentStageIdx + 1].key);
                                  }
                                }}
                              >
                                Move to {stages[currentStageIdx + 1].label}
                              </button>
                            )}
                            {currentStageIdx > 0 && (
                              <button
                                className="bg-gray-900/80 px-4 py-2 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-700/80 shadow transition-all duration-200"
                                onClick={() => handleStageChange(sub.id, stages[currentStageIdx - 1].key)}
                              >
                                Revert to {stages[currentStageIdx - 1].label}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Review Submission Modal */}
                {showReviewModal.open && showReviewModal.sub && (
                  <ReviewSubmissionModal
                    open={showReviewModal.open}
                    onClose={() => setShowReviewModal({ open: false, sub: null })}
                    submission={{
                      film_title: showReviewModal.sub.film_title,
                      name: showReviewModal.sub.name,
                      email: showReviewModal.sub.email,
                      production_house_name: showReviewModal.sub.production_house_name,
                      phone: showReviewModal.sub.phone,
                      country: showReviewModal.sub.country,
                      expected_ticket_price: showReviewModal.sub.expected_ticket_price,
                      preview_link: showReviewModal.sub.preview_link,
                      planned_release_date: showReviewModal.sub.planned_release_date,
                      message: showReviewModal.sub.message,
                      submitted_at: showReviewModal.sub.submitted_at,
                      synopsis: showReviewModal.sub.synopsis,
                      submission_rejection_reason: showReviewModal.sub.submission_rejection_reason,
                    }}
                    onApprove={async () => {
                      await supabase.from('film_submissions').update({ status_stage: 'onboarding' }).eq('id', showReviewModal.sub.id);
                      setShowReviewModal({ open: false, sub: null });
                      setFilmSubmissions(filmSubmissions => filmSubmissions.map(s => s.id === showReviewModal.sub.id ? { ...s, status_stage: 'onboarding' } : s));
                    }}
                    onReject={async (rejectionReason) => {
                      await supabase.from('film_submissions').update({ status_stage: 'submission_rejected', submission_rejection_reason: rejectionReason }).eq('id', showReviewModal.sub.id);
                      setShowReviewModal({ open: false, sub: null });
                      setFilmSubmissions(filmSubmissions => filmSubmissions.map(s => s.id === showReviewModal.sub.id ? { ...s, status_stage: 'submission_rejected', submission_rejection_reason: rejectionReason } : s));
                    }}
                  />
                )}
                
                {/* Onboarding Modal */}
                {showOnboardingModal.open && showOnboardingModal.subId && (
                  <Dialog open={showOnboardingModal.open} onOpenChange={(open) => !open && setShowOnboardingModal({ open: false, subId: null })}>
                    <DialogContent className="w-full max-w-3xl max-h-[80vh] overflow-y-auto p-8 rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white border border-gray-700 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
                          Set Onboarding Instructions
                        </DialogTitle>
                        <DialogDescription className="text-gray-300 mb-6">
                          Create or edit the onboarding checklist for <span className="font-bold text-white">{filmSubmissions.find(s => s.id === showOnboardingModal.subId)?.film_title}</span>.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-lg font-bold text-tiketx-blue mb-4">Checklist Steps</label>
                          <OnboardingChecklistEditor
                            steps={tempChecklistSteps}
                            onChange={steps => setTempChecklistSteps(steps)}
                          />
                        </div>
                        
                        <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowOnboardingModal({ open: false, subId: null })}
                            className="px-6 py-2 rounded-xl bg-gray-600 text-white font-bold shadow hover:bg-gray-800 transition"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              await supabase.from('film_submissions').update({ onboarding_instructions: JSON.stringify(tempChecklistSteps) }).eq('id', showOnboardingModal.subId);
                              setFilmSubmissions(filmSubmissions => filmSubmissions.map(s => s.id === showOnboardingModal.subId ? { ...s, onboarding_instructions: tempChecklistSteps } : s));
                              setShowOnboardingModal({ open: false, subId: null });
                            }}
                            className="px-6 py-2 rounded-xl bg-tiketx-blue text-white font-bold shadow hover:bg-tiketx-violet transition"
                          >
                            Save Instructions
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* Review Onboarding Modal */}
                {showReviewOnboardingModal.open && showReviewOnboardingModal.sub && (
                  <Dialog open={showReviewOnboardingModal.open} onOpenChange={(open) => !open && setShowReviewOnboardingModal({ open: false, sub: null })}>
                    <DialogContent className="w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white border border-gray-700 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-blue-600 to-black bg-clip-text text-transparent drop-shadow-lg tracking-tight">
                          Review Onboarding Submission
                        </DialogTitle>
                        <DialogDescription className="text-gray-300 mb-6">
                          Review the onboarding details for <span className="font-bold text-white">{showReviewOnboardingModal.sub.film_title}</span>.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Film className="w-5 h-5 text-blue-400" />
                              <span className="font-semibold text-blue-300">Film Title:</span>
                              <span className="text-white">{showReviewOnboardingModal.sub.film_title}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-400" />
                              <span className="font-semibold text-blue-300">Submitter:</span>
                              <span className="text-white">{showReviewOnboardingModal.sub.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-blue-400" />
                              <span className="font-semibold text-blue-300">Terms Agreed:</span>
                              <span className={`font-semibold ${showReviewOnboardingModal.sub.agreed_terms ? 'text-green-400' : 'text-red-400'}`}>
                                {showReviewOnboardingModal.sub.agreed_terms ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-blue-300">Onboarding Fee:</span>
                              <span className="text-white">₹{showReviewOnboardingModal.sub.onboarding_fee || 'Not set'}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-blue-400" />
                              <span className="font-semibold text-blue-300">Fee Paid:</span>
                              <span className={`font-semibold ${showReviewOnboardingModal.sub.onboarding_fee_paid ? 'text-green-400' : 'text-red-400'}`}>
                                {showReviewOnboardingModal.sub.onboarding_fee_paid ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            {showReviewOnboardingModal.sub.onboarding_fee_paid_datetime && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-300">Payment Date:</span>
                                <span className="text-white">
                                  {new Date(showReviewOnboardingModal.sub.onboarding_fee_paid_datetime).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {showReviewOnboardingModal.sub.drive_link && (
                          <div className="space-y-2">
                            <span className="font-semibold text-blue-300">Drive Link:</span>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <a 
                                href={showReviewOnboardingModal.sub.drive_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline break-all"
                              >
                                {showReviewOnboardingModal.sub.drive_link}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {showReviewOnboardingModal.sub.onboarding_instructions && (
                          <div className="space-y-2">
                            <span className="font-semibold text-blue-300">Onboarding Instructions:</span>
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              {(() => {
                                try {
                                  const instructions = typeof showReviewOnboardingModal.sub.onboarding_instructions === 'string' 
                                    ? JSON.parse(showReviewOnboardingModal.sub.onboarding_instructions) 
                                    : showReviewOnboardingModal.sub.onboarding_instructions;
                                  
                                  if (Array.isArray(instructions)) {
                                    return (
                                      <ul className="space-y-2">
                                        {instructions.map((instruction, idx) => (
                                          <li key={idx} className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span className="text-gray-200">{instruction}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  } else {
                                    return <p className="text-gray-200">{String(instructions)}</p>;
                                  }
                                } catch {
                                  return <p className="text-gray-200">{String(showReviewOnboardingModal.sub.onboarding_instructions)}</p>;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowReviewOnboardingModal({ open: false, sub: null })}
                            className="px-6 py-2 rounded-xl bg-gray-600 text-white font-bold shadow hover:bg-gray-800 transition"
                          >
                            Close
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              await supabase.from('film_submissions').update({ status_stage: 'release' }).eq('id', showReviewOnboardingModal.sub.id);
                              setShowReviewOnboardingModal({ open: false, sub: null });
                              setFilmSubmissions(filmSubmissions => filmSubmissions.map(s => s.id === showReviewOnboardingModal.sub.id ? { ...s, status_stage: 'release' } : s));
                            }}
                            className="px-6 py-2 rounded-xl bg-green-600 text-white font-bold shadow hover:bg-green-700 transition"
                          >
                            Approve Onboarding
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              await supabase.from('film_submissions').update({ status_stage: 'onboarding' }).eq('id', showReviewOnboardingModal.sub.id);
                              setShowReviewOnboardingModal({ open: false, sub: null });
                              setFilmSubmissions(filmSubmissions => filmSubmissions.map(s => s.id === showReviewOnboardingModal.sub.id ? { ...s, status_stage: 'onboarding' } : s));
                            }}
                            className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
                          >
                            Reject - Send Back
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* Review Release Modal */}
                {showReviewReleaseModal.open && showReviewReleaseModal.sub && (
                  <Dialog open={showReviewReleaseModal.open} onOpenChange={(open) => !open && setShowReviewReleaseModal({ open: false, sub: null })}>
                    <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white border border-gray-700 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
                          Review Release Schedule
                        </DialogTitle>
                        <DialogDescription className="text-gray-300 mb-6">
                          Review and manage the release schedule for <span className="font-bold text-white">{showReviewReleaseModal.sub.film_title}</span>.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Creator's Scheduled Information */}
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                          <h3 className="text-xl font-bold text-blue-300 mb-4">Creator's Release Schedule</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-400 mb-1">Scheduled Release Date:</label>
                              <span className="text-white text-lg font-bold">
                                {showReviewReleaseModal.sub.scheduled_release_date 
                                  ? new Date(showReviewReleaseModal.sub.scheduled_release_date).toLocaleDateString('en-US', { 
                                      year: 'numeric', month: 'long', day: 'numeric' 
                                    })
                                  : 'Not set'
                                }
                              </span>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-400 mb-1">Currency:</label>
                              <span className="text-white text-lg font-bold">{showReviewReleaseModal.sub.final_currency || 'Not set'}</span>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-400 mb-1">Ticket Price:</label>
                              <span className="text-white text-lg font-bold">{showReviewReleaseModal.sub.final_ticket_price || 'Not set'}</span>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-400 mb-1">Release Terms Agreed:</label>
                              <span className={`font-semibold text-lg ${showReviewReleaseModal.sub.release_agreement ? 'text-green-400' : 'text-red-400'}`}>
                                {showReviewReleaseModal.sub.release_agreement ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Edit Section */}
                        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
                          <h3 className="text-xl font-bold text-orange-300 mb-4">Admin Actions</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-400 mb-2">Reschedule Release Date:</label>
                              <input
                                type="date"
                                value={adminReleaseDate}
                                onChange={(e) => setAdminReleaseDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-400 mb-2">Edit Ticket Price:</label>
                              <input
                                type="number"
                                value={adminTicketPrice}
                                onChange={(e) => setAdminTicketPrice(e.target.value)}
                                placeholder="Enter price"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setAdminReleaseDate('');
                              setAdminTicketPrice('');
                              setShowReviewReleaseModal({ open: false, sub: null });
                            }}
                            className="px-6 py-2 rounded-xl bg-gray-600 text-white font-bold shadow hover:bg-gray-800 transition"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              const updateData: any = { status_stage: 'release_scheduled' };
                              
                              // Always update the date if a date is provided
                              if (adminReleaseDate) {
                                updateData.scheduled_release_date = adminReleaseDate;
                              }
                              
                              // Always update the ticket price if a price is provided
                              if (adminTicketPrice && adminTicketPrice.trim() !== '') {
                                updateData.final_ticket_price = parseFloat(adminTicketPrice);
                              }
                              
                              console.log('Updating film submission with data:', updateData);
                              
                              const { error } = await supabase.from('film_submissions').update(updateData).eq('id', showReviewReleaseModal.sub.id);
                              
                              if (error) {
                                console.error('Error updating film submission:', error);
                                alert('Failed to update release schedule: ' + error.message);
                                return;
                              }
                              
                              console.log('Successfully updated film submission');
                              
                              // Clear form state
                              setAdminReleaseDate('');
                              setAdminTicketPrice('');
                              setShowReviewReleaseModal({ open: false, sub: null });
                              
                              // Update the local state to reflect changes
                              setFilmSubmissions(filmSubmissions => filmSubmissions.map(s => 
                                s.id === showReviewReleaseModal.sub.id 
                                  ? { ...s, ...updateData } 
                                  : s
                              ));
                            }}
                            className="px-6 py-2 rounded-xl bg-green-600 text-white font-bold shadow hover:bg-green-700 transition"
                          >
                            Approve & Schedule Release
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              await supabase.from('film_submissions').update({ status_stage: 'release' }).eq('id', showReviewReleaseModal.sub.id);
                              setShowReviewReleaseModal({ open: false, sub: null });
                              setFilmSubmissions(filmSubmissions => filmSubmissions.map(s => s.id === showReviewReleaseModal.sub.id ? { ...s, status_stage: 'release' } : s));
                            }}
                            className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
                          >
                            Reject - Send Back to Release
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Total Films</h3>
                <p className="text-3xl font-bold text-tiketx-blue">142</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Active Creators</h3>
                <p className="text-3xl font-bold text-tiketx-violet">28</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-400">$45,230</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Active Users</h3>
                <p className="text-3xl font-bold text-tiketx-pink">1,850</p>
              </div>
            </div>
          </div>
        );

      case 'banners':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Homepage Banners</h2>
              <button
                className="gradient-button flex items-center space-x-2"
                onClick={() => setShowBannerModal(true)}
                disabled={showBannerModal || savingBanner || uploading}
              >
                <Plus size={20} />
                <span>Add Banner</span>
              </button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={e => setDraggingBannerId(e.active.id)}
              onDragEnd={e => {
                setDraggingBannerId(null);
                const { active, over } = e;
                if (active.id !== over?.id) {
                  const oldIndex = banners.findIndex(b => b.id === active.id);
                  const newIndex = banners.findIndex(b => b.id === over?.id);
                  const newBanners = arrayMove(banners, oldIndex, newIndex);
                  updateBannerOrder(newBanners);
                }
              }}
            >
              <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-4">
                  {banners.map((banner) => (
                    <SortableBannerCard
                      key={banner.id}
                      banner={banner}
                      onEdit={handleEditBanner}
                      onDelete={handleDeleteBanner}
                      isDragging={draggingBannerId === banner.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {/* Banner Modal */}
            <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
              <DialogContent
                className="w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 rounded-2xl"
                aria-describedby={undefined}
              >
                <DialogHeader>
                  <DialogTitle>{editingBannerId ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
                  <DialogDescription>
                    Fill out the details to add or edit a homepage banner.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleBannerSubmit}>
                  <div className="flex flex-col gap-4">
                    <Input placeholder="Custom Tag (e.g. New Release)" value={bannerForm.custom_tag} onChange={e => setBannerForm(f => ({ ...f, custom_tag: e.target.value }))} className="mb-2" />
                    <Input placeholder="Title" value={bannerForm.title} onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))} required />
                    <label className="block mb-1 mt-2">Title Image (optional)</label>
                    {editingBannerId && bannerForm.title_image && (
                      <div className="flex items-center mb-2 gap-2">
                        <img src={bannerForm.title_image} alt="Title Preview" className="max-h-20 rounded shadow" />
                        <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveImage('title')} disabled={removingImage === 'title'} className="text-xs px-2 py-1 h-7">
                          {removingImage === 'title' ? 'Removing...' : 'Remove Image'}
                        </Button>
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={e => setBannerForm(f => ({ ...f, titleImageFile: e.target.files?.[0] }))} disabled={!!bannerForm.title_image} />
                    <div className="text-xs text-gray-400 mt-1 mb-2">Recommended: 1020x600 px, 72ppi</div>
                    <div className="flex items-center mt-2 gap-1">
                      <Switch id="enable_title_image" checked={bannerForm.enable_title_image} onCheckedChange={checked => setBannerForm(f => ({ ...f, enable_title_image: checked }))} className="scale-90" />
                      <label htmlFor="enable_title_image" className="ml-1 select-none text-xs">Use Title Image</label>
                    </div>
                    <Input placeholder="Year" value={bannerForm.year} onChange={e => setBannerForm(f => ({ ...f, year: e.target.value }))} required />
                    <Input placeholder="Language" value={bannerForm.language} onChange={e => setBannerForm(f => ({ ...f, language: e.target.value }))} required />
                    <Input placeholder="Duration" value={bannerForm.duration} onChange={e => setBannerForm(f => ({ ...f, duration: e.target.value }))} required />
                    <label className="block mb-1 mt-2">Link to Film (optional)</label>
                    <select
                      className="rounded-lg bg-black/80 border border-white/20 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiketx-blue transition-all shadow-sm placeholder-gray-400"
                      value={bannerForm.filmid || ''}
                      onChange={e => setBannerForm(f => ({ ...f, filmid: e.target.value }))}
                      style={{ minHeight: '44px', fontSize: '1rem', marginBottom: '0.5rem' }}
                    >
                      <option value="" className="bg-black text-white">-- No Film (Coming Soon) --</option>
                      {films.map(film => (
                        <option key={film.id} value={film.id} className="bg-black text-white">{film.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Input placeholder="Certificate" value={bannerForm.certificate} onChange={e => setBannerForm(f => ({ ...f, certificate: e.target.value }))} required />
                    <Input placeholder="Description" value={bannerForm.description} onChange={e => setBannerForm(f => ({ ...f, description: e.target.value }))} />
                    <Input placeholder="Genres (comma separated)" value={bannerForm.genres} onChange={e => setBannerForm(f => ({ ...f, genres: e.target.value }))} required />
                    <div>
                      <label className="block mb-1">Banner Image</label>
                      {editingBannerId && bannerForm.banner_image && (
                        <div className="flex items-center mb-2 gap-2">
                          <img src={bannerForm.banner_image} alt="Banner Preview" className="max-h-20 rounded shadow" />
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveImage('banner')} disabled={removingImage === 'banner'} className="text-xs px-2 py-1 h-7">
                            {removingImage === 'banner' ? 'Removing...' : 'Remove Image'}
                          </Button>
                        </div>
                      )}
                      <Input type="file" accept="image/*" onChange={e => setBannerForm(f => ({ ...f, imageFile: e.target.files?.[0] }))} disabled={!!bannerForm.banner_image} />
                      <div className="text-xs text-gray-400 mt-1 mb-2">Recommended: 1920x1080 px, 72ppi</div>
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Trailer Playback ID (Mux)</label>
                      <Input
                        placeholder="Enter Mux Playback ID (e.g. abc123xyz)"
                        value={bannerForm.trailerFile}
                        onChange={e => setBannerForm(f => ({ ...f, trailerFile: e.target.value }))}
                      />
                      {bannerForm.trailerFile && false && (
                        <div className="mb-2">
                          <video
                            src={`https://stream.mux.com/${bannerForm.trailerFile}.m3u8`}
                            controls
                            style={{ width: '100%', maxWidth: 320 }}
                          />
                        </div>
                      )}
                      <div className="mt-6" />
                      <div className="flex items-center mt-2 gap-1">
                        <Switch
                          id="enable_trailer"
                          checked={!!bannerForm.enable_trailer && !!bannerForm.trailerFile}
                          onCheckedChange={checked => setBannerForm(f => ({ ...f, enable_trailer: checked }))}
                          className="scale-90"
                          disabled={!bannerForm.trailerFile}
                        />
                        <label htmlFor="enable_trailer" className="ml-1 select-none text-xs">Enable Trailer</label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch checked={bannerForm.enabled} onCheckedChange={v => setBannerForm(f => ({ ...f, enabled: v }))} className="scale-90" />
                      <span className="text-xs">Enable Banner On Home Page</span>
                    </div>
                    <div className="mb-4" />
                    <Button type="submit" className="w-full" disabled={uploading || savingBanner}>
                      {savingBanner ? (<><Spinner /> Saving...</>) : (editingBannerId ? 'Save Changes' : 'Add Banner')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'films':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Films</h2>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors" 
                  onClick={fetchFilms}
                  title="Refresh films list"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button className="gradient-button flex items-center space-x-2" onClick={() => {
                  fetchFilmSubmissions();
                  setShowFilmModal(true);
                }}>
                  <Plus size={20} />
                  <span>Add Film</span>
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {films.map((film) => (
                <div key={film.id} className="glass-card p-4 flex items-center space-x-4">
                  <img
                    src={film.film_thumbnail_horizontal || film.film_thumbnail_vertical}
                    alt={film.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{film.title}</h3>
                      {film.is_published && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                      {!film.is_published && film.scheduled_release_datetime && (
                        <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          SCHEDULED
                        </div>
                      )}
                      {!film.is_published && !film.scheduled_release_datetime && (
                        <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          DRAFT
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{film.language}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold ${film.has_ticket ? 'text-green-400' : 'text-gray-400'}`}>{film.has_ticket ? 'Has Ticket' : 'No Ticket'}</span>
                      {film.scheduled_release_datetime && (
                        <span className="text-xs text-blue-400">
                          Scheduled: {(() => {
                            const utcDate = new Date(film.scheduled_release_datetime);
                            const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                            
                            // Format in IST explicitly
                            const day = istDate.getUTCDate();
                            const month = istDate.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                            const hours = istDate.getUTCHours();
                            const minutes = istDate.getUTCMinutes();
                            const ampm = hours >= 12 ? 'pm' : 'am';
                            const displayHours = hours % 12 || 12;
                            const displayMinutes = minutes.toString().padStart(2, '0');
                            
                            return `${day} ${month}, ${displayHours}:${displayMinutes} ${ampm} IST`;
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors" onClick={() => handleEditFilm(film)}>
                      <Edit size={16} />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors" onClick={() => handleDeleteFilm(film.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Film Modal */}
            <Dialog open={showFilmModal} onOpenChange={setShowFilmModal}>
              <DialogContent
                className="w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 rounded-2xl"
                aria-describedby={undefined}
              >
                <DialogHeader>
                  <DialogTitle>{editingFilmId ? 'Edit Film' : 'Add Film'}</DialogTitle>
                  <DialogDescription>
                    Fill out the details to add or edit a film.
                  </DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-8" onSubmit={handleFilmSubmit}>
                  {/* 1. All text fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Title</label>
                      <Input placeholder="Title" value={filmForm.title} onChange={e => setFilmForm(f => ({ ...f, title: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="block mb-1">Year</label>
                      <Input placeholder="Year" value={filmForm.release_year} onChange={e => setFilmForm(f => ({ ...f, release_year: e.target.value }))} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-1 mt-2">Synopsis</label>
                      <Input placeholder="Synopsis" value={filmForm.synopsis} onChange={e => setFilmForm(f => ({ ...f, synopsis: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 mt-2">Genres</label>
                        <Input placeholder="Genres (comma separated)" value={filmForm.genres} onChange={e => setFilmForm(f => ({ ...f, genres: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="block mb-1 mt-2">Certificate</label>
                        <Input placeholder="Certificate (e.g. U/A, A)" value={filmForm.censor_certificate || ''} onChange={e => setFilmForm(f => ({ ...f, censor_certificate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 mt-2">Trailer Link (YouTube or external URL)</label>
                        <Input placeholder="Trailer Link (YouTube or external URL)" value={filmForm.trailer_link} onChange={e => setFilmForm(f => ({ ...f, trailer_link: e.target.value }))} />
                      </div>
                      <div className="flex items-center gap-2 mt-7">
                        <Switch id="is_trailer_enabled" checked={!!filmForm.is_trailer_enabled} onCheckedChange={checked => setFilmForm(f => ({ ...f, is_trailer_enabled: checked }))} className="scale-90" />
                        <label htmlFor="is_trailer_enabled" className="ml-1 select-none text-xs">Enable Trailer</label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-1 mt-2">Film Playback ID</label>
                      <Input placeholder="Film Playback ID (external or streaming URL)" value={filmForm.film_playback_id} onChange={e => setFilmForm(f => ({ ...f, film_playback_id: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-1 mt-2">Custom Tag</label>
                      <Input placeholder="Custom Tag (optional)" value={filmForm.custom_tag} onChange={e => setFilmForm(f => ({ ...f, custom_tag: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Runtime (minutes)</label>
                      <Input placeholder="Runtime (e.g. 120)" type="number" value={filmForm.runtime ?? ""} onChange={e => setFilmForm(f => ({ ...f, runtime: e.target.value }))} min={0} />
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Film Expiry Date</label>
                      <Input placeholder="Expiry Date" type="date" value={filmForm.film_expiry_date ? filmForm.film_expiry_date.slice(0, 10) : ""} onChange={e => setFilmForm(f => ({ ...f, film_expiry_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Scheduled Release Date & Time (IST) <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <div className="flex gap-2">
                        <Input 
                          type="datetime-local" 
                          value={filmForm.scheduled_release_datetime || ""} 
                          onChange={e => setFilmForm(f => ({ ...f, scheduled_release_datetime: e.target.value }))} 
                          className="[color-scheme:dark] flex-1"
                          placeholder=""
                          min={filmForm.scheduled_release_datetime ? (() => {
                            // Only apply minimum when there's a value
                            const now = new Date();
                            // Add 5.5 hours to convert to IST
                            const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
                            return istNow.toISOString().slice(0, 16);
                          })() : undefined}
                        />
                        {filmForm.scheduled_release_datetime && (
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => setFilmForm(f => ({ ...f, scheduled_release_datetime: '' }))}
                            className="px-3"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Optional: Enter date and time in IST to schedule automatic release. Leave empty to publish immediately when saved.</p>
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Closure Expiry Date</label>
                      <Input 
                        type="date" 
                        value={filmForm.closure_expiry_date || ""} 
                        onChange={e => setFilmForm(f => ({ ...f, closure_expiry_date: e.target.value }))} 
                        className="[color-scheme:dark]"
                        min={(() => {
                          // Set minimum to tomorrow's date
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow.toISOString().split('T')[0];
                        })()}
                      />
                      <p className="text-xs text-gray-500 mt-1">Date when the film will automatically be removed from public view (end of day IST).</p>
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Quality</label>
                      <Input placeholder="Quality (e.g. HD, 4K)" value={filmForm.quality || ""} onChange={e => setFilmForm(f => ({ ...f, quality: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Languages</label>
                      <Input placeholder="Languages (comma separated, e.g. English, Tamil)" value={filmForm.language || ""} onChange={e => setFilmForm(f => ({ ...f, language: e.target.value }))} />
                    </div>
                  </div>

                  {/* Link Submitted Film field */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 mt-2">Link Submitted Film (Optional)</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={filmForm.submission_id || ''}
                      onChange={e => setFilmForm(f => ({ ...f, submission_id: e.target.value }))}
                    >
                      <option value="">Select a submission (optional)</option>
                      {filmSubmissions.map((submission: any) => (
                        <option key={submission.id} value={submission.id}>
                          {submission.film_title} - {submission.name} - ({submission.status_stage})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Publish Control */}
                  <div className={`p-4 rounded-lg border ${filmForm.is_published ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch 
                            id="is_published" 
                            checked={!!filmForm.is_published} 
                            onCheckedChange={checked => setFilmForm(f => ({ ...f, is_published: checked }))} 
                          />
                          <label htmlFor="is_published" className="font-medium">Publish Film Now</label>
                        </div>
                        <div className="text-sm text-gray-600">
                          {filmForm.is_published ? 
                            "Film is live and visible to users" : 
                            filmForm.scheduled_release_datetime ? 
                              "Film will go live automatically on scheduled date" : 
                              "Film is in draft mode"
                          }
                        </div>
                      </div>
                      {filmForm.is_published && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. All image uploaders and ticket fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Trailer Thumbnail</label>
                      {editingFilmId && filmForm.trailer_thumbnail && (
                        <div className="flex items-center mb-2 gap-2">
                          <img src={filmForm.trailer_thumbnail} alt="Trailer Thumbnail Preview" className="max-h-20 rounded shadow" />
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveFilmImage('trailer_thumbnail')} disabled={removingFilmImage === 'trailer_thumbnail'} className="text-xs px-2 py-1 h-7">
                            {removingFilmImage === 'trailer_thumbnail' ? 'Removing...' : 'Remove Image'}
                          </Button>
                        </div>
                      )}
                      {!editingFilmId && (
                        <Input type="file" accept="image/*" onChange={e => setFilmForm(f => ({ ...f, trailerThumbFile: e.target.files?.[0] }))} disabled={!!filmForm.trailer_thumbnail} />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Film Thumbnail Fullsize</label>
                      {editingFilmId && filmForm.film_thumbnail_fullsize && (
                        <div className="flex items-center mb-2 gap-2">
                          <img src={filmForm.film_thumbnail_fullsize} alt="Fullsize Thumbnail Preview" className="max-h-20 rounded shadow" />
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveFilmImage('fullsize')} disabled={removingFilmImage === 'fullsize'} className="text-xs px-2 py-1 h-7">
                            {removingFilmImage === 'fullsize' ? 'Removing...' : 'Remove Image'}
                          </Button>
                        </div>
                      )}
                      {!editingFilmId && (
                        <Input type="file" accept="image/*" onChange={e => setFilmForm(f => ({ ...f, fullsizeThumbFile: e.target.files?.[0] }))} disabled={!!filmForm.film_thumbnail_fullsize} />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Film Thumbnail Vertical</label>
                      {editingFilmId && filmForm.film_thumbnail_vertical && (
                        <div className="flex items-center mb-2 gap-2">
                          <img src={filmForm.film_thumbnail_vertical} alt="Vertical Thumbnail Preview" className="max-h-20 rounded shadow" />
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveFilmImage('vertical')} disabled={removingFilmImage === 'vertical'} className="text-xs px-2 py-1 h-7">
                            {removingFilmImage === 'vertical' ? 'Removing...' : 'Remove Image'}
                          </Button>
                        </div>
                      )}
                      {!editingFilmId && (
                        <Input type="file" accept="image/*" onChange={e => setFilmForm(f => ({ ...f, verticalThumbFile: e.target.files?.[0] }))} disabled={!!filmForm.film_thumbnail_vertical} />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 mt-2">Film Thumbnail Horizontal</label>
                      {editingFilmId && filmForm.film_thumbnail_horizontal && (
                        <div className="flex items-center mb-2 gap-2">
                          <img src={filmForm.film_thumbnail_horizontal} alt="Horizontal Thumbnail Preview" className="max-h-20 rounded shadow" />
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveFilmImage('horizontal')} disabled={removingFilmImage === 'horizontal'} className="text-xs px-2 py-1 h-7">
                            {removingFilmImage === 'horizontal' ? 'Removing...' : 'Remove Image'}
                          </Button>
                        </div>
                      )}
                      {!editingFilmId && (
                        <Input type="file" accept="image/*" onChange={e => setFilmForm(f => ({ ...f, horizontalThumbFile: e.target.files?.[0] }))} disabled={!!filmForm.film_thumbnail_horizontal} />
                      )}
                    </div>
                  </div>
                  {/* Ticketing Details Section Header - moved here */}
                  <div className="flex items-center gap-2">
                    <Ticket className="text-green-400 w-5 h-5" />
                    <h4 className="font-semibold text-lg">Ticketing Details</h4>
                    <div className="flex-1 border-b border-gray-700 ml-2" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="flex items-center gap-2">
                      <Switch id="has_ticket" checked={filmForm.has_ticket} onCheckedChange={checked => setFilmForm(f => ({ ...f, has_ticket: checked }))} />
                      <label htmlFor="has_ticket">Has Ticket</label>
                    </div>
                    <div>
                      <Input placeholder="Ticket Price" type="text" inputMode="decimal" pattern="[0-9]*" value={filmForm.ticket_price} onChange={e => setFilmForm(f => ({ ...f, ticket_price: e.target.value.replace(/[^0-9.]/g, '') }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="text-sm text-gray-400">
                      <label htmlFor="ticket_expiry_hours">Ticket Expiry Duration (hours)</label>
                      <p className="text-xs text-gray-500 mt-1">Default: 24 hours if not specified. Min: 1 hour, Max: 168 hours (7 days)</p>
                    </div>
                    <div>
                      <Input 
                        id="ticket_expiry_hours"
                        placeholder="24" 
                        type="text" 
                        inputMode="numeric" 
                        pattern="[0-9]*" 
                        min="1"
                        max="168"
                        value={filmForm.ticket_expiry_hours} 
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          const numValue = parseInt(value);
                          if (value === '' || (numValue >= 1 && numValue <= 168)) {
                            setFilmForm(f => ({ ...f, ticket_expiry_hours: value }));
                          }
                        }} 
                      />
                    </div>
                  </div>

                  {/* Financial Configuration Section */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-green-400 w-5 h-5" />
                    <h4 className="font-semibold text-lg">Financial Configuration</h4>
                    <div className="flex-1 border-b border-gray-700 ml-2" />
                  </div>
                  
                  {/* GST Toggle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="text-sm text-gray-400">
                      <label htmlFor="disable_gst">GST Settings</label>
                      <p className="text-xs text-gray-500 mt-1">Control GST calculations for this film</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="disable_gst" 
                        checked={filmForm.disable_gst} 
                        onCheckedChange={checked => {
                          if (checked) {
                            // When GST is disabled, automatically set GST fields to 0
                            setFilmForm(f => ({ 
                              ...f, 
                              disable_gst: checked,
                              gst_on_platform_fee: '0',
                              gst_on_commission_fee: '0'
                            }));
                          } else {
                            // When GST is enabled, just update the toggle without changing other fields
                            setFilmForm(f => ({ ...f, disable_gst: checked }));
                          }
                        }} 
                      />
                      <label htmlFor="disable_gst" className="text-sm text-gray-300">
                        Disable GST for this film
                      </label>
                    </div>
                  </div>
                  
                  {/* Platform Fee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="text-sm text-gray-400">
                      <label htmlFor="platform_fee_percentage">Platform Fee (%)</label>
                      <p className="text-xs text-gray-500 mt-1">Platform fee percentage on ticket sales (0-100%)</p>
                    </div>
                    <div>
                      <Input 
                        id="platform_fee_percentage"
                        placeholder="0.00" 
                        type="text" 
                        inputMode="decimal" 
                        pattern="[0-9.]*" 
                        value={filmForm.platform_fee_percentage} 
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const numValue = parseFloat(value);
                          if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
                            setFilmForm(f => ({ ...f, platform_fee_percentage: value }));
                          }
                        }} 
                      />
                    </div>
                  </div>

                  {/* GST on Platform Fee - only show if GST is not disabled */}
                  {!filmForm.disable_gst && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      <div className="text-sm text-gray-400">
                        <label htmlFor="gst_on_platform_fee">GST on Platform Fee (%)</label>
                        <p className="text-xs text-gray-500 mt-1">GST percentage applied on platform fee (0-100%)</p>
                      </div>
                      <div>
                        <Input 
                          id="gst_on_platform_fee"
                          placeholder="0.00" 
                          type="text" 
                          inputMode="decimal" 
                          pattern="[0-9.]*" 
                          value={filmForm.gst_on_platform_fee} 
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            const numValue = parseFloat(value);
                            if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
                              setFilmForm(f => ({ ...f, gst_on_platform_fee: value }));
                            }
                          }} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Commission Fee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="text-sm text-gray-400">
                      <label htmlFor="commission_fee_percentage">Base Commission Fee (%)</label>
                      <p className="text-xs text-gray-500 mt-1">Base commission percentage (can be overridden by slabs)</p>
                    </div>
                    <div>
                      <Input 
                        id="commission_fee_percentage"
                        placeholder="0.00" 
                        type="text" 
                        inputMode="decimal" 
                        pattern="[0-9.]*" 
                        value={filmForm.commission_fee_percentage} 
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const numValue = parseFloat(value);
                          if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
                            setFilmForm(f => ({ ...f, commission_fee_percentage: value }));
                          }
                        }} 
                      />
                    </div>
                  </div>

                  {/* GST on Commission Fee - only show if GST is not disabled */}
                  {!filmForm.disable_gst && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      <div className="text-sm text-gray-400">
                        <label htmlFor="gst_on_commission_fee">GST on Commission Fee (%)</label>
                        <p className="text-xs text-gray-500 mt-1">GST percentage applied on commission fee (0-100%)</p>
                      </div>
                      <div>
                        <Input 
                          id="gst_on_commission_fee"
                          placeholder="0.00" 
                          type="text" 
                          inputMode="decimal" 
                          pattern="[0-9.]*" 
                          value={filmForm.gst_on_commission_fee} 
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            const numValue = parseFloat(value);
                            if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
                              setFilmForm(f => ({ ...f, gst_on_commission_fee: value }));
                            }
                          }} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Commission Slabs Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="text-purple-400 w-5 h-5" />
                      <h4 className="font-semibold text-lg">Commission Slabs</h4>
                      <div className="flex-1 border-b border-gray-700 ml-2" />
                    </div>
                    
                    {/* Existing Commission Slabs */}
                    {commissionSlabs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Current Commission Slabs:</p>
                        {commissionSlabs.map((slab, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-800/80 rounded-xl p-3">
                            <div className="flex-1 grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-gray-400">Min: </span>
                                <span className="text-white">{slab.min_tickets}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Max: </span>
                                <span className="text-white">{slab.max_tickets || 'Unlimited'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Commission: </span>
                                <span className="text-white">{slab.commission_percentage}%</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCommissionSlab(index)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Commission Slab */}
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">Add New Commission Slab:</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Min Tickets</label>
                          <Input
                            placeholder="0"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newSlab.min_tickets}
                            onChange={e => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setNewSlab(prev => ({ ...prev, min_tickets: value }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Max Tickets (Optional)</label>
                          <Input
                            placeholder="100"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newSlab.max_tickets}
                            onChange={e => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setNewSlab(prev => ({ ...prev, max_tickets: value }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Commission %</label>
                          <Input
                            placeholder="10.00"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.]*"
                            value={newSlab.commission_percentage}
                            onChange={e => {
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              const numValue = parseFloat(value);
                              if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
                                setNewSlab(prev => ({ ...prev, commission_percentage: value }));
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            onClick={addCommissionSlab}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={!newSlab.min_tickets || !newSlab.commission_percentage}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Slab
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Leave "Max Tickets" empty for unlimited upper range. Commission slabs cannot overlap.
                      </p>
                    </div>
                  </div>

                  {/* 3. Cast */}
                  <div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-blue-400 w-5 h-5" />
                        <h4 className="font-semibold text-lg">Cast</h4>
                        <div className="flex-1 border-b border-gray-700 ml-2" />
                      </div>
                      {cast.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-x-3 bg-gray-800/80 rounded-xl shadow p-3 w-full">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-base">
                            {creators.find(c => c.id === entry.creator_id)?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </div>
                          <select
                            value={entry.creator_id || ''}
                            onChange={e => {
                              const newCast = [...cast];
                              newCast[idx].creator_id = e.target.value;
                              setCast(newCast);
                            }}
                            className="flex-1 bg-gray-900 text-white border-none focus:ring-2 focus:ring-blue-500 rounded-xl placeholder-gray-400 input-modern min-w-0"
                          >
                            <option value="">Select Creator</option>
                            {creators.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <Input
                            placeholder="Character Name"
                            value={entry.character_name || ''}
                            onChange={e => {
                              const newCast = [...cast];
                              newCast[idx].character_name = e.target.value;
                              setCast(newCast);
                            }}
                            className="flex-1 bg-gray-900 text-white border-none focus:ring-2 focus:ring-blue-500 rounded-xl placeholder-gray-400 input-modern min-w-0"
                          />
                          <Input
                            placeholder="Order"
                            type="number"
                            min={1}
                            value={entry.order || ''}
                            onChange={e => {
                              const newCast = [...cast];
                              newCast[idx].order = e.target.value;
                              setCast(newCast);
                            }}
                            className="w-16 bg-gray-900 text-white border-none focus:ring-2 focus:ring-blue-500 rounded-xl placeholder-gray-400 input-modern"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setCast(cast.filter((_, i) => i !== idx))} className="hover:bg-red-500/20">
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="secondary" className="rounded-full px-4 py-2 mt-1 flex items-center gap-2" onClick={() => setCast([...cast, { creator_id: '', character_name: '', order: cast.length + 1 }])}>
                        <Plus className="w-4 h-4" /> Add Cast Member
                      </Button>
                    </div>
                  </div>

                  {/* 4. Crew */}
                  <div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-violet-400 w-5 h-5" />
                        <h4 className="font-semibold text-lg">Crew</h4>
                        <div className="flex-1 border-b border-gray-700 ml-2" />
                      </div>
                      {crew.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-x-3 bg-gray-800/80 rounded-xl shadow p-3 w-full">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-base">
                            {creators.find(c => c.id === entry.creator_id)?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </div>
                          <select
                            value={entry.creator_id || ''}
                            onChange={e => {
                              const newCrew = [...crew];
                              newCrew[idx].creator_id = e.target.value;
                              setCrew(newCrew);
                            }}
                            className="flex-1 bg-gray-900 text-white border-none focus:ring-2 focus:ring-violet-500 rounded-xl placeholder-gray-400 input-modern min-w-0"
                          >
                            <option value="">Select Creator</option>
                            {creators.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <Input
                            placeholder="Role (e.g. Director)"
                            value={entry.role || ''}
                            onChange={e => {
                              const newCrew = [...crew];
                              newCrew[idx].role = e.target.value;
                              setCrew(newCrew);
                            }}
                            className="flex-1 bg-gray-900 text-white border-none focus:ring-2 focus:ring-violet-500 rounded-xl placeholder-gray-400 input-modern min-w-0"
                          />
                          <Input
                            placeholder="Order"
                            type="number"
                            min={1}
                            value={entry.order || ''}
                            onChange={e => {
                              const newCrew = [...crew];
                              newCrew[idx].order = e.target.value;
                              setCrew(newCrew);
                            }}
                            className="w-16 bg-gray-900 text-white border-none focus:ring-2 focus:ring-violet-500 rounded-xl placeholder-gray-400 input-modern"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setCrew(crew.filter((_, i) => i !== idx))} className="hover:bg-red-500/20">
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="secondary" className="rounded-full px-4 py-2 mt-1 flex items-center gap-2" onClick={() => setCrew([...crew, { creator_id: '', role: '', order: crew.length + 1 }])}>
                        <Plus className="w-4 h-4" /> Add Crew Member
                      </Button>
                    </div>
                  </div>

                  {/* Actions (full width) */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="secondary" onClick={() => setShowFilmModal(false)}>Cancel</Button>
                    <Button type="submit" variant="default" disabled={savingFilm}>
                      {savingFilm ? (<><Spinner /> Saving...</>) : (editingFilmId ? 'Save Changes' : 'Add Film')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'sections':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Homepage Sections</h2>
              <button className="gradient-button flex items-center space-x-2">
                <Plus size={20} />
                <span>Add Section</span>
              </button>
            </div>

            <div className="grid gap-4">
              {sections.map((section) => (
                <div key={section.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{section.name}</h3>
                    <p className="text-sm text-gray-400">{section.filmCount} films • Order: {section.order}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-tiketx-blue/20 text-tiketx-blue rounded-lg hover:bg-tiketx-blue/30 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'creators':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Manage Creators</h2>
              <Button onClick={() => {
                setCreatorForm({ id: null, name: '', profile_image: '', imageFile: null, bio: '' });
                setShowCreatorModal(true);
              }}>
                <Plus size={20} /> <span>Add Creator</span>
              </Button>
            </div>
            <div className="grid gap-4">
              {creators.map((creator) => (
                <div key={creator.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{creator.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span>{creator.filmsCount} films</span>
                        <span>Revenue: {creator.totalRevenue}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button className="gradient-button text-sm px-3 py-1" onClick={() => {
                        setCreatorForm({
                          id: creator.id,
                          name: creator.name || '',
                          profile_image: creator.profile_image || '',
                          imageFile: null,
                          bio: creator.bio || '',
                        });
                        setShowCreatorModal(true);
                      }}>
                        Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteCreator(creator.id)}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Viewers & Ticket Sales</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 glass-card rounded-lg">
                      <div>
                        <p className="font-medium">Thor: Love and Thunder</p>
                        <p className="text-sm text-gray-400">Purchased by user@email.com</p>
                      </div>
                      <span className="text-tiketx-blue font-semibold">$12.99</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performing Films</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Thor: Love and Thunder', sales: 156, revenue: '$1,872' },
                    { title: 'Ocean Dreams', sales: 89, revenue: '$1,068' },
                    { title: 'Starlight Noir', sales: 67, revenue: '$804' }
                  ].map((film, i) => (
                    <div key={i} className="flex justify-between items-center p-3 glass-card rounded-lg">
                      <div>
                        <p className="font-medium">{film.title}</p>
                        <p className="text-sm text-gray-400">{film.sales} tickets sold</p>
                      </div>
                      <span className="text-green-400 font-semibold">{film.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'payouts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Creator Payout Management</h2>
              <div className="text-sm text-gray-400">
                Review and process creator payout requests
              </div>
            </div>

            {/* Payout Requests Table will be implemented here */}
            <div className="glass-card p-6">
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Payout Management</h3>
                <p className="text-gray-500">
                  This section will be implemented to manage creator payout requests.<br />
                  Features: Review requests, approve/reject payouts, track payment status, and manage payment methods.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add handler for creator form submit
  async function handleCreatorSubmit(e) {
    e.preventDefault();
    setSavingCreator(true);
    let profileImageUrl = creatorForm.profile_image;
    if (creatorForm.imageFile) {
      const file = creatorForm.imageFile;
      const fileExt = file.name.split('.').pop();
      const filePath = `creatorImages/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('creators').upload(filePath, file);
      if (!uploadError) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('creators').createSignedUrl(filePath, 1576800000);
        if (!signedUrlError && signedUrlData) {
          profileImageUrl = signedUrlData.signedUrl;
        }
      }
    }
    const { error } = await supabase.from('creators').insert({
      name: creatorForm.name,
      profile_image: profileImageUrl,
      bio: creatorForm.bio,
    });
    setSavingCreator(false);
    if (!error) {
      setShowCreatorModal(false);
      setCreatorForm({ id: null, name: '', profile_image: '', imageFile: null, bio: '' });
      // Refresh creators list
      const { data, error: fetchError } = await supabase.from('creators').select('id, name, profile_image').order('name');
      if (!fetchError && data) setCreators(data);
      toast({ title: 'Creator added successfully', duration: 2500 });
    } else {
      toast({ title: 'Failed to add creator', description: error.message, variant: 'destructive' });
    }
  }

  // Add handler for deleting a creator
  async function handleDeleteCreator(id) {
    if (!window.confirm('Are you sure you want to remove this creator?')) return;
    const { error } = await supabase.from('creators').delete().eq('id', id);
    if (!error) {
      // Refresh creators list
      const { data, error: fetchError } = await supabase.from('creators').select('id, name, profile_image').order('name');
      if (!fetchError && data) setCreators(data);
      toast({ title: 'Creator removed', duration: 2000 });
    } else {
      toast({ title: 'Failed to remove creator', description: error.message, variant: 'destructive' });
    }
  }

  // CSS spinner for delete
  const Spinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin align-middle"></span>
  );

  // Add this useEffect to ensure films are loaded when the banner modal is opened
  useEffect(() => {
    if (showBannerModal && films.length === 0) {
      fetchFilms();
    }
  }, [showBannerModal]);

  // Commission slab management functions
  const addCommissionSlab = () => {
    const minTickets = parseInt(newSlab.min_tickets);
    const maxTickets = newSlab.max_tickets ? parseInt(newSlab.max_tickets) : null;
    const commissionPercentage = parseFloat(newSlab.commission_percentage);

    // Validation
    if (isNaN(minTickets) || minTickets < 0) {
      toast({
        title: "Invalid input",
        description: "Minimum tickets must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (maxTickets !== null && (isNaN(maxTickets) || maxTickets < minTickets)) {
      toast({
        title: "Invalid input", 
        description: "Maximum tickets must be greater than or equal to minimum tickets",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(commissionPercentage) || commissionPercentage < 0 || commissionPercentage > 100) {
      toast({
        title: "Invalid input",
        description: "Commission percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    // Check for overlapping ranges (adjacent ranges are allowed)
    const overlapping = commissionSlabs.some(slab => {
      const slabMin = parseInt(slab.min_tickets);
      const slabMax = slab.max_tickets ? parseInt(slab.max_tickets) : Infinity;
      const newMax = maxTickets || Infinity;
      
      // Ranges overlap if they have any ticket numbers in common
      // They DON'T overlap if: newMax < slabMin OR slabMax < minTickets
      // So they DO overlap if: NOT (newMax < slabMin OR slabMax < minTickets)
      return !(newMax < slabMin || slabMax < minTickets);
    });

    if (overlapping) {
      toast({
        title: "Overlapping range",
        description: "Commission slab ranges cannot overlap",
        variant: "destructive",
      });
      return;
    }

    // Add the new slab
    const newSlabData = {
      id: `temp_${Date.now()}`, // Temporary ID for new slabs
      min_tickets: newSlab.min_tickets,
      max_tickets: newSlab.max_tickets,
      commission_percentage: newSlab.commission_percentage
    };

    setCommissionSlabs([...commissionSlabs, newSlabData].sort((a, b) => 
      parseInt(a.min_tickets) - parseInt(b.min_tickets)
    ));
    setNewSlab({ min_tickets: '', max_tickets: '', commission_percentage: '' });
  };

  const removeCommissionSlab = (index: number) => {
    const updatedSlabs = commissionSlabs.filter((_, i) => i !== index);
    setCommissionSlabs(updatedSlabs);
  };

  return (
    <div className="min-h-screen bg-tiketx-navy">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 glass-card m-4 rounded-2xl p-6 h-fit">
          <div className="flex items-center space-x-3 mb-8">
            <img src="/lovable-uploads/407505aa-5215-4c3d-ab75-8fd6ea8f6416.png" alt="TiketX" className="w-10 h-10" />
            <h1 className="text-xl font-bold">TiketX Admin</h1>
          </div>
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-all duration-200 mb-4"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/admin/login';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
            <span className="font-medium">Logout</span>
          </button>
          
          <nav className="space-y-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-start px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-tiketx-gradient text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center justify-center min-w-[24px] h-6 pt-0.5">
                <Icon size={20} />
                </span>
                <span className="font-medium ml-3 text-left leading-tight">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
      <AlertDialog open={confirmRemove.open} onOpenChange={open => setConfirmRemove(c => ({ ...c, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmRemove.type === 'title' ? 'Title Image' : confirmRemove.type === 'banner' ? 'Banner Image' : 'Trailer'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will be deleted immediately and cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingRemove}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRemoveImage(confirmRemove.type)} disabled={pendingRemove} className="bg-red-600 hover:bg-red-700">
              {pendingRemove ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={errorModal.open} onOpenChange={open => setErrorModal(e => ({ ...e, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorModal.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorModal({ open: false, message: "" })}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={showCreatorModal} onOpenChange={setShowCreatorModal}>
        <DialogContent className="w-full max-w-lg p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{creatorForm.id ? 'Edit Creator' : 'Add Creator'}</DialogTitle>
            <DialogDescription>Fill out the details to {creatorForm.id ? 'edit' : 'add'} a creator.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={async (e) => {
            e.preventDefault();
            setSavingCreator(true);
            let profileImageUrl = creatorForm.profile_image;
            if (creatorForm.imageFile) {
              const file = creatorForm.imageFile;
              const fileExt = file.name.split('.').pop();
              const filePath = `creatorImages/${Date.now()}.${fileExt}`;
              const { data: uploadData, error: uploadError } = await supabase.storage.from('creators').upload(filePath, file);
              if (!uploadError) {
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('creators').createSignedUrl(filePath, 1576800000);
                if (!signedUrlError && signedUrlData) {
                  profileImageUrl = signedUrlData.signedUrl;
                }
              }
            }
            let error;
            if (creatorForm.id) {
              // Edit existing creator
              ({ error } = await supabase.from('creators').update({
                name: creatorForm.name,
                profile_image: profileImageUrl,
                bio: creatorForm.bio,
              }).eq('id', creatorForm.id));
            } else {
              // Add new creator
              ({ error } = await supabase.from('creators').insert({
                name: creatorForm.name,
                profile_image: profileImageUrl,
                bio: creatorForm.bio,
              }));
            }
            setSavingCreator(false);
            if (!error) {
              setShowCreatorModal(false);
              setCreatorForm({ id: null, name: '', profile_image: '', imageFile: null, bio: '' });
              // Refresh creators list
              const { data, error: fetchError } = await supabase.from('creators').select('id, name, profile_image, bio').order('name');
              if (!fetchError && data) setCreators(data);
              toast({ title: creatorForm.id ? 'Creator updated successfully' : 'Creator added successfully', duration: 2500 });
            } else {
              toast({ title: 'Failed to save creator', description: error.message, variant: 'destructive' });
            }
          }}>
            <label className="block mb-1">Name</label>
            <Input placeholder="Name" value={creatorForm.name} onChange={e => setCreatorForm(f => ({ ...f, name: e.target.value }))} required />
            <label className="block mb-1">Profile Image (optional)</label>
            {creatorForm.profile_image && (
              <div className="mb-2 flex items-center gap-3">
                <img src={creatorForm.profile_image} alt="Profile" className="h-16 w-16 rounded-full object-cover border border-white/10" />
                <Button type="button" variant="destructive" size="sm" onClick={() => setCreatorForm(f => ({ ...f, profile_image: '', imageFile: null }))}>
                  Remove
                </Button>
              </div>
            )}
            <Input type="file" accept="image/*" onChange={e => setCreatorForm(f => ({ ...f, imageFile: e.target.files?.[0] }))} />
            <label className="block mb-1">Bio (optional)</label>
            <Input placeholder="Short bio" value={creatorForm.bio} onChange={e => setCreatorForm(f => ({ ...f, bio: e.target.value }))} />
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowCreatorModal(false)}>Cancel</Button>
              <Button type="submit" variant="default" disabled={savingCreator}>{savingCreator ? 'Saving...' : (creatorForm.id ? 'Save Changes' : 'Add Creator')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sortable Banner Card
function SortableBannerCard({ banner, onEdit, onDelete, isDragging }: any) {
  const { setNodeRef, transform, transition, isDragging: dragging, listeners, attributes } = useSortable({ id: banner.id });
  return (
    <div
      ref={setNodeRef}
      style={{
  // Replace with actual implementation or import if available
  // transform: CSS.Transform.toString(transform),
        transition,
        opacity: dragging ? 0.5 : 1,
        zIndex: dragging ? 10 : 1,
      }}
      className={`glass-card p-4 flex items-center space-x-4 ${dragging ? 'ring-2 ring-blue-400' : ''}`}
    >
      {/* Drag handle */}
      <span
        className="flex items-center justify-center cursor-grab active:cursor-grabbing mr-2"
        tabIndex={0}
        {...listeners}
        {...attributes}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </span>
      <img
        src={banner.banner_image}
        alt={banner.title}
        className="w-32 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{banner.title}</h3>
        <p className="text-sm text-gray-400">Order: {banner.order}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-semibold ${banner.enabled ? 'text-green-400' : 'text-gray-400'}`}>{banner.enabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors" onClick={() => onEdit(banner)}>
          <Edit size={16} />
        </button>
        <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors" onClick={() => onDelete(banner.id)}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
