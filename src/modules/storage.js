/* ============================================================
   Aqui se lee y escribe en LocalStorage.
   No conoce nada de UI ni de lógica de tareas.
   ============================================================ */

const STORAGE_KEY = 'lab5_tasks';

/**
 * Guarda el arreglo de tareas en LocalStorage como JSON.
 * @param {object[]} tasks
 */
export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Lee y retorna el arreglo de tareas guardado.
 * Si no hay nada guardado, retorna null.
 * @returns {object[]|null}
 */
export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}