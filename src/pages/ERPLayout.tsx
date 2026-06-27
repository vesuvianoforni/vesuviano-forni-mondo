import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ERPSidebar } from '@/components/erp/ERPSidebar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const ERPLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/erp/login');
        return;
      }
      // Check if user has any ERP role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (!roles || roles.length === 0) {
        navigate('/erp/login');
        return;
      }
      setAuthenticated(true);
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/erp/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading && !authenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (

    <>
      <SEOHead title="ERP | Vesuviano" description="Layout principale ERP." lang="it" noIndex />
      <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0f0f0f]">
        <ERPSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-amber-900/20 bg-[#141414] px-4 sticky top-0 z-10">
            <SidebarTrigger className="text-amber-200 hover:text-amber-100" />
            <span className="ml-4 text-sm font-medium text-amber-200/60">Vesuviano ERP</span>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
    </>
  );
};

export default ERPLayout;
