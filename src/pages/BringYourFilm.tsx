import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const BringYourFilm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    filmTitle: '',
    synopsis: '',
    previewLink: '',
    country: '',
    message: '',
    consent: false,
    expectedTicketPrice: '',
    plannedReleaseDate: '',
    productionHouseName: '',
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      
      // Auto-fill name and email from user profile
      if (data?.user) {
        setForm(prev => ({
          ...prev,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
          email: data.user.email || '',
        }));
      }
      
      setAuthChecking(false);
    })();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/bring-your-film`,
        },
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Sign-in failed', variant: 'destructive' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.country || !form.filmTitle || !form.synopsis || !form.previewLink || !form.consent || !form.expectedTicketPrice || !form.productionHouseName) {
      toast({ title: 'Please fill all required fields and accept the consent.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('film_submissions').insert({
        user_id: user?.id || null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        film_title: form.filmTitle,
        synopsis: form.synopsis,
        preview_link: form.previewLink,
        country: form.country,
        message: form.message || null,
        consent: form.consent,
        expected_ticket_price: form.expectedTicketPrice,
        planned_release_date: form.plannedReleaseDate || null,
        production_house_name: form.productionHouseName,
        status_stage: 'submission',
        submitted_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: 'Thanks! We received your submission.' });
      
      // Dispatch custom event to update navigation
      window.dispatchEvent(new CustomEvent('filmSubmitted'));
      
      navigate('/creator');
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white px-4 md:px-8 py-10 flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <img src="/tiketx-logo-text.png" alt="TiketX" className="h-10 w-auto mx-auto mb-6 opacity-90" />
          <h1 className="text-2xl font-extrabold mb-2">Bring Your Film to TiketX</h1>
          <p className="text-gray-300 mb-6">Please sign in with Google to submit your film details.</p>
          <button onClick={handleGoogleSignIn} className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink text-white shadow-lg">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-10 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <img src="/tiketx-logo-text.png" alt="TiketX" className="h-14 w-auto opacity-95" />
              <div className="absolute -inset-2 bg-gradient-to-r from-tiketx-blue/20 via-tiketx-violet/20 to-tiketx-pink/20 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>
          
          {/* Main Title */}
          <div className="relative mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight">
              Bring Your Film to TiketX
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-tiketx-blue/10 via-tiketx-violet/10 to-tiketx-pink/10 rounded-3xl blur-2xl -z-10"></div>
          </div>
          
          {/* Subtitle */}
          <div className="max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
              Submit your film details and we'll get in touch to help you 
              <span className="bg-gradient-to-r from-tiketx-blue to-tiketx-violet bg-clip-text text-transparent font-semibold"> stream on TiketX</span>
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-tiketx-blue to-transparent"></div>
            <div className="w-2 h-2 bg-tiketx-violet rounded-full animate-pulse"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-tiketx-pink to-transparent"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Name *</label>
              <input 
                name="name" 
                value={form.name} 
                readOnly 
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-gray-300 cursor-not-allowed" 
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email *</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                readOnly 
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-gray-300 cursor-not-allowed" 
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">WhatsApp (include country code) *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Country *</label>
              <input name="country" value={form.country} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Production House Name *</label>
              <input name="productionHouseName" value={form.productionHouseName} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Film Title *</label>
              <input name="filmTitle" value={form.filmTitle} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Synopsis (short) *</label>
            <textarea name="synopsis" value={form.synopsis} onChange={handleChange} rows={4} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Private preview link (YouTube/Vimeo/Drive) *</label>
            <input name="previewLink" value={form.previewLink} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Expected Ticket Price (INR/USD) *</label>
              <input name="expectedTicketPrice" value={form.expectedTicketPrice} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" placeholder="e.g. 199 INR" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Planned Release Date (optional)</label>
              <input type="date" name="plannedReleaseDate" value={form.plannedReleaseDate} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Message (optional)</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={3} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tiketx-blue" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} className="h-4 w-4" />
            <span className="text-sm text-gray-300">I agree to be contacted by TiketX about my submission *</span>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink text-white shadow-lg disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BringYourFilm; 