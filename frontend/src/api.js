const API_BASE = 'http://localhost:8083/api';

const getHeaders = () => {
  const token = localStorage.getItem('ems_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || (data.errors && data.errors.join(', ')) || 'An error occurred';
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('ems_token', data.token);
      localStorage.setItem('ems_user', JSON.stringify(data));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
  },

  getCurrentUser: () => {
    try {
      const u = localStorage.getItem('ems_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  // Employees
  getEmployees: async ({ search = '', departmentId = '', status = '', page = 0, size = 10, sortBy = 'id', sortDir = 'desc' }) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (departmentId) params.append('departmentId', departmentId);
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);

    const res = await fetch(`${API_BASE}/employees?${params.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getEmployeeById: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createEmployee: async (employeeData) => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(employeeData)
    });
    return handleResponse(res);
  },

  updateEmployee: async (id, employeeData) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(employeeData)
    });
    return handleResponse(res);
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/employees/dashboard/stats`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Departments
  getDepartments: async () => {
    const res = await fetch(`${API_BASE}/departments`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createDepartment: async (deptData) => {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(deptData)
    });
    return handleResponse(res);
  },

  updateDepartment: async (id, deptData) => {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(deptData)
    });
    return handleResponse(res);
  },

  deleteDepartment: async (id) => {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
