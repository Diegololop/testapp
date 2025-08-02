import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

export default function ConnectionStatusBar() {
    const netInfo = useNetInfo();
    
    if (netInfo.isConnected === false) {
        return (
            <View style={styles.offlineContainer}>
                <Text style={styles.offlineText}>Sin conexión a internet</Text>
            </View>
        );
    }
    
    return null;
}

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
    },
    offlineText: {
        color: 'white',
        fontSize: 14
    }
});