import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Save, User as UserIcon, Mail, Image as ImageIcon, Key } from 'lucide-react';

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setName(data.user.user_metadata?.name || '');
        setEmail(data.user.email || '');
        setProfilePic(data.user.user_metadata?.avatar_url || null);
      }
    });
  }, []);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError('Failed to upload image');
      setLoading(false);
      return;
    }
    const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(filePath);
    if (urlData?.publicUrl) {
      setProfilePic(urlData.publicUrl);
      // Update user metadata
      await supabase.auth.updateUser({ data: { avatar_url: urlData.publicUrl } });
      setSuccess('Profile picture updated!');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    // Update name in auth
    const { error: metaError } = await supabase.auth.updateUser({ data: { name } });
    if (metaError) {
      setError('Failed to update name');
      setLoading(false);
      return;
    }
    // Update name in users table
    if (user?.id) {
      const { error: dbError } = await supabase
        .from('users')
        .upsert({ id: user.id, display_name: name, email: user.email });
      if (dbError) {
        setError('Failed to update display name in users table');
        setLoading(false);
        return;
      }
    }
    // Update password if provided
    if (newPassword) {
      const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
      if (passError) {
        setError('Failed to update password');
        setLoading(false);
        return;
      }
    }
    setSuccess('Profile updated!');
    setNewPassword('');
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl bg-black/80 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-8">Profile Settings</h2>
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <img
              src={profilePic || '/default-avatar.png'}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-tiketx-blue shadow-lg"
            />
            <button
              className="absolute bottom-2 right-2 bg-tiketx-blue p-2 rounded-full hover:bg-tiketx-pink transition-colors"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <ImageIcon className="w-5 h-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
            />
          </div>
          <div className="text-lg font-semibold mt-1">{name || 'User'}</div>
          <div className="text-gray-400 text-sm flex items-center gap-1"><Mail className="w-4 h-4" /> {email}</div>
        </div>
        <div className="w-full flex flex-col gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue"
              value={email}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">New Password</label>
            <input
              className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Change password"
              type="password"
              disabled={loading}
            />
          </div>
        </div>
        {success && <div className="mt-6 text-green-400 font-semibold">{success}</div>}
        {error && <div className="mt-6 text-red-400 font-semibold">{error}</div>}
        <div className="flex gap-4 mt-10 w-full">
          <button
            className="flex-1 gradient-button py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-lg disabled:opacity-60"
            onClick={handleSave}
            disabled={loading}
            type="button"
          >
            <Save className="w-5 h-5" /> Save Changes
          </button>
          <button
            className="flex-1 glass-card py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-lg border border-white/20 hover:bg-white/10 transition-colors"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 