/* ============================================================
   Arreglo de objetos de tareas + lógica.
   Cada tarea: { id, text, done }
   ============================================================ */

import { saveTasks, loadTasks } from './storage.js';

let tasks  = [];
let nextId = 1;

/**
 * Carga tareas desde LocalStorage.
 * Si no hay datos guardados, carga tareas de ejemplo.
 * @returns {object[]} arreglo de tareas inicial
 */
export function initTasks() {
  const saved = loadTasks();

  if (saved && saved.length > 0) {
    tasks  = saved;
    nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  } else {
    tasks = [
      { id: nextId++, text: 'Estudiar módulos ESM',          done: true  },
      { id: nextId++, text: 'Implementar LocalStorage',       done: false },
      { id: nextId++, text: 'Aplicar delegación de eventos',  done: false },
    ];
    saveTasks(tasks);
  }

  return [...tasks];
}

/** Retorna una copia del arreglo para evitar mutaciones externas. */
export function getTasks() {
  return [...tasks];
}

/**
 * Crea un objeto tarea, lo agrega al arreglo y persiste.
 * @param {string} text - texto ya validado y limpio
 * @returns {object} la tarea creada { id, text, done }
 */
export function addTask(text) {
  const task = { id: nextId++, text, done: false };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

/**
 * Invierte task.done de la tarea con el id dado y persiste.
 * @param {number} id
 * @returns {object|null} la tarea actualizada, o null si no existe
 */
export function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return null;
  task.done = !task.done;
  saveTasks(tasks);
  return task;
}

/**
 * Elimina la tarea con el id dado del arreglo y persiste.
 * @param {number} id
 */
export function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
}

/**
 * Elimina todas las tareas completadas del arreglo y persiste.
 * @returns {number[]} ids de las tareas eliminadas (para que UI las quite)
 */
export function clearDoneTasks() {
  const doneIds = tasks.filter(t => t.done).map(t => t.id);
  tasks = tasks.filter(t => !t.done);
  saveTasks(tasks);
  return doneIds;
}