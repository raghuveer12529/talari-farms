'use client';

import { useState, useTransition } from 'react';
import { createPartner, deletePartner, changePassword } from '@/actions/admin';
import { Users, Plus, Trash2, KeyRound, X } from 'lucide-react';

const INPUT =
  'w-full bg-input border border-border/40 rounded-[0.875rem] px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface Props {
  users: User[];
  currentUserId: string;
}

export default function AdminClient({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [pwdUserId, setPwdUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createPartner(data);
        setAddOpen(false);
        window.location.reload();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from the farm ledger? This will delete all their data.`)) return;
    startTransition(async () => {
      try {
        await deletePartner(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const data = new FormData(e.currentTarget);
    data.set('userId', pwdUserId!);
    startTransition(async () => {
      try {
        await changePassword(data);
        setPwdUserId(null);
        alert('Password updated successfully');
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  const pwdUser = users.find((u) => u.id === pwdUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Admin</span>
          <h1 className="font-display text-3xl font-bold text-foreground mt-1">
            Manage <span className="gradient-text">Partners</span>
          </h1>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-gradient-hero text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft hover:shadow-glow hover:scale-105 transition-all"
        >
          <Plus size={16} /> Add Partner
        </button>
      </div>

      {/* Users list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h2 className="font-bold text-foreground">{users.length} Partner{users.length !== 1 ? 's' : ''}</h2>
        </div>
        <div className="divide-y divide-border/30">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-sm">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {u.name} {u.id === currentUserId && <span className="text-[11px] text-muted-foreground">(You)</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  u.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {u.role}
                </span>
                <button
                  onClick={() => { setPwdUserId(u.id); setError(''); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Change password"
                >
                  <KeyRound size={15} />
                </button>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    disabled={pending}
                    className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
                    title="Remove partner"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add partner modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="glass-card rounded-[2rem] p-8 w-full max-w-md shadow-elegant">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">Add Partner</h2>
              <button onClick={() => { setAddOpen(false); setError(''); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Full Name *</label>
                <input name="name" type="text" required placeholder="Partner name" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Email *</label>
                <input name="email" type="email" required placeholder="partner@email.com" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Password *</label>
                <input name="password" type="password" required minLength={8} placeholder="Min 8 characters" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Role</label>
                <select name="role" className={INPUT}>
                  <option value="PARTNER">Partner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-gradient-hero text-white py-3 rounded-[0.875rem] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {pending ? 'Creating…' : 'Create Partner'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {pwdUserId && pwdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="glass-card rounded-[2rem] p-8 w-full max-w-sm shadow-elegant">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Change Password</h2>
                <p className="text-sm text-muted-foreground mt-1">For {pwdUser.name}</p>
              </div>
              <button onClick={() => { setPwdUserId(null); setError(''); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">New Password *</label>
                <input name="newPassword" type="password" required minLength={8} placeholder="Min 8 characters" className={INPUT} />
              </div>
              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-gradient-hero text-white py-3 rounded-[0.875rem] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {pending ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
