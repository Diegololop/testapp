// ##################################################################
// # ARCHIVO 9: components/QRCodeModal.js (NUEVO ARCHIVO)
// ##################################################################
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeModal({ visible, data, onClose }) {
    if (!data) return null;
    
    const loginUrl = `${window.location.origin}/login?username=${data.name}&password=PASSWORD_PLACEHOLDER`;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>QR de Acceso para {data.name}</Text>
                    <QRCode value={loginUrl} size={200} />
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    closeButton: { backgroundColor: '#008069', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20, width: '100%' },
    closeButtonText: { color: 'white', fontWeight: 'bold' }
});