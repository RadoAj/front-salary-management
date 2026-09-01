import api from './Api.jsx';

export const DeductionService = {
    getAllDeduction: async () => {
        return api.get('/deductions');
    },

    createDeduction: async (deduction) => {
        return api.post('/deductions', deduction);
    },

    updateDeduction: async (id, deduction) => {
        return api.put(`/deductions/${id}`, deduction);
    },

    deleteDeduction: async (id) => {
        return api.delete(`/deductions/${id}`);
    },
};
