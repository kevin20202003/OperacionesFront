import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5174/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

export const obtenerOperaciones = (search) =>
    api.get('/Operaciones', { params: { search } }).then(r => r.data);

export const obtenerOperacion = (id) =>
    api.get(`/Operaciones/${id}`).then(r => r.data);

export const crearOperacion = (data) =>
    api.post('/Operaciones', data).then(r => r.data);

export const actualizarOperacion = (id, data) =>
    api.put(`/Operaciones/${id}`, data).then(r => r.data);

export const eliminarOperacion = (id) =>
    api.delete(`/Operaciones/${id}`);
