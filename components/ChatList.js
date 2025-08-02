// ##################################################################
// # ARCHIVO 5: components/ChatList.js
// ##################################################################
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import ChatAvatar from './ChatAvatar';
import { fetchWithAuth } from '../api';

const ContextMenu = ({ visible, chat, onClose, onSelectCategory, categories, onAssignWorker, workers, currentUser, onArchiveChat }) => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <TouchableOpacity style={styles.contextOverlay} onPress={onClose}>
            <View style={styles.contextMenu}>
                <TouchableOpacity style={styles.contextItem} onPress={() => onArchiveChat(!chat.archived)}>
                    <Text>{chat.archived ? 'Desarchivar' : 'Archivar'}</Text>
                </TouchableOpacity>
                <View style={styles.separator} />
                <Text style={styles.contextTitle}>Mover a:</Text>
                {categories.map(cat => (
                    <TouchableOpacity key={cat.name} style={styles.contextItem} onPress={() => onSelectCategory(cat.name)}>
                        <Text>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
                {currentUser.role === 'admin' && (
                    <>
                        <View style={styles.separator} />
                        <Text style={styles.contextTitle}>Asignar a:</Text>
                        <TouchableOpacity style={styles.contextItem} onPress={() => onAssignWorker(null)}>
                            <Text>Quitar asignación</Text>
                        </TouchableOpacity>
                        {workers.map(worker => (
                            <TouchableOpacity key={worker.id} style={styles.contextItem} onPress={() => onAssignWorker(worker.name)}>
                                <Text>{worker.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </View>
        </TouchableOpacity>
    </Modal>
);

export default function ChatList({ allChats, onChatSelect, currentUser, onLogout }) {
    const [contextMenu, setContextMenu] = useState(null);
    const [categories, setCategories] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [activeTab, setActiveTab] = useState('General');

    useEffect(() => {
        fetchWithAuth('/api/categories').then(res => res.json()).then(data => {
            const categoryOrder = ['General', 'Ventas', 'Soporte'];
            const sorted = data.sort((a,b) => categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name));
            setCategories(sorted);
        });
        fetchWithAuth('/api/workers').then(res => res.json()).then(setWorkers);
    }, []);

    const handleLongPress = (chat) => {
        setContextMenu({ chat });
    };

    const handleSelectCategory = async (categoryName) => {
        if (!contextMenu) return;
        await fetchWithAuth(`/api/chats/${contextMenu.chat.id}/category`, {
            method: 'POST',
            body: JSON.stringify({ category: categoryName })
        });
        setContextMenu(null);
    };

    const handleAssignWorker = async (workerName) => {
        if (!contextMenu) return;
        await fetchWithAuth(`/api/chats/${contextMenu.chat.id}/assign`, {
            method: 'POST',
            body: JSON.stringify({ workerName })
        });
        setContextMenu(null);
    };

    const handleArchiveChat = async (archiveState) => {
        if (!contextMenu) return;
        await fetchWithAuth(`/api/chats/${contextMenu.chat.id}/archive`, {
            method: 'POST',
            body: JSON.stringify({ archive: archiveState })
        });
        setContextMenu(null);
    };

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        return new Date(Number(ts) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const archivedChats = allChats.filter(chat => chat.archived);
    const mainChats = allChats.filter(chat => !chat.archived);
    
    const visibleChats = activeTab === 'Archivados' 
        ? archivedChats 
        : mainChats.filter(chat => (chat.category || 'General') === activeTab);

    const renderChatItem = ({ item }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => onChatSelect(item)} onLongPress={() => handleLongPress(item)}>
            <ChatAvatar jid={item.id} />
            <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name || `+${item.id.split('@')[0]}`}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage?.text || '...'}</Text>
            </View>
            <View style={styles.chatDetails}>
                <Text style={styles.timestamp}>{formatTimestamp(item.conversationTimestamp)}</Text>
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chats</Text>
                <TouchableOpacity onPress={onLogout}>
                    <Text style={{color: '#008069'}}>Salir</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tabsContainer}>
                {categories.map(cat => (
                    <TouchableOpacity 
                        key={cat.name}
                        style={[styles.tabButton, activeTab === cat.name && styles.activeTab]}
                        onPress={() => setActiveTab(cat.name)}
                    >
                        <Text style={[styles.tabText, activeTab === cat.name && styles.activeTabText]}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
                 <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'Archivados' && styles.activeTab]}
                    onPress={() => setActiveTab('Archivados')}
                >
                    <Text style={[styles.tabText, activeTab === 'Archivados' && styles.activeTabText]}>Archivados</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={visibleChats}
                renderItem={renderChatItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyListText}>No hay chats en esta vista.</Text>}
            />
            {contextMenu && <ContextMenu visible={!!contextMenu} {...contextMenu} onClose={() => setContextMenu(null)} onSelectCategory={handleSelectCategory} categories={categories} onAssignWorker={handleAssignWorker} workers={workers} currentUser={currentUser} onArchiveChat={handleArchiveChat} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#f0f2f5' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f0f2f5', paddingVertical: 5 },
    tabButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20 },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#008069' },
    tabText: { color: '#667781', fontWeight: 'bold' },
    activeTabText: { color: '#008069' },
    chatItem: { flexDirection: 'row', padding: 15, alignItems: 'center' },
    chatInfo: { flex: 1, marginLeft: 10 },
    chatName: { fontWeight: 'bold', fontSize: 16 },
    lastMessage: { color: 'gray' },
    assignedWorker: { fontSize: 12, color: '#008069', fontStyle: 'italic' },
    chatDetails: { alignItems: 'flex-end' },
    timestamp: { color: 'gray', fontSize: 12 },
    unreadBadge: { backgroundColor: '#25d366', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
    unreadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    emptyListText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    contextOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    contextMenu: { backgroundColor: 'white', borderRadius: 10, padding: 10, width: '70%' },
    contextItem: { padding: 15 },
    contextTitle: { padding: 15, color: 'gray', fontSize: 12 },
    separator: { height: 1, backgroundColor: '#eee', marginVertical: 5 }
});