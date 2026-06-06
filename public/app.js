const state = {
  token: localStorage.getItem('gestao_token'),
  user: null,
  tickets: [],
  items: [],
  users: [],
  loans: [],
  adminDialog: null,
};

const roleLabels = {
  admin: 'Admin',
  analista: 'Analista',
  usuario: 'Usuario',
};

const statusLabels = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

const priorityLabels = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  let data = null;
  const text = await response.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { erro: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.erro || 'Nao foi possivel concluir a acao.');
  }

  return data;
}

function formData(form) {
  if (!form) {
    return {};
  }

  return Object.fromEntries(new FormData(form).entries());
}

function resetForm(form) {
  if (form && typeof form.reset === 'function') {
    form.reset();
  }
}

function closeDialog(dialog) {
  if (!dialog) return;

  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function openDialog(dialog) {
  if (!dialog) return;

  if (dialog.open) return;

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

async function withSubmitting(form, action) {
  const submitButton = form?.querySelector?.('[type="submit"]');
  const originalText = submitButton?.textContent;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Processando...';
  }

  try {
    return await action();
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
}

function showNotice(message, type = 'success') {
  const notice = qs('#notice');
  if (!notice) return;

  notice.textContent = message;
  notice.classList.toggle('error', type === 'error');
  notice.classList.remove('hidden');
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => notice.classList.add('hidden'), 4200);
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function initials(name = 'Usuario') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function canManageTickets() {
  return ['admin', 'analista'].includes(state.user?.role);
}

function isAdmin() {
  return state.user?.role === 'admin';
}

function setAuthTab(tab) {
  qsa('[data-auth-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.authTab === tab);
  });
  qs('#loginForm')?.classList.toggle('active', tab === 'login');
  qs('#registerForm')?.classList.toggle('active', tab === 'register');
}

function showApp(authenticated) {
  qs('#authView')?.classList.toggle('hidden', authenticated);
  qs('#dashboardView')?.classList.toggle('hidden', !authenticated);
}

function applyRoleVisibility() {
  qsa('.admin-only').forEach((element) => element.classList.toggle('hidden', !isAdmin()));
  qsa('.analyst-only').forEach((element) => element.classList.toggle('hidden', !canManageTickets()));
  qsa('[data-view="users"]').forEach((element) => element.classList.toggle('hidden', !isAdmin()));
}

function switchView(view) {
  qsa('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  qsa('.view').forEach((section) => {
    section.classList.toggle('active', section.id === view);
  });
  const pageTitle = qs('#pageTitle');
  if (pageTitle) {
    pageTitle.textContent = qsa(`[data-view="${view}"]`)[0]?.textContent || 'Resumo';
  }
}

function renderUser() {
  if (!state.user) return;

  qs('#userName').textContent = state.user.nome;
  qs('#userEmail').textContent = state.user.email;
  qs('#userRole').textContent = roleLabels[state.user.role] || state.user.role;
  qs('#userInitials').textContent = initials(state.user.nome);
}

function renderOverview() {
  qs('#metricOpenTickets').textContent = state.tickets.filter((ticket) => ticket.status === 'aberto').length;
  qs('#metricProgressTickets').textContent = state.tickets.filter((ticket) => ticket.status === 'em_andamento').length;
  qs('#metricAvailableItems').textContent = state.items.reduce((sum, item) => sum + Number(item.quantidade_disponivel || 0), 0);
  qs('#metricLoans').textContent = state.loans.filter((loan) => !loan.devolvido).length;

  qs('#recentTickets').innerHTML = state.tickets.slice(0, 5).map((ticket) => `
    <div class="list-row">
      <div>
        <strong>${escapeHtml(ticket.titulo)}</strong>
        <span>${statusLabels[ticket.status]} · ${priorityLabels[ticket.prioridade]}</span>
      </div>
      <span>${formatDate(ticket.criado_em)}</span>
    </div>
  `).join('') || '<p class="empty-state">Nenhum chamado encontrado.</p>';

  qs('#recentItems').innerHTML = state.items.slice(0, 5).map((item) => `
    <div class="list-row">
      <div>
        <strong>${escapeHtml(item.nome)}</strong>
        <span>${Number(item.quantidade_disponivel)} de ${Number(item.quantidade)} disponiveis</span>
      </div>
      <span class="pill ok">${Math.round(stockRatio(item) * 100)}%</span>
    </div>
  `).join('') || '<p class="empty-state">Nenhum item cadastrado.</p>';
}

