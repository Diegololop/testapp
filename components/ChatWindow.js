// ##################################################################
// # ARCHIVO 7: components/ChatWindow.js
// ##################################################################
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import ChatAvatar from './ChatAvatar';
import { fetchWithAuth } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageBubble = ({ message }) => {
    const isSent = message.key.fromMe;
    const content = message.message?.conversation || message.message?.extendedTextMessage?.text || "Mensaje no soportado";
    const time = new Date(Number(message.messageTimestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <View style={[styles.messageContainer, isSent ? styles.sentContainer : styles.receivedContainer]}>
            <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
                <Text style={isSent ? styles.sentText : styles.receivedText}>{content}</Text>
                <Text style={styles.timeText}>{time}</Text>
            </View>
        </View>
    );
};

export default function ChatWindow({ chat, onBack, socket }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const flatListRef = useRef(null);

    useEffect(() => {
        const loadMessages = async () => {
            const cachedMessages = await AsyncStorage.getItem(`messages_${chat.id}`);
            if (cachedMessages) {
                setMessages(JSON.parse(cachedMessages));
            }
            try {
                const response = await fetchWithAuth(`/api/messages/${chat.id}`);
                if (response.ok) {
                    const serverMessages = await response.json();
                    setMessages(serverMessages);
                    await AsyncStorage.setItem(`messages_${chat.id}`, JSON.stringify(serverMessages));
                }
            } catch (e) { console.error("Error al sincronizar mensajes:", e); }
        };
        loadMessages();
    }, [chat.id]);

    useEffect(() => {
        const handleNewMessage = async ({ message }) => {
            if (message.key.remoteJid === chat.id && !message.key.fromMe) {
                setMessages(prev => {
                    const newMessages = [...prev, message];
                    AsyncStorage.setItem(`messages_${chat.id}`, JSON.stringify(newMessages));
                    return newMessages;
                });
            }
        };
        socket.on('new_message', handleNewMessage);
        return () => socket.off('new_message', handleNewMessage);
    }, [chat.id, socket]);
    
    const handleSend = async () => {
        if (!text.trim()) return;
        const tempMessage = {
            key: { id: Date.now().toString(), fromMe: true, remoteJid: chat.id },
            message: { conversation: text },
            messageTimestamp: Math.floor(Date.now() / 1000)
        };
        setMessages(prev => [...prev, tempMessage]);
        setText('');

        try {
            await fetchWithAuth('/api/send-message', {
                method: 'POST',
                body: JSON.stringify({ jid: chat.id, message: text })
            });
        } catch (e) {
            console.error("Error al enviar mensaje:", e);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <ChatAvatar jid={chat.id} />
                    <Text style={styles.headerTitle}>{chat.name || chat.id}</Text>
                </View>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => <MessageBubble message={item} />}
                    keyExtractor={item => item.key.id}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={text}
                        onChangeText={setText}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>➤</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#e5ddd5' 
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        backgroundColor: '#f0f2f5', 
        borderBottomWidth: StyleSheet.hairlineWidth, 
        borderBottomColor: '#ddd',
        paddingTop: Platform.select({ ios: 40, android: 15 }),
    },
    backButton: { 
        padding: 5,
        marginRight: 10,
    },
    backButtonText: { 
        fontSize: 24, 
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginLeft: 10,
    },
    messagesContainer: { 
        flex: 1, 
        padding: 10,
    },
    messagesContent: {
        paddingBottom: 10,
    },
    messageContainer: { 
        marginVertical: 5, 
        maxWidth: '80%' 
    },
    sentContainer: { 
        alignSelf: 'flex-end' 
    },
    receivedContainer: { 
        alignSelf: 'flex-start' 
    },
    bubble: { 
        padding: 10, 
        borderRadius: 10,
    },
    sentBubble: { 
        backgroundColor: '#d9fdd3',
        borderTopRightRadius: 0,
    },
    receivedBubble: { 
        backgroundColor: '#fff',
        borderTopLeftRadius: 0,
    },
    sentText: { 
        color: '#000',
        fontSize: 16,
    },
    receivedText: { 
        color: '#000',
        fontSize: 16,
    },
    timeText: { 
        alignSelf: 'flex-end', 
        fontSize: 10, 
        color: 'gray', 
        marginTop: 5 
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 10, 
        backgroundColor: '#f0f2f5',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ddd',
    },
    textInput: { 
        flex: 1, 
        height: Platform.OS === 'ios' ? 40 : 45,
        backgroundColor: '#fff', 
        borderRadius: 25, 
        paddingHorizontal: 15,
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    },
    sendButton: { 
        marginLeft: 10, 
        backgroundColor: '#008069', 
        width: 45, 
        height: 45, 
        borderRadius: 22.5, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 2,
    },
    sendButtonText: { 
        color: '#fff', 
        fontSize: 18,
        textAlign: 'center',
    }
}); 