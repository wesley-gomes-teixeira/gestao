const state = {
  token: localStorage.getItem('gestao_token'),
  user: null,
  tickets: [],
  items: [],
  users: [],
  loans: [],
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
        <div class="row-actions">
          <button class="secondary-action" type="button" data-open-ticket="${ticket.id}">Ver</button>
          <button class="secondary-action" type="button" data-status-ticket="${ticket.id}" data-status="em_andamento">Andar</button>
          <button class="secondary-action" type="button" data-status-ticket="${ticket.id}" data-status="resolvido">Resolver</button>
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
      <button class="secondary-action" type="button" data-loan-item="${item.id}" ${Number(item.quantidade_disponivel) <= 0 ? 'disabled' : ''}>
        Emprestar
      </button>
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
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty-state">Nenhum usuario encontrado.</td></tr>';
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

  if (dialog.open) {
    return;
  }

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
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

async function loanItem(id) {
  const quantity = Number(window.prompt('Quantidade para emprestar:', '1'));
  if (!quantity || quantity < 1) return;

  await api('/api/itens/emprestar', {
    method: 'POST',
    body: JSON.stringify({ itemId: id, quantidade: quantity }),
  });
  await loadData();
  showNotice('Emprestimo registrado.');
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

qs('#logoutButton')?.addEventListener('click', () => {
  localStorage.removeItem('gestao_token');
  state.token = null;
  state.user = null;
  switchView('overview');
  showApp(false);
});

document.addEventListener('click', async (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const openButton = target.closest('[data-open-ticket]');
  const statusButton = target.closest('[data-status-ticket]');
  const loanButton = target.closest('[data-loan-item]');
  const answerButton = target.closest('[data-answer-ticket]');

  try {
    if (openButton) await openTicket(openButton.dataset.openTicket);
    if (statusButton) await updateTicketStatus(statusButton.dataset.statusTicket, statusButton.dataset.status);
    if (loanButton) await loanItem(loanButton.dataset.loanItem);
    if (answerButton) await answerTicket(answerButton.dataset.answerTicket);
  } catch (error) {
    showNotice(error.message, 'error');
  }
});

boot();
