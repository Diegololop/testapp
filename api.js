import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Reemplaza "localhost" con la IP de tu computadora
export const API_URL = 'http://192.168.1.16:5000';
export const SOCKET_URL = API_URL;

export const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem('authToken');
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    return fetch(`${API_URL}${url}`, { ...options, headers });
};