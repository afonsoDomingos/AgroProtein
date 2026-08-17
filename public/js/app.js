// API Base URL
const API_URL = '/api';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Mobile sidebar toggle
const toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
};

// Desktop sidebar collapse toggle
const toggleSidebarCollapse = () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // Save state to localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
};

// Load sidebar state from localStorage
const loadSidebarState = () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && window.innerWidth >= 768) {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
};

// Close sidebar when clicking on menu items (mobile)
document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    });
});

// API calls with auth
const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            showToast('Sessão expirada. Faça login novamente.', 'warning');
            logout();
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        showToast(error.message || 'Erro ao processar requisição', 'error');
        return null;
    }
};

// Navigation
const setupNavigation = () => {
    const links = document.querySelectorAll('.sidebar-menu a');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('pageTitle');
    
    if (links.length === 0) {
        console.error('No sidebar menu links found');
        return;
    }
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const pageName = link.getAttribute('data-page');
            if (!pageName) {
                console.error('No data-page attribute on link');
                return;
            }
            
            // Update active link
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding page
            pages.forEach(page => page.style.display = 'none');
            const targetPage = document.getElementById(pageName + 'Page');
            if (targetPage) {
                targetPage.style.display = 'block';
            } else {
                console.error('Page not found:', pageName + 'Page');
            }
            
            // Update page title
            const titles = {
                'dashboard': 'Visão Geral',
                'frangos': 'Frangos de Corte',
                'poedeiras': 'Poedeiras',
                'clientes': 'Clientes',
                'financeiro': 'Gestão Financeira',
                'stock': 'Gestão de Stock',
                'noticias': 'Notícias',
                'database': 'Base de Dados',
                'faturas': 'Faturas & Recibos',
                'config': 'Configurações'
            };
            
            pageTitle.textContent = titles[pageName] || 'Dashboard';
            
            // Load data for specific pages
            if (pageName === 'dashboard') {
                loadDashboardData();
            } else if (pageName === 'frangos') {
                loadFrangos();
            } else if (pageName === 'poedeiras') {
                loadPoedeiras();
            } else if (pageName === 'clientes') {
                loadClientes();
            } else if (pageName === 'financeiro') {
                loadDespesas();
            } else if (pageName === 'stock') {
                loadStockStatus();
            } else if (pageName === 'noticias') {
                loadNoticias();
            } else if (pageName === 'database') {
                loadDatabaseOverview();
            } else if (pageName === 'faturas') {
                loadFaturas();
            }
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });
};

// Load page-specific data
const loadPageData = async (page) => {
    switch(page) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'frangos':
            await loadFrangos();
            break;
        case 'poedeiras':
            await loadPoedeiras();
            break;
        case 'clientes':
            await loadClientes();
            break;
        case 'financeiro':
            await loadDespesas();
            break;
        case 'database':
            await loadDatabaseStats();
            break;
        case 'faturas':
            await loadFaturas();
            break;
        case 'config':
            loadUserInfo();
            break;
    }
};

// Dashboard functions
const loadDashboardData = async () => {
    const year = document.getElementById('filterYear').value;
    const month = document.getElementById('filterMonth').value;
    const line = document.getElementById('filterLine').value;
    
    let queryParams = `?ano=${year}`;
    if (month) queryParams += `&mes=${month}`;
    if (line) queryParams += `&linha=${line}`;
    
    const data = await apiCall(`/dashboard/overview${queryParams}`);
    
    if (data) {
        // Update health status
        const healthStatus = document.getElementById('healthStatus');
        healthStatus.className = `health-status ${data.saudeGranja.toLowerCase()}`;
        document.getElementById('healthTitle').textContent = data.saudeGranja;
        
        // Update indicators
        document.getElementById('receitaTotal').textContent = formatCurrency(data.indicadores.receitaTotal);
        document.getElementById('lucroLiquido').textContent = formatCurrency(data.indicadores.lucroLiquido);
        document.getElementById('margemLucro').textContent = `${data.indicadores.margemLucro}%`;
        document.getElementById('roiAnual').textContent = `${data.indicadores.roi}%`;
        document.getElementById('avesAlojadas').textContent = data.indicadores.avesAlojadas;
        document.getElementById('taxaMortalidade').textContent = `${data.indicadores.taxaMortalidadeMedia}%`;
        
        // Update performance vs goal
        document.getElementById('desempenhoMeta').textContent = `${data.desempenhoMeta.desempenho}%`;
        
        // Update revenue by line
        document.getElementById('receitaFrango').textContent = formatCurrency(data.receitaPorLinha.frango);
        document.getElementById('receitaOvos').textContent = formatCurrency(data.receitaPorLinha.ovos);
        
        // Update charts
        updateCharts(data);
    }
};

// Chart instances
let receitaMensalChart, despesasChart, producaoChart, mortalidadeChart, fluxoCaixaChart;

