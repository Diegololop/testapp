// ##################################################################
// # ARCHIVO 4: services/avatarService.js (NUEVO ARCHIVO)
// ##################################################################
import * as FileSystem from 'expo-file-system';
import { fetchWithAuth } from '../api';

const AVATAR_DIR = `${FileSystem.cacheDirectory}avatars/`;

const ensureDirExists = (async () => {
  const dirInfo = await FileSystem.getInfoAsync(AVATAR_DIR);
  if (!dirInfo.exists) {
    console.log("Creando directorio de avatares...");
    await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
  }
})();

export const getAvatarUri = async (jid) => {
    await ensureDirExists;

    const filename = jid.replace(/[^a-zA-Z0-9.-]/g, '_') + '.jpg';
    const avatarPath = `${AVATAR_DIR}${filename}`;
    
    const fileInfo = await FileSystem.getInfoAsync(avatarPath);

    if (fileInfo.exists) {
        return avatarPath;
    }

    try {
        const response = await fetchWithAuth(`/api/profile-pic/${jid}`);
        if (response.ok) {
            const data = await response.json();
            if (data.url) {
                const { uri } = await FileSystem.downloadAsync(data.url, avatarPath);
                return uri;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error al obtener y cachear el avatar para ${jid}:`, error);
        return null;
    }
};

export const clearAvatarCache = async () => {
    try {
        await FileSystem.deleteAsync(AVATAR_DIR, { idempotent: true });
        console.log("Caché de avatares limpiado.");
    } catch (error) {
        console.error("Error al limpiar el caché de avatares:", error);
    }
};