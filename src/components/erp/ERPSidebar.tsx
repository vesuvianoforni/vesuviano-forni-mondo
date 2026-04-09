import {
  LayoutDashboard,
  Users,
  Settings as SettingsIcon,
  FileText,
  BookOpen,
  Package,
  TrendingUp,
  Flame,
  LogOut,
  Truck,
  ShieldCheck,
  DollarSign,
  PackageCheck,
  Brain,
  MessageCircle,
  Store,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const mainItems = [
  { title: 'Dashboard', url: '/erp', icon: LayoutDashboard },
  { title: 'CRM', url: '/erp/crm', icon: Users },
  { title: 'Pro-Forma', url: '/erp/proforma', icon: FileText },
  { title: 'Configuratore', url: '/erp/configuratore', icon: SettingsIcon },
];

const catalogItems = [
  { title: 'Forni', url: '/erp/forni', icon: Flame },
  { title: 'Bruciatori', url: '/erp/bruciatori', icon: Package },
  { title: 'Pronta Consegna', url: '/erp/pronta-consegna', icon: PackageCheck },
  { title: 'Listini', url: '/erp/listini', icon: DollarSign },
  { title: 'Listino Rivenditori', url: '/erp/listino-rivenditori', icon: Store },
];

const contentItems = [
  { title: 'Blog', url: '/erp/blog', icon: BookOpen },
  { title: 'Lead Sito Web', url: '/erp/leads', icon: TrendingUp },
  { title: 'Chat AI Logs', url: '/erp/chat-logs', icon: MessageCircle },
  { title: 'Knowledge Base AI', url: '/erp/knowledge-base', icon: Brain },
];

const operationsItems = [
  { title: 'Ordini', url: '/erp/ordini', icon: Truck },
  { title: 'Utenti', url: '/erp/utenti', icon: ShieldCheck },
];

export function ERPSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/erp') return currentPath === '/erp';
    return currentPath.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/erp/login');
  };

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-amber-500/60 text-xs uppercase tracking-wider">
        {!collapsed && label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                className={`transition-colors ${
                  isActive(item.url)
                    ? 'bg-amber-900/30 text-amber-100'
                    : 'text-gray-400 hover:text-amber-200 hover:bg-amber-900/10'
                }`}
              >
                <a href={item.url} onClick={(e) => { e.preventDefault(); navigate(item.url); }}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-amber-900/20 bg-[#141414]">
      <SidebarContent className="bg-[#141414]">
        {/* Logo */}
        <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
          {collapsed ? (
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">V</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">V</div>
              <div>
                <p className="text-amber-100 font-semibold text-sm">Vesuviano</p>
                <p className="text-amber-500/50 text-xs">ERP & CRM</p>
              </div>
            </div>
          )}
        </div>

        {renderGroup('Principale', mainItems)}
        {renderGroup('Catalogo', catalogItems)}
        {renderGroup('Contenuti', contentItems)}
        {renderGroup('Operazioni', operationsItems)}
      </SidebarContent>

      <SidebarFooter className="bg-[#141414] border-t border-amber-900/20 p-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-500 hover:text-red-400 hover:bg-red-900/10"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
