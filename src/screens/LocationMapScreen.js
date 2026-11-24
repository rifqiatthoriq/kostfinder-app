import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';

// Titik Pusat Geofencing: Kampus 3 UMM Malang (sesuai contoh slide)
const KAMPUS_UMM = {
  latitude: -7.9214,
  longitude: 112.5993,
  radius: 500, // Radius 500 meter
};

// Fungsi Haversine untuk menghitung jarak (meter) antara GPS user & pusat Geofence
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radius bumi dalam meter
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function LocationMapScreen({ onBack }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Mencari alamat...');
  const [distanceToCampus, setDistanceToCampus] = useState(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Task 01, 02, 03: Ambil GPS, Reverse Geocoding, dan Cek Geofence
  const fetchUserLocation = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Minta Runtime Foreground Permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin akses lokasi ditolak oleh pengguna.');
        setLoading(false);
        return;
      }

      // 2. Ambil Posisi GPS (Accuracy.Balanced untuk optimasi baterai)
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude, accuracy } = currentLoc.coords;
      setLocation({ latitude, longitude, accuracy });

      // 3. Task 03A: Reverse Geocoding (Koordinat -> Alamat Jalan)
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocodeResult.length > 0) {
        const place = geocodeResult[0];
        const formattedAddress = [
          place.street,
          place.district || place.subregion,
          place.city,
          place.region,
          place.postalCode,
        ]
          .filter(Boolean)
          .join(', ');
        setAddress(formattedAddress || 'Alamat tidak terdeteksi');
      }

      // 4. Task 03B: Evaluasi Geofencing (Radius 500m dari Kampus UMM)
      const dist = calculateDistanceMeters(
        latitude,
        longitude,
        KAMPUS_UMM.latitude,
        KAMPUS_UMM.longitude
      );
      setDistanceToCampus(Math.round(dist));

      const inside = dist <= KAMPUS_UMM.radius;
      setIsInsideGeofence(inside);

      if (inside) {
        Alert.alert(
          '🔔 Geofence Enter Event',
          'Anda berada di dalam area Kampus UMM (Radius 500m)!'
        );
      }
    } catch (err) {
      setErrorMsg('Gagal mengambil sinyal GPS: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Navigasi */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>⬅ Katalog</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Peta & Radar Kos (LBS)</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchUserLocation}>
          <Text style={styles.refreshBtnText}>🎯 Update</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Mengunci satelit GPS...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchUserLocation}>
            <Text style={styles.retryBtnText}>Izinkan & Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Task 02: Komponen Peta Interaktif + Marker + Circle Geofence */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              showsUserLocation={true}
            >
              {/* Marker Lokasi Mahasiswa */}
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Lokasi Saya"
                description={address}
                pinColor="#007AFF"
              />

              {/* Marker Pusat Kampus UMM */}
              <Marker
                coordinate={{
                  latitude: KAMPUS_UMM.latitude,
                  longitude: KAMPUS_UMM.longitude,
                }}
                title="Area Kampus 3 UMM"
                description="Pusat Radius Geofence 500m"
                pinColor="#DC3545"
              />

              {/* Visualisasi Batas Geofencing (Radius 500m) */}
              <Circle
                center={{
                  latitude: KAMPUS_UMM.latitude,
                  longitude: KAMPUS_UMM.longitude,
                }}
                radius={KAMPUS_UMM.radius}
                strokeWidth={2}
                strokeColor="rgba(220, 53, 69, 0.8)"
                fillColor="rgba(220, 53, 69, 0.15)"
              />
            </MapView>
          </View>

          {/* Kartu Status Geofencing (Task 03B) */}
          <View
            style={[
              styles.geofenceBanner,
              isInsideGeofence ? styles.geofenceInside : styles.geofenceOutside,
            ]}
          >
            <Text style={styles.geofenceTitle}>
              {isInsideGeofence
                ? '✅ Dalam Area Geofence Kampus UMM'
                : '📍 Di Luar Radius Geofence Kampus (500m)'}
            </Text>
            <Text style={styles.geofenceSub}>
              Jarak ke Kampus 3 UMM: ± {distanceToCampus?.toLocaleString('id-ID')} meter
            </Text>
          </View>

          {/* Kartu Detail Koordinat GPS & Reverse Geocoding (Task 01 & 03A) */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>📡 Data GPS & Alamat Terdeteksi</Text>

            <View style={styles.coordRow}>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <Text style={styles.coordValue}>{location.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <Text style={styles.coordValue}>{location.longitude.toFixed(6)}</Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Akurasi</Text>
                <Text style={styles.coordValue}>±{Math.round(location.accuracy)} m</Text>
              </View>
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>🏠 Alamat Saat Ini (Reverse Geocoding):</Text>
              <Text style={styles.addressText}>{address}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backBtn: { backgroundColor: '#E9ECEF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  backBtnText: { fontWeight: 'bold', color: '#495057', fontSize: 12 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#212529' },
  refreshBtn: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  refreshBtnText: { fontWeight: 'bold', color: '#28A745', fontSize: 12 },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#6C757D', fontSize: 14 },
  errorText: { color: '#DC3545', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },

  mapContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginBottom: 14,
  },
  map: { width: '100%', height: '100%' },

  geofenceBanner: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  geofenceInside: { backgroundColor: '#E8F5E9', borderColor: '#28A745' },
  geofenceOutside: { backgroundColor: '#FFF3E0', borderColor: '#FF9800' },
  geofenceTitle: { fontSize: 14, fontWeight: 'bold', color: '#212529', marginBottom: 4 },
  geofenceSub: { fontSize: 12, color: '#495057' },

  infoCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 24,
  },
  cardHeading: { fontSize: 15, fontWeight: 'bold', color: '#212529', marginBottom: 12 },
  coordRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  coordBox: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  coordLabel: { fontSize: 11, color: '#6C757D', marginBottom: 2 },
  coordValue: { fontSize: 13, fontWeight: 'bold', color: '#007AFF' },

  addressBox: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8 },
  addressLabel: { fontSize: 12, fontWeight: 'bold', color: '#495057', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#212529', lineHeight: 19 },
});