import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, FlatList, 
  Modal, TextInput, Alert, ScrollView, SafeAreaView, ActivityIndicator
} from 'react-native';
import { 
  collection, onSnapshot, query, orderBy, where, doc, 
  getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const SEA_EMOJIS = ["🌊", "🐙", "🦈", "🏝️", "⛵", "🐳", "🦀", "🐬", "🐢"];

export default function HomeScreen() {
  const [friends, setFriends] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState("🐙");
  const [editingFriendId, setEditingFriendId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const getUserData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser?.uid || ""));
        if (snap.exists()) {
          const data = snap.data();
          setUserName(data.displayName || "Sailor");
          // FETCH THE AVATAR HERE:
          if (data.profilePic) {
            setUserAvatar(data.profilePic);
          }
        }
      } catch (e) {
        console.log("User data fetch error", e);
      }
    };
    getUserData();

    const q = query(
      collection(db, "friends"), 
      where("userId", "==", auth.currentUser.uid), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const friendsList = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date() 
        }));
        setFriends(friendsList);
        setLoading(false);
      },
      (error) => {
        console.log("Firestore Listener Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddFriend = async () => {
    if (!friendName.trim() || !friendPhone.trim()) {
      return Alert.alert("Missing Info", "Name and number are required.");
    }
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, "friends"), {
        name: friendName.trim(),
        contactNumber: friendPhone.trim(),
        profilePic: selectedEmoji,
        userId: auth.currentUser.uid, 
        createdAt: serverTimestamp()
      });
      closeModals();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleUpdateFriend = async () => {
    if (!editingFriendId) return;
    try {
      await updateDoc(doc(db, "friends", editingFriendId), {
        name: friendName.trim(),
        contactNumber: friendPhone.trim(),
        profilePic: selectedEmoji
      });
      closeModals();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      "Abandon Crewmate?",
      `Remove ${name} from your crew?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "friends", id)) }
      ]
    );
  };

  const openEditModal = (friend: any) => {
    setEditingFriendId(friend.id);
    setFriendName(friend.name);
    setFriendPhone(friend.contactNumber);
    setSelectedEmoji(friend.profilePic || "🐙");
    setIsEditModalVisible(true);
  };

  const closeModals = () => {
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setFriendName('');
    setFriendPhone('');
    setSelectedEmoji("🐙");
    setEditingFriendId(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#005b96" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 20 }}>
        {/* NEW HEADER WITH AVATAR */}
        <View style={styles.header}>
          <View style={styles.userInfoRow}>
             <View style={styles.userAvatar}>
                <Text style={{ fontSize: 30 }}>{userAvatar}</Text>
             </View>
             <View>
               <Text style={styles.welcome}>Ahoy,</Text>
               <Text style={styles.userName}>{userName}!</Text>
             </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut(auth)}>
            <Ionicons name="log-out-outline" size={30} color="#e53935" />
          </TouchableOpacity>
        </View>

        {/* RECRUIT ACTION ROW */}
        <View style={styles.actionRow}>
          <Text style={styles.recruitText}>Want to recruit a new friend?</Text>
          <TouchableOpacity style={styles.miniAddBtn} onPress={() => setIsAddModalVisible(true)}>
             <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* TOTAL COUNTER */}
        <View style={styles.statsContainer}>
           <Text style={styles.statsText}>Crew Members: <Text style={styles.statsCount}>{friends.length}</Text></Text>
        </View>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} 
        ListEmptyComponent={<Text style={styles.emptyText}>No crewmates found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardContent} onPress={() => openEditModal(item)}>
              <View style={styles.emojiAvatar}>
                <Text style={{ fontSize: 24 }}>{item.profilePic || "👤"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subText}>{item.contactNumber}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => confirmDelete(item.id, item.name)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={22} color="#e53935" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
      </View>

      {/* MODAL CODE REMAINS THE SAME */}
      <Modal visible={isAddModalVisible || isEditModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{isAddModalVisible ? "Recruit Friend" : "Update Crew"}</Text>
            <TextInput placeholder="Name" value={friendName} onChangeText={setFriendName} style={styles.modalInput} />
            <TextInput placeholder="Phone Number" value={friendPhone} onChangeText={setFriendPhone} style={styles.modalInput} keyboardType="phone-pad" maxLength={11} />
            <Text style={styles.modalLabel}>Choose Avatar:</Text>
            <View style={{ height: 65 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SEA_EMOJIS.map(e => (
                  <TouchableOpacity key={e} onPress={() => setSelectedEmoji(e)} style={[styles.emojiBtn, selectedEmoji === e && styles.selectedEmojiBtn]}>
                    <Text style={{ fontSize: 24 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModals}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={isAddModalVisible ? handleAddFriend : handleUpdateFriend}>
                <Text style={styles.saveBtnText}>{isAddModalVisible ? "Add" : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e1f5fe' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 50, },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15, elevation: 4 },
  welcome: { fontSize: 16, color: '#005b96' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#005b96' },
  logoutBtn: { alignItems: 'center' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', borderRadius: 10, marginBottom: 20, },
  recruitText: { fontSize: 15, color: '#005b96', fontWeight: '500' },
  miniAddBtn: { backgroundColor: '#005b96', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { marginBottom: 15, },
  statsText: { fontSize: 17, color: '#005b96', fontWeight: '500' },
  statsCount: { fontWeight: 'bold', color: '#011f4b' },

  card: { flexDirection: 'row', backgroundColor: '#005b96', borderRadius: 20, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 },
  deleteBtn: { paddingHorizontal: 15, justifyContent: 'center' },
  emojiAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subText: { color: '#9dcde5', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6497b1', fontStyle: 'italic' },
  footer: { paddingVertical: 20, backgroundColor: '#005b96', borderTopWidth: 1, borderTopColor: '#b3e5fc', alignItems: 'center', },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 31, 75, 0.7)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 30, padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#005b96', marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: '#f0f8ff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#b3e5fc' },
  modalLabel: { color: '#005b96', fontWeight: 'bold', marginBottom: 10 },
  emojiBtn: { padding: 10, borderRadius: 12, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  selectedEmojiBtn: { borderColor: '#005b96', backgroundColor: '#e1f5fe' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginLeft: -15 },
  cancelBtnText: { color: '#6497b1', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#005b96', padding: 15, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});