// ##################################################################
// # ARCHIVO 8: components/SettingsModal.js (NUEVO ARCHIVO)
// ##################################################################
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { fetchWithAuth } from '../api';

export default function SettingsModal({ visible, onClose, onGenerateQR }) {
    const [workers, setWorkers] = useState([]);
    // ... (lógica para añadir trabajadores)

    useEffect(() => {
        if (visible) {
            fetchWithAuth('/api/workers').then(res => res.json()).then(setWorkers);
        }
    }, [visible]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Configuración</Text>
                    
                    <Text style={styles.subtitle}>Trabajadores</Text>
                    <FlatList
                        data={workers}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.workerItem}>
                                <Text>{item.name} ({item.role})</Text>
                                <TouchableOpacity style={styles.qrButton} onPress={() => onGenerateQR(item)}>
                                    <Text style={styles.qrButtonText}>QR</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
    workerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    qrButton: { backgroundColor: '#008069', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
    qrButtonText: { color: 'white' },
    closeButton: { backgroundColor: '#f44336', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
    closeButtonText: { color: 'white', fontWeight: 'bold' }
});