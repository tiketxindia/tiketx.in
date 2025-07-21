
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Watch from "./pages/Watch";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import MyTikets from "./pages/MyTikets";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import { UserTicketsProvider } from './hooks/useUserTickets';
import Watchlist from './pages/Watchlist';
import About from './pages/About';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

function AuthToastListener() {
  const { toast } = useToast();
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && !sessionStorage.getItem('tiketx_signed_in_toast')) {
        toast({ title: 'Signed in successfully!' });
        sessionStorage.setItem('tiketx_signed_in_toast', '1');
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthToastListener />
      <UserTicketsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="*" element={
              <Layout>
                <Routes>
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/watch/:id" element={<Watch />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/my-tikets" element={<MyTikets />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </UserTicketsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
