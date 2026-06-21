import api from '../services/axios';
import { useEffect, useState } from 'react';
import AccessDenied from './AccessDenied';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';

const ROLES = ['worker', 'Inspector', 'Safety Manager', 'Shift Incharge', 'Mine admin', 'Super admin'];

const UserManagement = () => {
  const { can } = usePermissions();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'worker' });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/getAllusers');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', role: 'worker' });
    setEditMode(false);
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setSelected(user);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMode && selected) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${selected._id}`, payload);
      } else {
        await api.post('/users/', form);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || e.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete');
    }
  };

  if (!can(PERMISSIONS.USER_MANAGE)) {
    return <AccessDenied message="Only Mine Admin and Super Admin can manage user accounts." />;
  }

  return (
    <PageShell
      title="User management"
      subtitle="Manage workers, inspectors, and administrators"
      action={<Button onClick={openCreate}><FaPlus /> Add user</Button>}
    >
      <div className="toolbar">
        <input
          className="input-field flex-1"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" message="Add a user or adjust your search." action={<Button onClick={openCreate}>Add user</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td className="font-medium text-slate-800 dark:text-white">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge-warning">{u.role}</span></td>
                  <td className="text-right space-x-2">
                    <button type="button" className="btn-ghost !py-1" onClick={() => openEdit(u)}><FaEdit /></button>
                    <button type="button" className="btn-ghost !py-1 text-red-500" onClick={() => handleDelete(u._id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? 'Edit user' : 'New user'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Name">
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Email">
            <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label={editMode ? 'New password (optional)' : 'Password'}>
            <input className="input-field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
          <FormField label="Role">
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FormField>
        </div>
      </Modal>
    </PageShell>
  );
};

export default UserManagement;
