import api from './Api.jsx';

export const DepartmentService = {
    getAllDepartments: async () => {
        return api.get('/departments');
    },

    createDepartment: async (department) => {
        return api.post('/departments', department);
    },

    updateDepartment: async (id, department) => {
        return api.put(`/departments/${id}`, department);
    },

    deleteDepartment: async (id) => {
        return api.delete(`/departments/${id}`);
    },
};