// Initialize charts
const initCharts = () => {
    // Receita Mensal Chart
    const receitaCtx = document.getElementById('receitaMensalChart').getContext('2d');
    receitaMensalChart = new Chart(receitaCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Receita',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2196F3',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Despesas Chart
    const despesasCtx = document.getElementById('despesasChart').getContext('2d');
    despesasChart = new Chart(despesasCtx, {
        type: 'doughnut',
        data: {
            labels: ['Alimentação', 'Medicamentos', 'Manutenção', 'Salários', 'Energia', 'Água', 'Outros'],
            datasets: [{
                data: [30, 15, 10, 25, 10, 5, 5],
                backgroundColor: [
                    '#2196F3',
                    '#4CAF50',
                    '#FF9800',
                    '#9C27B0',
                    '#F44336',
                    '#00BCD4',
                    '#607D8B'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Produção Chart
    const producaoCtx = document.getElementById('producaoChart').getContext('2d');
    producaoChart = new Chart(producaoCtx, {
        type: 'bar',
        data: {
            labels: ['Frangos', 'Ovos (mil)'],
            datasets: [{
                label: 'Este Mês',
                data: [0, 0],
                backgroundColor: ['#2196F3', '#4CAF50'],
                borderRadius: 8,
                barThickness: 60
            }, {
                label: 'Mês Anterior',
                data: [0, 0],
                backgroundColor: ['#90CAF9', '#A5D6A7'],
                borderRadius: 8,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Mortalidade Chart
    const mortalidadeCtx = document.getElementById('mortalidadeChart').getContext('2d');
    mortalidadeChart = new Chart(mortalidadeCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Frangos',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#F44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#F44336',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }, {
                label: 'Poedeiras',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#FF9800',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Fluxo de Caixa Chart
    const fluxoCaixaCtx = document.getElementById('fluxoCaixaChart').getContext('2d');
    fluxoCaixaChart = new Chart(fluxoCaixaCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Receitas',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#4CAF50',
                borderRadius: 8
            }, {
                label: 'Despesas',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#F44336',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
};

// Update charts with data
const updateCharts = (data) => {
    // Update Receita Mensal Chart
    if (receitaMensalChart && data.receitaMensal) {
        receitaMensalChart.data.datasets[0].data = data.receitaMensal;
        receitaMensalChart.update('active');
    }

    // Update Despesas Chart
    if (despesasChart && data.distribuicaoDespesas) {
        despesasChart.data.datasets[0].data = data.distribuicaoDespesas;
        despesasChart.update('active');
    }

    // Update Produção Chart
    if (producaoChart && data.producao) {
        producaoChart.data.datasets[0].data = data.producao.atual;
        producaoChart.data.datasets[1].data = data.producao.anterior;
        producaoChart.update('active');
    }

    // Update Mortalidade Chart
    if (mortalidadeChart && data.mortalidade) {
        mortalidadeChart.data.datasets[0].data = data.mortalidade.frangos;
        mortalidadeChart.data.datasets[1].data = data.mortalidade.poedeiras;
        mortalidadeChart.update('active');
    }

    // Update Fluxo de Caixa Chart
    if (fluxoCaixaChart && data.fluxoCaixa) {
        fluxoCaixaChart.data.datasets[0].data = data.fluxoCaixa.receitas;
        fluxoCaixaChart.data.datasets[1].data = data.fluxoCaixa.despesas;
        fluxoCaixaChart.update('active');
    }
};

// Frangos functions
const loadFrangos = async () => {
    const data = await apiCall('/frangos-corte');
    if (data) {
        const tbody = document.querySelector('#frangosTable tbody');
        tbody.innerHTML = data.map(frango => `
            <tr>
                <td data-label="Lote">${frango.lote}</td>
                <td data-label="Quantidade">${frango.quantidade}</td>
                <td data-label="Data Entrada">${formatDate(frango.dataEntrada)}</td>
                <td data-label="Raça">${frango.raca}</td>
                <td data-label="Status">${frango.status}</td>
                <td data-label="Taxa Mortalidade">${frango.taxaMortalidade}%</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary" onclick="editFrango('${frango._id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFrango('${frango._id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    }
};

const saveFrango = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall('/frangos-corte', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    // Remove loading state
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('frangoModal');
        form.reset();
        loadFrangos();
        showToast('Lote de frangos criado com sucesso!', 'success');
    }
};

const editFrango = async (id) => {
    const data = await apiCall(`/frangos-corte/${id}`);
    if (data) {
        const form = document.getElementById('frangoForm');
        Object.keys(data).forEach(key => {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        });
        form.dataset.editId = id;
        openModal('frangoModal');
    }
};

const updateFrango = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = form.dataset.editId;
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall(`/frangos-corte/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('frangoModal');
        form.reset();
        delete form.dataset.editId;
        loadFrangos();
        showToast('Lote de frangos atualizado com sucesso!', 'success');
    }
};

const deleteFrango = async (id) => {
    if (confirm('Tem certeza que deseja excluir este lote? Esta ação não pode ser desfeita.')) {
        const result = await apiCall(`/frangos-corte/${id}`, {
            method: 'DELETE'
        });
        
        if (result) {
            loadFrangos();
            showToast('Lote excluído com sucesso!', 'success');
        }
    }
};

// Poedeiras functions
const loadPoedeiras = async () => {
    const data = await apiCall('/poedeiras');
    if (data) {
        const tbody = document.querySelector('#poedeirasTable tbody');
        tbody.innerHTML = data.map(poedeira => `
            <tr>
                <td data-label="Lote">${poedeira.lote}</td>
                <td data-label="Quantidade">${poedeira.quantidade}</td>
                <td data-label="Data Entrada">${formatDate(poedeira.dataEntrada)}</td>
                <td data-label="Raça">${poedeira.raca}</td>
                <td data-label="Status">${poedeira.status}</td>
                <td data-label="Taxa Postura">${poedeira.taxaPostura}%</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary" onclick="editPoedeira('${poedeira._id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePoedeira('${poedeira._id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    }
};

const savePoedeira = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall('/poedeiras', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('poedeiraModal');
        form.reset();
        loadPoedeiras();
        showToast('Lote de poedeiras criado com sucesso!', 'success');
    }
};

const editPoedeira = async (id) => {
    const data = await apiCall(`/poedeiras/${id}`);
    if (data) {
        const form = document.getElementById('poedeiraForm');
        Object.keys(data).forEach(key => {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        });
        form.dataset.editId = id;
        openModal('poedeiraModal');
    }
};

const updatePoedeira = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = form.dataset.editId;
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall(`/poedeiras/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('poedeiraModal');
        form.reset();
        delete form.dataset.editId;
        loadPoedeiras();
        showToast('Lote de poedeiras atualizado com sucesso!', 'success');
    }
};

const deletePoedeira = async (id) => {
    if (confirm('Tem certeza que deseja excluir este lote? Esta ação não pode ser desfeita.')) {
        const result = await apiCall(`/poedeiras/${id}`, {
            method: 'DELETE'
        });
        
        if (result) {
            loadPoedeiras();
            showToast('Lote excluído com sucesso!', 'success');
        }
    }
};

// Clientes functions
const loadClientes = async () => {
    const data = await apiCall('/clientes');
    if (data) {
        const tbody = document.querySelector('#clientesTable tbody');
        tbody.innerHTML = data.map(cliente => `
            <tr>
                <td data-label="Nome">${cliente.nome}</td>
                <td data-label="Email">${cliente.email}</td>
                <td data-label="Telefone">${cliente.telefone}</td>
                <td data-label="Tipo">${cliente.tipoCliente}</td>
                <td data-label="Status">${cliente.ativo ? 'Ativo' : 'Inativo'}</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary" onclick="editCliente('${cliente._id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCliente('${cliente._id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
        
        // Update cliente selects in forms
        updateClienteSelects(data);
    }
};

const updateClienteSelects = (clientes) => {
    const vendaSelect = document.getElementById('vendaCliente');
    const faturaSelect = document.getElementById('faturaCliente');
    
    const options = clientes.map(c => `<option value="${c._id}">${c.nome}</option>`).join('');
    
    if (vendaSelect) vendaSelect.innerHTML = '<option value="">Selecione...</option>' + options;
    if (faturaSelect) faturaSelect.innerHTML = '<option value="">Selecione...</option>' + options;
};

const saveCliente = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall('/clientes', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('clienteModal');
        form.reset();
        loadClientes();
        showToast('Cliente cadastrado com sucesso!', 'success');
    }
};

const editCliente = async (id) => {
    const data = await apiCall(`/clientes/${id}`);
    if (data) {
        const form = document.getElementById('clienteForm');
        Object.keys(data).forEach(key => {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        });
        form.dataset.editId = id;
        openModal('clienteModal');
    }
};

const updateCliente = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = form.dataset.editId;
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('clienteModal');
        form.reset();
        delete form.dataset.editId;
        loadClientes();
        showToast('Cliente atualizado com sucesso!', 'success');
    }
};

const deleteCliente = async (id) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        const result = await apiCall(`/clientes/${id}`, {
            method: 'DELETE'
        });
        
        if (result) {
            loadClientes();
            showToast('Cliente excluído com sucesso!', 'success');
        }
    }
};

// Vendas functions
const loadVendas = async () => {
    const data = await apiCall('/vendas');
    if (data) {
        const tbody = document.querySelector('#vendasTable tbody');
        tbody.innerHTML = data.map(venda => `
            <tr>
                <td data-label="Cliente">${venda.cliente?.nome || 'N/A'}</td>
                <td data-label="Produto">${venda.tipoProduto}</td>
                <td data-label="Quantidade">${venda.quantidade}</td>
                <td data-label="Valor Total">${formatCurrency(venda.valorTotal)}</td>
                <td data-label="Data">${formatDate(venda.dataVenda)}</td>
                <td data-label="Status">${venda.status}</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary" onclick="editVenda('${venda._id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVenda('${venda._id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    }
};

const saveVenda = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall('/vendas', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('vendaModal');
        form.reset();
        loadVendas();
        showToast('Venda registrada com sucesso!', 'success');
    }
};

const editVenda = async (id) => {
    const data = await apiCall(`/vendas/${id}`);
    if (data) {
        const form = document.getElementById('vendaForm');
        Object.keys(data).forEach(key => {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        });
        form.dataset.editId = id;
        openModal('vendaModal');
    }
};

const updateVenda = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = form.dataset.editId;
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall(`/vendas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('vendaModal');
        form.reset();
        delete form.dataset.editId;
        loadVendas();
        showToast('Venda atualizada com sucesso!', 'success');
    }
};

const deleteVenda = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.')) {
        const result = await apiCall(`/vendas/${id}`, {
            method: 'DELETE'
        });
        
        if (result) {
            loadVendas();
            showToast('Venda excluída com sucesso!', 'success');
        }
    }
};

// Despesas functions
const loadDespesas = async () => {
    const data = await apiCall('/despesas');
    if (data) {
        const tbody = document.querySelector('#despesasTable tbody');
        tbody.innerHTML = data.map(despesa => `
            <tr>
                <td data-label="Descrição">${despesa.descricao}</td>
                <td data-label="Categoria">${despesa.categoria}</td>
                <td data-label="Valor">${formatCurrency(despesa.valor)}</td>
                <td data-label="Data">${formatDate(despesa.dataDespesa)}</td>
                <td data-label="Status">${despesa.status}</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary" onclick="editDespesa('${despesa._id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDespesa('${despesa._id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    }
};

const saveDespesa = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall('/despesas', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('despesaModal');
        form.reset();
        loadDespesas();
        showToast('Despesa registrada com sucesso!', 'success');
    }
};

const editDespesa = async (id) => {
    const data = await apiCall(`/despesas/${id}`);
    if (data) {
        const form = document.getElementById('despesaForm');
        Object.keys(data).forEach(key => {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        });
        form.dataset.editId = id;
        openModal('despesaModal');
    }
};

const updateDespesa = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = form.dataset.editId;
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall(`/despesas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('despesaModal');
        form.reset();
        delete form.dataset.editId;
        loadDespesas();
        showToast('Despesa atualizada com sucesso!', 'success');
    }
};

const deleteDespesa = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.')) {
        const result = await apiCall(`/despesas/${id}`, {
            method: 'DELETE'
        });
        
        if (result) {
            loadDespesas();
            showToast('Despesa excluída com sucesso!', 'success');
        }
    }
};

// Faturas functions
const loadFaturas = async () => {
    const data = await apiCall('/faturas');
    if (data) {
        const tbody = document.querySelector('#faturasTable tbody');
        tbody.innerHTML = data.map(fatura => `
            <tr>
                <td data-label="Número">${fatura.numero}</td>
                <td data-label="Cliente">${fatura.cliente?.nome || 'N/A'}</td>
                <td data-label="Valor">${formatCurrency(fatura.valor)}</td>
                <td data-label="Data Emissão">${formatDate(fatura.dataEmissao)}</td>
                <td data-label="Data Vencimento">${formatDate(fatura.dataVencimento)}</td>
                <td data-label="Status">${fatura.status}</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary" onclick="editFatura('${fatura._id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFatura('${fatura._id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    }
};

const saveFatura = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall('/faturas', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('faturaModal');
        form.reset();
        loadFaturas();
        showToast('Fatura emitida com sucesso!', 'success');
    }
};

const editFatura = async (id) => {
    const data = await apiCall(`/faturas/${id}`);
    if (data) {
        const form = document.getElementById('faturaForm');
        Object.keys(data).forEach(key => {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        });
        form.dataset.editId = id;
        openModal('faturaModal');
    }
};

const updateFatura = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = form.dataset.editId;
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await apiCall(`/faturas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (result) {
        closeModal('faturaModal');
        form.reset();
        delete form.dataset.editId;
        loadFaturas();
        showToast('Fatura atualizada com sucesso!', 'success');
    }
};

const deleteFatura = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.')) {
        const result = await apiCall(`/faturas/${id}`, {
            method: 'DELETE'
        });
        
        if (result) {
            loadFaturas();
            showToast('Fatura excluída com sucesso!', 'success');
        }
    }
};

// Database stats
const loadDatabaseStats = async () => {
    const [frangos, poedeiras, clientes, vendas, despesas, faturas] = await Promise.all([
        apiCall('/frangos-corte'),
        apiCall('/poedeiras'),
        apiCall('/clientes'),
        apiCall('/vendas'),
        apiCall('/despesas'),
        apiCall('/faturas')
    ]);
    
    document.getElementById('totalFrangos').textContent = frangos?.length || 0;
    document.getElementById('totalPoedeiras').textContent = poedeiras?.length || 0;
    document.getElementById('totalClientes').textContent = clientes?.length || 0;
    document.getElementById('totalVendas').textContent = vendas?.length || 0;
    document.getElementById('totalDespesas').textContent = despesas?.length || 0;
    document.getElementById('totalFaturas').textContent = faturas?.length || 0;
};

// User info
const loadUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userInfo').innerHTML = `
            <p><strong>Nome:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Função:</strong> ${user.role}</p>
        `;
    }
};

// Seed admin
const seedAdmin = async () => {
    const result = await apiCall('/auth/seed-admin', {
        method: 'POST'
    });
    
    if (result) {
        showToast('Usuário admin criado com sucesso!', 'success');
    } else {
        showToast('Erro ao criar usuário admin', 'error');
    }
};

// Modal functions
const openModal = (modalId) => {
    document.getElementById(modalId).classList.add('active');
};

const closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active');
};

// Config form handler
document.getElementById('configForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Save to localStorage
    localStorage.setItem('config', JSON.stringify(data));
    
    // Update currency format
    localStorage.setItem('moeda', data.moeda);
    
    // Update company name in header
    const empresaNome = data.empresaNome || 'Gestão Avícola';
    document.querySelector('.mobile-header h1').textContent = '🐔 ' + empresaNome;
    document.querySelector('.sidebar-header h2').textContent = '🐔 ' + empresaNome;
    
    showToast('Configurações salvas com sucesso!', 'success');
    
    // Reload data to apply new currency
    loadDashboardData();
});

// Stock management functions
const loadStockStatus = async () => {
    const result = await apiCall('/stock/status');
    if (result) {
        document.getElementById('totalFrangosStock').textContent = result.totalFrangos;
        document.getElementById('totalPoedeirasStock').textContent = result.totalPoedeiras;
        document.getElementById('alertasStockBaixo').textContent = result.alertasStockBaixo.length;
        
        // Render frangos stock table
        const frangosTable = document.getElementById('frangosStockTable').querySelector('tbody');
        frangosTable.innerHTML = result.frangos.map(f => `
            <tr>
                <td>${f.lote}</td>
                <td>${f.quantidade}</td>
                <td>${f.stockAtual}</td>
                <td>${f.stockMinimo}</td>
                <td>
                    <span class="badge ${f.alertaStockBaixo ? 'badge-danger' : 'badge-success'}">
                        ${f.alertaStockBaixo ? '⚠️ Stock Baixo' : '✓ Normal'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="ajustarStock('${f.id}', 'frango')">Ajustar</button>
                </td>
            </tr>
        `).join('');
        
        // Render poedeiras stock table
        const poedeirasTable = document.getElementById('poedeirasStockTable').querySelector('tbody');
        poedeirasTable.innerHTML = result.poedeiras.map(p => `
            <tr>
                <td>${p.lote}</td>
                <td>${p.quantidade}</td>
                <td>${p.stockAtual}</td>
                <td>${p.stockMinimo}</td>
                <td>
                    <span class="badge ${p.alertaStockBaixo ? 'badge-danger' : 'badge-success'}">
                        ${p.alertaStockBaixo ? '⚠️ Stock Baixo' : '✓ Normal'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="ajustarStock('${p.id}', 'poedeira')">Ajustar</button>
                </td>
            </tr>
        `).join('');
        
        // Load movimentacoes
        loadMovimentacoes();
    }
};

const loadMovimentacoes = async () => {
    const result = await apiCall('/stock/movimentacoes?limit=20');
    if (result) {
        const table = document.getElementById('movimentacoesTable').querySelector('tbody');
        table.innerHTML = result.map(m => `
            <tr>
                <td>${formatDate(m.createdAt)}</td>
                <td>
                    <span class="badge badge-${m.tipo === 'entrada' ? 'success' : m.tipo === 'saida' ? 'danger' : 'warning'}">
                        ${m.tipo.toUpperCase()}
                    </span>
                </td>
                <td>${m.lote}</td>
                <td>${m.quantidade}</td>
                <td>${m.stockAnterior}</td>
                <td>${m.stockNovo}</td>
                <td>${m.motivo}</td>
            </tr>
        `).join('');
    }
};

const openMovimentacaoModal = () => {
    document.getElementById('movimentacaoForm').reset();
    loadProdutosForStock();
    openModal('movimentacaoModal');
};

const loadProdutosForStock = async () => {
    const produtoTipo = document.getElementById('movProdutoTipo').value;
    const loteSelect = document.getElementById('movLote');
    
    let endpoint = produtoTipo === 'frango' ? '/frangos-corte' : '/poedeiras';
    const result = await apiCall(endpoint);
    
    if (result) {
        loteSelect.innerHTML = result.map(p => 
            `<option value="${p._id}">${p.lote} (Stock: ${p.stockAtual})</option>`
        ).join('');
    }
};

// Movimentação form handler
document.getElementById('movimentacaoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const produtoId = data.produtoId;
    const produtoTipo = data.produtoTipo;
    
    // Get lote name
    const loteSelect = document.getElementById('movLote');
    const lote = loteSelect.options[loteSelect.selectedIndex].text.split(' (')[0];
    
    const stockData = {
        tipo: data.tipo,
        quantidade: parseInt(data.quantidade),
        produtoTipo: produtoTipo,
        produtoId: produtoId,
        lote: lote,
        motivo: data.motivo,
        observacoes: data.observacoes
    };
    
    const result = await apiCall('/stock/movimentacao', {
        method: 'POST',
        body: JSON.stringify(stockData)
    });
    
    if (result) {
        closeModal('movimentacaoModal');
        form.reset();
        loadStockStatus();
        showToast('Movimentação registrada com sucesso!', 'success');
    }
});

const ajustarStock = async (id, tipo) => {
    const stockMinimo = prompt('Novo stock mínimo:');
    if (stockMinimo !== null) {
        const result = await apiCall(`/stock/config/${id}?produtoTipo=${tipo}`, {
            method: 'PUT',
            body: JSON.stringify({ stockMinimo: parseInt(stockMinimo) })
        });
        
        if (result) {
            loadStockStatus();
            showToast('Stock mínimo atualizado!', 'success');
        }
    }
};

// Load config from localStorage
const loadConfig = () => {
    const config = JSON.parse(localStorage.getItem('config') || '{}');
    
    if (config.empresaNome) {
        document.getElementById('empresaNome').value = config.empresaNome;
        document.querySelector('.mobile-header h1').textContent = '🐔 ' + config.empresaNome;
        document.querySelector('.sidebar-header h2').textContent = '🐔 ' + config.empresaNome;
    }
    
    if (config.moeda) {
        document.getElementById('moeda').value = config.moeda;
        localStorage.setItem('moeda', config.moeda);
    }
    
    if (config.telefoneContato) {
        document.getElementById('telefoneContato').value = config.telefoneContato;
    }
    
    if (config.emailContato) {
        document.getElementById('emailContato').value = config.emailContato;
    }
    
    if (config.endereco) {
        document.getElementById('endereco').value = config.endereco;
    }
    
    if (config.nif) {
        document.getElementById('nif').value = config.nif;
    }
    
    if (config.observacoes) {
        document.getElementById('observacoes').value = config.observacoes;
    }
    
    // Load profile photo
    loadProfilePhoto();
};

// Profile photo functions
const previewProfilePhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('profilePhotoImg');
            const placeholder = document.getElementById('profilePhotoPlaceholder');
            
            img.src = e.target.result;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Save to localStorage
            localStorage.setItem('profilePhoto', e.target.result);
            
            // Update header avatar
            updateHeaderAvatar(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};

const loadProfilePhoto = () => {
    const profilePhoto = localStorage.getItem('profilePhoto');
    if (profilePhoto) {
        const img = document.getElementById('profilePhotoImg');
        const placeholder = document.getElementById('profilePhotoPlaceholder');
        
        img.src = profilePhoto;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Update header avatar
        updateHeaderAvatar(profilePhoto);
    }
};

const removeProfilePhoto = () => {
    localStorage.removeItem('profilePhoto');
    
    const img = document.getElementById('profilePhotoImg');
    const placeholder = document.getElementById('profilePhotoPlaceholder');
    const input = document.getElementById('profilePhotoInput');
    
    img.style.display = 'none';
    img.src = '';
    placeholder.style.display = 'block';
    input.value = '';
    
    // Remove header avatar
    removeHeaderAvatar();
    
    showToast('Foto de perfil removida', 'success');
};

const updateHeaderAvatar = (photoData) => {
    // Check if avatar already exists in header
    let avatar = document.querySelector('.user-avatar');
    
    if (!avatar) {
        // Add avatar to mobile header
        const mobileHeader = document.querySelector('.user-info-mobile');
        if (mobileHeader) {
            const avatarImg = document.createElement('img');
            avatarImg.className = 'user-avatar has-photo';
            avatarImg.src = photoData;
            mobileHeader.insertBefore(avatarImg, mobileHeader.firstChild);
        }
        
        // Add avatar to desktop header
        const desktopHeader = document.querySelector('.user-info');
        if (desktopHeader) {
            const avatarImg = document.createElement('img');
            avatarImg.className = 'user-avatar has-photo';
            avatarImg.src = photoData;
            desktopHeader.insertBefore(avatarImg, desktopHeader.firstChild);
        }
    } else {
        avatar.src = photoData;
        avatar.classList.add('has-photo');
    }
};

const removeHeaderAvatar = () => {
    const avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(avatar => {
        avatar.classList.remove('has-photo');
        avatar.style.display = 'none';
    });
};

// Form handlers
document.getElementById('frangoForm').addEventListener('submit', (e) => {
    const form = e.target;
    if (form.dataset.editId) {
        updateFrango(e);
    } else {
        saveFrango(e);
    }
});

document.getElementById('poedeiraForm').addEventListener('submit', (e) => {
    const form = e.target;
    if (form.dataset.editId) {
        updatePoedeira(e);
    } else {
        savePoedeira(e);
    }
});

document.getElementById('clienteForm').addEventListener('submit', (e) => {
    const form = e.target;
    if (form.dataset.editId) {
        updateCliente(e);
    } else {
        saveCliente(e);
    }
});

document.getElementById('vendaForm').addEventListener('submit', (e) => {
    const form = e.target;
    if (form.dataset.editId) {
        updateVenda(e);
    } else {
        saveVenda(e);
    }
});

document.getElementById('despesaForm').addEventListener('submit', (e) => {
    const form = e.target;
    if (form.dataset.editId) {
        updateDespesa(e);
    } else {
        saveDespesa(e);
    }
});

document.getElementById('faturaForm').addEventListener('submit', (e) => {
    const form = e.target;
    if (form.dataset.editId) {
        updateFatura(e);
    } else {
        saveFatura(e);
    }
});

// Utility functions
const formatCurrency = (value) => {
    const currency = localStorage.getItem('moeda') || 'MT';
    const formattedValue = new Intl.NumberFormat('pt-MZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value).replace('MT', '').trim();
    return currency + ' ' + formattedValue;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

// Filter table function
const filterTable = (tableId, searchTerm) => {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    const searchLower = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matches = text.includes(searchLower);
        row.style.display = matches ? '' : 'none';
    });
    
    // Show message if no results
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
    const noResultsMessage = table.querySelector('.no-results');
    
    if (visibleRows.length === 0 && searchTerm) {
        if (!noResultsMessage) {
            const message = document.createElement('tr');
            message.className = 'no-results';
            message.innerHTML = `<td colspan="100%" style="text-align: center; padding: 20px; color: var(--text-secondary);">Nenhum resultado encontrado para "${searchTerm}"</td>`;
            tbody.appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
};

// Filter by status function
const filterByStatus = (tableId, status) => {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr:not(.no-results)'));
    
    // Find status column index (usually 4 or 5)
    const statusColumnIndex = tableId === 'clientesTable' ? 4 : 
                              tableId === 'vendasTable' ? 5 :
                              tableId === 'despesasTable' ? 4 :
                              tableId === 'faturasTable' ? 5 : 4;
    
    rows.forEach(row => {
        if (!status) {
            row.style.display = '';
        } else {
            const statusCell = row.cells[statusColumnIndex];
            const rowStatus = statusCell ? statusCell.textContent.trim().toLowerCase() : '';
            const matches = rowStatus === status.toLowerCase();
            row.style.display = matches ? '' : 'none';
        }
    });
    
    // Update no results message
    const visibleRows = rows.filter(row => row.style.display !== 'none');
    const noResultsMessage = table.querySelector('.no-results');
    
    if (visibleRows.length === 0 && status) {
        if (!noResultsMessage) {
            const message = document.createElement('tr');
            message.className = 'no-results';
            message.innerHTML = `<td colspan="100%" style="text-align: center; padding: 20px; color: var(--text-secondary);">Nenhum resultado encontrado para status "${status}"</td>`;
            tbody.appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
};

// Sort table function
const sortTable = (tableId, columnIndex) => {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr:not(.no-results)'));
    
    // Get current sort direction
    const th = table.querySelectorAll('th')[columnIndex];
    const currentSort = th.classList.contains('sort-asc') ? 'asc' : 
                      th.classList.contains('sort-desc') ? 'desc' : null;
    
    // Remove sort classes from all headers
    table.querySelectorAll('th').forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        header.classList.add('sortable');
    });
    
    // Determine new sort direction
    const newSort = currentSort === 'asc' ? 'desc' : 'asc';
    th.classList.add(`sort-${newSort}`);
    th.classList.remove('sortable');
    
    // Sort rows
    rows.sort((a, b) => {
        const aCell = a.cells[columnIndex];
        const bCell = b.cells[columnIndex];
        
        const aText = aCell.textContent.trim();
        const bText = bCell.textContent.trim();
        
        // Try to sort as numbers
        const aNum = parseFloat(aText.replace(/[^\d.-]/g, ''));
        const bNum = parseFloat(bText.replace(/[^\d.-]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return newSort === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Sort as text
        return newSort === 'asc' ? 
               aText.localeCompare(bText, 'pt-BR') : 
               bText.localeCompare(aText, 'pt-BR');
    });
    
    // Reappend sorted rows
    rows.forEach(row => tbody.appendChild(row));
};

// Export table to CSV
const exportTableToCSV = (tableId, filename) => {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');
    
    // Get headers
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    
    // Get data rows (exclude action column)
    const data = Array.from(rows).map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        // Exclude last column (actions)
        return cells.slice(0, -1).map(cell => cell.textContent.trim());
    }).filter(row => row.length > 0);
    
    // Create CSV content
    const csvContent = [
        headers.slice(0, -1).join(','), // Exclude actions from headers
        ...data.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Arquivo CSV exportado com sucesso!', 'success');
};

// Form validation
const validateForm = (form) => {
    let isValid = true;
    const formGroups = form.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const errorElement = group.querySelector('.error-message');
        
        // Remove previous error state
        group.classList.remove('has-error');
        input.classList.remove('error');
        
        if (input && input.required && !input.value.trim()) {
            group.classList.add('has-error');
            input.classList.add('error');
            if (errorElement) {
                errorElement.textContent = 'Este campo é obrigatório';
            }
            isValid = false;
        }
        
        // Email validation
        if (input && input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                group.classList.add('has-error');
                input.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = 'Email inválido';
                }
                isValid = false;
            }
        }
        
        // Phone validation
        if (input && input.type === 'tel' && input.value.trim()) {
            const phoneRegex = /^\d{10,11}$/;
            const cleanPhone = input.value.replace(/\D/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                group.classList.add('has-error');
                input.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = 'Telefone inválido (mínimo 10 dígitos)';
                }
                isValid = false;
            }
        }
        
        // Number validation
        if (input && input.type === 'number' && input.value.trim()) {
            const num = parseFloat(input.value);
            if (isNaN(num) || num < 0) {
                group.classList.add('has-error');
                input.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = 'Valor inválido (deve ser um número positivo)';
                }
                isValid = false;
            }
        }
    });
    
    return isValid;
};

const showToast = (message, type = 'success', duration = 4000) => {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Icons for different types
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;

    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    // Add to container
    container.appendChild(toast);

    // Auto remove after duration
    const timeout = setTimeout(() => removeToast(toast), duration);

    // Store timeout for potential manual removal
    toast.dataset.timeoutId = timeout;
};

const removeToast = (toast) => {
    // Clear any pending timeout
    if (toast.dataset.timeoutId) {
        clearTimeout(parseInt(toast.dataset.timeoutId));
    }

    // Add removing animation
    toast.classList.add('removing');

    // Remove after animation completes
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }

        // Remove container if empty
        const container = document.querySelector('.toast-container');
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 300);
};

// Logout
const logout = () => {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// Notícias functions
let allNoticias = [];

const loadNoticias = async () => {
    try {
        const response = await fetch('/api/noticias', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const noticias = await response.json();
        allNoticias = noticias;
        renderNoticias(noticias);
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        showToast('Erro ao carregar notícias', 'error');
    }
};

const renderNoticias = (noticias) => {
    const grid = document.getElementById('noticiasGrid');
    if (!grid) return;
    
    if (noticias.length === 0) {
        grid.innerHTML = '<p class="no-data">Nenhuma notícia encontrada</p>';
        return;
    }
    
    grid.innerHTML = noticias.map(noticia => `
        <div class="noticia-card ${noticia.destaque ? 'destaque' : ''}">
            ${noticia.imagem ? `<img src="${noticia.imagem}" alt="${noticia.titulo}" class="noticia-image">` : ''}
            <div class="noticia-content">
                <span class="noticia-categoria">${noticia.categoria}</span>
                <h4 class="noticia-titulo">${noticia.titulo}</h4>
                <p class="noticia-texto">${noticia.conteudo.substring(0, 150)}...</p>
                <div class="noticia-meta">
                    <span class="noticia-data">${new Date(noticia.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                    <span class="noticia-status ${noticia.publicado ? 'publicado' : 'rascunho'}">
                        ${noticia.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                </div>
                <div class="noticia-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editNoticia('${noticia._id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteNoticia('${noticia._id}')">Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
};

const filterNoticias = (searchTerm) => {
    const filtered = allNoticias.filter(noticia =>
        noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticia.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderNoticias(filtered);
};

const filterNoticiasByCategoria = (categoria) => {
    if (!categoria) {
        renderNoticias(allNoticias);
        return;
    }
    const filtered = allNoticias.filter(noticia => noticia.categoria === categoria);
    renderNoticias(filtered);
};

const editNoticia = async (id) => {
    try {
        const response = await fetch(`/api/noticias/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const noticia = await response.json();
        
        // Preencher o formulário
        const form = document.getElementById('noticiaForm');
        form.querySelector('[name="titulo"]').value = noticia.titulo;
        form.querySelector('[name="categoria"]').value = noticia.categoria;
        form.querySelector('[name="conteudo"]').value = noticia.conteudo;
        form.querySelector('[name="imagem"]').value = noticia.imagem || '';
        form.querySelector('[name="destaque"]').checked = noticia.destaque;
        form.querySelector('[name="publicado"]').checked = noticia.publicado;
        
        // Adicionar ID ao formulário para edição
        form.dataset.editId = id;
        
        openModal('noticiaModal');
    } catch (error) {
        console.error('Erro ao carregar notícia:', error);
        showToast('Erro ao carregar notícia', 'error');
    }
};

const deleteNoticia = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    
    try {
        const response = await fetch(`/api/noticias/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showToast('Notícia excluída com sucesso', 'success');
            loadNoticias();
        } else {
            showToast('Erro ao excluir notícia', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir notícia:', error);
        showToast('Erro ao excluir notícia', 'error');
    }
};

// Setup notícia form
document.addEventListener('DOMContentLoaded', () => {
    const noticiaForm = document.getElementById('noticiaForm');
    if (noticiaForm) {
        noticiaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(noticiaForm);
            const data = Object.fromEntries(formData.entries());
            data.destaque = noticiaForm.querySelector('[name="destaque"]').checked;
            data.publicado = noticiaForm.querySelector('[name="publicado"]').checked;
            
            const editId = noticiaForm.dataset.editId;
            const url = editId ? `/api/noticias/${editId}` : '/api/noticias';
            const method = editId ? 'PUT' : 'POST';
            
            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showToast(editId ? 'Notícia atualizada com sucesso' : 'Notícia criada com sucesso', 'success');
                    closeModal('noticiaModal');
                    noticiaForm.reset();
                    delete noticiaForm.dataset.editId;
                    loadNoticias();
                } else {
                    showToast('Erro ao salvar notícia', 'error');
                }
            } catch (error) {
                console.error('Erro ao salvar notícia:', error);
                showToast('Erro ao salvar notícia', 'error');
            }
        });
    }
});

// Initialize
window.addEventListener('load', () => {
    // Initialize charts
    initCharts();
        
    // Load sidebar state
    loadSidebarState();
        
    // Load config
    loadConfig();
        
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
        
    // Load user info
    loadUserInfo();
        
    // Load initial data
    loadDashboardData();
    loadFrangos();
    loadPoedeiras();
    loadClientes();
    loadVendas();
    loadDespesas();
    loadFaturas();
    loadDatabaseOverview();
        
    // Setup navigation
    setupNavigation();
});
