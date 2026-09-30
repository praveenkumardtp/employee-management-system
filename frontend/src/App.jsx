import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, LayoutDashboard, Search, Plus, Filter, 
  Trash2, Edit, ChevronLeft, ChevronRight, LogOut, CheckCircle2, 
  AlertCircle, DollarSign, Calendar, Mail, Phone, Briefcase, 
  ShieldCheck, UserCheck, UserX, Clock
} from 'lucide-react';
import { api } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(api.getCurrentUser());
  const [activeTab, setActiveTab] = useState('employees'); // 'dashboard', 'employees', 'departments'

  // Auth Form State
  const [username, setUsername] = useState('admin@ems.company.com');
  const [password, setPassword] = useState('admin123');
  const [authLoading, setAuthLoading] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Dashboard Stats State
  const [stats, setStats] = useState(null);

  // Employees State
  const [employees, setEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Departments State
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    departmentId: ''
  });

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [editingDept, setEditingDept] = useState(null);

  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Initial Load
  useEffect(() => {
    if (currentUser) {
      loadDepartments();
      if (activeTab === 'dashboard') loadStats();
      if (activeTab === 'employees') loadEmployees();
    }
  }, [currentUser, activeTab, page, deptFilter, statusFilter, sortBy, sortDir]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const user = await api.login(username, password);
      setCurrentUser(user);
      showToast(`Welcome back, ${user.username}!`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    showToast('Logged out successfully');
  };

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      showToast('Failed to load dashboard metrics', 'error');
    }
  };

  const loadDepartments = async () => {
    setLoadingDepts(true);
    try {
      const data = await api.getDepartments();
      setDepartments(data);
      if (data.length > 0 && !employeeForm.departmentId) {
        setEmployeeForm(prev => ({ ...prev, departmentId: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDepts(false);
    }
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await api.getEmployees({
        search,
        departmentId: deptFilter,
        status: statusFilter,
        page,
        size: 10,
        sortBy,
        sortDir
      });
      setEmployees(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showToast('Failed to fetch employees', 'error');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadEmployees();
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...employeeForm,
        salary: parseFloat(employeeForm.salary),
        departmentId: parseInt(employeeForm.departmentId)
      };

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, payload);
        showToast('Employee updated successfully');
      } else {
        await api.createEmployee(payload);
        showToast('Employee created successfully');
      }
      setShowEmployeeModal(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openCreateEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: '',
      salary: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      departmentId: departments.length > 0 ? departments[0].id : ''
    });
    setShowEmployeeModal(true);
  };

  const openEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation,
      salary: emp.salary,
      joiningDate: emp.joiningDate,
      status: emp.status,
      departmentId: emp.departmentId
    });
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee: ${name}?`)) {
      try {
        await api.deleteEmployee(id);
        showToast(`Employee ${name} deleted successfully`);
        loadEmployees();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, deptForm);
        showToast('Department updated successfully');
      } else {
        await api.createDepartment(deptForm);
        showToast('Department created successfully');
      }
      setShowDeptModal(false);
      setEditingDept(null);
      loadDepartments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteDept = async (id, name) => {
    if (window.confirm(`Delete department: ${name}?`)) {
      try {
        await api.deleteDepartment(id);
        showToast(`Department ${name} deleted`);
        loadDepartments();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="status-pill status-active">Active</span>;
      case 'ON_LEAVE':
        return <span className="status-pill status-leave">On Leave</span>;
      case 'TERMINATED':
        return <span className="status-pill status-term">Terminated</span>;
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  // Render Login Screen if not authenticated
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '52px', height: '52px', background: '#2563eb', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '14px' }}>
              <Users size={28} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>EMS Portal</h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>Sign in to manage employees & organization</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Work Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }} disabled={authLoading}>
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Quick Demo Logins:</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ flex: 1 }}
                onClick={() => { setUsername('admin@ems.company.com'); setPassword('admin123'); }}
              >
                Admin (Full Access)
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ flex: 1 }}
                onClick={() => { setUsername('hr@ems.company.com'); setPassword('hr123456'); }}
              >
                HR Manager
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div className={`toast-notice ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ems-layout">
      {/* Sidebar */}
      <aside className="ems-sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">
            <Users size={22} />
          </div>
          <div>
            <div className="brand-title">StaffCore EMS</div>
            <div className="brand-sub">Enterprise Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <Users size={18} />
            <span>Employees</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <Building2 size={18} />
            <span>Departments</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.email || currentUser.username}</div>
              <div className="user-role">{currentUser.roles ? Array.from(currentUser.roles).join(', ') : 'STAFF'}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ color: '#cbd5e1', borderColor: '#334155', justifyContent: 'center' }} onClick={handleLogout}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ems-main">
        <header className="ems-topbar">
          <div className="topbar-title">
            <h1>
              {activeTab === 'dashboard' && 'Executive HR Dashboard'}
              {activeTab === 'employees' && 'Employee Directory'}
              {activeTab === 'departments' && 'Department Organization'}
            </h1>
          </div>
          <div className="topbar-actions">
            {activeTab === 'employees' && (
              <button className="btn btn-primary" onClick={openCreateEmployee}>
                <Plus size={16} />
                <span>Add Employee</span>
              </button>
            )}
            {activeTab === 'departments' && (
              <button className="btn btn-primary" onClick={() => { setEditingDept(null); setDeptForm({ name: '', code: '', description: '' }); setShowDeptModal(true); }}>
                <Plus size={16} />
                <span>Add Department</span>
              </button>
            )}
          </div>
        </header>

        <main className="ems-content">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {stats ? (
                <>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <Users size={24} />
                      </div>
                      <div className="metric-info">
                        <h3>Total Staff</h3>
                        <p>{stats.totalEmployees}</p>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <UserCheck size={24} />
                      </div>
                      <div className="metric-info">
                        <h3>Active Staff</h3>
                        <p>{stats.activeEmployees}</p>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                        <Clock size={24} />
                      </div>
                      <div className="metric-info">
                        <h3>On Leave</h3>
                        <p>{stats.onLeaveEmployees}</p>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}>
                        <UserX size={24} />
                      </div>
                      <div className="metric-info">
                        <h3>Terminated</h3>
                        <p>{stats.terminatedEmployees}</p>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                        <DollarSign size={24} />
                      </div>
                      <div className="metric-info">
                        <h3>Avg Salary</h3>
                        <p>${stats.averageSalary ? Number(stats.averageSalary).toLocaleString() : '0'}</p>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon-box" style={{ background: '#ecfeff', color: '#0891b2' }}>
                        <Building2 size={24} />
                      </div>
                      <div className="metric-info">
                        <h3>Total Payroll</h3>
                        <p>${stats.totalPayroll ? Number(stats.totalPayroll).toLocaleString() : '0'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Department Distribution Grid */}
                  <div className="table-card" style={{ padding: '24px', marginTop: '20px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Staffing by Department</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                      {Object.entries(stats.departmentDistribution || {}).map(([dept, count]) => (
                        <div key={dept} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{dept}</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{count} employees</div>
                          <div style={{ marginTop: '8px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${stats.totalEmployees > 0 ? (count / stats.totalEmployees) * 100 : 0}%`, height: '100%', background: '#2563eb' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px' }}>Loading analytics...</div>
              )}
            </div>
          )}

          {/* TAB 2: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div>
              {/* Filter and Search Bar */}
              <div className="toolbar-card">
                <form onSubmit={handleSearchSubmit} className="search-input-wrap">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search by name, email, role..." 
                    className="input-field" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                  />
                </form>

                <div className="filter-group">
                  <select 
                    className="select-field" 
                    value={deptFilter} 
                    onChange={e => { setDeptFilter(e.target.value); setPage(0); }}
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  <select 
                    className="select-field" 
                    value={statusFilter} 
                    onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>

                  <select 
                    className="select-field" 
                    value={`${sortBy}_${sortDir}`} 
                    onChange={e => {
                      const [by, dir] = e.target.value.split('_');
                      setSortBy(by);
                      setSortDir(dir);
                    }}
                  >
                    <option value="id_desc">Newest First</option>
                    <option value="id_asc">Oldest First</option>
                    <option value="salary_desc">Salary (High to Low)</option>
                    <option value="salary_asc">Salary (Low to High)</option>
                    <option value="firstName_asc">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="table-card">
                {loadingEmployees ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading employees...</div>
                ) : employees.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600 }}>No employees found</p>
                    <p style={{ fontSize: '0.85rem' }}>Try clearing filters or add a new employee.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Designation</th>
                        <th>Department</th>
                        <th>Salary</th>
                        <th>Joining Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{emp.fullName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{emp.email}</div>
                          </td>
                          <td>{emp.designation}</td>
                          <td>
                            <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                              {emp.departmentName}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>${Number(emp.salary).toLocaleString()}</td>
                          <td>{emp.joiningDate}</td>
                          <td>{getStatusBadge(emp.status)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button 
                                className="btn btn-outline btn-sm" 
                                title="View Details"
                                onClick={() => setViewingEmployee(emp)}
                              >
                                View
                              </button>
                              <button 
                                className="btn btn-outline btn-sm" 
                                title="Edit Employee"
                                onClick={() => openEditEmployee(emp)}
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="btn btn-outline btn-sm" 
                                style={{ color: '#ef4444' }} 
                                title="Delete Employee"
                                onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Pagination */}
                <div className="pagination-bar">
                  <div>
                    Showing <strong>{employees.length}</strong> of <strong>{totalElements}</strong> employees
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      className="btn btn-outline btn-sm" 
                      disabled={page === 0} 
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
                    <button 
                      className="btn btn-outline btn-sm" 
                      disabled={page >= totalPages - 1} 
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div>
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Staff Count</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept.id}>
                        <td style={{ fontWeight: 600 }}>{dept.name}</td>
                        <td>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem' }}>
                            {dept.code}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{dept.description || 'No description provided'}</td>
                        <td style={{ fontWeight: 600 }}>{dept.employeeCount || 0}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setEditingDept(dept);
                                setDeptForm({ name: dept.name, code: dept.code, description: dept.description || '' });
                                setShowDeptModal(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="btn btn-outline btn-sm" 
                              style={{ color: '#ef4444' }}
                              onClick={() => handleDeleteDept(dept.id, dept.name)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {showEmployeeModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}</h2>
              <button 
                onClick={() => setShowEmployeeModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEmployee}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={employeeForm.firstName} 
                      onChange={e => setEmployeeForm({ ...employeeForm, firstName: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={employeeForm.lastName} 
                      onChange={e => setEmployeeForm({ ...employeeForm, lastName: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Work Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={employeeForm.email} 
                      onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      value={employeeForm.phone} 
                      onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Designation / Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={employeeForm.designation} 
                      onChange={e => setEmployeeForm({ ...employeeForm, designation: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Annual Salary ($)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      value={employeeForm.salary} 
                      onChange={e => setEmployeeForm({ ...employeeForm, salary: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      className="form-input" 
                      value={employeeForm.departmentId} 
                      onChange={e => setEmployeeForm({ ...employeeForm, departmentId: e.target.value })}
                      required
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      className="form-input" 
                      value={employeeForm.status} 
                      onChange={e => setEmployeeForm({ ...employeeForm, status: e.target.value })}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Joining Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={employeeForm.joiningDate} 
                    onChange={e => setEmployeeForm({ ...employeeForm, joiningDate: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowEmployeeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingDept ? 'Edit Department' : 'Create Department'}</h2>
              <button 
                onClick={() => setShowDeptModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveDept}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={deptForm.name} 
                    onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Department Code (e.g. ENG, FIN)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={deptForm.code} 
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    value={deptForm.description} 
                    onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDeptModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDept ? 'Update' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE DETAIL MODAL */}
      {viewingEmployee && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Employee Profile</h2>
              <button 
                onClick={() => setViewingEmployee(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700 }}>
                  {viewingEmployee.firstName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{viewingEmployee.fullName}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{viewingEmployee.designation}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>DEPARTMENT</span>
                  <p style={{ fontWeight: 600 }}>{viewingEmployee.departmentName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>STATUS</span>
                  <div style={{ marginTop: '2px' }}>{getStatusBadge(viewingEmployee.status)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>EMAIL</span>
                  <p style={{ fontWeight: 600 }}>{viewingEmployee.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>PHONE</span>
                  <p style={{ fontWeight: 600 }}>{viewingEmployee.phone || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>SALARY</span>
                  <p style={{ fontWeight: 700, color: '#059669' }}>${Number(viewingEmployee.salary).toLocaleString()}/yr</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>JOINING DATE</span>
                  <p style={{ fontWeight: 600 }}>{viewingEmployee.joiningDate}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewingEmployee(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toast && (
        <div className={`toast-notice ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
