// ##################################################################
// # ARCHIVO 2: App.js
// ##################################################################
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import QRScanner from './components/QRScanner';
import { fetchWithAuth, SOCKET_URL } from './api';

const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: false
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [status, setStatus] = useState('Desconectado');
  const [qr, setQr] = useState(null);
  const [allChats, setAllChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('currentUser');
      if (token && user) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(user));
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = async (data) => {
      await AsyncStorage.setItem('authToken', data.accessToken);
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      setIsAuthenticated(true);
      setCurrentUser(data.user);
  };

  const handleLogout = async () => {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('currentUser');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSelectedChat(null);
      setAllChats([]);
  };

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/chats');
      if (response.ok) {
        const data = await response.json();
        const sortedChats = data.sort((a, b) => (Number(b.conversationTimestamp) || 0) - (Number(a.conversationTimestamp) || 0));
        setAllChats(sortedChats);
      } else if (response.status === 401 || response.status === 403) {
          handleLogout();
      }
    } catch (error) {
      console.error("Error de red al obtener los chats:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
        socket.connect();
    } else {
        socket.disconnect();
    }
    
    const onConnect = () => {
        socket.emit('client_ready');
    };

    const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'Conectado') fetchChats();
    };
    
    socket.on('connect', onConnect);
    socket.on('status', handleStatusChange);
    socket.on('qr', setQr);
    socket.on('chats_updated', fetchChats);

    if (socket.connected) {
        onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('status', handleStatusChange);
      socket.off('qr', setQr);
      socket.off('chats_updated', fetchChats);
    };
  }, [isAuthenticated, fetchChats]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  if (isLoading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#008069" /></View>;
  }

  if (!isAuthenticated) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (status === 'Esperando QR') {
    return (
        <SafeAreaView style={styles.centerContainer}>
            {currentUser?.role === 'admin' ? (
                <QRScanner qrData={qr} />
            ) : (
                <Text style={styles.loadingText}>Esperando conexión del administrador...</Text>
            )}
        </SafeAreaView>
    );
  }

  const visibleChats = currentUser?.role === 'admin' 
    ? allChats 
    : allChats.filter(chat => chat.assignedTo === currentUser?.name || !chat.assignedTo);

  return (
    <SafeAreaView style={styles.container}>
        {selectedChat ? (
            <ChatWindow 
                chat={selectedChat} 
                onBack={() => setSelectedChat(null)}
                currentUser={currentUser}
                socket={socket}
            />
        ) : (
            <ChatList 
                allChats={visibleChats}
                onChatSelect={handleChatSelect}
                currentUser={currentUser}
                onLogout={handleLogout}
            />
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eae6df',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#54656f',
    padding: 20,
  }
});