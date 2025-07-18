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
  const [tab, setTab] = useState<'login' | 'signup'>("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: undefined as File | undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "profilePic" && files) {
      setForm((f) => ({ ...f, profilePic: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Handle login/signup submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast({ title: "Login successful!", variant: "default" });
        onOpenChange(false);
        // Redirect logic here (e.g., window.location or router)
      } else {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name } },
        });
        if (error) throw error;
        toast({ title: "Signup successful!", variant: "default" });
        onOpenChange(false);
        // Redirect logic here
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers (Google/Apple)
  const handleSocial = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      toast({ title: `Signed in with ${provider}` });
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
      onClick={() => handleSocial('google')}
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

  // Guest logic (disabled for purchase)
  const guestDisabled = !!(redirectPath && redirectPath.startsWith("/movie"));

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
              {tab === "login" ? "Login to your account" : "Create a new account"}
            </DialogDescription>
          </DialogHeader>
          {/* Google Login Button */}
          <div className="mt-3 max-w-[400px] mx-auto w-full">
            <GoogleButton />
          </div>
          {/* Tabs */}
          <div className="flex w-full mb-8 rounded-xl bg-white/5 p-1 gap-2">
            <button
              className={`flex-1 py-2 rounded-xl font-semibold transition-all text-base ${tab === "login" ? "bg-gradient-to-r from-tiketx-pink via-tiketx-violet to-tiketx-blue text-white shadow-lg" : "text-white/60 hover:text-white"}`}
              onClick={() => setTab("login")}
              disabled={tab === "login"}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 rounded-xl font-semibold transition-all text-base ${tab === "signup" ? "bg-gradient-to-r from-tiketx-pink via-tiketx-violet to-tiketx-blue text-white shadow-lg" : "text-white/60 hover:text-white"}`}
              onClick={() => setTab("signup")}
              disabled={tab === "signup"}
            >
              Sign Up
            </button>
          </div>
          {/* Form */}
          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            {tab === "signup" && (
              <div className="relative">
                <Input
                  name="name"
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10 bg-black/60 border-tiketx-pink/40 text-white rounded-xl"
                  required
                />
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-tiketx-pink" size={20} />
              </div>
            )}
            <div className="relative">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="pl-10 bg-black/60 border-tiketx-blue/40 text-white rounded-xl"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-tiketx-blue" size={20} />
            </div>
            <div className="relative">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="pl-10 bg-black/60 border-tiketx-violet/40 text-white rounded-xl"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-tiketx-violet" size={20} />
            </div>
            {tab === "signup" && (
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 bg-black/60 border-tiketx-violet/40 text-white rounded-xl"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-tiketx-violet" size={20} />
              </div>
            )}
            {tab === "signup" && (
              <div className="relative flex items-center gap-3">
                <label htmlFor="profilePic" className="flex items-center cursor-pointer">
                  <Avatar className="w-10 h-10 mr-2">
                    {form.profilePic ? (
                      <AvatarImage src={URL.createObjectURL(form.profilePic)} />
                    ) : (
                      <AvatarFallback>
                        <ImageIcon className="text-tiketx-blue" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm text-white/70">Upload Profile Picture</span>
                  <Input
                    id="profilePic"
                    name="profilePic"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                  />
                </label>
              </div>
            )}
            {tab === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-tiketx-blue text-sm hover:underline">Forgot Password?</button>
              </div>
            )}
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            <Button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-tiketx-pink via-tiketx-violet to-tiketx-blue text-white shadow-lg"
              disabled={loading}
            >
              {tab === "login" ? "Login" : "Sign Up"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 