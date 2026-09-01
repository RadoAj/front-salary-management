import api from './Api.jsx';

export const SalaryService = {
  getAllSalary: async () => {
    return api.get('/salaries');
  },

  createSalary: async (salary) => {
    return api.post('/salaries', salary);
  },

  updateSalary: async (id, salary) => {
    return api.put(`/salaries/${id}`, salary);
  },

  deleteSalary: async (id) => {
    return api.delete(`/salaries/${id}`);
  },
};
