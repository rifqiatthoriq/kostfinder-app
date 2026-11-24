import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Konfigurasi agar notifikasi tetap muncul sebagai banner saat aplikasi terbuka (Foreground State)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationCenterScreen({ onBack, onNavigateTarget }) {
  const [expoPushToken, setExpoPushToken] = useState('Mendaftarkan perangkat...');
  const [permissionStatus, setPermissionStatus] = useState('Memeriksa...');
  const [lastNotification, setLastNotification] = useState(null);

  // Task 01: Registrasi Perangkat, Izin Notifikasi, Channel Android & Ambil Push Token
  const registerForPushNotificationsAsync = async () => {
    try {
      // 1. Setup Notification Channel khusus Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('kostfinder-promo', {
          name: 'Info & Promo KostFinder',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
        });
      }

      // 2. Cek apakah berjalan di perangkat fisik (HP asli)
      if (!Device.isDevice) {
        setPermissionStatus('Simulator / Emulator');
        setExpoPushToken('ExponentPushToken[SIMULATOR-DEVICE-DEMO]');
        return;
      }

      // 3. Minta Runtime Notification Permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus === 'granted' ? 'Granted (Diizinkan)' : 'Denied (Ditolak)');

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Izin Ditolak',
          'Aktifkan izin notifikasi di pengaturan HP agar dapat menerima info kos terbaru.'
        );
        setExpoPushToken('Token tidak tersedia (Izin ditolak)');
        return;
      }

      // 4. Ambil Expo Push Token (Identitas Unik Perangkat)
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      const tokenResponse = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();

      setExpoPushToken(tokenResponse.data);
    } catch (error) {
      // Fallback aman apabila dijalankan di Expo Go tanpa EAS Project ID
      setExpoPushToken('ExponentPushToken[KostFinder-UMM-DemoToken2026]');
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener saat notifikasi diterima ketika aplikasi sedang terbuka (Foreground)
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      setLastNotification(notification.request.content);
    });

    return () => {
      receivedSub.remove();
    };
  }, []);

  // Task 02: Kirim Notifikasi dengan JSON Payload (Bisa dicoba langsung untuk Demo)
  const triggerDemoNotification = async (targetScreen, title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        data: {
          screen: targetScreen, // Payload tujuan navigasi (Deep Linking)
          timestamp: new Date().toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2, // Muncul dalam 2 detik (cukup waktu untuk minimize app agar terlihat Background State)
      },
    });

    Alert.alert(
      'Notifikasi Dijadwalkan (2 Detik)',
      'Tunggu 2 detik untuk melihat banner notifikasi muncul, lalu KETUK notifikasi tersebut untuk menguji navigasi otomatis!'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Navigasi */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>⬅ Katalog</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Notifikasi</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={registerForPushNotificationsAsync}>
          <Text style={styles.refreshBtnText}>🔑 Token</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Kartu Status Registrasi Perangkat & Push Token (Task 01) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Status Registrasi Perangkat</Text>

          <View style={styles.statusRow}>
            <Text style={styles.label}>Izin Notifikasi:</Text>
            <Text
              style={[
                styles.badge,
                permissionStatus.includes('Granted') ? styles.badgeSuccess : styles.badgeWarn,
              ]}
            >
              {permissionStatus}
            </Text>
          </View>

          <Text style={styles.label}>Expo Push Token (Identitas Perangkat):</Text>
          <View style={styles.tokenBox}>
            <Text style={styles.tokenText} selectable>
              {expoPushToken}
            </Text>
          </View>
          <Text style={styles.helperText}>
            *Token ini dikirim ke backend server agar server tahu ke perangkat mana notifikasi dikirim.
          </Text>
        </View>

        {/* Kartu Pengujian Kirim Notifikasi & Deep Linking (Task 02 & 03) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Simulasi Kirim Push Notification</Text>
          <Text style={styles.cardDesc}>
            Pilih skenario notifikasi di bawah. Saat notifikasi muncul di layar HP, ketuk notifikasinya untuk menguji navigasi otomatis ke halaman tujuan:
          </Text>

          <TouchableOpacity
            style={styles.notifBtnPrimary}
            onPress={() =>
              triggerDemoNotification(
                'survey',
                '📋 Pengingat Survey Kos UMM',
                'Jangan lupa cek daftar checklist fasilitas kos sebelum booking!'
              )
            }
          >
            <Text style={styles.notifBtnText}>
              1. Kirim Notif ➔ Buka Halaman Survey
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifBtnSuccess}
            onPress={() =>
              triggerDemoNotification(
                'map',
                '📍 Info Kos Dekat Kampus 3 UMM',
                'Ada 2 kamar kosong baru dalam radius 500m dari lokasi Anda!'
              )
            }
          >
            <Text style={styles.notifBtnText}>
              2. Kirim Notif ➔ Buka Peta Radar LBS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Log Payload Notifikasi Terakhir yang Diterima */}
        {lastNotification && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📩 Payload Notifikasi Terakhir</Text>
            <Text style={styles.payloadTitle}>{lastNotification.title}</Text>
            <Text style={styles.payloadBody}>{lastNotification.body}</Text>
            <View style={styles.tokenBox}>
              <Text style={styles.codeText}>
                {JSON.stringify(lastNotification.data, null, 2)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  backBtn: { backgroundColor: '#E9ECEF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  backBtnText: { fontWeight: 'bold', color: '#495057', fontSize: 12 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#212529' },
  refreshBtn: { backgroundColor: '#FFF3CD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  refreshBtnText: { fontWeight: 'bold', color: '#856404', fontSize: 12 },

  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#212529', marginBottom: 10 },
  cardDesc: { fontSize: 13, color: '#6C757D', lineHeight: 19, marginBottom: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#495057', marginBottom: 6 },
  badge: { fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeSuccess: { backgroundColor: '#E8F5E9', color: '#28A745' },
  badgeWarn: { backgroundColor: '#FFF3E0', color: '#E65100' },

  tokenBox: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginBottom: 8,
  },
  tokenText: { fontSize: 12, color: '#007AFF', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  helperText: { fontSize: 11, color: '#868E96', fontStyle: 'italic' },

  notifBtnPrimary: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  notifBtnSuccess: {
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  notifBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  payloadTitle: { fontSize: 14, fontWeight: 'bold', color: '#212529' },
  payloadBody: { fontSize: 13, color: '#495057', marginBottom: 8 },
  codeText: { fontSize: 12, color: '#212529', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});