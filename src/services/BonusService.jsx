import api from './Api.jsx';

export const BonusService = {
    getAllBonus: async () => {
        return api.get('/bonus');
    },

    createBonus: async (bonus) => {
        return api.post('/bonus', bonus);
    },

    updateBonus: async (id, bonus) => {
        return api.put(`/bonus/${id}`, bonus);
    },

    deleteBonus: async (id) => {
        return api.delete(`/bonus/${id}`);
    },
};
