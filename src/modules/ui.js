/* ============================================================
   
   Toda la manipulación del DOM.
   ============================================================ */

/* ── Referencias al DOM (se asignan en initUI) ── */
let taskInput;
let taskList;
let errorMsg;
let pendingCount;
let totalCount;
let doneCount;
let emptyState;
let filterBtns;

/**
 * Guarda referencias a los nodos del DOM.
 * Debe llamarse una vez antes de cualquier otra función.
 */
export function initUI() {
  taskInput    = document.getElementById('taskInput');
  taskList     = document.getElementById('taskList');
  errorMsg     = document.getElementById('errorMsg');
  pendingCount = document.getElementById('pendingCount');
  totalCount   = document.getElementById('totalCount');
  doneCount    = document.getElementById('doneCount');
  emptyState   = document.getElementById('emptyState');
  filterBtns   = document.querySelectorAll('.filter-btn');
}

/**
 * Crea el <li> de una tarea y lo inserta en el <ul>.
 * Usa data-action en los elementos clickeables para que
 * la delegación de eventos en app.js los identifique.
 * @param {object} task - { id, text, done }
 */
export function renderTask(task) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  li.setAttribute('data-id', task.id);
  if (task.done) li.classList.add('done');

  /* Área de checkbox */
  const checkArea = document.createElement('label');
  checkArea.classList.add('check-area');
  checkArea.title = 'Marcar como completada';

  const checkbox = document.createElement('input');
  checkbox.type    = 'checkbox';
  checkbox.checked = task.done;
  checkbox.setAttribute('data-action', 'toggle');

  const checkmark = document.createElement('span');
  checkmark.classList.add('checkmark');
  checkmark.textContent = '✓';

  checkArea.appendChild(checkbox);
  checkArea.appendChild(checkmark);

  /* Texto */
  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = task.text;

  /* Botón eliminar */
  const delBtn = document.createElement('button');
  delBtn.classList.add('delete-btn');
  delBtn.textContent = '✕';
  delBtn.title       = 'Eliminar tarea';
  delBtn.setAttribute('data-action', 'delete');

  li.appendChild(checkArea);
  li.appendChild(span);
  li.appendChild(delBtn);
  taskList.appendChild(li);
}

/**
 * Aplica animación de salida y elimina el <li> del DOM.
 * @param {number} id
 */
export function removeTaskElement(id) {
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (!li) return;
  li.style.transition = 'opacity 0.2s, transform 0.2s';
  li.style.opacity    = '0';
  li.style.transform  = 'translateX(12px)';
  setTimeout(() => li.remove(), 200);
}

/**
 * Sincroniza el <li> existente con el nuevo estado done de la tarea.
 * @param {object} task - tarea actualizada { id, done }
 */
export function updateTaskElement(task) {
  const li = taskList.querySelector(`[data-id="${task.id}"]`);
  if (!li) return;
  li.classList.toggle('done', task.done);
  const cb = li.querySelector('input[type="checkbox"]');
  if (cb) cb.checked = task.done;
}

/** Recalcula y muestra los 3 contadores a partir del arreglo. */
export function updateCounters(tasks) {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = total - done;
  totalCount.textContent   = total;
  doneCount.textContent    = done;
  pendingCount.textContent = pending;
}

/** Muestra u oculta el bloque "No hay tareas". */
export function updateEmptyState(tasks) {
  emptyState.classList.toggle('visible', tasks.length === 0);
}

/**
 * Muestra u oculta cada <li> según el filtro activo.
 * @param {object[]} tasks
 * @param {string}   filter - 'all' | 'pending' | 'done'
 */
export function applyFilter(tasks, filter) {
  taskList.querySelectorAll('.task-item').forEach(li => {
    const id   = parseInt(li.getAttribute('data-id'));
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    let visible = true;
    if (filter === 'pending' && task.done)  visible = false;
    if (filter === 'done'    && !task.done) visible = false;

    li.classList.toggle('hidden', !visible);
  });
}

/** Marca visualmente el botón de filtro activo. */
export function highlightFilterBtn(filter) {
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
  });
}

/* ──────────────────────────────────────────────────────────────
   INPUT Y ERRORES
────────────────────────────────────────────────────────────── */
export function getInput()   { return taskInput.value; }
export function clearInput() { taskInput.value = ''; taskInput.focus(); }
export function showError(msg) { errorMsg.textContent = msg; }
export function clearError()   { errorMsg.textContent = ''; }