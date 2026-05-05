const API_URL = 'http://localhost:5237/api/geometries';
const AUTH_URL = 'http://localhost:5237/api/auth';

// Helper: Token'ı header'a ekler
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const login = async (username, password) => {
    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) throw new Error('Giriş başarısız');
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        return data;
    } catch (error) {
        return null;
    }
};

export const register = async (username, password) => {
    try {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
};

export const fetchGeometries = async () => {
    try {
        const response = await fetch(API_URL, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Ağ hatası');
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const createGeometry = async (feature) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(feature)
        });
        if (!response.ok) throw new Error('Kaydetme hatası');
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const deleteGeometry = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const updateGeometry = async (id, feature) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(feature)
        });
        if (!response.ok) throw new Error('Güncelleme hatası');
        return await response.json();
    } catch (error) {
        return null;
    }
};
