import api from './Api.jsx';

export const PayrollService = {
    getAllPayrolls: async () => {
        return api.get('/payrolls');
    },

    createPayroll: async (payroll) => {
        return api.post('/payrolls', payroll);
    },

    updatePayroll: async (id, payroll) => {
        return api.put(`/payrolls/${id}`, payroll);
    },

    deletePayroll: async (id) => {
        return api.delete(`/payrolls/${id}`);
    },

    downloadPayroll: async (id) => {
        return api.get(`/payrolls/${id}/pdf`, { responseType: 'blob' });
    },

    sendPayrollEmail: async (id, email) => {
        return api.get(`/payrolls/${id}/email`, { email });
    },

    sendPayrollEmailToAll: async () => {
        return api.post(`/payrolls/send-all`);
    }

};