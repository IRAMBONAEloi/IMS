import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { Plus, Shield, Trash2, UserPlus, Users as UsersIcon, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { authService } from '../../services/auth.service';
import { fetcher } from '../../services/fetcher';

type TeamUser = { id: number; name: string; email: string; role: 'ADMIN' | 'STAFF'; createdAt: string };

export default function Users() {
  const currentUser = authService.getUser();
  const { data: users = [], error, isLoading, mutate } = useSWR<TeamUser[]>('/users', fetcher);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    const values = new FormData(event.currentTarget);
    const payload = { name: values.get('name'), email: String(values.get('email')).trim().toLowerCase(), password: values.get('password'), role: values.get('role') };
    try { await api.post('/users', payload); await mutate(); setOpen(false); setNotice('Team member added.'); window.setTimeout(() => setNotice(''), 3000); }
    catch (cause) { setFormError((cause as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not add this team member.'); }
    finally { setSaving(false); }
  };

  const removeUser = async (user: TeamUser) => {
    if (!window.confirm(`Remove ${user.name} from this workspace?`)) return;
    try { await api.delete(`/users/${user.id}`); await mutate(); }
    catch (cause) { setNotice((cause as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not remove this team member.'); window.setTimeout(() => setNotice(''), 3500); }
  };

  return <AppShell title="Team" description="Manage who can access this shop’s inventory." actions={<button className="ims-button ims-button-primary" onClick={() => { setFormError(''); setOpen(true); }}><UserPlus size={16} /> Add teammate</button>}>
    {notice && <p className="ims-form-success" role="status">{notice}</p>}
    <section className="ims-panel"><div className="ims-panel-head"><div><h2 className="ims-panel-title">Workspace access</h2><p className="ims-panel-subtitle">Members can only see information inside this workspace.</p></div><span className="ims-count-chip"><UsersIcon size={14} /> {users.length} members</span></div>
      {error && <div className="ims-error-state" role="alert">Could not load team members.</div>}
      {isLoading ? <div className="ims-loading-list"><div className="ims-skeleton" /></div> : <div className="ims-table-wrap"><table className="ims-table"><thead><tr><th>Member</th><th>Role</th><th>Added</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{users.map((member) => <tr key={member.id}><td><div className="ims-product-cell"><span className="ims-avatar table-avatar">{member.name.slice(0, 1).toUpperCase()}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div></td><td><span className={`ims-role-badge ${member.role === 'ADMIN' ? 'is-admin' : ''}`}><Shield size={12} />{member.role === 'ADMIN' ? 'Owner / admin' : 'Staff'}</span></td><td>{new Intl.DateTimeFormat('en-RW', { dateStyle: 'medium' }).format(new Date(member.createdAt))}</td><td>{member.id !== currentUser?.id && <button className="ims-icon-button light" aria-label={`Remove ${member.name}`} title={`Remove ${member.name}`} onClick={() => void removeUser(member)}><Trash2 size={15} /></button>}</td></tr>)}</tbody></table></div>}
    </section>
    <aside className="ims-team-note"><Shield size={17} /><div><strong>Every shop has its own private workspace</strong><p>Team roles control which actions a member can take. Inventory data is scoped to this shop on the server.</p></div></aside>
    {open && <div className="ims-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="ims-modal" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title"><div className="ims-modal-head"><div><p className="ims-eyebrow">TEAM ACCESS</p><h2 id="member-dialog-title">Add a teammate</h2><p>Create an account for someone who works in this shop.</p></div><button className="ims-close-button" aria-label="Close dialog" onClick={() => setOpen(false)}><X size={17} /></button></div>
      <form onSubmit={createUser}><div className="ims-form-grid"><label className="ims-field span-two">Full name<input name="name" required minLength={2} autoComplete="name" /></label><label className="ims-field span-two">Email<input name="email" type="email" required autoComplete="email" /></label><label className="ims-field span-two">Temporary password<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label><label className="ims-field span-two">Role<select name="role" defaultValue="STAFF"><option value="STAFF">Staff — manage stock activity</option><option value="ADMIN">Admin — manage workspace settings</option></select></label></div>{formError && <p className="ims-form-error" role="alert">{formError}</p>}<div className="ims-modal-footer"><button className="ims-button ims-button-secondary" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="ims-button ims-button-dark" disabled={saving}><Plus size={14} />{saving ? 'Adding…' : 'Add teammate'}</button></div></form>
    </section></div>}
  </AppShell>;
}
