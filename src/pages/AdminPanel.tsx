import { useEffect, useState } from 'react';
import { Upload, Image, Users, BarChart3, Settings, Plus, Edit, Trash2, CheckCircle, Film, GripVertical } from 'lucide-react';
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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 1. Add Mux upload helpers at the top (after imports)
// 1. Update getMuxDirectUploadUrl to use the full deployed URL if running locally or in production
async function getMuxDirectUploadUrl() {
  // Use the deployed Supabase Edge Function URL for local dev and production
  const functionUrl =
    window.location.hostname === 'localhost'
      ? 'https://pibbyyltgdtkzfjbqixw.functions.supabase.co/create-mux-upload'
      : '/functions/v1/create-mux-upload';

  // Get the current user's access token from Supabase Auth
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('Not authenticated');

  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ origin: window.location.origin }),
  });
  if (!res.ok) throw new Error('Failed to get Mux upload URL');
  return await res.json(); // { url, upload_id }
}

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
    film_expiry_date: '',
    runtime: '',
    language: '',
    quality: '',
    has_funding: false,
    release_year: '',
    is_trailer_enabled: false,
    film_playback_id: '',
    custom_tag: '',
    trailer_link: '',
  });

  // Remove cast_ids and crew_ids from filmForm state
  // Add state for cast and crew selection with roles and character names
  const [cast, setCast] = useState([]); // [{creator_id, character_name, order}]
  const [crew, setCrew] = useState([]); // [{creator_id, role, order}]
  const [creators, setCreators] = useState([]);

  // Add state for creator modal and form at the top of AdminPanel
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [creatorForm, setCreatorForm] = useState({ name: '', profile_image: '', imageFile: null, bio: '' });
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
      const uploadRes = await getMuxDirectUploadUrl();
      const url = uploadRes.url;
      const id = uploadRes.upload_id || uploadRes.id;
      if (!id) throw new Error('No upload_id returned from Mux upload function');
      // 2. Upload file to Mux
      await uploadToMux(url, file, (percent) => setUploadTrailerProgress(percent));
      // 3. Poll for asset status and get playback_id
      setUploadTrailerProgress(100);
      const playback_id = await pollMuxPlaybackIdEdge(id);
      // 4. Save playback_id as the trailer URL (for playback)
      setBannerForm(f => ({ ...f, trailerFile: playback_id }));
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
  async function handleRemoveImage(type: 'banner' | 'title' | 'trailer') {
    let url = type === 'banner' ? bannerForm.banner_image : type === 'title' ? bannerForm.title_image : bannerForm.trailerFile;
    if (!url) {
      setBannerForm(f => ({
        ...f,
        [type === 'banner' ? 'banner_image' : type === 'title' ? 'title_image' : 'trailerFile']: null,
      }));
      return;
    }
    setConfirmRemove({ type, open: true });
  }

  async function confirmRemoveImage() {
    if (!confirmRemove.type) return;
    setPendingRemove(true);
    const type = confirmRemove.type;
    let url = type === 'banner' ? bannerForm.banner_image : type === 'title' ? bannerForm.title_image : bannerForm.trailerFile;
    if (!url) {
      setPendingRemove(false);
      setConfirmRemove({ type: null, open: false });
      return;
    }
    if (type === 'trailer' && url && !url.startsWith('http')) {
      setDeleteTrailerProgress(0);
      setDeleteTrailerStatus('deleting');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setDeleteTrailerProgress(Math.min(progress, 90));
      }, 80);
      try {
        await deleteMuxAssetByPlaybackId(url);
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
    if (url.startsWith('http') && url.includes('supabase.co')) {
      const path = getStoragePathFromUrl(url);
      if (path) {
        setRemovingImage(type);
        const { error } = await supabase.storage.from('banners').remove([path]);
        setRemovingImage(null);
        if (!error) {
          toast({
            title: type === 'title'
              ? "Title image removed successfully. This change is already saved."
              : type === 'banner'
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
      [type === 'banner' ? 'banner_image' : type === 'title' ? 'title_image' : 'trailerFile']: null,
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
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('films').createSignedUrl(filePath, 1576800000);
      if (signedUrlError || !signedUrlData) {
        alert('Failed to get trailer thumbnail URL');
        setSavingFilm(false);
        return;
      }
      trailerThumbUrl = signedUrlData.signedUrl;
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
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('films').createSignedUrl(filePath, 1576800000);
      if (signedUrlError || !signedUrlData) {
        alert('Failed to get fullsize thumbnail URL');
        setSavingFilm(false);
        return;
      }
      fullsizeThumbUrl = signedUrlData.signedUrl;
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
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('films').createSignedUrl(filePath, 1576800000);
      if (signedUrlError || !signedUrlData) {
        alert('Failed to get vertical thumbnail URL');
        setSavingFilm(false);
        return;
      }
      verticalThumbUrl = signedUrlData.signedUrl;
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
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('films').createSignedUrl(filePath, 1576800000);
      if (signedUrlError || !signedUrlData) {
        alert('Failed to get horizontal thumbnail URL');
        setSavingFilm(false);
        return;
      }
      horizontalThumbUrl = signedUrlData.signedUrl;
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

    // Build payload
    const rawPayload = {
      ...filmForm,
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
      setShowFilmModal(false);
      setFilmForm({
        title: '', synopsis: '', genres: [], trailer_thumbnail: '', film_thumbnail_fullsize: '', film_thumbnail_vertical: '', film_thumbnail_horizontal: '', film_playback_id: '', custom_tag: '', trailerFile: null,
      });
      setCast([]);
      setCrew([]);
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

  function handleEditFilm(film: any) {
    setFilmForm({
      ...film,
      title: film.title ?? '',
      synopsis: film.synopsis ?? '',
      genres: Array.isArray(film.genres) ? film.genres.join(', ') : (film.genres ?? ''),
      trailer_thumbnail: film.trailer_thumbnail ?? '',
      film_thumbnail_fullsize: film.film_thumbnail_fullsize ?? '',
      film_thumbnail_vertical: film.film_thumbnail_vertical ?? '',
      film_thumbnail_horizontal: film.film_thumbnail_horizontal ?? '',
      trailerThumbFile: null,
      fullsizeThumbFile: null,
      horizontalThumbFile: null,
      film_playback_id: film.film_playback_id ?? '',
      custom_tag: film.custom_tag ?? '',
      trailerFile: null,
      language: film.language ?? '',
    });
    setEditingFilmId(film.id);
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
    { id: 'sales', label: 'Viewers & Sales', icon: BarChart3 }
  ];

  const sections = [
    { id: 1, name: 'Trending Now', filmCount: 8, order: 1 },
    { id: 2, name: 'Director\'s Picks', filmCount: 5, order: 2 },
    { id: 3, name: 'Regional Favourites', filmCount: 12, order: 3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
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
              <button className="gradient-button flex items-center space-x-2" onClick={() => setShowFilmModal(true)}>
                <Plus size={20} />
                <span>Add Film</span>
              </button>
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
                    <h3 className="font-semibold">{film.title}</h3>
                    <p className="text-sm text-gray-400">{film.language}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold ${film.has_ticket ? 'text-green-400' : 'text-gray-400'}`}>{film.has_ticket ? 'Has Ticket' : 'No Ticket'}</span>
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
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleFilmSubmit}>
                  <div className="flex flex-col gap-4">
                    <label className="block mb-1">Title</label>
                    <Input placeholder="Title" value={filmForm.title} onChange={e => setFilmForm(f => ({ ...f, title: e.target.value }))} required />
                    <label className="block mb-1 mt-2">Year</label>
                    <Input placeholder="Year" value={filmForm.release_year} onChange={e => setFilmForm(f => ({ ...f, release_year: e.target.value }))} required />
                    <label className="block mb-1 mt-2">Synopsis</label>
                    <Input placeholder="Synopsis" value={filmForm.synopsis} onChange={e => setFilmForm(f => ({ ...f, synopsis: e.target.value }))} />
                    <label className="block mb-1 mt-2">Genres</label>
                    <Input placeholder="Genres (comma separated)" value={filmForm.genres} onChange={e => setFilmForm(f => ({ ...f, genres: e.target.value }))} required />
                    <div className="flex items-center gap-2 mt-2 mb-2">
                      <Switch id="is_trailer_enabled" checked={!!filmForm.is_trailer_enabled} onCheckedChange={checked => setFilmForm(f => ({ ...f, is_trailer_enabled: checked }))} className="scale-90" />
                      <label htmlFor="is_trailer_enabled" className="ml-1 select-none text-xs">Enable Trailer</label>
                    </div>
                    <label className="block mb-1 mt-2">Film Playback ID</label>
                    <Input placeholder="Film Playback ID (external or streaming URL)" value={filmForm.film_playback_id} onChange={e => setFilmForm(f => ({ ...f, film_playback_id: e.target.value }))} />
                    <label className="block mb-1 mt-2">Custom Tag</label>
                    <Input placeholder="Custom Tag (optional)" value={filmForm.custom_tag} onChange={e => setFilmForm(f => ({ ...f, custom_tag: e.target.value }))} />
                    <label className="block mb-1 mt-2">Runtime (minutes)</label>
                    <Input
                      placeholder="Runtime (e.g. 120)"
                      type="number"
                      value={filmForm.runtime ?? ""}
                      onChange={e => setFilmForm(f => ({ ...f, runtime: e.target.value }))}
                      min={0}
                    />

                    <label className="block mb-1 mt-2">Film Expiry Date</label>
                    <Input
                      placeholder="Expiry Date"
                      type="date"
                      value={filmForm.film_expiry_date ? filmForm.film_expiry_date.slice(0, 10) : ""}
                      onChange={e => setFilmForm(f => ({ ...f, film_expiry_date: e.target.value }))}
                    />

                    <label className="block mb-1 mt-2">Quality</label>
                    <Input
                      placeholder="Quality (e.g. HD, 4K)"
                      value={filmForm.quality || ""}
                      onChange={e => setFilmForm(f => ({ ...f, quality: e.target.value }))}
                    />

                    <label className="block mb-1 mt-2">Languages</label>
                    <Input
                      placeholder="Languages (comma separated, e.g. English, Tamil)"
                      value={filmForm.language || ""}
                      onChange={e => setFilmForm(f => ({ ...f, language: e.target.value }))}
                    />
                    <label className="block mb-1 mt-2">Trailer Link (YouTube or external URL)</label>
                    <Input placeholder="Trailer Link (YouTube or external URL)" value={filmForm.trailer_link} onChange={e => setFilmForm(f => ({ ...f, trailer_link: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-4">
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
                    <div className="flex items-center gap-2 mt-2">
                      <Switch id="has_ticket" checked={filmForm.has_ticket} onCheckedChange={checked => setFilmForm(f => ({ ...f, has_ticket: checked }))} />
                      <label htmlFor="has_ticket">Has Ticket</label>
                    </div>
                    <Input placeholder="Ticket Price" type="text" inputMode="decimal" pattern="[0-9]*" value={filmForm.ticket_price} onChange={e => setFilmForm(f => ({ ...f, ticket_price: e.target.value.replace(/[^0-9.]/g, '') }))} />
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Cast</h4>
                    {cast.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <select
                          value={entry.creator_id || ''}
                          onChange={e => {
                            const newCast = [...cast];
                            newCast[idx].creator_id = e.target.value;
                            setCast(newCast);
                          }}
                          className="border rounded px-2 py-1"
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
                          className="w-48"
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
                          className="w-20"
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => setCast(cast.filter((_, i) => i !== idx))}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" size="sm" onClick={() => setCast([...cast, { creator_id: '', character_name: '', order: cast.length + 1 }])}>Add Cast Member</Button>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Crew</h4>
                    {crew.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <select
                          value={entry.creator_id || ''}
                          onChange={e => {
                            const newCrew = [...crew];
                            newCrew[idx].creator_id = e.target.value;
                            setCrew(newCrew);
                          }}
                          className="border rounded px-2 py-1"
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
                          className="w-48"
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
                          className="w-20"
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => setCrew(crew.filter((_, i) => i !== idx))}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" size="sm" onClick={() => setCrew([...crew, { creator_id: '', role: '', order: crew.length + 1 }])}>Add Crew Member</Button>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
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
              <Button onClick={() => setShowCreatorModal(true)}>
                <Plus size={20} /> <span>Add Creator</span>
              </Button>
            </div>
            <div className="grid gap-4">
              {creators.map((creator) => (
                <div key={creator.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{creator.name}</h3>
                      <p className="text-sm text-gray-400">{creator.email}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span>{creator.filmsCount} films</span>
                        <span>Revenue: {creator.totalRevenue}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-lg text-sm ${
                        creator.status === 'Approved' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {creator.status}
                      </span>
                      <div className="flex space-x-2">
                        <Button className="gradient-button text-sm px-3 py-1">
                          {creator.status === 'Approved' ? 'Edit' : 'Approve'}
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteCreator(creator.id)}>
                          <Trash2 size={18} />
                        </Button>
                      </div>
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
      setCreatorForm({ name: '', profile_image: '', imageFile: null, bio: '' });
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
            <AlertDialogAction onClick={confirmRemoveImage} disabled={pendingRemove} className="bg-red-600 hover:bg-red-700">
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
            <DialogTitle>Add Creator</DialogTitle>
            <DialogDescription>Fill out the details to add a new creator.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleCreatorSubmit}>
            <label className="block mb-1">Name</label>
            <Input placeholder="Name" value={creatorForm.name} onChange={e => setCreatorForm(f => ({ ...f, name: e.target.value }))} required />
            <label className="block mb-1">Profile Image (optional)</label>
            <Input type="file" accept="image/*" onChange={e => setCreatorForm(f => ({ ...f, imageFile: e.target.files?.[0] }))} />
            <label className="block mb-1">Bio (optional)</label>
            <Input placeholder="Short bio" value={creatorForm.bio} onChange={e => setCreatorForm(f => ({ ...f, bio: e.target.value }))} />
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowCreatorModal(false)}>Cancel</Button>
              <Button type="submit" variant="default" disabled={savingCreator}>{savingCreator ? 'Saving...' : 'Add Creator'}</Button>
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
        transform: CSS.Transform.toString(transform),
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
