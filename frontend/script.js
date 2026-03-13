const API = 'https://jtjgnhb28d.execute-api.us-east-2.amazonaws.com/default/todo-api'; // e.g. https://abc123.execute-api.us-east-2.amazonaws.com

    // ── State ──────────────────────────────────────────────
    let deviceId = localStorage.getItem('device_id') || null;

    // ── Boot ───────────────────────────────────────────────
    if (deviceId) showTodo();
    else          showConnect();

    // ── Screen helpers ─────────────────────────────────────
    function showConnect() {
        document.getElementById('screen-connect').classList.add('active');
        document.getElementById('screen-todo').classList.remove('active');
    }

    function showTodo() {
        document.getElementById('screen-connect').classList.remove('active');
        document.getElementById('screen-todo').classList.add('active');
        document.getElementById('device-label').textContent = deviceId;
        loadTasks();
    }

    // ── Connect ────────────────────────────────────────────
    document.getElementById('btn-connect').addEventListener('click', connect);
    document.getElementById('device-code').addEventListener('keydown', e => {
        if (e.key === 'Enter') connect();
    });

    async function connect() {
        const code  = document.getElementById('device-code').value.trim().toLowerCase();
        const error = document.getElementById('connect-error');
        error.textContent = '';

        if (!code) { error.textContent = 'Please enter a device code.'; return; }

        try {
            const res = await fetch(`${API}/devices?device_id=${code}`);
            const data = await res.json();

            if (!data.exists) {
                error.textContent = 'Device not found. Check the code on your display.';
                return;
            }

            deviceId = code;
            localStorage.setItem('device_id', deviceId);
            showTodo();
        } catch {
            error.textContent = 'Could not reach the server. Try again.';
        }
    }

    // ── Disconnect ─────────────────────────────────────────
    document.getElementById('btn-disconnect').addEventListener('click', () => {
        localStorage.removeItem('device_id');
        deviceId = null;
        document.getElementById('device-code').value = '';
        showConnect();
    });

    // ── Load tasks ─────────────────────────────────────────
    async function loadTasks() {
        const list = document.getElementById('task-list');
        list.innerHTML = `<div class="loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;

        try {
            const res   = await fetch(`${API}/tasks?device_id=${deviceId}`);
            const tasks = await res.json();
            renderTasks(tasks);
        } catch {
            list.innerHTML = `<div class="empty"><div class="empty-icon">⚠</div><p>Could not load tasks.</p></div>`;
        }
    }

    function renderTasks(tasks) {
        const list = document.getElementById('task-list');
        if (!tasks.length) {
            list.innerHTML = `<div class="empty"><div class="empty-icon">○</div><p>No tasks yet.</p></div>`;
            return;
        }

        list.innerHTML = '';
        tasks.forEach(task => list.appendChild(makeTaskEl(task)));
    }

    function makeTaskEl(task) {
        const li = document.createElement('li');
        li.className = `task-item${task.is_complete ? ' done' : ''}`;
        li.dataset.id = task.task_id;

        const isOverdue = task.due_date && !task.is_complete && new Date(task.due_date) < new Date();
        const dueStr    = task.due_date
            ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '';

        li.innerHTML = `
            <input class="task-check" type="checkbox" ${task.is_complete ? 'checked' : ''} />
            <div class="task-body">
                <div class="task-desc">${escHtml(task.task_description)}</div>
                ${dueStr ? `<div class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠ ' : ''}${dueStr}</div>` : ''}
            </div>
            <button class="btn-delete" title="Delete">×</button>
        `;

        li.querySelector('.task-check').addEventListener('change', () => toggleTask(task.task_id, li));
        li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.task_id, li));

        return li;
    }

    // ── Add task ───────────────────────────────────────────
    document.getElementById('btn-add').addEventListener('click', addTask);
    document.getElementById('task-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') addTask();
    });

    async function addTask() {
        const input = document.getElementById('task-input');
        const due   = document.getElementById('due-input');
        const desc  = input.value.trim();
        if (!desc) return;

        const body = {
            device_id:        deviceId,
            task_description: desc,
            due_date:         due.value || null
        };

        try {
            const res  = await fetch(`${API}/tasks`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body)
            });
            const data = await res.json();

            // optimistic UI — add to list immediately
            const list = document.getElementById('task-list');
            const empty = list.querySelector('.empty');
            if (empty) list.innerHTML = '';

            list.appendChild(makeTaskEl({
                task_id:          data.task_id || Date.now().toString(),
                task_description: desc,
                due_date:         due.value || null,
                is_complete:      false
            }));

            input.value = '';
            due.value   = '';
            input.focus();
        } catch {
            alert('Could not add task. Try again.');
        }
    }

    // ── Toggle complete ────────────────────────────────────
    async function toggleTask(taskId, li) {
        li.classList.toggle('done');
        try {
            await fetch(`${API}/tasks/${taskId}/complete`, { method: 'PATCH' });
        } catch {
            li.classList.toggle('done'); // revert on failure
        }
    }

    // ── Delete ─────────────────────────────────────────────
    async function deleteTask(taskId, li) {
        li.style.opacity = '0.4';
        try {
            await fetch(`${API}/tasks/${taskId}`, { method: 'DELETE' });
            li.remove();
            if (!document.querySelectorAll('.task-item').length) {
                document.getElementById('task-list').innerHTML =
                    `<div class="empty"><div class="empty-icon">○</div><p>No tasks yet.</p></div>`;
            }
        } catch {
            li.style.opacity = '1';
        }
    }

    // ── Util ───────────────────────────────────────────────
    function escHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }