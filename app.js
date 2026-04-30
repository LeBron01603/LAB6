/* ============================================================
   APP — app.js
   Manipulación del DOM
   ============================================================

   ============================================================ */


const taskInput    = document.getElementById('taskInput');    // <input> de texto
const addBtn       = document.getElementById('addBtn');       // botón "+ Agregar"
const taskList     = document.getElementById('taskList');     // <ul> contenedor
const errorMsg     = document.getElementById('errorMsg');     // párrafo de error
const pendingCount = document.getElementById('pendingCount'); // contador pendientes
const totalCount   = document.getElementById('totalCount');   // contador total
const doneCount    = document.getElementById('doneCount');    // contador completadas
const emptyState   = document.getElementById('emptyState');   // estado vacío
const clearDoneBtn = document.getElementById('clearDoneBtn'); // botón limpiar
const filterBtns   = document.querySelectorAll('.filter-btn');// todos los filtros


/* ──────────────────────────────────────────────────────────────
   2. ESTADO DE LA APLICACIÓN
   Un arreglo de objetos que representa las tareas en memoria.
   Cada tarea: { id, text, done }
────────────────────────────────────────────────────────────── */
let tasks       = [];          // arreglo principal de tareas
let currentFilter = 'all';     // filtro activo: 'all' | 'pending' | 'done'
let nextId      = 1;           // ID autoincremental


/* ──────────────────────────────────────────────────────────────
   3. AGREGAR TAREA
   - Valida que el input no esté vacío ni tenga solo espacios
   - Crea un objeto tarea
   - Llama a renderTask() para insertar en el DOM
────────────────────────────────────────────────────────────── */
function addTask() {
  const rawValue = taskInput.value;           // valor crudo del input
  const text     = rawValue.trim();           // quitamos espacios extremos

  /* ── VALIDACIÓN ── */
  if (text === '') {
    showError('⚠ La tarea no puede estar vacía ni tener solo espacios.');
    taskInput.focus();
    return;                                   // detenemos la ejecución
  }

  clearError();

  /* ── CREAR OBJETO TAREA ── */
  const newTask = {
    id:   nextId++,   // asignamos id y lo incrementamos
    text: text,       // texto limpio
    done: false       // inicia como pendiente
  };

  tasks.push(newTask);        // agregamos al arreglo de estado
  renderTask(newTask);        // creamos el nodo en el DOM
  taskInput.value = '';       // limpiamos el input
  taskInput.focus();          // devolvemos el foco
  updateCounters();           // actualizamos contadores
  updateEmptyState();         // ocultamos/mostramos empty state
  applyFilter(currentFilter); // respetamos el filtro activo
}


/* ──────────────────────────────────────────────────────────────
   4. CREAR NODO DE TAREA EN EL DOM
   document.createElement() → crea elementos HTML desde JS
   element.appendChild()    → los inserta en el árbol del DOM
────────────────────────────────────────────────────────────── */
function renderTask(task) {

  /* <li class="task-item" data-id="1"> */
  const li = document.createElement('li');
  li.classList.add('task-item');
  li.setAttribute('data-id', task.id);   // guardamos el id como atributo

  /* ── Área de checkbox ── */
  const checkArea = document.createElement('label');
  checkArea.classList.add('check-area');
  checkArea.title = 'Marcar como completada';

  const checkbox = document.createElement('input');
  checkbox.type    = 'checkbox';
  checkbox.checked = task.done;

  const checkmark = document.createElement('span');
  checkmark.classList.add('checkmark');
  checkmark.textContent = '✓';

  checkArea.appendChild(checkbox);
  checkArea.appendChild(checkmark);

  /* ── Texto de la tarea ── */
  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = task.text;   // .textContent es seguro (no ejecuta HTML)

  /* ── Botón eliminar ── */
  const delBtn = document.createElement('button');
  delBtn.classList.add('delete-btn');
  delBtn.textContent = '✕';
  delBtn.title       = 'Eliminar tarea';

  /* ── Ensamblar: appendChild inserta nodos hijo ── */
  li.appendChild(checkArea);
  li.appendChild(span);
  li.appendChild(delBtn);

  /* ── Insertar en el <ul> del DOM ── */
  taskList.appendChild(li);

  /* ── Si la tarea ya viene como completada, aplicar clase ── */
  if (task.done) li.classList.add('done');

  /* ── EVENTOS sobre este <li> ── */
  checkbox.addEventListener('change', () => toggleTask(task.id, li));
  span.addEventListener('click',      () => toggleTask(task.id, li));
  delBtn.addEventListener('click',    () => deleteTask(task.id, li));
}


/* ──────────────────────────────────────────────────────────────
   5. MARCAR / DESMARCAR TAREA COMO COMPLETADA
   classList.toggle() agrega la clase si no existe, la quita si existe
────────────────────────────────────────────────────────────── */
function toggleTask(id, liElement) {
  /* Actualizamos el estado en el arreglo */
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;                         // invertimos el booleano

  liElement.classList.toggle('done', task.done);  // toggle con valor fuerza el estado

  /* Sincronizamos el checkbox con el estado */
  const cb = liElement.querySelector('input[type="checkbox"]');
  cb.checked = task.done;

  updateCounters();
  applyFilter(currentFilter); // re-aplica el filtro para ocultar/mostrar si es necesario
}


