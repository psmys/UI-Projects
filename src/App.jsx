import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, CircleUserRound, LoaderCircle, Plus, Search, Users, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const emptyEmployee = { firstName: '', lastName: '', email: '', position: '', team: '', salary: '' };

const employeeName = (employee) => employee.name || [employee.firstName, employee.lastName].filter(Boolean).join(' ') || 'Unnamed person';

function App() {
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState('All teams');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(emptyEmployee);
  const [employeeDrafts, setEmployeeDrafts] = useState([emptyEmployee]);

  const loadEmployees = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/employees`);
      if (!response.ok) throw new Error('Could not load employees.');
      setEmployees(await response.json());
    } catch (requestError) {
      setError(`${requestError.message} Check that the backend is running at ${API_URL}.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  const teams = useMemo(() => ['All teams', ...new Set(employees.map((employee) => employee.team).filter(Boolean))], [employees]);
  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    const searchable = `${employeeName(employee)} ${employee.email} ${employee.position} ${employee.team || ''}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (team === 'All teams' || employee.team === team);
  }), [employees, query, team]);

  const openCreate = () => { setEditingEmployee(null); setEmployeeDrafts([{ ...emptyEmployee }]); setIsPanelOpen(true); };
  const openEdit = (employee) => { setEditingEmployee(employee); setForm({ firstName: employee.firstName || '', lastName: employee.lastName || '', email: employee.email || '', position: employee.position || '', team: employee.team || '', salary: employee.salary || '' }); setIsPanelOpen(true); };
  const closePanel = () => setIsPanelOpen(false);
  const updateForm = (event, index = 0) => {
    const { name, value } = event.target;
    if (editingEmployee) {
      setForm((currentForm) => ({ ...currentForm, [name]: value }));
      return;
    }
    setEmployeeDrafts((currentDrafts) => currentDrafts.map((draft, draftIndex) => draftIndex === index ? { ...draft, [name]: value } : draft));
  };
  const addEmployeeDraft = () => setEmployeeDrafts((currentDrafts) => [...currentDrafts, { ...emptyEmployee }]);
  const removeEmployeeDraft = (index) => setEmployeeDrafts((currentDrafts) => currentDrafts.filter((_, draftIndex) => draftIndex !== index));

  const saveEmployee = async (event) => {
    event.preventDefault();
    const method = editingEmployee ? 'PUT' : 'POST';
    const endpoint = editingEmployee ? `${API_URL}/employees/${editingEmployee.id}` : `${API_URL}/employees/bulk`;
    const employeesToSave = (editingEmployee ? [form] : employeeDrafts).map((employee) => ({ ...employee, salary: Number(employee.salary) }));
    const body = JSON.stringify(editingEmployee ? employeesToSave[0] : employeesToSave);
    try {
      const response = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) throw new Error('Could not save employee.');
      closePanel();
      await loadEmployees();
    } catch (requestError) { setError(requestError.message); }
  };

  const deleteEmployee = async (employee) => {
    if (!window.confirm(`Remove ${employeeName(employee)} from the directory?`)) return;
    try {
      const response = await fetch(`${API_URL}/employees/${employee.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not remove employee.');
      await loadEmployees();
    } catch (requestError) { setError(requestError.message); }
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">P</span><span>People</span></div>
        <nav><a className="active" href="#directory"><Users size={17} /> Directory</a><a href="#teams"><BriefcaseBusiness size={17} /> Teams</a></nav>
        <div className="sidebar-foot"><div className="profile"><CircleUserRound size={30} /><span><strong>Workspace</strong><small>People ops</small></span></div></div>
      </aside>

      <section className="content" id="directory">
        <header className="topbar"><span className="crumb">Workspace <b>/</b> Directory</span><button className="avatar">PA</button></header>
        <div className="intro"><div><p className="eyebrow">People operations</p><h1>Your people, at a glance.</h1><p className="lede">A simple home for the people who keep everything moving.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17} /> Add people</button></div>

        <div className="stats"><div><span>Total people</span><strong>{employees.length}</strong></div><div><span>Teams</span><strong>{Math.max(teams.length - 1, 0)}</strong></div><div><span>Showing</span><strong>{filteredEmployees.length}</strong></div></div>
        <div className="toolbar"><label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" /></label><label className="select-wrap"><select value={team} onChange={(event) => setTeam(event.target.value)}>{teams.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></label></div>

        {error && <div className="notice">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
        <div className="table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Team</th><th>Salary</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{isLoading ? <tr><td className="loading" colSpan="5"><LoaderCircle className="spin" size={20} /> Loading directory...</td></tr> : filteredEmployees.map((employee) => <tr key={employee.id}><td><div className="person"><span className="person-initials">{employeeName(employee).split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{employeeName(employee)}</strong><small>{employee.email}</small></span></div></td><td>{employee.position || '—'}</td><td><span className="team-tag">{employee.team || 'Unassigned'}</span></td><td>{employee.salary ? `$${Number(employee.salary).toLocaleString()}` : '—'}</td><td><button className="row-action" onClick={() => openEdit(employee)} aria-label={`Edit ${employeeName(employee)}`}><ArrowUpRight size={17} /></button></td></tr>)}{!isLoading && filteredEmployees.length === 0 && <tr><td className="empty" colSpan="5">No people match your search.</td></tr>}</tbody></table></div>
      </section>

      {isPanelOpen && <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && closePanel()}><aside className="panel"><div className="panel-head"><div><p className="eyebrow">Directory</p><h2>{editingEmployee ? 'Edit person' : 'Add people'}</h2></div><button className="close-button" onClick={closePanel} aria-label="Close"><X size={19} /></button></div><form onSubmit={saveEmployee}>{(editingEmployee ? [form] : employeeDrafts).map((employee, index) => <div className="employee-entry" key={editingEmployee ? editingEmployee.id : index}>{!editingEmployee && <div className="entry-heading"><strong>Person {index + 1}</strong>{employeeDrafts.length > 1 && <button type="button" className="row-action" onClick={() => removeEmployeeDraft(index)} aria-label={`Remove person ${index + 1}`}><X size={16} /></button>}</div>}{['firstName', 'lastName', 'email', 'position', 'team', 'salary'].map((field) => <label key={field}>{field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'position' ? 'Role' : field[0].toUpperCase() + field.slice(1)}<input required={field !== 'salary'} name={field} type={field === 'salary' ? 'number' : field === 'email' ? 'email' : 'text'} value={employee[field] || ''} onChange={(event) => updateForm(event, index)} /></label>)}</div>)}{!editingEmployee && <button type="button" className="secondary-button add-row-button" onClick={addEmployeeDraft}><Plus size={16} /> Add another person</button>}<div className="form-actions"><button type="button" className="secondary-button" onClick={closePanel}>Cancel</button><button className="primary-button" type="submit">{editingEmployee ? 'Save changes' : 'Add people'}</button></div>{editingEmployee && <button type="button" className="delete-button" onClick={() => { deleteEmployee(editingEmployee); closePanel(); }}>Remove from directory</button>}</form></aside></div>}
    </main>
  );
}

export default App;