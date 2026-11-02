import NetInfo from '@react-native-community/netinfo';

// Service data kos realistis dengan Error, Timeout, & Offline Handling (Sprint 05)
export const fetchKostCatalog = async (token, options = {}) => {
  const { forceError = false, forceEmpty = false } = options;

  // 1. Cek Koneksi Internet (Offline Handling - Task 03)
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    throw new Error('OFFLINE_ERROR');
  }

  // 2. Simulasi Fetch dengan Timeout Controller (10 Detik Batas Waktu)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    if (!token) {
      throw new Error('401: Unauthorized. Silakan login kembali.');
    }

    // Simulasi Delay Network
    await new Promise((resolve) => setTimeout(resolve, 1000));
    clearTimeout(timeoutId);

    // Simulasi Skenario Error (HTTP Status Code Testing)
    if (forceError) {
      throw new Error('500: Server Sedang Gangguan. Silakan coba beberapa saat lagi.');
    }

    // Simulasi Skenario Data Kosong (Empty State Testing)
    if (forceEmpty) {
      return [];
    }

    // Data Katalog Kos Nyata
    return [
      {
        id: '1',
        name: 'Kost Eksklusif Green House UMM',
        price: 'Rp 1.200.000/bulan',
        type: 'Putra',
        availableRooms: 2,
        location: 'Jl. Raya Tlogomas No. 45, Malang',
        facilities: ['Wi-Fi 100Mbps', 'AC', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Parkir Mobil'],
        ownerContact: '081234567890',
        description: 'Kost eksklusif dekat kampus UMM Kampus 3. Lingkungan tenang, bersih, dan aman dengan penjagaan 24 jam.',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '2',
        name: 'Kost Putri Annisa Campus 3',
        price: 'Rp 850.000/bulan',
        type: 'Putri',
        availableRooms: 1,
        location: 'Jl. Saxophone No. 12, Tunggulwulung, Malang',
        facilities: ['Wi-Fi', 'Kipas Angin', 'Dapur Bersama', 'Kamera CCTV'],
        ownerContact: '081987654321',
        description: 'Kost khusus putri aman dan nyaman. Berada di lingkungan pemukiman dekat kampus dan pusat kuliner.',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '3',
        name: 'Kost Residence Student Studio',
        price: 'Rp 1.500.000/bulan',
        type: 'Campur',
        availableRooms: 4,
        location: 'Jl. Bendungan Sutami No. 8, Sumbersari, Malang',
        facilities: ['Wi-Fi High Speed', 'AC', 'Water Heater', 'TV Cable', 'Bebas Jam Malam'],
        ownerContact: '082111223344',
        description: 'Kost bergaya studio apartment modern untuk mahasiswa. Dilengkapi fasilitas lengkap serba ada.',
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '4',
        name: 'Kost Executive Graha Malang',
        price: 'Rp 950.000/bulan',
        type: 'Putra',
        availableRooms: 3,
        location: 'Jl. Gajayana No. 88, Dinoyo, Malang',
        facilities: ['Wi-Fi', 'Kasur Busa Super', 'Meja Belajar', 'Parkir Motor Luas'],
        ownerContact: '085777888999',
        description: 'Strategis dekat pusat perbelanjaan Dinoyo dan kampus. Kamar cukup luas dengan pencahayaan baik.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
      }
    ];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT_ERROR');
    }
    throw error;
  }
};