import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, Image, ActivityIndicator, 
  TouchableOpacity, StyleSheet, Modal, ScrollView, Alert 
} from 'react-native';
import { fetchKostCatalog } from '../services/kostService';
import { removeSecureData } from '../utils/storage';

export default function HomeScreen({ token, onLogout }) {
  const [kostList, setKostList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Detail Kos (Layer 3)
  const [selectedKost, setSelectedKost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Task 02: Mengirim token ke API request
      const data = await fetchKostCatalog(token);
      setKostList(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Gagal mengambil data dari Protected API");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Task 03: Menghapus token dari SecureStore dan mengakhiri session
    await removeSecureData('user_token');
    onLogout();
  };

  const handleOpenDetail = (item) => {
    setSelectedKost(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Mahasiswa!</Text>
          <Text style={styles.location}>📍 Area Kampus Malang</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Katalog Kos Terdekat</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 8 }}>Memuat data dari Protected API...</Text>
        </View>
      ) : (
        <FlatList
          data={kostList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            // Kartu Kos BISA DIPENCET
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => handleOpenDetail(item)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.kostName}>{item.name}</Text>
                <Text style={styles.kostPrice}>{item.price}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.badgeType}>{item.type}</Text>
                  <Text style={styles.badgeRoom}>Sisa {item.availableRooms} kamar</Text>
                  <Text style={styles.clickHint}>Lihat Detail ➔</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* LAYER 3: MODAL DETAIL KOS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedKost && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedKost.image }} style={styles.modalImage} />
                <View style={{ padding: 16 }}>
                  <Text style={styles.modalTitle}>{selectedKost.name}</Text>
                  <Text style={styles.modalPrice}>{selectedKost.price}</Text>
                  <Text style={styles.modalLocation}>{selectedKost.location}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.subHeading}>Deskripsi</Text>
                  <Text style={styles.descText}>{selectedKost.description}</Text>

                  <Text style={styles.subHeading}>Fasilitas</Text>
                  <View style={styles.facilityContainer}>
                    {selectedKost.facilities.map((fac, idx) => (
                      <Text key={idx} style={styles.facilityBadge}>✓ {fac}</Text>
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={styles.chatButton}
                    onPress={() => Alert.alert("Hubungi Pemilik", `Menghubungi nomor: ${selectedKost.ownerContact}`)}
                  >
                    <Text style={styles.chatButtonText}>Hubungi Pemilik Kos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Tutup</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: 'bold' },
  location: { color: '#6C757D', fontSize: 13 },
  logoutBtn: { backgroundColor: '#FFE5E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#D9534F', fontWeight: 'bold', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 14 },
  kostName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  kostPrice: { fontSize: 15, color: '#28A745', fontWeight: '600', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeType: { backgroundColor: '#E3F2FD', color: '#0D47A1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12 },
  badgeRoom: { backgroundColor: '#FFF3E0', color: '#E65100', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12 },
  clickHint: { marginLeft: 'auto', color: '#007AFF', fontSize: 12, fontWeight: 'bold' },
  
  // Modal Detail Styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalImage: { width: '100%', height: 220, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  modalPrice: { fontSize: 18, color: '#28A745', fontWeight: 'bold', marginBottom: 4 },
  modalLocation: { color: '#6C757D', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#E9ECEF', marginVertical: 12 },
  subHeading: { fontSize: 15, fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
  descText: { color: '#495057', lineHeight: 20, fontSize: 13 },
  facilityContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  facilityBadge: { backgroundColor: '#E8F5E9', color: '#2E7D32', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 12 },
  chatButton: { backgroundColor: '#28A745', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  chatButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  closeButton: { backgroundColor: '#E9ECEF', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  closeButtonText: { color: '#495057', fontWeight: 'bold' }
});