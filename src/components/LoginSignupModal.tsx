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
            <DialogDescription className="text-center text-white/70 mb-6">
              {tab === "login" ? "Login to your account" : "Create a new account"}
            </DialogDescription>
          </DialogHeader>
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
          {/* Social login */}
          <div className="flex items-center my-6 w-full">
            <div className="flex-1 h-px bg-white/20" />
            <span className="mx-4 text-white/40 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>
          <div className="flex w-full gap-3 mb-4">
            <Button
              type="button"
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={() => handleSocial("google")}
              disabled={loading}
            >
              <SiGoogle className="mr-2" size={18} /> Google
            </Button>
            <Button
              type="button"
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={() => handleSocial("apple")}
              disabled={loading}
            >
              <Apple className="mr-2" size={18} /> Apple
            </Button>
          </div>
          <Button
            type="button"
            className="w-full py-2 rounded-xl font-semibold text-base bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white/60 mt-2"
            disabled={guestDisabled}
          >
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 