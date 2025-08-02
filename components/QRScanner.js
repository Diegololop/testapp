// ##################################################################
// # ARCHIVO 7: components/QRScanner.js
// ##################################################################
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRScanner({ qrData }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Conectar WhatsApp</Text>
            {qrData ? (
                <QRCode value={qrData} size={250} />
            ) : (
                <Text>Generando código QR...</Text>
            )}
            <Text style={styles.instructions}>Escanea este código desde la sección "Dispositivos Vinculados" en tu WhatsApp.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    instructions: {
        marginTop: 20,
        textAlign: 'center',
        color: '#54656f'
    }
});