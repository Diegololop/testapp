// ##################################################################
// # ARCHIVO 9: components/ChatAvatar.js
// ##################################################################
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getAvatarUri } from '../services/avatarService';

export default function ChatAvatar({ jid }) {
    const [avatarUri, setAvatarUri] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const loadAvatar = async () => {
            const uri = await getAvatarUri(jid);
            if (isMounted) {
                setAvatarUri(uri);
            }
        };

        loadAvatar();
        
        return () => { isMounted = false; };
    }, [jid]);

    return (
        <View style={styles.container}>
            {avatarUri ? (
                <Image 
                    source={{ uri: avatarUri }} 
                    style={styles.avatar} 
                    onError={() => setAvatarUri(null)}
                />
            ) : (
                <View style={[styles.avatar, styles.placeholder]} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    placeholder: {
        backgroundColor: '#cccccc',
    }
});