/* ──────────────────────────────────────────────────────────────
   6. ELIMINAR TAREA
   element.remove() → elimina el nodo directamente del DOM
────────────────────────────────────────────────────────────── */
function deleteTask(id, liElement) {
  /* Eliminamos del arreglo */
  tasks = tasks.filter(t => t.id !== id);

  /* Animación de salida antes de remover */
  liElement.style.transition  = 'opacity 0.2s, transform 0.2s';
  liElement.style.opacity     = '0';
  liElement.style.transform   = 'translateX(12px)';

  setTimeout(() => {
    liElement.remove();        // ← elimina el nodo del árbol DOM
    updateCounters();
    updateEmptyState();
  }, 200);
}


/* ──────────────────────────────────────────────────────────────
   7. ACTUALIZAR CONTADORES
   Leemos el estado del arreglo y actualizamos el textContent
   de los elementos del contador.
────────────────────────────────────────────────────────────── */
function updateCounters() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = total - done;

  totalCount.textContent   = total;
  doneCount.textContent    = done;
  pendingCount.textContent = pending;
}


/* ──────────────────────────────────────────────────────────────
   8. ESTADO VACÍO
   Mostramos u ocultamos el bloque "No hay tareas" según el arreglo.
   classList.add() / classList.remove() modifica las clases CSS.
────────────────────────────────────────────────────────────── */
function updateEmptyState() {
  if (tasks.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }
}


/* ──────────────────────────────────────────────────────────────
   9. FILTROS
   Recorremos todos los <li> del DOM y les agregamos/quitamos
   la clase 'hidden' según el filtro seleccionado.
────────────────────────────────────────────────────────────── */
function applyFilter(filter) {
  currentFilter = filter;

  /* Actualizamos botones de filtro */
  filterBtns.forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  /* Mostramos u ocultamos cada <li> */
  const items = taskList.querySelectorAll('.task-item');  // NodeList de <li>

  items.forEach(li => {
    const id      = parseInt(li.getAttribute('data-id'));
    const task    = tasks.find(t => t.id === id);
    if (!task) return;

    let visible = true;

    if (filter === 'pending' && task.done)   visible = false;
    if (filter === 'done'    && !task.done)  visible = false;

    if (visible) {
      li.classList.remove('hidden');
    } else {
      li.classList.add('hidden');
    }
  });
}


/* ──────────────────────────────────────────────────────────────
   10. LIMPIAR COMPLETADAS
   Eliminamos del DOM y del arreglo todas las tareas completadas.
────────────────────────────────────────────────────────────── */
function clearDone() {
  const doneTasks = tasks.filter(t => t.done);

  doneTasks.forEach(task => {
    const li = taskList.querySelector(`[data-id="${task.id}"]`);
    if (li) li.remove();               // elimina el nodo del DOM
  });

  tasks = tasks.filter(t => !t.done); // actualiza el arreglo
  updateCounters();
  updateEmptyState();
}


/* ──────────────────────────────────────────────────────────────
   11. MENSAJES DE ERROR
────────────────────────────────────────────────────────────── */
function showError(msg) {
  errorMsg.textContent = msg;           // escribimos en el DOM
}

function clearError() {
  errorMsg.textContent = '';            // limpiamos el mensaje
}


/* ──────────────────────────────────────────────────────────────
   12. ESCUCHAR EVENTOS
   addEventListener() conecta funciones a eventos del navegador.
────────────────────────────────────────────────────────────── */

/* Click en el botón Agregar */
addBtn.addEventListener('click', addTask);

/* Tecla Enter en el input → mismo efecto que el botón */
taskInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    addTask();
  }
});

/* Limpiar error mientras el usuario escribe */
taskInput.addEventListener('input', function() {
  if (taskInput.value.trim() !== '') clearError();
});

/* Botón limpiar completadas */
clearDoneBtn.addEventListener('click', clearDone);

/* Botones de filtro */
filterBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const filter = this.getAttribute('data-filter'); // this = el botón clickeado
    applyFilter(filter);
  });
});


/* ──────────────────────────────────────────────────────────────
   13. INICIALIZAR CON TAREAS DE EJEMPLO
   Cargamos unas tareas por defecto al arrancar la app.
────────────────────────────────────────────────────────────── */
(function init() {
  const ejemplos = [
    { text: 'Estudiar manipulación del DOM',    done: true  },
    { text: 'Completar el laboratorio de JS',   done: false },
    { text: 'Revisar los slides de la clase',   done: false },
  ];

  ejemplos.forEach(e => {
    const task = { id: nextId++, text: e.text, done: e.done };
    tasks.push(task);
    renderTask(task);
  });

  updateCounters();
  updateEmptyState();
})();
// La función se invoca inmediatamente (IIFE) al cargar el script.