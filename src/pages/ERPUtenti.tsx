import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Loader2, Users, Shield, Trash2 } from 'lucide-react';

type UserRole = {
  id: string;
  user_id: string;
  role: string;
  created_at: string | null;
};

const ROLES = [
  { value: 'admin', label: 'Amministratore', description: 'Accesso completo a tutti i moduli', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { value: 'commerciale', label: 'Commerciale', description: 'CRM, ordini, pro-forma, lead', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'produzione', label: 'Produzione', description: 'Ordini (solo stato), forni', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
];

const ERPUtenti = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('commerciale');

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Errore caricamento ruoli');
    const rolesData = (data as UserRole[]) || [];
    setRoles(rolesData);

    // Fetch emails via security definer function
    if (rolesData.length > 0) {
      const userIds = rolesData.map(r => r.user_id);
      const { data: emailData } = await supabase.rpc('get_user_emails', { user_ids: userIds });
      if (emailData) {
        const map: Record<string, string> = {};
        (emailData as any[]).forEach(e => { map[e.user_id] = e.email; });
        setEmailMap(map);
      }
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword || newPassword.length < 6) {
      toast.error('Inserisci email e password (min 6 caratteri)');
      return;
    }
    setSaving(true);
    try {
      // Use the create-admin edge function to create user with role
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email: newEmail, password: newPassword, role: newRole, secret: 'Zapper2019!' },
      });
      if (error) throw error;
      toast.success(`Utente ${newEmail} creato con ruolo ${newRole}`);
      setShowCreateModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('commerciale');
      fetchRoles();
    } catch (e: any) {
      toast.error('Errore: ' + (e.message || 'Impossibile creare utente'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleEntry: UserRole) => {
    if (!confirm(`Rimuovere il ruolo ${roleEntry.role} per questo utente?`)) return;
    const { error } = await supabase.from('user_roles').delete().eq('id', roleEntry.id);
    if (error) { toast.error('Errore eliminazione'); return; }
    toast.success('Ruolo rimosso');
    fetchRoles();
  };

  const getRoleBadge = (role: string) => {
    const r = ROLES.find(rl => rl.value === role);
    return <Badge variant="outline" className={r?.color || ''}>{r?.label || role}</Badge>;
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-amber-100">Gestione Utenti</h1>
        <Button onClick={() => setShowCreateModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" />Nuovo Utente
        </Button>
      </div>

      {/* Role descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map(r => (
          <Card key={r.value} className="bg-[#1a1a1a] border-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-amber-500" />
                {getRoleBadge(r.value)}
              </div>
              <p className="text-amber-200/50 text-sm">{r.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users table */}
      <Card className="bg-[#1a1a1a] border-amber-900/20">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
          ) : roles.length === 0 ? (
            <div className="text-center py-20 text-amber-200/40">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nessun utente con ruoli assegnati</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-amber-900/20 hover:bg-transparent">
                  <TableHead className="text-amber-500/60">Email</TableHead>
                  <TableHead className="text-amber-500/60">User ID</TableHead>
                  <TableHead className="text-amber-500/60">Data Assegnazione</TableHead>
                  <TableHead className="text-amber-500/60 text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(r => (
                  <TableRow key={r.id} className="border-amber-900/10 hover:bg-amber-900/5">
                    <TableCell className="text-amber-100 font-mono text-xs">{r.user_id.substring(0, 12)}...</TableCell>
                    <TableCell>{getRoleBadge(r.role)}</TableCell>
                    <TableCell className="text-amber-200/40 text-sm">{r.created_at ? new Date(r.created_at).toLocaleDateString('it-IT') : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteRole(r)} className="text-red-400 hover:text-red-200 hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#141414] border-amber-900/30 text-amber-100">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Crea Nuovo Utente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-amber-200/80">Email</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="utente@azienda.com" className="bg-[#1a1a1a] border-amber-900/30 text-amber-100" /></div>
            <div><Label className="text-amber-200/80">Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimo 6 caratteri" className="bg-[#1a1a1a] border-amber-900/30 text-amber-100" /></div>
            <div><Label className="text-amber-200/80">Ruolo</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-[#1a1a1a] border-amber-900/30 text-amber-100"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label} — {r.description}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="border-amber-900/30 text-amber-200">Annulla</Button>
            <Button onClick={handleCreateUser} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Crea Utente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ERPUtenti;
