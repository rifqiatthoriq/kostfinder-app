import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  fetchSurveyTodos,
  createSurveyTodo,
  toggleSurveyTodo,
} from '../services/todoService';

export default function TodoSurveyScreen({ onBack }) {
  // Tri-State Asinkron
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Input Form & Proses POST/PATCH
  const [newTask, setNewTask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fungsi GET Data dengan dukungan AbortController
  const loadTodos = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSurveyTodos(signal);
      setTodos(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Terjadi kesalahan saat mengambil data.');
        Alert.alert('Error Koneksi', 'Gagal memuat daftar tugas dari server.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Siklus useEffect + Cleanup Function (AbortController)
  useEffect(() => {
    const controller = new AbortController();
    loadTodos(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  // Fungsi POST: Tambah Tugas Baru
  const handleAddTodo = async () => {
    if (!newTask.trim()) {
      Alert.alert('Validasi', 'Masukkan nama catatan survey kos terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createSurveyTodo(newTask.trim());
      const newItem = {
        ...created,
        id: Date.now(),
      };
      setTodos((prev) => [newItem, ...prev]);
      setNewTask('');
      Alert.alert('Berhasil (POST)', 'Catatan baru berhasil dikirim ke REST API!');
    } catch (err) {
      Alert.alert('Gagal (POST)', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fungsi PATCH: Ubah Status Selesai/Belum
  const handleToggleStatus = async (item) => {
    try {
      await toggleSurveyTodo(item.id, item.completed);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === item.id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (err) {
      Alert.alert('Gagal (PATCH)', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>⬅ Katalog</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checklist Survey Kos</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadTodos()}>
          <Text style={styles.refreshBtnText}>🔄 Reload</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Simulasi Async CRUD (GET, POST, PATCH) via JSONPlaceholder API
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Cek kecepatan Wi-Fi Kos..."
          value={newTask}
          onChangeText={setNewTask}
          editable={!submitting}
        />
        <TouchableOpacity
          style={[styles.addBtn, submitting && styles.disabledBtn]}
          onPress={handleAddTodo}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.addBtnText}>+ Tambah</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Mengambil data dari server...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadTodos()}>
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.todoItem, item.completed && styles.todoItemDone]}
              onPress={() => handleToggleStatus(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.checkbox}>{item.completed ? '✅' : '⬜'}</Text>
              <Text
                style={[
                  styles.todoTitle,
                  item.completed && styles.todoTitleDone,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  backBtn: { backgroundColor: '#E9ECEF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  backBtnText: { fontWeight: 'bold', color: '#495057', fontSize: 12 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#212529' },
  refreshBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  refreshBtnText: { fontWeight: 'bold', color: '#007AFF', fontSize: 12 },
  subtitle: { fontSize: 12, color: '#6C757D', marginBottom: 14, textAlign: 'center' },

  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  disabledBtn: { backgroundColor: '#A0C4FF' },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#6C757D', fontSize: 14 },
  errorText: { color: '#DC3545', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },

  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  todoItemDone: { backgroundColor: '#F8F9FA', borderColor: '#D4EDDA' },
  checkbox: { fontSize: 18, marginRight: 12 },
  todoTitle: { flex: 1, fontSize: 14, color: '#212529' },
  todoTitleDone: { textDecorationLine: 'line-through', color: '#868E96' },
});