import api from './Api.jsx';

export const EmployeeService = {
  getAllEmployees: async () => {
    return api.get('/employees');
  },

  createEmployee: async (employee) => {
    return api.post('/employees', employee);
  },

  updateEmployee: async (id, employee) => {
    return api.put(`/employees/${id}`, employee);
  },

  deleteEmployee: async (id) => {
    return api.delete(`/employees/${id}`);
  },
};