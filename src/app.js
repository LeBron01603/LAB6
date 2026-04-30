/* ============================================================
   PUNTO DE ENTRADA — app.js
   Orquesta los 3 módulos e implementa la delegación de eventos.

   DELEGACIÓN DE EVENTOS:
   Un solo listener en el <ul> maneja clics de TODAS las tareas.
   El evento burbujea (propagation) desde el hijo hasta el padre,
   y acá identificamos la acción por data-action del elemento.
   ============================================================ */

import { initTasks, getTasks, addTask, toggleTask, deleteTask, clearDoneTasks } from './modules/tasks.js';
import { initUI, renderTask, removeTaskElement, updateTaskElement,
         updateCounters, updateEmptyState, applyFilter,
         highlightFilterBtn, getInput, clearInput,
         showError, clearError } from './modules/ui.js';

/* Filtro activo global */
let currentFilter = 'all';

/* ──────────────────────────────────────────────────────────────
   ACCIONES
────────────────────────────────────────────────────────────── */
function handleAdd() {
  const text = getInput().trim();
  if (text === '') {
    showError('⚠ La tarea no puede estar vacía ni tener solo espacios.');
    return;
  }
  clearError();

  const newTask = addTask(text);     // tasks.js → agrega al arreglo + guarda en LS
  renderTask(newTask);               // ui.js    → crea el <li> en el DOM
  clearInput();

  const tasks = getTasks();
  updateCounters(tasks);
  updateEmptyState(tasks);
  applyFilter(tasks, currentFilter);
}

function handleToggle(id) {
  const updatedTask = toggleTask(id);       // tasks.js → invierte done + guarda en LS
  if (!updatedTask) return;
  updateTaskElement(updatedTask);           // ui.js → actualiza el <li>
  const tasks = getTasks();
  updateCounters(tasks);
  applyFilter(tasks, currentFilter);
}

function handleDelete(id) {
  deleteTask(id);                           // tasks.js → filtra el arreglo + guarda en LS
  removeTaskElement(id);                    // ui.js → anima y quita el <li>
  setTimeout(() => {
    const tasks = getTasks();
    updateCounters(tasks);
    updateEmptyState(tasks);
  }, 210);
}

/* ──────────────────────────────────────────────────────────────
   DELEGACIÓN DE EVENTOS EN EL <UL>
   Un único listener en el padre captura todos los clics hijos.
   closest() sube por el árbol DOM buscando el selector dado.
────────────────────────────────────────────────────────────── */
function initDelegation() {
  const taskList = document.getElementById('taskList');

  taskList.addEventListener('click', function(event) {
    const target = event.target;

    /* Clic en botón eliminar */
    if (target.closest('[data-action="delete"]')) {
      const li = target.closest('.task-item');
      if (li) handleDelete(parseInt(li.getAttribute('data-id')));
      return;
    }

    /* Clic en checkbox */
    if (target.closest('[data-action="toggle"]')) {
      const li = target.closest('.task-item');
      if (li) handleToggle(parseInt(li.getAttribute('data-id')));
      return;
    }

    /* Clic en el texto → también hace toggle */
    if (target.classList.contains('task-text')) {
      const li = target.closest('.task-item');
      if (li) handleToggle(parseInt(li.getAttribute('data-id')));
    }
  });

  /* Delegación en .filters para los botones de filtro */
  document.querySelector('.filters').addEventListener('click', function(event) {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;
    currentFilter = btn.getAttribute('data-filter');
    highlightFilterBtn(currentFilter);
    applyFilter(getTasks(), currentFilter);
  });
}

/* ──────────────────────────────────────────────────────────────
   INICIALIZACIÓN
────────────────────────────────────────────────────────────── */
function init() {
  initUI();                              // ui.js: guarda refs al DOM

  const savedTasks = initTasks();        // tasks.js: carga arreglo desde LS (o ejemplos)
  savedTasks.forEach(t => renderTask(t)); // ui.js: renderiza cada objeto del arreglo

  const tasks = getTasks();
  updateCounters(tasks);
  updateEmptyState(tasks);
  highlightFilterBtn('all');
  applyFilter(tasks, 'all');

  /* Eventos del input y botones fijos */
  document.getElementById('addBtn')
    .addEventListener('click', handleAdd);

  document.getElementById('taskInput')
    .addEventListener('keydown', e => { if (e.key === 'Enter') handleAdd(); });

  document.getElementById('taskInput')
    .addEventListener('input', function() {
      if (this.value.trim() !== '') clearError();
    });

  document.getElementById('clearDoneBtn')
    .addEventListener('click', function() {
      const doneIds = clearDoneTasks();           // tasks.js → elimina del arreglo + LS
      doneIds.forEach(id => removeTaskElement(id)); // ui.js → quita los <li>
      setTimeout(() => {
        const tasks = getTasks();
        updateCounters(tasks);
        updateEmptyState(tasks);
      }, 210);
    });

  initDelegation();  // delegación sobre <ul> y .filters
}

document.addEventListener('DOMContentLoaded', init);