import { useCallback, useEffect, useState } from 'react';

import { toast } from 'react-toastify';

import PageShell from '../components/ui/PageShell';

import LoadingBlock from '../components/ui/LoadingBlock';

import Modal from '../components/ui/Modal';

import Button from '../components/ui/Button';

import api from '../services/axios';

import usePermissions from '../hooks/usePermissions';

import { PERMISSIONS } from '../utils/roles';



const STATUS_COLORS = {

  open: 'bg-slate-500/20 text-slate-300',

  in_progress: 'bg-blue-500/20 text-blue-300',

  verification: 'bg-amber-500/20 text-amber-300',

  closed: 'bg-emerald-500/20 text-emerald-300',

};



const CAPAPage = () => {

  const { can, isManager } = usePermissions();

  const [records, setRecords] = useState([]);

  const [users, setUsers] = useState([]);

  const [safetyReports, setSafetyReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({

    title: '',

    description: '',

    rootCause: '',

    severity: 'Medium',

    incidentId: '',

    owner: '',

    correctiveActions: [{ title: '', description: '', dueDate: '', status: 'pending' }],

  });



  const load = useCallback(async () => {

    setLoading(true);

    try {

      const requests = [

        api.get('/capa'),

        api.get('/capa/safety-reports'),

      ];

      if (isManager || can(PERMISSIONS.USER_MANAGE)) {

        requests.push(api.get('/users/getAllusers').catch(() => ({ data: [] })));

      }

      const results = await Promise.all(requests);

      setRecords(results[0].data.records || []);

      setSafetyReports(results[1].data.reports || []);

      if (results[2]) setUsers(Array.isArray(results[2].data) ? results[2].data : results[2].data?.users || []);

    } catch {

      toast.error('Failed to load CAPA records');

    } finally {

      setLoading(false);

    }

  }, [can, isManager]);



  useEffect(() => {

    load();

  }, [load]);



  const refreshSelected = async (id) => {

    try {

      const { data } = await api.get(`/capa/${id}`);

      setSelected(data.record);

    } catch {

      /* keep current selection */

    }

  };



  const create = async (e) => {

    e.preventDefault();

    try {

      await api.post('/capa', {

        ...form,

        incidentId: form.incidentId || undefined,

        owner: form.owner || undefined,

      });

      toast.success('CAPA created');

      setModalOpen(false);

      load();

    } catch (err) {

      toast.error(err.response?.data?.message || 'Create failed');

    }

  };



  const assignOwner = async (ownerId) => {

    if (!selected) return;

    try {

      await api.put(`/capa/${selected._id}`, { owner: ownerId || null });

      toast.success('Owner updated');

      await refreshSelected(selected._id);

      load();

    } catch {

      toast.error('Failed to assign owner');

    }

  };



  const completeAction = async (actionId, actionType) => {

    if (!selected) return;

    try {

      await api.patch(`/capa/${selected._id}/actions/complete`, { actionId, actionType });

      toast.success('Action marked complete');

      await refreshSelected(selected._id);

      load();

    } catch (err) {

      toast.error(err.response?.data?.message || 'Completion failed');

    }

  };



  const verifyAction = async (recordId, actionId, actionType) => {

    try {

      await api.patch(`/capa/${recordId}/verify`, { actionId, actionType, verificationNotes: 'Verified by supervisor' });

      toast.success('Action verified');

      await refreshSelected(recordId);

      load();

    } catch (err) {

      toast.error(err.response?.data?.message || 'Verification failed');

    }

  };



  const approveClosure = async () => {

    if (!selected) return;

    try {

      await api.patch(`/capa/${selected._id}/approve-closure`, { closureNotes: 'Approved for closure' });

      toast.success('CAPA closed');

      await refreshSelected(selected._id);

      load();

    } catch (err) {

      toast.error(err.response?.data?.message || 'Closure approval failed');

    }

  };



  const linkedReport = safetyReports.find((r) => String(r._id) === String(selected?.incidentId));



  return (

    <PageShell

      title="Incident & CAPA Management"

      subtitle="Corrective actions, ownership, and closure verification"

      variant="dark"

      action={

        <Button variant="primary" onClick={() => setModalOpen(true)}>Report incident / CAPA</Button>

      }

    >

      {loading ? (

        <LoadingBlock />

      ) : (

        <div className="grid lg:grid-cols-2 gap-4">

          <div className="space-y-3">

            {records.length === 0 ? (

              <p className="text-slate-500">No CAPA records yet.</p>

            ) : (

              records.map((r) => (

                <button

                  key={r._id}

                  type="button"

                  onClick={() => setSelected(r)}

                  className={`w-full text-left rounded-xl border p-4 transition ${

                    selected?._id === r._id ? 'border-amber-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'

                  }`}

                >

                  <div className="flex justify-between gap-2">

                    <h3 className="font-semibold text-white">{r.title}</h3>

                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>

                  </div>

                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{r.description}</p>

                  <p className="text-xs text-slate-500 mt-2">

                    {r.severity} · {r.owner?.name ? `Owner: ${r.owner.name}` : 'Unassigned'} · {new Date(r.createdAt).toLocaleDateString()}

                  </p>

                </button>

              ))

            )}

          </div>



          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 min-h-[320px]">

            {!selected ? (

              <p className="text-slate-500">Select a CAPA record to view details</p>

            ) : (

              <div className="space-y-4">

                <h2 className="text-xl font-bold text-white">{selected.title}</h2>

                <p className="text-slate-300">{selected.description}</p>

                {selected.rootCause && <p className="text-sm"><span className="text-slate-500">Root cause:</span> {selected.rootCause}</p>}



                {linkedReport && (

                  <p className="text-sm text-blue-300">

                    Linked safety report: {linkedReport.reportTitle || linkedReport.description?.slice(0, 60)}

                  </p>

                )}



                {isManager && (

                  <div>

                    <label className="text-xs uppercase text-slate-500">CAPA owner</label>

                    <select

                      className="input-field mt-1"

                      value={selected.owner?._id || selected.owner || ''}

                      onChange={(e) => assignOwner(e.target.value)}

                    >

                      <option value="">Unassigned</option>

                      {users.map((u) => (

                        <option key={u._id} value={u._id}>{u.name || u.email}</option>

                      ))}

                    </select>

                  </div>

                )}



                <div>

                  <h4 className="font-semibold text-white mb-2">Corrective actions</h4>

                  <ul className="space-y-2">

                    {(selected.correctiveActions || []).map((a) => (

                      <li key={a._id} className="text-sm border border-slate-600 rounded-lg p-2">

                        <p className="text-slate-200">{a.title}</p>

                        <p className="text-xs text-slate-500">{a.status} {a.dueDate && `· due ${new Date(a.dueDate).toLocaleDateString()}`}</p>

                        <div className="flex flex-wrap gap-2 mt-2">

                          {a.status === 'pending' || a.status === 'in_progress' ? (

                            <button type="button" className="text-xs text-blue-400" onClick={() => completeAction(a._id, 'corrective')}>

                              Mark complete

                            </button>

                          ) : null}

                          {can(PERMISSIONS.SAFETY_REPORT_APPROVE) && a.status === 'completed' && (

                            <button type="button" className="text-xs text-emerald-400" onClick={() => verifyAction(selected._id, a._id, 'corrective')}>

                              Verify action

                            </button>

                          )}

                        </div>

                      </li>

                    ))}

                  </ul>

                </div>



                {(selected.preventiveActions || []).length > 0 && (

                  <div>

                    <h4 className="font-semibold text-white mb-2">Preventive actions</h4>

                    <ul className="space-y-2">

                      {selected.preventiveActions.map((a) => (

                        <li key={a._id} className="text-sm border border-slate-600 rounded-lg p-2">

                          <p className="text-slate-200">{a.title}</p>

                          <p className="text-xs text-slate-500">{a.status}</p>

                          <div className="flex flex-wrap gap-2 mt-2">

                            {(a.status === 'pending' || a.status === 'in_progress') && (

                              <button type="button" className="text-xs text-blue-400" onClick={() => completeAction(a._id, 'preventive')}>

                                Mark complete

                              </button>

                            )}

                            {can(PERMISSIONS.SAFETY_REPORT_APPROVE) && a.status === 'completed' && (

                              <button type="button" className="text-xs text-emerald-400" onClick={() => verifyAction(selected._id, a._id, 'preventive')}>

                                Verify action

                              </button>

                            )}

                          </div>

                        </li>

                      ))}

                    </ul>

                  </div>

                )}



                {can(PERMISSIONS.SAFETY_REPORT_APPROVE) && selected.status !== 'closed' && (

                  <div className="flex flex-wrap gap-2">

                    <Button variant="primary" onClick={approveClosure}>Approve closure</Button>

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      )}



      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New CAPA / Incident" size="lg">

        <form onSubmit={create} className="space-y-3">

          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

          <textarea className="input-field" rows={3} placeholder="Incident description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />

          <input className="input-field" placeholder="Root cause (optional)" value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} />

          <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>

            {['Low', 'Medium', 'High', 'Critical'].map((s) => <option key={s} value={s}>{s}</option>)}

          </select>

          <select className="input-field" value={form.incidentId} onChange={(e) => setForm({ ...form, incidentId: e.target.value })}>

            <option value="">Link to safety report (optional)</option>

            {safetyReports.map((r) => (

              <option key={r._id} value={r._id}>{r.reportTitle || r.description?.slice(0, 50) || r._id}</option>

            ))}

          </select>

          {users.length > 0 && (

            <select className="input-field" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>

              <option value="">Assign owner (optional)</option>

              {users.map((u) => (

                <option key={u._id} value={u._id}>{u.name || u.email}</option>

              ))}

            </select>

          )}

          <input

            className="input-field"

            placeholder="Corrective action"

            value={form.correctiveActions[0].title}

            onChange={(e) => setForm({

              ...form,

              correctiveActions: [{ ...form.correctiveActions[0], title: e.target.value }],

            })}

          />

          <div className="flex justify-end gap-2">

            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>

            <Button type="submit" variant="primary">Create</Button>

          </div>

        </form>

      </Modal>

    </PageShell>

  );

};



export default CAPAPage;