function renderTickets() {
  const filter = qs('#ticketFilter').value;
  const tickets = filter === 'todos' ? state.tickets : state.tickets.filter((ticket) => ticket.status === filter);

  qs('#ticketsTable').innerHTML = tickets.map((ticket) => `
    <tr>
      <td>
        <strong>${escapeHtml(ticket.titulo)}</strong>
        <br />
        <small>${escapeHtml(ticket.descricao || '').slice(0, 90)}</small>
      </td>
      <td><span class="pill status-${ticket.status}">${statusLabels[ticket.status]}</span></td>
      <td><span class="pill ${ticket.prioridade === 'alta' ? 'high' : ''}">${priorityLabels[ticket.prioridade]}</span></td>
      <td>${formatDate(ticket.criado_em)}</td>
      <td class="analyst-only ${canManageTickets() ? '' : 'hidden'}">
        <div class="ticket-actions">
          <div class="ticket-primary-actions">
            <button class="secondary-action compact-action" type="button" data-open-ticket="${ticket.id}">Ver</button>
            <button class="secondary-action compact-action" type="button" data-edit-ticket="${ticket.id}">Editar</button>
            ${isAdmin() ? `<button class="danger-action compact-action" type="button" data-delete-ticket="${ticket.id}">Excluir</button>` : ''}
          </div>
          <label class="status-control">
            <span>Status</span>
            <select data-ticket-status-select="${ticket.id}" aria-label="Atualizar status de ${escapeHtml(ticket.titulo)}">
              ${Object.entries(statusLabels).map(([value, label]) => `
                <option value="${value}" ${ticket.status === value ? 'selected' : ''}>${label}</option>
              `).join('')}
            </select>
          </label>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="empty-state">Nenhum chamado para este filtro.</td></tr>';
}

function renderItems() {
  qs('#itemsGrid').innerHTML = state.items.map((item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.nome)}</strong>
        <span>${escapeHtml(item.descricao || 'Sem descricao')}</span>
      </div>
      <div class="stock-bar" aria-label="Disponibilidade">
        <span style="width: ${Math.round(stockRatio(item) * 100)}%"></span>
      </div>
      <span>${Number(item.quantidade_disponivel)} de ${Number(item.quantidade)} disponiveis</span>
      <div class="row-actions">
        <button class="secondary-action compact-action" type="button" data-loan-item="${item.id}" ${Number(item.quantidade_disponivel) <= 0 ? 'disabled' : ''}>
          Emprestar
        </button>
        ${isAdmin() ? `
          <button class="secondary-action compact-action" type="button" data-edit-item="${item.id}">Editar</button>
          <button class="danger-action compact-action" type="button" data-delete-item="${item.id}">Excluir</button>
        ` : ''}
      </div>
    </article>
  `).join('') || '<p class="empty-state">Nenhum item cadastrado.</p>';
}

