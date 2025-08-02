// ##################################################################
// # ARCHIVO 4: components/Login.js
// ##################################################################
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { API_URL } from '../api';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                onLoginSuccess(data);
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('No se pudo conectar al servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.loginBox}>
                <Text style={styles.title}>Iniciar Sesión</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Usuario"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
    loginBox: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#111b21' },
    input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 15, marginBottom: 15 },
    button: { backgroundColor: '#008069', padding: 15, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    errorText: { color: 'red', textAlign: 'center', marginBottom: 10 }
});