const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';

// 1. GET: Mengambil daftar catatan survey kos (dengan dukungan AbortController)
export const fetchSurveyTodos = async (signal) => {
  const response = await fetch(`${BASE_URL}?_limit=8`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  return await response.json();
};

// 2. POST: Menambahkan item catatan survey baru ke server
export const createSurveyTodo = async (title) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
      completed: false,
      userId: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gagal menambah data (Status: ${response.status})`);
  }
  return await response.json();
};

// 3. PATCH: Mengubah status selesai/belum selesai pada server
export const toggleSurveyTodo = async (id, currentStatus) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completed: !currentStatus,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengubah status (Status: ${response.status})`);
  }
  return await response.json();
};