function renderUsers() {
  qs('#usersTable').innerHTML = state.users.map((user) => `
    <tr>
      <td>${escapeHtml(user.nome)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${roleLabels[user.role] || user.role}</td>
      <td><span class="pill ${user.ativo ? 'ok' : ''}">${user.ativo ? 'Ativo' : 'Inativo'}</span></td>
      <td>
        <div class="row-actions">
          <button class="secondary-action compact-action" type="button" data-edit-user="${user.id}">Editar</button>
          <button class="danger-action compact-action" type="button" data-delete-user="${user.id}" ${user.id === state.user?.id ? 'disabled' : ''}>Excluir</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="empty-state">Nenhum usuario encontrado.</td></tr>';
}

function renderLoans() {
  const loansTable = qs('#loansTable');
  if (!loansTable) return;

  const filter = qs('#loanFilter')?.value || 'ativos';
  const loans = state.loans.filter((loan) => {
    if (filter === 'ativos') return !loan.devolvido;
    if (filter === 'devolvidos') return loan.devolvido;
    return true;
  });

  loansTable.innerHTML = loans.map((loan) => `
    <tr>
      <td>
        <strong>${escapeHtml(loan.item_nome || loan.item_id)}</strong>
        <br />
        <small>${escapeHtml(loan.item_id)}</small>
      </td>
      <td>
        <strong>${escapeHtml(loan.usuario_nome || loan.usuario_id)}</strong>
        <br />
        <small>${escapeHtml(loan.usuario_email || loan.usuario_id)}</small>
      </td>
      <td>${Number(loan.quantidade)}</td>
      <td><span class="pill ${loan.devolvido ? 'ok' : 'status-em_andamento'}">${loan.devolvido ? 'Devolvido' : 'Ativo'}</span></td>
      <td>${formatDate(loan.data_emprestimo)}</td>
      <td>
        <div class="row-actions">
          ${loan.devolvido ? `
            <span class="empty-state">Sem acoes</span>
          ` : `
            <button class="secondary-action compact-action" type="button" data-return-loan="${loan.id}" data-return-item="${loan.item_id}">
              Devolver
            </button>
          `}
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="empty-state">Nenhum emprestimo encontrado.</td></tr>';
}

function stockRatio(item) {
  const total = Number(item.quantidade || 0);
  if (!total) return 0;
  return Math.max(0, Math.min(1, Number(item.quantidade_disponivel || 0) / total));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadData() {
  if (!state.user) return;

  const ticketPath = canManageTickets() ? '/api/chamados/admin/todos' : '/api/chamados/meus';
  const requests = [
    api(ticketPath).then((data) => { state.tickets = data; }),
    api('/api/itens').then((data) => { state.items = data; }),
  ];

  if (canManageTickets()) {
    requests.push(api('/api/itens/listar-emprestimos').then((data) => { state.loans = data; }));
  } else {
    state.loans = [];
  }

  if (isAdmin()) {
    requests.push(api('/api/usuarios').then((data) => { state.users = data; }));
  } else {
    state.users = [];
  }

  await Promise.all(requests);
  renderOverview();
  renderTickets();
  renderItems();
  renderUsers();
  renderLoans();
}

async function boot() {
  if (!state.token) {
    showApp(false);
    return;
  }

  try {
    state.user = await api('/api/usuarios/me');
    showApp(true);
    renderUser();
    applyRoleVisibility();
    switchView('overview');
    await loadData();
  } catch (error) {
    localStorage.removeItem('gestao_token');
    state.token = null;
    state.user = null;
    showApp(false);
    showNotice('Sessao expirada. Entre novamente.', 'error');
  }
}

async function openTicket(id) {
  const ticket = await api(`/api/chamados/${id}`);
  const responses = ticket.respostas || [];
  const dialog = qs('#ticketDialog');
  const dialogTitle = qs('#dialogTitle');
  const dialogBody = qs('#dialogBody');

  if (!dialog || !dialogTitle || !dialogBody) {
    showNotice('Nao foi possivel abrir os detalhes do chamado.', 'error');
    return;
  }

  dialogTitle.textContent = ticket.titulo;
  dialogBody.innerHTML = `
    <p>${escapeHtml(ticket.descricao)}</p>
    <div class="row-actions">
      <span class="pill status-${ticket.status}">${statusLabels[ticket.status]}</span>
      <span class="pill ${ticket.prioridade === 'alta' ? 'high' : ''}">${priorityLabels[ticket.prioridade]}</span>
    </div>
    <div class="response-list">
      ${responses.map((item) => `
        <div class="response-item">
          <p>${escapeHtml(item.resposta)}</p>
          <small>${formatDate(item.criado_em)}</small>
        </div>
      `).join('') || '<p class="empty-state">Sem respostas ainda.</p>'}
    </div>
    ${canManageTickets() ? `
      <label>
        Resposta
        <textarea id="responseText" rows="4"></textarea>
      </label>
      <button class="primary-action" type="button" data-answer-ticket="${ticket.id}">Responder</button>
    ` : ''}
  `;

  openDialog(dialog);
}

function getTicket(id) {
  return state.tickets.find((ticket) => ticket.id === id);
}

function getItem(id) {
  return state.items.find((item) => item.id === id);
}

function getUser(id) {
  return state.users.find((user) => user.id === id);
}

function setAdminDialog({ title, eyebrow, fields, onSubmit }) {
  const dialog = qs('#adminDialog');
  const form = qs('#adminDialogForm');
  const titleElement = qs('#adminDialogTitle');
  const eyebrowElement = qs('#adminDialogEyebrow');
  const fieldsElement = qs('#adminDialogFields');

  if (!dialog || !form || !titleElement || !eyebrowElement || !fieldsElement) {
    showNotice('Nao foi possivel abrir o formulario administrativo.', 'error');
    return;
  }

  titleElement.textContent = title;
  eyebrowElement.textContent = eyebrow;
  fieldsElement.innerHTML = fields;
  state.adminDialog = { onSubmit };
  openDialog(dialog);
}

function editTicket(id) {
  const ticket = getTicket(id);
  if (!ticket || !canManageTickets()) return;

  setAdminDialog({
    eyebrow: 'Chamado',
    title: 'Editar chamado',
    fields: `
      <label>
        Titulo
        <input name="titulo" value="${escapeHtml(ticket.titulo)}" required />
      </label>
      <label>
        Status
        <select name="status">
          ${Object.entries(statusLabels).map(([value, label]) => `
            <option value="${value}" ${ticket.status === value ? 'selected' : ''}>${label}</option>
          `).join('')}
        </select>
      </label>
      <label>
        Prioridade
        <select name="prioridade">
          ${Object.entries(priorityLabels).map(([value, label]) => `
            <option value="${value}" ${ticket.prioridade === value ? 'selected' : ''}>${label}</option>
          `).join('')}
        </select>
      </label>
      <label>
        Descricao
        <textarea name="descricao" rows="5" required>${escapeHtml(ticket.descricao || '')}</textarea>
      </label>
    `,
    onSubmit: async (data) => {
      await api(`/api/chamados/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await loadData();
      showNotice('Chamado atualizado.');
    },
  });
}

function editItem(id) {
  const item = getItem(id);
  if (!item || !isAdmin()) return;

  setAdminDialog({
    eyebrow: 'Item',
    title: 'Editar item',
    fields: `
      <label>
        Nome
        <input name="nome" value="${escapeHtml(item.nome)}" required />
      </label>
      <label>
        Quantidade total
        <input name="quantidade" type="number" min="0" value="${Number(item.quantidade)}" required />
      </label>
      <label>
        Disponivel
        <input name="quantidade_disponivel" type="number" min="0" value="${Number(item.quantidade_disponivel)}" required />
      </label>
      <label>
        Descricao
        <textarea name="descricao" rows="4">${escapeHtml(item.descricao || '')}</textarea>
      </label>
    `,
    onSubmit: async (data) => {
      data.quantidade = Number(data.quantidade);
      data.quantidade_disponivel = Number(data.quantidade_disponivel);

      if (data.quantidade_disponivel > data.quantidade) {
        throw new Error('Disponivel nao pode ser maior que a quantidade total.');
      }

      await api(`/api/itens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await loadData();
      showNotice('Item atualizado.');
    },
  });
}

function loanItem(id) {
  const item = getItem(id);
  if (!item) return;

  const maxQuantity = Number(item.quantidade_disponivel || 0);

  if (maxQuantity <= 0) {
    showNotice('Item sem quantidade disponivel.', 'error');
    return;
  }

  const userOptions = state.users.map((user) => `
    <option value="${user.id}" ${user.id === state.user?.id ? 'selected' : ''}>
      ${escapeHtml(user.nome)} (${escapeHtml(user.email)})
    </option>
  `).join('');

  setAdminDialog({
    eyebrow: 'Emprestimo',
    title: `Emprestar ${item.nome}`,
    fields: `
      ${canManageTickets() && state.users.length ? `
        <label>
          Usuario responsavel
          <select name="usuarioId" required>
            ${userOptions}
          </select>
        </label>
      ` : `
        <p class="empty-state">Este item sera associado ao seu usuario logado.</p>
      `}
      <label>
        Quantidade
        <input name="quantidade" type="number" min="1" max="${maxQuantity}" value="1" required />
      </label>
      <p class="empty-state">${maxQuantity} unidade(s) disponivel(is).</p>
    `,
    onSubmit: async (data) => {
      const payload = {
        itemId: id,
        quantidade: Number(data.quantidade),
      };

      if (data.usuarioId) {
        payload.usuarioId = data.usuarioId;
      }

      await api('/api/itens/emprestar', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await loadData();
      showNotice('Emprestimo registrado e associado ao usuario.');
    },
  });
}

function editUser(id) {
  const user = getUser(id);
  if (!user || !isAdmin()) return;

  setAdminDialog({
    eyebrow: 'Usuario',
    title: 'Editar usuario',
    fields: `
      <label>
        Nome
        <input name="nome" value="${escapeHtml(user.nome)}" required />
      </label>
      <label>
        Email
        <input name="email" type="email" value="${escapeHtml(user.email)}" required />
      </label>
      <label>
        Perfil
        <select name="role">
          ${Object.entries(roleLabels).map(([value, label]) => `
            <option value="${value}" ${user.role === value ? 'selected' : ''}>${label}</option>
          `).join('')}
        </select>
      </label>
      <label>
        Status
        <select name="ativo">
          <option value="true" ${user.ativo ? 'selected' : ''}>Ativo</option>
          <option value="false" ${!user.ativo ? 'selected' : ''}>Inativo</option>
        </select>
      </label>
    `,
    onSubmit: async (data) => {
      data.ativo = data.ativo === 'true';
      await api(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await loadData();

      if (state.user?.id === id) {
        state.user = await api('/api/usuarios/me');
        renderUser();
        applyRoleVisibility();
      }

      showNotice('Usuario atualizado.');
    },
  });
}

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;

  try {
    await withSubmitting(form, async () => {
      const credentials = formData(form);
      const data = await api('/api/usuarios/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      state.token = data.token;
      localStorage.setItem('gestao_token', state.token);
      await boot();
    });
    showNotice('Login realizado com sucesso.');
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

async function register(event) {
  event.preventDefault();
  const form = event.currentTarget;

  try {
    await withSubmitting(form, async () => {
      await api('/api/usuarios/register', {
        method: 'POST',
        body: JSON.stringify(formData(form)),
      });
      resetForm(form);
    });
    setAuthTab('login');
    showNotice('Conta criada. Entre com seu email e senha.');
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

async function createTicket(event) {
  event.preventDefault();
  const form = event.currentTarget;

  try {
    await withSubmitting(form, async () => {
      await api('/api/chamados', {
        method: 'POST',
        body: JSON.stringify(formData(form)),
      });
      resetForm(form);
      await loadData();
    });
    showNotice('Chamado aberto.');
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

async function createItem(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formData(form);
  data.quantidade = Number(data.quantidade);

  try {
    await withSubmitting(form, async () => {
      await api('/api/itens', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      resetForm(form);
      await loadData();
    });
    showNotice('Item adicionado.');
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

async function createUser(event) {
  event.preventDefault();
  const form = event.currentTarget;

  try {
    await withSubmitting(form, async () => {
      await api('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(formData(form)),
      });
      resetForm(form);
      await loadData();
    });
    showNotice('Usuario criado.');
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

async function updateTicketStatus(id, status) {
  await api(`/api/chamados/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  await loadData();
  showNotice('Chamado atualizado.');
}

async function deleteTicket(id) {
  if (!isAdmin() || !window.confirm('Excluir este chamado?')) return;

  await api(`/api/chamados/${id}`, { method: 'DELETE' });
  await loadData();
  showNotice('Chamado excluido.');
}

async function deleteItem(id) {
  if (!isAdmin() || !window.confirm('Excluir este item?')) return;

  await api(`/api/itens/${id}`, { method: 'DELETE' });
  await loadData();
  showNotice('Item excluido.');
}

async function deleteUser(id) {
  if (!isAdmin()) return;

  if (id === state.user?.id) {
    showNotice('Voce nao pode excluir seu proprio usuario logado.', 'error');
    return;
  }

  if (!window.confirm('Excluir este usuario?')) return;

  await api(`/api/usuarios/${id}`, { method: 'DELETE' });
  await loadData();
  showNotice('Usuario excluido.');
}

async function returnLoan(emprestimoId, itemId) {
  if (!emprestimoId || !itemId) return;

  await api('/api/itens/devolver', {
    method: 'POST',
    body: JSON.stringify({ emprestimoId, itemId }),
  });
  await loadData();
  showNotice('Item devolvido.');
}

async function answerTicket(id) {
  const resposta = qs('#responseText')?.value.trim();
  if (!resposta) return;

  await api(`/api/chamados/${id}/respostas`, {
    method: 'POST',
    body: JSON.stringify({ resposta }),
  });
  await loadData();
  await openTicket(id);
  showNotice('Resposta adicionada.');
}

qsa('[data-auth-tab]').forEach((button) => {
  button.addEventListener('click', () => setAuthTab(button.dataset.authTab));
});

qsa('.nav-item').forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

qs('#loginForm')?.addEventListener('submit', login);
qs('#registerForm')?.addEventListener('submit', register);
qs('#ticketForm')?.addEventListener('submit', createTicket);
qs('#itemForm')?.addEventListener('submit', createItem);
qs('#userForm')?.addEventListener('submit', createUser);
qs('#ticketFilter')?.addEventListener('change', renderTickets);
qs('#loanFilter')?.addEventListener('change', renderLoans);

qs('#logoutButton')?.addEventListener('click', () => {
  localStorage.removeItem('gestao_token');
  state.token = null;
  state.user = null;
  switchView('overview');
  showApp(false);
});

qsa('[data-close-admin-dialog]').forEach((button) => {
  button.addEventListener('click', () => closeDialog(qs('#adminDialog')));
});

qs('#adminDialogForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const currentDialog = state.adminDialog;

  if (!currentDialog?.onSubmit) return;

  try {
    await withSubmitting(form, async () => {
      await currentDialog.onSubmit(formData(form));
    });
    closeDialog(qs('#adminDialog'));
    state.adminDialog = null;
  } catch (error) {
    showNotice(error.message, 'error');
  }
});

document.addEventListener('click', async (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const openButton = target.closest('[data-open-ticket]');
  const statusButton = target.closest('[data-status-ticket]');
  const loanButton = target.closest('[data-loan-item]');
  const answerButton = target.closest('[data-answer-ticket]');
  const editTicketButton = target.closest('[data-edit-ticket]');
  const deleteTicketButton = target.closest('[data-delete-ticket]');
  const editItemButton = target.closest('[data-edit-item]');
  const deleteItemButton = target.closest('[data-delete-item]');
  const editUserButton = target.closest('[data-edit-user]');
  const deleteUserButton = target.closest('[data-delete-user]');
  const returnLoanButton = target.closest('[data-return-loan]');

  try {
    if (openButton) await openTicket(openButton.dataset.openTicket);
    if (statusButton) await updateTicketStatus(statusButton.dataset.statusTicket, statusButton.dataset.status);
    if (loanButton) await loanItem(loanButton.dataset.loanItem);
    if (answerButton) await answerTicket(answerButton.dataset.answerTicket);
    if (editTicketButton) editTicket(editTicketButton.dataset.editTicket);
    if (deleteTicketButton) await deleteTicket(deleteTicketButton.dataset.deleteTicket);
    if (editItemButton) editItem(editItemButton.dataset.editItem);
    if (deleteItemButton) await deleteItem(deleteItemButton.dataset.deleteItem);
    if (editUserButton) editUser(editUserButton.dataset.editUser);
    if (deleteUserButton) await deleteUser(deleteUserButton.dataset.deleteUser);
    if (returnLoanButton) {
      await returnLoan(
        returnLoanButton.dataset.returnLoan,
        returnLoanButton.dataset.returnItem
      );
    }
  } catch (error) {
    showNotice(error.message, 'error');
  }
});

document.addEventListener('change', async (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const statusSelect = target?.closest('[data-ticket-status-select]');

  if (!statusSelect) return;

  try {
    await updateTicketStatus(
      statusSelect.dataset.ticketStatusSelect,
      statusSelect.value
    );
  } catch (error) {
    showNotice(error.message, 'error');
    renderTickets();
  }
});

boot();
