import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const STORAGE_KEYS = {
    CHATS: 'chats',
    MESSAGES: 'messages',
    CONTACTS: 'contacts',
    AVATARS: 'avatars',
    USER: 'currentUser',
    TOKEN: 'authToken',
    STATUS: 'connectionStatus',
    LAST_SYNC: 'lastSync'
};

const AVATAR_DIR = `${FileSystem.cacheDirectory}avatars/`;

// Verificar si los datos locales son válidos
const isValidData = (data) => {
    return data && 
           Array.isArray(data.chats) && 
           typeof data.messages === 'object' &&
           typeof data.contacts === 'object';
};

export const loadInitialData = async () => {
    try {
        const [chats, messages, contacts, avatars, user, token, status, lastSync] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.CHATS),
            AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
            AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
            AsyncStorage.getItem(STORAGE_KEYS.AVATARS),
            AsyncStorage.getItem(STORAGE_KEYS.USER),
            AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
            AsyncStorage.getItem(STORAGE_KEYS.STATUS),
            AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC)
        ]);

        const data = {
            chats: chats ? JSON.parse(chats) : [],
            messages: messages ? JSON.parse(messages) : {},
            contacts: contacts ? JSON.parse(contacts) : {},
            avatars: avatars ? JSON.parse(avatars) : {},
            currentUser: user ? JSON.parse(user) : null,
            authToken: token,
            connectionStatus: status || 'Desconectado',
            lastSync: lastSync ? parseInt(lastSync) : 0
        };

        // Verificar si los datos son válidos
        if (!isValidData(data)) {
            console.log('Datos locales inválidos, limpiando...');
            await clearAllData();
            return {
                chats: [],
                messages: {},
                contacts: {},
                avatars: {},
                currentUser: null,
                authToken: null,
                connectionStatus: 'Desconectado',
                lastSync: 0
            };
        }

        return data;
    } catch (error) {
        console.error('Error loading initial data:', error);
        return {
            chats: [],
            messages: {},
            contacts: {},
            avatars: {},
            currentUser: null,
            authToken: null,
            connectionStatus: 'Desconectado',
            lastSync: 0
        };
    }
};

export const saveData = async (dataType, data) => {
    try {
        const key = STORAGE_KEYS[dataType.toUpperCase()];
        if (!key) throw new Error(`Invalid data type: ${dataType}`);
        
        // Verificar si los datos son válidos antes de guardar
        if (data === undefined || data === null) {
            throw new Error(`Invalid data for ${dataType}`);
        }
        
        await AsyncStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        // Manejo seguro del error
        console.error(`Error saving ${dataType}:`, error);
        return false;
    }
};

export const saveAllData = async (data) => {
    try {
        await Promise.all([
            saveData('chats', data.chats),
            saveData('messages', data.messages),
            saveData('contacts', data.contacts),
            saveData('avatars', data.avatars),
            saveData('user', data.currentUser),
            saveData('token', data.authToken),
            saveData('status', data.connectionStatus)
        ]);
        return true;
    } catch (error) {
        console.error('Error saving all data:', error);
        return false;
    }
};

export const clearAllData = async () => {
    try {
        // Limpiar AsyncStorage
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
        
        // Limpiar avatares
        if (FileSystem.deleteAsync) {
            try {
                const dirInfo = await FileSystem.getInfoAsync(AVATAR_DIR);
                if (dirInfo.exists) {
                    await FileSystem.deleteAsync(AVATAR_DIR, { idempotent: true });
                }
            } catch (fileError) {
                console.error('Error deleting avatar directory:', fileError);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error clearing all data:', error);
        return false;
    }
};