import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useToast } from "../hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User as UserIcon, Image as ImageIcon, Apple } from "lucide-react";
import { SiGoogle } from "react-icons/si";

interface LoginSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string | null;
}

export const LoginSignupModal: React.FC<LoginSignupModalProps> = ({ open, onOpenChange, redirectPath }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Social login handler (Google only)
  const handleSocial = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Social login failed");
    } finally {
      setLoading(false);
    }
  };

  // Google login button (primary)
  const GoogleButton = () => (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 py-3 mb-6 rounded-xl bg-white text-black font-semibold text-base shadow hover:bg-gray-100 transition-colors border border-white/20 max-w-[400px]"
      onClick={handleSocial}
      disabled={loading}
    >
      <span className="w-6 h-6 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 48 48">
          <g>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.1 0-13.2 3.7-16.7 9.3z"/>
            <path fill="#FBBC05" d="M24 45c5.3 0 10.1-1.8 13.8-4.9l-6.4-5.2C29.2 36.9 26.7 37.5 24 37.5c-5.7 0-10.6-3.9-12.3-9.1l-7 5.4C7.1 41.2 14.9 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C15.5 43.9 19.4 45 24 45c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/>
          </g>
        </svg>
      </span>
      Continue with Google
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-black/80 border-none shadow-2xl max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Logo */}
        <div className="absolute left-6 top-6 z-10">
          <img src="/mobile-logo.png" alt="TiketX Logo" className="h-8 w-auto opacity-80" />
        </div>
        <div className="flex flex-col items-center pt-12 pb-8 px-8">
          <DialogHeader className="w-full">
            <DialogTitle className="text-2xl font-bold text-white mb-2 text-center">Welcome to TiketX</DialogTitle>
            <DialogDescription className="text-center text-white/70 mb-8">
              Login or sign up with Google to continue
            </DialogDescription>
          </DialogHeader>
          {/* Google Login Button */}
          <div className="mt-3 max-w-[400px] mx-auto w-full">
            <GoogleButton />
          </div>
          {error && <div className="text-red-400 text-sm text-center mt-4">{error}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 