/**
 * Sistema de Almoxarifado
 * 
 * Credenciais:
 * ADMIN          → usuário: admin    | senha: admin123
 * Usuário Comum  → usuário: usuario  | senha: usuario123
 */

/* ========== Credenciais e Permissões ========== */

const CREDENTIALS = {
    admin: {
        password: "admin123",
        profile: "ADMIN",
        displayName: "Administrador"
    },
    usuario: {
        password: "usuario123",
        profile: "Usuário Comum",
        displayName: "Usuário Comum"
    }
};

/**
 * Permissões por perfil.
 * ADMIN possui todas as permissões.
 * Usuário Comum possui apenas as de consulta.
 */
const PERMISSIONS = {
    "ADMIN": [
        "cadastrar_produto",
        "editar_produto",
        "excluir_produto",
        "entrada_estoque",
        "saida_estoque",
        "consultar_produtos",
        "consultar_estoque",
        "consultar_historico"
    ],
    "Usuário Comum": [
        "consultar_produtos",
        "consultar_estoque",
        "consultar_historico"
    ]
};

/**
 * Itens do menu de navegação.
 * A propriedade "permission" define a permissão necessária.
 * Itens sem "permission" são sempre visíveis (ex: Início).
 */
const MENU_ITEMS = [
    {
        id: "dashboard",
        label: "Início",
        section: "section-dashboard",
        permission: null
    },
    {
        id: "consultar_produtos",
        label: "Consultar Produtos",
        section: "section-consultar-produtos",
        permission: "consultar_produtos",
        group: "Consultas"
    },
    {
        id: "consultar_estoque",
        label: "Consultar Estoque",
        section: "section-consultar-estoque",
        permission: "consultar_estoque",
        group: "Consultas"
    },
    {
        id: "consultar_historico",
        label: "Histórico de Movimentações",
        section: "section-consultar-historico",
        permission: "consultar_historico",
        group: "Consultas"
    },
    {
        id: "cadastrar_produto",
        label: "Cadastrar Produto",
        section: "section-cadastrar-produto",
        permission: "cadastrar_produto",
        group: "Produtos"
    },
    {
        id: "editar_produto",
        label: "Editar Produto",
        section: "section-editar-produto",
        permission: "editar_produto",
        group: "Produtos"
    },
    {
        id: "excluir_produto",
        label: "Excluir Produto",
        section: "section-excluir-produto",
        permission: "excluir_produto",
        group: "Produtos"
    },
    {
        id: "entrada_estoque",
        label: "Entrada de Estoque",
        section: "section-entrada-estoque",
        permission: "entrada_estoque",
        group: "Movimentações"
    },
    {
        id: "saida_estoque",
        label: "Saída de Estoque",
        section: "section-saida-estoque",
        permission: "saida_estoque",
        group: "Movimentações"
    }
];

/* ========== Chaves de armazenamento ========== */

const STORAGE_KEYS = {
    products: "almoxarifado_produtos",
    movements: "almoxarifado_movimentacoes"
};

/* ========== Estado da aplicação ========== */

let currentUser = null;

/* ========== Elementos do DOM ========== */

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");
const userInfo = document.getElementById("user-info");
const profileInfo = document.getElementById("profile-info");
const profileBadgeHeader = document.getElementById("profile-badge-header");
const logoutBtn = document.getElementById("logout-btn");
const mainMenu = document.getElementById("main-menu");

/* ========== Mensagens globais (toast) ========== */

/**
 * Exibe mensagem temporária de sucesso, erro, aviso ou informação.
 * @param {string} message
 * @param {"success"|"error"|"warning"|"info"} type
 * @param {number} duration ms
 */
function showToast(message, type = "info", duration = 3500) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(24px)";
        toast.style.transition = "opacity 0.25s, transform 0.25s";
        setTimeout(() => toast.remove(), 250);
    }, duration);
}

/* ========== Camada de Dados (localStorage) ========== */


/**
 * Gera um ID simples único.
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Obtém a lista de produtos do localStorage.
 */
function getProducts() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.products);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Salva a lista de produtos no localStorage.
 */
function saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

/**
 * Obtém a lista de movimentações do localStorage.
 */
function getMovements() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.movements);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Salva a lista de movimentações no localStorage.
 */
function saveMovements(movements) {
    localStorage.setItem(STORAGE_KEYS.movements, JSON.stringify(movements));
}

/**
 * Inicializa dados de exemplo caso ainda não existam produtos cadastrados.
 * Isso permite que o Dashboard apresente informações reais desde o início.
 */
function seedInitialData() {
    const products = getProducts();
    if (products.length > 0) return;

    const sampleProducts = [
        {
            id: generateId(),
            codigo: "PRD-001",
            nome: "Parafuso Sextavado M8",
            descricao: "Parafuso sextavado aço zincado M8 x 20mm",
            categoria: "Fixadores",
            quantidade: 150,
            estoqueMinimo: 30,
            localizacao: "Prateleira A-01"
        },
        {
            id: generateId(),
            codigo: "PRD-002",
            nome: "Porca Sextavada M8",
            descricao: "Porca sextavada aço zincado M8",
            categoria: "Fixadores",
            quantidade: 12,
            estoqueMinimo: 25,
            localizacao: "Prateleira A-01"
        },
        {
            id: generateId(),
            codigo: "PRD-003",
            nome: "Arruela Lisa M8",
            descricao: "Arruela lisa aço zincado M8",
            categoria: "Fixadores",
            quantidade: 0,
            estoqueMinimo: 40,
            localizacao: "Prateleira A-02"
        },
        {
            id: generateId(),
            codigo: "PRD-004",
            nome: "Fita Isolante 20m",
            descricao: "Fita isolante preta 20 metros",
            categoria: "Elétrica",
            quantidade: 45,
            estoqueMinimo: 10,
            localizacao: "Prateleira B-03"
        },
        {
            id: generateId(),
            codigo: "PRD-005",
            nome: "Cabo Flexível 2,5mm",
            descricao: "Cabo flexível 2,5mm rolo 100m",
            categoria: "Elétrica",
            quantidade: 8,
            estoqueMinimo: 5,
            localizacao: "Prateleira B-01"
        },
        {
            id: generateId(),
            codigo: "PRD-006",
            nome: "Lâmpada LED 9W",
            descricao: "Lâmpada LED bulbo 9W luz branca",
            categoria: "Iluminação",
            quantidade: 0,
            estoqueMinimo: 15,
            localizacao: "Prateleira C-02"
        }
    ];

    saveProducts(sampleProducts);

    const now = Date.now();
    const sampleMovements = [
        {
            id: generateId(),
            produtoId: sampleProducts[0].id,
            produtoNome: sampleProducts[0].nome,
            tipo: "entrada",
            quantidade: 50,
            data: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
            usuario: "admin",
            observacao: "Reposição de estoque"
        },
        {
            id: generateId(),
            produtoId: sampleProducts[1].id,
            produtoNome: sampleProducts[1].nome,
            tipo: "saida",
            quantidade: 18,
            data: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
            usuario: "admin",
            observacao: "Uso em manutenção"
        },
        {
            id: generateId(),
            produtoId: sampleProducts[3].id,
            produtoNome: sampleProducts[3].nome,
            tipo: "entrada",
            quantidade: 20,
            data: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
            usuario: "admin",
            observacao: "Compra mensal"
        },
        {
            id: generateId(),
            produtoId: sampleProducts[4].id,
            produtoNome: sampleProducts[4].nome,
            tipo: "saida",
            quantidade: 2,
            data: new Date(now - 30 * 60 * 60 * 1000).toISOString(),
            usuario: "admin",
            observacao: "Instalação elétrica"
        },
        {
            id: generateId(),
            produtoId: sampleProducts[2].id,
            produtoNome: sampleProducts[2].nome,
            tipo: "saida",
            quantidade: 15,
            data: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
            usuario: "admin",
            observacao: "Consumo total do lote"
        }
    ];

    saveMovements(sampleMovements);
}


/* ========== Controle de Acesso ========== */

/**
 * Verifica se o usuário atual possui determinada permissão.
 */
function hasPermission(permission) {
    if (!currentUser) return false;
    if (!permission) return true;

    const profilePermissions = PERMISSIONS[currentUser.profile] || [];
    return profilePermissions.includes(permission);
}

/**
 * Navega para uma seção, respeitando as permissões.
 */
function navigateTo(sectionId, menuItemId) {
    document.querySelectorAll(".content-section").forEach(section => {
        section.hidden = true;
    });

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    const menuItem = MENU_ITEMS.find(item => item.id === menuItemId);

    if (menuItem && menuItem.permission && !hasPermission(menuItem.permission)) {
        document.getElementById("section-acesso-negado").hidden = false;
        return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
        section.hidden = false;
    }

    const activeBtn = document.querySelector(`.menu-item[data-id="${menuItemId}"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }

    // Atualiza o Dashboard sempre que ele for exibido
    if (sectionId === "section-dashboard") {
        renderDashboard();
    }

    // Renderiza lista de produtos ao acessar a seção
    if (sectionId === "section-consultar-produtos") {
        showProdutosLista();
        renderProdutosLista();
    }

    // Preenche selects de produtos nas movimentações
    if (sectionId === "section-entrada-estoque") {
        popularSelectProdutos("entrada-produto");
        resetMovimentacaoForm("entrada");
    }
    if (sectionId === "section-saida-estoque") {
        popularSelectProdutos("saida-produto");
        resetMovimentacaoForm("saida");
    }

    // Histórico de movimentações
    if (sectionId === "section-consultar-historico") {
        renderHistorico();
    }

    // Consulta de estoque
    if (sectionId === "section-consultar-estoque") {
        renderEstoque();
    }
}


/**
 * Renderiza o menu lateral de acordo com as permissões do perfil autenticado.
 */


function renderMenu() {
    mainMenu.innerHTML = "";

    let currentGroup = null;

    MENU_ITEMS.forEach(item => {
        if (item.permission && !hasPermission(item.permission)) {
            return;
        }

        if (item.group && item.group !== currentGroup) {
            currentGroup = item.group;
            const groupTitle = document.createElement("div");
            groupTitle.className = "menu-section-title";
            groupTitle.textContent = currentGroup;
            mainMenu.appendChild(groupTitle);
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "menu-item";
        button.dataset.id = item.id;
        button.textContent = item.label;

        button.addEventListener("click", () => {
            navigateTo(item.section, item.id);
        });

        mainMenu.appendChild(button);
    });
}

/* ========== Dashboard ========== */

/**
 * Formata data ISO para exibição legível (pt-BR).
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/**
 * Calcula e renderiza os dados do Dashboard.
 */
/**
 * Separa produtos por situação de estoque (baixo / sem estoque).
 */
function obterProdutosEmAlerta() {
    const products = getProducts();
    const semEstoque = [];
    const estoqueBaixo = [];

    products.forEach(p => {
        const sit = getSituacaoEstoque(p);
        if (sit.classe === "badge-zerado") {
            semEstoque.push(p);
        } else if (sit.classe === "badge-baixo") {
            estoqueBaixo.push(p);
        }
    });

    semEstoque.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
    estoqueBaixo.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

    return { semEstoque, estoqueBaixo };
}

/**
 * Monta HTML da lista de alertas de estoque.
 */
function montarHtmlAlertas(semEstoque, estoqueBaixo, compacto) {
    if (semEstoque.length === 0 && estoqueBaixo.length === 0) {
        return '<p class="alerta-vazio">Nenhum alerta de estoque no momento.</p>';
    }

    let html = "";

    if (semEstoque.length > 0) {
        html += `
            <div class="alerta-bloco">
                <div class="alerta-titulo alerta-zerado">🚫 Sem estoque (${semEstoque.length})</div>
                <ul class="alerta-lista">
                    ${semEstoque.map(p => `
                        <li class="alerta-item zerado">
                            <span class="alerta-item-nome">${escapeHtml(p.codigo || "")} — ${escapeHtml(p.nome || "")}</span>
                            <span class="alerta-item-meta">Qtd: 0 · Mín: ${Number(p.estoqueMinimo) || 0}${compacto ? "" : " · " + escapeHtml(p.localizacao || "—")}</span>
                        </li>
                    `).join("")}
                </ul>
            </div>
        `;
    }

    if (estoqueBaixo.length > 0) {
        html += `
            <div class="alerta-bloco">
                <div class="alerta-titulo alerta-baixo">⚠️ Estoque baixo (${estoqueBaixo.length})</div>
                <ul class="alerta-lista">
                    ${estoqueBaixo.map(p => `
                        <li class="alerta-item baixo">
                            <span class="alerta-item-nome">${escapeHtml(p.codigo || "")} — ${escapeHtml(p.nome || "")}</span>
                            <span class="alerta-item-meta">Qtd: ${Number(p.quantidade) || 0} · Mín: ${Number(p.estoqueMinimo) || 0}${compacto ? "" : " · " + escapeHtml(p.localizacao || "—")}</span>
                        </li>
                    `).join("")}
                </ul>
            </div>
        `;
    }

    return html;
}

function renderDashboard() {
    const products = getProducts();
    const movements = getMovements();

    // Métricas com base na situação do estoque
    const totalProdutos = products.length;
    const totalItens = products.reduce((sum, p) => sum + (Number(p.quantidade) || 0), 0);
    const { semEstoque, estoqueBaixo } = obterProdutosEmAlerta();

    document.getElementById("dash-total-produtos").textContent = totalProdutos;
    document.getElementById("dash-total-itens").textContent = totalItens;
    document.getElementById("dash-estoque-baixo").textContent = estoqueBaixo.length;
    document.getElementById("dash-sem-estoque").textContent = semEstoque.length;

    // Alertas de estoque mínimo
    const alertasBox = document.getElementById("dash-alertas-estoque");
    const alertasConteudo = document.getElementById("dash-alertas-conteudo");
    if (alertasBox && alertasConteudo) {
        if (semEstoque.length === 0 && estoqueBaixo.length === 0) {
            alertasBox.hidden = true;
            alertasConteudo.innerHTML = "";
        } else {
            alertasBox.hidden = false;
            alertasConteudo.innerHTML = montarHtmlAlertas(semEstoque, estoqueBaixo, false);
        }
    }

    // Movimentações recentes (últimas 5, mais recentes primeiro)
    const movContainer = document.getElementById("dash-movimentacoes");
    const recentMovements = [...movements]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);

    if (recentMovements.length === 0) {
        movContainer.innerHTML = '<p class="empty-message">Nenhuma movimentação registrada.</p>';
    } else {
        movContainer.innerHTML = recentMovements.map(mov => {
            const tipoLabel = mov.tipo === "entrada" ? "Entrada" : "Saída";
            const badgeClass = mov.tipo === "entrada" ? "entrada" : "saida";
            return `
                <div class="mov-item">
                    <div class="mov-item-info">
                        <span class="mov-item-nome">${mov.produtoNome || "Produto"}</span>
                        <span class="mov-item-meta">${formatDate(mov.data)} · Qtd: ${mov.quantidade}</span>
                    </div>
                    <span class="mov-badge ${badgeClass}">${tipoLabel}</span>
                </div>
            `;
        }).join("");
    }

    // Atalhos rápidos (respeitando permissões)
    const atalhosContainer = document.getElementById("dash-atalhos");
    const atalhosDisponiveis = MENU_ITEMS.filter(item => {
        if (item.id === "dashboard") return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    });

    if (atalhosDisponiveis.length === 0) {
        atalhosContainer.innerHTML = '<p class="empty-message">Nenhum atalho disponível.</p>';
    } else {
        atalhosContainer.innerHTML = atalhosDisponiveis.map(item => {
            return `<button type="button" class="atalho-btn" data-section="${item.section}" data-id="${item.id}">${item.label}</button>`;
        }).join("");

        atalhosContainer.querySelectorAll(".atalho-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                navigateTo(btn.dataset.section, btn.dataset.id);
            });
        });
    }
}


/* ========== Gerenciamento de Produtos ========== */

/**
 * Retorna a situação do estoque de um produto.
 */
function getSituacaoEstoque(produto) {
    const qtd = Number(produto.quantidade) || 0;
    const min = Number(produto.estoqueMinimo) || 0;
    if (qtd === 0) return { label: "Sem estoque", classe: "badge-zerado" };
    if (qtd <= min) return { label: "Estoque baixo", classe: "badge-baixo" };
    return { label: "Normal", classe: "badge-ok" };
}

/**
 * Exibe o painel da lista e oculta detalhes/edição.
 */
function showProdutosLista() {
    const lista = document.getElementById("produtos-lista-panel");
    const detalhe = document.getElementById("produto-detalhe-panel");
    const editar = document.getElementById("produto-editar-panel");
    if (lista) lista.hidden = false;
    if (detalhe) detalhe.hidden = true;
    if (editar) editar.hidden = true;
}

/**
 * Lê os critérios atuais dos filtros da lista de produtos.
 */
function getFiltrosProdutos() {
    return {
        nome: (document.getElementById("filtro-nome")?.value || "").trim().toLowerCase(),
        codigo: (document.getElementById("filtro-codigo")?.value || "").trim().toLowerCase(),
        categoria: document.getElementById("filtro-categoria")?.value || "",
        situacao: document.getElementById("filtro-situacao")?.value || "",
        ordenacao: document.getElementById("filtro-ordenacao")?.value || "nome-asc"
    };
}

/**
 * Preenche o select de categorias com base nos produtos cadastrados.
 */
function popularFiltroCategorias() {
    const select = document.getElementById("filtro-categoria");
    if (!select) return;

    const valorAtual = select.value;
    const categorias = [...new Set(
        getProducts()
            .map(p => (p.categoria || "").trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "pt-BR"));

    select.innerHTML = '<option value="">Todas</option>';
    categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    if (valorAtual && categorias.includes(valorAtual)) {
        select.value = valorAtual;
    }
}

/**
 * Filtra e ordena produtos conforme os critérios da interface.
 */
function filtrarEOrdenarProdutos() {
    const filtros = getFiltrosProdutos();
    let products = getProducts();

    if (filtros.nome) {
        products = products.filter(p =>
            (p.nome || "").toLowerCase().includes(filtros.nome)
        );
    }

    if (filtros.codigo) {
        products = products.filter(p =>
            (p.codigo || "").toLowerCase().includes(filtros.codigo)
        );
    }

    if (filtros.categoria) {
        products = products.filter(p =>
            (p.categoria || "").trim() === filtros.categoria
        );
    }

    if (filtros.situacao) {
        products = products.filter(p => {
            const sit = getSituacaoEstoque(p);
            if (filtros.situacao === "normal") return sit.classe === "badge-ok";
            if (filtros.situacao === "baixo") return sit.classe === "badge-baixo";
            if (filtros.situacao === "zerado") return sit.classe === "badge-zerado";
            return true;
        });
    }

    const [campo, direcao] = (filtros.ordenacao || "nome-asc").split("-");
    const mult = direcao === "desc" ? -1 : 1;

    products.sort((a, b) => {
        if (campo === "quantidade") {
            return ((Number(a.quantidade) || 0) - (Number(b.quantidade) || 0)) * mult;
        }
        const va = (a[campo] || "").toString().toLowerCase();
        const vb = (b[campo] || "").toString().toLowerCase();
        return va.localeCompare(vb, "pt-BR") * mult;
    });

    return products;
}

/**
 * Limpa todos os filtros da lista de produtos.
 */
function limparFiltrosProdutos() {
    const nome = document.getElementById("filtro-nome");
    const codigo = document.getElementById("filtro-codigo");
    const categoria = document.getElementById("filtro-categoria");
    const situacao = document.getElementById("filtro-situacao");
    const ordenacao = document.getElementById("filtro-ordenacao");

    if (nome) nome.value = "";
    if (codigo) codigo.value = "";
    if (categoria) categoria.value = "";
    if (situacao) situacao.value = "";
    if (ordenacao) ordenacao.value = "nome-asc";

    renderProdutosLista();
}

/**
 * Renderiza a tabela de produtos com filtros e ordenação aplicados.
 */
function renderProdutosLista() {
    const tbody = document.getElementById("tabela-produtos-body");
    const vazio = document.getElementById("produtos-vazio");
    const contador = document.getElementById("produtos-contador");
    const tableWrap = document.querySelector("#produtos-lista-panel .table-wrap");
    if (!tbody) return;

    // Alertas de estoque mínimo (visão geral, independente dos filtros)
    const alertasProdutos = document.getElementById("produtos-alertas-estoque");
    if (alertasProdutos) {
        const { semEstoque, estoqueBaixo } = obterProdutosEmAlerta();
        if (semEstoque.length === 0 && estoqueBaixo.length === 0) {
            alertasProdutos.hidden = true;
            alertasProdutos.innerHTML = "";
        } else {
            alertasProdutos.hidden = false;
            alertasProdutos.innerHTML = montarHtmlAlertas(semEstoque, estoqueBaixo, true);
        }
    }

    popularFiltroCategorias();
    const products = filtrarEOrdenarProdutos();


    if (contador) {
        contador.textContent = products.length === 1
            ? "1 produto encontrado"
            : products.length + " produtos encontrados";
    }

    if (products.length === 0) {
        tbody.innerHTML = "";
        if (vazio) vazio.hidden = false;
        if (tableWrap) tableWrap.hidden = true;
        return;
    }

    if (vazio) vazio.hidden = true;
    if (tableWrap) tableWrap.hidden = false;

    const canEdit = hasPermission("editar_produto");
    const canDelete = hasPermission("excluir_produto");

    tbody.innerHTML = products.map(p => {
        const sit = getSituacaoEstoque(p);
        let acoes = `<button type="button" class="btn-sm btn-view" data-action="view" data-id="${p.id}">Ver</button>`;
        if (canEdit) {
            acoes += `<button type="button" class="btn-sm btn-edit" data-action="edit" data-id="${p.id}">Editar</button>`;
        }
        if (canDelete) {
            acoes += `<button type="button" class="btn-sm btn-delete" data-action="delete" data-id="${p.id}">Excluir</button>`;
        }
        return `
            <tr>
                <td>${escapeHtml(p.codigo || "")}</td>
                <td>${escapeHtml(p.nome || "")}</td>
                <td>${escapeHtml(p.categoria || "—")}</td>
                <td>${Number(p.quantidade) || 0}</td>
                <td>${Number(p.estoqueMinimo) || 0}</td>
                <td><span class="badge-estoque ${sit.classe}">${sit.label}</span></td>
                <td>${escapeHtml(p.localizacao || "—")}</td>
                <td><div class="acoes-cell">${acoes}</div></td>
            </tr>
        `;
    }).join("");

    tbody.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            if (action === "view") showProdutoDetalhe(id);
            else if (action === "edit") showProdutoEdicao(id);
            else if (action === "delete") confirmarExclusaoProduto(id);
        });
    });
}


/**
 * Escapa HTML para evitar XSS em conteúdo inserido.
 */
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Exibe os detalhes de um produto.
 */
function showProdutoDetalhe(id) {
    const products = getProducts();
    const p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById("produtos-lista-panel").hidden = true;
    document.getElementById("produto-editar-panel").hidden = true;
    const panel = document.getElementById("produto-detalhe-panel");
    panel.hidden = false;

    document.getElementById("detalhe-titulo").textContent = p.nome || "Produto";

    const sit = getSituacaoEstoque(p);
    const conteudo = document.getElementById("produto-detalhe-conteudo");
    conteudo.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">Código</span>
            <span class="detail-value">${escapeHtml(p.codigo || "—")}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Nome</span>
            <span class="detail-value">${escapeHtml(p.nome || "—")}</span>
        </div>
        <div class="detail-item full">
            <span class="detail-label">Descrição</span>
            <span class="detail-value">${escapeHtml(p.descricao || "—")}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Categoria</span>
            <span class="detail-value">${escapeHtml(p.categoria || "—")}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Localização</span>
            <span class="detail-value">${escapeHtml(p.localizacao || "—")}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Quantidade</span>
            <span class="detail-value">${Number(p.quantidade) || 0}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Estoque Mínimo</span>
            <span class="detail-value">${Number(p.estoqueMinimo) || 0}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Situação do Estoque</span>
            <span class="detail-value"><span class="badge-estoque ${sit.classe}">${sit.label}</span></span>
        </div>
    `;

    const acoes = document.getElementById("produto-detalhe-acoes");
    let html = "";
    if (hasPermission("editar_produto")) {
        html += `<button type="button" class="btn btn-primary btn-form" id="btn-detalhe-editar">Editar</button>`;
    }
    if (hasPermission("excluir_produto")) {
        html += `<button type="button" class="btn btn-danger" id="btn-detalhe-excluir">Excluir</button>`;
    }
    acoes.innerHTML = html;

    const btnEdit = document.getElementById("btn-detalhe-editar");
    if (btnEdit) btnEdit.addEventListener("click", () => showProdutoEdicao(id));
    const btnDel = document.getElementById("btn-detalhe-excluir");
    if (btnDel) btnDel.addEventListener("click", () => confirmarExclusaoProduto(id));
}

/**
 * Abre o formulário de edição preenchido.
 */
function showProdutoEdicao(id) {
    if (!hasPermission("editar_produto")) return;

    const products = getProducts();
    const p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById("produtos-lista-panel").hidden = true;
    document.getElementById("produto-detalhe-panel").hidden = true;
    document.getElementById("produto-editar-panel").hidden = false;

    document.getElementById("edit-prod-id").value = p.id;
    document.getElementById("edit-prod-codigo").value = p.codigo || "";
    document.getElementById("edit-prod-nome").value = p.nome || "";
    document.getElementById("edit-prod-descricao").value = p.descricao || "";
    document.getElementById("edit-prod-categoria").value = p.categoria || "";
    document.getElementById("edit-prod-localizacao").value = p.localizacao || "";
    document.getElementById("edit-prod-quantidade").value = Number(p.quantidade) || 0;
    document.getElementById("edit-prod-estoque-minimo").value = Number(p.estoqueMinimo) || 0;

    const feedback = document.getElementById("edicao-feedback");
    if (feedback) {
        feedback.hidden = true;
        feedback.textContent = "";
    }
    document.querySelectorAll("#form-editar-produto .input-error").forEach(el => el.classList.remove("input-error"));
}

/**
 * Valida e salva a edição do produto.
 */
function handleEdicaoProduto(event) {
    event.preventDefault();
    if (!hasPermission("editar_produto")) return;

    const id = document.getElementById("edit-prod-id").value;
    const codigo = document.getElementById("edit-prod-codigo").value.trim();
    const nome = document.getElementById("edit-prod-nome").value.trim();
    const descricao = document.getElementById("edit-prod-descricao").value.trim();
    const categoria = document.getElementById("edit-prod-categoria").value.trim();
    const localizacao = document.getElementById("edit-prod-localizacao").value.trim();
    const quantidadeStr = document.getElementById("edit-prod-quantidade").value;
    const estoqueMinimoStr = document.getElementById("edit-prod-estoque-minimo").value;

    document.querySelectorAll("#form-editar-produto .input-error").forEach(el => el.classList.remove("input-error"));

    let firstInvalid = null;
    if (!codigo) {
        document.getElementById("edit-prod-codigo").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("edit-prod-codigo");
    }
    if (!nome) {
        document.getElementById("edit-prod-nome").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("edit-prod-nome");
    }
    if (!categoria) {
        document.getElementById("edit-prod-categoria").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("edit-prod-categoria");
    }
    if (!localizacao) {
        document.getElementById("edit-prod-localizacao").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("edit-prod-localizacao");
    }
    if (quantidadeStr === "" || Number(quantidadeStr) < 0 || !Number.isInteger(Number(quantidadeStr))) {
        document.getElementById("edit-prod-quantidade").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("edit-prod-quantidade");
    }
    if (estoqueMinimoStr === "" || Number(estoqueMinimoStr) < 0 || !Number.isInteger(Number(estoqueMinimoStr))) {
        document.getElementById("edit-prod-estoque-minimo").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("edit-prod-estoque-minimo");
    }

    const feedback = document.getElementById("edicao-feedback");

    if (firstInvalid) {
        firstInvalid.focus();
        feedback.textContent = "Preencha todos os campos obrigatórios corretamente.";
        feedback.className = "form-feedback error";
        feedback.hidden = false;
        return;
    }

    const products = getProducts();
    const codigoExiste = products.some(p => p.id !== id && (p.codigo || "").toLowerCase() === codigo.toLowerCase());
    if (codigoExiste) {
        document.getElementById("edit-prod-codigo").classList.add("input-error");
        document.getElementById("edit-prod-codigo").focus();
        feedback.textContent = "Já existe outro produto com este código.";
        feedback.className = "form-feedback error";
        feedback.hidden = false;
        return;
    }

    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
        feedback.textContent = "Produto não encontrado.";
        feedback.className = "form-feedback error";
        feedback.hidden = false;
        return;
    }

    products[idx] = {
        ...products[idx],
        codigo,
        nome,
        descricao,
        categoria,
        localizacao,
        quantidade: parseInt(quantidadeStr, 10),
        estoqueMinimo: parseInt(estoqueMinimoStr, 10)
    };
    saveProducts(products);

    // Atualiza nome nas movimentações vinculadas
    const movements = getMovements();
    let movAlterado = false;
    movements.forEach(m => {
        if (m.produtoId === id) {
            m.produtoNome = nome;
            movAlterado = true;
        }
    });
    if (movAlterado) saveMovements(movements);

    const sitEdit = getSituacaoEstoque(products[idx]);
    let msgEdit = 'Produto "' + nome + '" atualizado com sucesso!';
    if (sitEdit.classe === "badge-zerado") {
        msgEdit += " Alerta: produto SEM ESTOQUE.";
    } else if (sitEdit.classe === "badge-baixo") {
        msgEdit += " Alerta: ESTOQUE BAIXO (qtd: " + products[idx].quantidade + ", mínimo: " + products[idx].estoqueMinimo + ").";
    }

    feedback.textContent = msgEdit;
    feedback.className = "form-feedback success";
    feedback.hidden = false;
    showToast(msgEdit, sitEdit.classe === "badge-ok" ? "success" : "warning");


    setTimeout(() => {
        showProdutosLista();
        renderProdutosLista();
    }, 800);
}


/**
 * Abre modal de confirmação de exclusão.
 */
function confirmarExclusaoProduto(id) {
    if (!hasPermission("excluir_produto")) return;

    const products = getProducts();
    const p = products.find(item => item.id === id);
    if (!p) return;

    // Remove modal anterior se existir
    const existing = document.getElementById("modal-confirm-delete");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "modal-confirm-delete";
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
        <div class="modal-box">
            <h3>Confirmar exclusão</h3>
            <p>Deseja realmente excluir o produto <strong>${escapeHtml(p.nome || p.codigo)}</strong> (código ${escapeHtml(p.codigo || "")})?<br>
            Esta ação não pode ser desfeita.</p>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary btn-form" id="btn-cancel-delete">Cancelar</button>
                <button type="button" class="btn-danger" id="btn-confirm-delete">Excluir</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("btn-cancel-delete").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.getElementById("btn-confirm-delete").addEventListener("click", () => {
        excluirProduto(id);
        overlay.remove();
    });
}

/**
 * Exclui o produto do armazenamento.
 */
function excluirProduto(id) {
    if (!hasPermission("excluir_produto")) return;

    let products = getProducts();
    const removido = products.find(p => p.id === id);
    products = products.filter(p => p.id !== id);
    saveProducts(products);

    showToast(
        removido
            ? `Produto "${removido.nome || removido.codigo}" excluído com sucesso.`
            : "Produto excluído com sucesso.",
        "success"
    );

    showProdutosLista();
    renderProdutosLista();
}


/* ========== Histórico de Movimentações ========== */

/**
 * Lê os critérios de filtro do histórico.
 */
function getFiltrosHistorico() {
    return {
        produto: (document.getElementById("hist-filtro-produto")?.value || "").trim().toLowerCase(),
        tipo: document.getElementById("hist-filtro-tipo")?.value || "",
        usuario: (document.getElementById("hist-filtro-usuario")?.value || "").trim().toLowerCase(),
        dataInicio: document.getElementById("hist-filtro-data-inicio")?.value || "",
        dataFim: document.getElementById("hist-filtro-data-fim")?.value || ""
    };
}

/**
 * Filtra movimentações conforme critérios da interface.
 */
function filtrarMovimentacoes() {
    const filtros = getFiltrosHistorico();
    let movements = getMovements().slice();

    if (filtros.produto) {
        movements = movements.filter(m =>
            (m.produtoNome || "").toLowerCase().includes(filtros.produto)
        );
    }

    if (filtros.tipo) {
        movements = movements.filter(m => m.tipo === filtros.tipo);
    }

    if (filtros.usuario) {
        movements = movements.filter(m =>
            (m.usuario || "").toLowerCase().includes(filtros.usuario)
        );
    }

    if (filtros.dataInicio) {
        const inicio = new Date(filtros.dataInicio + "T00:00:00");
        movements = movements.filter(m => new Date(m.data) >= inicio);
    }

    if (filtros.dataFim) {
        const fim = new Date(filtros.dataFim + "T23:59:59");
        movements = movements.filter(m => new Date(m.data) <= fim);
    }

    // Mais recentes primeiro
    movements.sort((a, b) => new Date(b.data) - new Date(a.data));
    return movements;
}

/**
 * Limpa os filtros do histórico.
 */
function limparFiltrosHistorico() {
    const ids = [
        "hist-filtro-produto",
        "hist-filtro-tipo",
        "hist-filtro-usuario",
        "hist-filtro-data-inicio",
        "hist-filtro-data-fim"
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    renderHistorico();
}

/**
 * Renderiza a tabela do histórico de movimentações.
 */
function renderHistorico() {
    const tbody = document.getElementById("tabela-historico-body");
    const vazio = document.getElementById("hist-vazio");
    const contador = document.getElementById("hist-contador");
    const tableWrap = document.querySelector("#section-consultar-historico .table-wrap");
    if (!tbody) return;

    const movements = filtrarMovimentacoes();

    if (contador) {
        contador.textContent = movements.length === 1
            ? "1 movimentação encontrada"
            : movements.length + " movimentações encontradas";
    }

    if (movements.length === 0) {
        tbody.innerHTML = "";
        if (vazio) vazio.hidden = false;
        if (tableWrap) tableWrap.hidden = true;
        return;
    }

    if (vazio) vazio.hidden = true;
    if (tableWrap) tableWrap.hidden = false;

    tbody.innerHTML = movements.map(m => {
        const tipoLabel = m.tipo === "entrada" ? "Entrada" : "Saída";
        const badgeClass = m.tipo === "entrada" ? "entrada" : "saida";
        return `
            <tr>
                <td>${formatDate(m.data)}</td>
                <td>${escapeHtml(m.produtoNome || "—")}</td>
                <td><span class="mov-badge ${badgeClass}">${tipoLabel}</span></td>
                <td>${Number(m.quantidade) || 0}</td>
                <td>${escapeHtml(m.usuario || "—")}</td>
                <td>${escapeHtml(m.observacao || "—")}</td>
            </tr>
        `;
    }).join("");
}

/* ========== Consultar Estoque ========== */

/**
 * Renderiza a consulta de estoque com filtros e alertas.
 */
function renderEstoque() {
    const tbody = document.getElementById("tabela-estoque-body");
    const vazio = document.getElementById("estoque-vazio");
    const contador = document.getElementById("estoque-contador");
    const tableWrap = document.querySelector("#section-consultar-estoque .table-wrap");
    const alertasBox = document.getElementById("estoque-alertas");
    if (!tbody) return;

    const busca = (document.getElementById("estoque-filtro-busca")?.value || "").trim().toLowerCase();
    const situacaoFiltro = document.getElementById("estoque-filtro-situacao")?.value || "";

    let products = getProducts().slice();

    if (busca) {
        products = products.filter(p =>
            (p.codigo || "").toLowerCase().includes(busca) ||
            (p.nome || "").toLowerCase().includes(busca)
        );
    }

    if (situacaoFiltro) {
        products = products.filter(p => {
            const sit = getSituacaoEstoque(p);
            if (situacaoFiltro === "normal") return sit.classe === "badge-ok";
            if (situacaoFiltro === "baixo") return sit.classe === "badge-baixo";
            if (situacaoFiltro === "zerado") return sit.classe === "badge-zerado";
            return true;
        });
    }

    products.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

    // Alertas gerais (todos os produtos, não só filtrados)
    if (alertasBox && typeof montarHtmlAlertas === "function") {
        const all = getProducts();
        const semEstoque = all.filter(p => (Number(p.quantidade) || 0) === 0);
        const estoqueBaixo = all.filter(p => {
            const q = Number(p.quantidade) || 0;
            const min = Number(p.estoqueMinimo) || 0;
            return q > 0 && q <= min;
        });
        if (semEstoque.length === 0 && estoqueBaixo.length === 0) {
            alertasBox.hidden = true;
            alertasBox.innerHTML = "";
        } else {
            alertasBox.hidden = false;
            alertasBox.innerHTML = "<h3 class=\"panel-title\">Alertas de Estoque</h3>" + montarHtmlAlertas(semEstoque, estoqueBaixo, false);
        }
    }

    if (contador) {
        contador.textContent = products.length === 1
            ? "1 produto"
            : products.length + " produtos";
    }

    if (products.length === 0) {
        tbody.innerHTML = "";
        if (vazio) vazio.hidden = false;
        if (tableWrap) tableWrap.hidden = true;
        return;
    }

    if (vazio) vazio.hidden = true;
    if (tableWrap) tableWrap.hidden = false;

    tbody.innerHTML = products.map(p => {
        const sit = getSituacaoEstoque(p);
        return `
            <tr>
                <td>${escapeHtml(p.codigo || "")}</td>
                <td>${escapeHtml(p.nome || "")}</td>
                <td>${escapeHtml(p.categoria || "—")}</td>
                <td>${Number(p.quantidade) || 0}</td>
                <td>${Number(p.estoqueMinimo) || 0}</td>
                <td><span class="badge-estoque ${sit.classe}">${sit.label}</span></td>
                <td>${escapeHtml(p.localizacao || "—")}</td>
            </tr>
        `;
    }).join("");
}

function limparFiltrosEstoque() {
    const busca = document.getElementById("estoque-filtro-busca");
    const situacao = document.getElementById("estoque-filtro-situacao");
    if (busca) busca.value = "";
    if (situacao) situacao.value = "";
    renderEstoque();
}

/* ========== Movimentações de Estoque ========== */

/**
 * Preenche o select de produtos.

 */
function popularSelectProdutos(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const products = getProducts().slice().sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

    const valorAtual = select.value;

    select.innerHTML = '<option value="">Selecione um produto...</option>';
    products.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.codigo} — ${p.nome} (estoque: ${Number(p.quantidade) || 0})`;
        select.appendChild(opt);
    });

    if (valorAtual && products.some(p => p.id === valorAtual)) {
        select.value = valorAtual;
    }
}

/**
 * Atualiza o info de estoque ao selecionar produto.
 */
function atualizarInfoEstoque(tipo) {
    const selectId = tipo === "entrada" ? "entrada-produto" : "saida-produto";
    const infoId = tipo === "entrada" ? "entrada-info-estoque" : "saida-info-estoque";
    const select = document.getElementById(selectId);
    const info = document.getElementById(infoId);
    if (!select || !info) return;

    const produtoId = select.value;
    if (!produtoId) {
        info.hidden = true;
        info.textContent = "";
        return;
    }

    const products = getProducts();
    const p = products.find(item => item.id === produtoId);
    if (!p) {
        info.hidden = true;
        return;
    }

    const sit = getSituacaoEstoque(p);
    info.innerHTML = `Estoque atual: <strong>${Number(p.quantidade) || 0}</strong> · Mínimo: <strong>${Number(p.estoqueMinimo) || 0}</strong> · Situação: <span class="badge-estoque ${sit.classe}">${sit.label}</span>`;
    info.hidden = false;
}

/**
 * Limpa formulário de movimentação.
 */
function resetMovimentacaoForm(tipo) {
    const form = document.getElementById(tipo === "entrada" ? "form-entrada-estoque" : "form-saida-estoque");
    if (form) form.reset();

    const feedback = document.getElementById(tipo === "entrada" ? "entrada-feedback" : "saida-feedback");
    if (feedback) {
        feedback.hidden = true;
        feedback.textContent = "";
    }

    const info = document.getElementById(tipo === "entrada" ? "entrada-info-estoque" : "saida-info-estoque");
    if (info) {
        info.hidden = true;
        info.textContent = "";
    }

    form?.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}

/**
 * Exibe feedback de movimentação.
 */
function showMovFeedback(tipo, message, isError) {
    const feedback = document.getElementById(tipo === "entrada" ? "entrada-feedback" : "saida-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = "form-feedback " + (isError ? "error" : "success");
    feedback.hidden = false;
    if (isError) {
        showToast(message, "error");
    }
}


/**
 * Registra entrada de estoque.
 */
function handleEntradaEstoque(event) {
    event.preventDefault();

    if (!hasPermission("entrada_estoque")) {
        showMovFeedback("entrada", "Você não possui permissão para registrar entradas.", true);
        return;
    }

    const select = document.getElementById("entrada-produto");
    const qtdInput = document.getElementById("entrada-quantidade");
    const obsInput = document.getElementById("entrada-observacao");

    select.classList.remove("input-error");
    qtdInput.classList.remove("input-error");

    const produtoId = select.value;
    const quantidadeStr = qtdInput.value;
    const observacao = (obsInput.value || "").trim();

    if (!produtoId) {
        select.classList.add("input-error");
        select.focus();
        showMovFeedback("entrada", "Selecione um produto.", true);
        return;
    }

    const quantidade = parseInt(quantidadeStr, 10);
    if (!quantidadeStr || !Number.isInteger(quantidade) || quantidade < 1) {
        qtdInput.classList.add("input-error");
        qtdInput.focus();
        showMovFeedback("entrada", "Informe uma quantidade inteira maior que zero.", true);
        return;
    }

    const products = getProducts();
    const idx = products.findIndex(p => p.id === produtoId);
    if (idx === -1) {
        showMovFeedback("entrada", "Produto não encontrado.", true);
        return;
    }

    products[idx].quantidade = (Number(products[idx].quantidade) || 0) + quantidade;
    saveProducts(products);

    const movements = getMovements();
    movements.push({
        id: generateId(),
        produtoId: products[idx].id,
        produtoNome: products[idx].nome,
        tipo: "entrada",
        quantidade: quantidade,
        data: new Date().toISOString(),
        usuario: currentUser ? currentUser.username : "sistema",
        observacao: observacao || "Entrada de estoque"
    });
    saveMovements(movements);

    const sitEntrada = getSituacaoEstoque(products[idx]);
    let msgEntrada = `Entrada de ${quantidade} unidade(s) de "${products[idx].nome}" registrada com sucesso. Estoque atual: ${products[idx].quantidade}.`;
    if (sitEntrada.classe === "badge-zerado") {
        msgEntrada += " Alerta: produto permanece SEM ESTOQUE.";
    } else if (sitEntrada.classe === "badge-baixo") {
        msgEntrada += ` Alerta: ESTOQUE BAIXO (mínimo: ${Number(products[idx].estoqueMinimo) || 0}).`;
    }

    showMovFeedback("entrada", msgEntrada, false);
    showToast(msgEntrada, sitEntrada.classe === "badge-ok" ? "success" : "warning");

    popularSelectProdutos("entrada-produto");
    select.value = produtoId;
    atualizarInfoEstoque("entrada");
    qtdInput.value = "";

    obsInput.value = "";
}


/**
 * Registra saída de estoque.
 */
function handleSaidaEstoque(event) {
    event.preventDefault();

    if (!hasPermission("saida_estoque")) {
        showMovFeedback("saida", "Você não possui permissão para registrar saídas.", true);
        return;
    }

    const select = document.getElementById("saida-produto");
    const qtdInput = document.getElementById("saida-quantidade");
    const obsInput = document.getElementById("saida-observacao");

    select.classList.remove("input-error");
    qtdInput.classList.remove("input-error");

    const produtoId = select.value;
    const quantidadeStr = qtdInput.value;
    const observacao = (obsInput.value || "").trim();

    if (!produtoId) {
        select.classList.add("input-error");
        select.focus();
        showMovFeedback("saida", "Selecione um produto.", true);
        return;
    }

    const quantidade = parseInt(quantidadeStr, 10);
    if (!quantidadeStr || !Number.isInteger(quantidade) || quantidade < 1) {
        qtdInput.classList.add("input-error");
        qtdInput.focus();
        showMovFeedback("saida", "Informe uma quantidade inteira maior que zero.", true);
        return;
    }

    const products = getProducts();
    const idx = products.findIndex(p => p.id === produtoId);
    if (idx === -1) {
        showMovFeedback("saida", "Produto não encontrado.", true);
        return;
    }

    const estoqueAtual = Number(products[idx].quantidade) || 0;
    if (quantidade > estoqueAtual) {
        qtdInput.classList.add("input-error");
        qtdInput.focus();
        showMovFeedback("saida", `Quantidade indisponível. Estoque atual de "${products[idx].nome}": ${estoqueAtual}.`, true);
        return;
    }

    products[idx].quantidade = estoqueAtual - quantidade;
    saveProducts(products);

    const movements = getMovements();
    movements.push({
        id: generateId(),
        produtoId: products[idx].id,
        produtoNome: products[idx].nome,
        tipo: "saida",
        quantidade: quantidade,
        data: new Date().toISOString(),
        usuario: currentUser ? currentUser.username : "sistema",
        observacao: observacao || "Saída de estoque"
    });
    saveMovements(movements);

    const sitSaida = getSituacaoEstoque(products[idx]);
    let msgSaida = `Saída de ${quantidade} unidade(s) de "${products[idx].nome}" registrada com sucesso. Estoque atual: ${products[idx].quantidade}.`;
    if (sitSaida.classe === "badge-zerado") {
        msgSaida += " Alerta: produto ficou SEM ESTOQUE.";
    } else if (sitSaida.classe === "badge-baixo") {
        msgSaida += ` Alerta: ESTOQUE BAIXO (mínimo: ${Number(products[idx].estoqueMinimo) || 0}).`;
    }

    showMovFeedback("saida", msgSaida, false);
    showToast(msgSaida, sitSaida.classe === "badge-ok" ? "success" : "warning");

    popularSelectProdutos("saida-produto");
    select.value = produtoId;
    atualizarInfoEstoque("saida");

    qtdInput.value = "";
    obsInput.value = "";
}


/* ========== Cadastro de Produtos ========== */


/**
 * Exibe mensagem de feedback no formulário de cadastro.
 */
function showCadastroFeedback(message, type) {
    const feedback = document.getElementById("cadastro-feedback");
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = "form-feedback " + type;
    feedback.hidden = false;
}

/**
 * Remove classes de erro dos campos do formulário.
 */
function clearCadastroFieldErrors() {
    const form = document.getElementById("form-cadastrar-produto");
    if (!form) return;
    form.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}

/**
 * Limpa o formulário de cadastro e o feedback.
 */
function resetCadastroForm() {
    const form = document.getElementById("form-cadastrar-produto");
    if (form) form.reset();
    clearCadastroFieldErrors();
    const feedback = document.getElementById("cadastro-feedback");
    if (feedback) {
        feedback.hidden = true;
        feedback.textContent = "";
    }
}

/**
 * Valida os campos do formulário de cadastro.
 * Retorna um objeto { valid: boolean, message: string }.
 */
function validateCadastroForm() {
    clearCadastroFieldErrors();

    const codigo = document.getElementById("prod-codigo").value.trim();
    const nome = document.getElementById("prod-nome").value.trim();
    const categoria = document.getElementById("prod-categoria").value.trim();
    const localizacao = document.getElementById("prod-localizacao").value.trim();
    const quantidadeStr = document.getElementById("prod-quantidade").value;
    const estoqueMinimoStr = document.getElementById("prod-estoque-minimo").value;

    let firstInvalid = null;

    if (!codigo) {
        document.getElementById("prod-codigo").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("prod-codigo");
    }
    if (!nome) {
        document.getElementById("prod-nome").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("prod-nome");
    }
    if (!categoria) {
        document.getElementById("prod-categoria").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("prod-categoria");
    }
    if (!localizacao) {
        document.getElementById("prod-localizacao").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("prod-localizacao");
    }
    if (quantidadeStr === "" || Number(quantidadeStr) < 0 || !Number.isInteger(Number(quantidadeStr))) {
        document.getElementById("prod-quantidade").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("prod-quantidade");
    }
    if (estoqueMinimoStr === "" || Number(estoqueMinimoStr) < 0 || !Number.isInteger(Number(estoqueMinimoStr))) {
        document.getElementById("prod-estoque-minimo").classList.add("input-error");
        if (!firstInvalid) firstInvalid = document.getElementById("prod-estoque-minimo");
    }

    if (firstInvalid) {
        firstInvalid.focus();
        return { valid: false, message: "Preencha todos os campos obrigatórios corretamente." };
    }

    // Verifica se o código já existe
    const products = getProducts();
    const codigoExiste = products.some(p => p.codigo.toLowerCase() === codigo.toLowerCase());
    if (codigoExiste) {
        document.getElementById("prod-codigo").classList.add("input-error");
        document.getElementById("prod-codigo").focus();
        return { valid: false, message: "Já existe um produto cadastrado com este código." };
    }

    return { valid: true, message: "" };
}

/**
 * Processa o cadastro de um novo produto.
 */
function handleCadastroProduto(event) {
    event.preventDefault();

    if (!hasPermission("cadastrar_produto")) {
        showCadastroFeedback("Você não possui permissão para cadastrar produtos.", "error");
        return;
    }

    const validation = validateCadastroForm();
    if (!validation.valid) {
        showCadastroFeedback(validation.message, "error");
        return;
    }

    const codigo = document.getElementById("prod-codigo").value.trim();
    const nome = document.getElementById("prod-nome").value.trim();
    const descricao = document.getElementById("prod-descricao").value.trim();
    const categoria = document.getElementById("prod-categoria").value.trim();
    const localizacao = document.getElementById("prod-localizacao").value.trim();
    const quantidade = parseInt(document.getElementById("prod-quantidade").value, 10);
    const estoqueMinimo = parseInt(document.getElementById("prod-estoque-minimo").value, 10);

    const novoProduto = {
        id: generateId(),
        codigo: codigo,
        nome: nome,
        descricao: descricao,
        categoria: categoria,
        quantidade: quantidade,
        estoqueMinimo: estoqueMinimo,
        localizacao: localizacao
    };

    const products = getProducts();
    products.push(novoProduto);
    saveProducts(products);

    // Se houver quantidade inicial > 0, registra movimentação de entrada
    if (quantidade > 0) {
        const movements = getMovements();
        movements.push({
            id: generateId(),
            produtoId: novoProduto.id,
            produtoNome: novoProduto.nome,
            tipo: "entrada",
            quantidade: quantidade,
            data: new Date().toISOString(),
            usuario: currentUser ? currentUser.username : "sistema",
            observacao: "Quantidade inicial no cadastro"
        });
        saveMovements(movements);
    }

    const sitCadastro = getSituacaoEstoque(novoProduto);
    let msgCadastro = `Produto "${nome}" cadastrado com sucesso!`;
    if (sitCadastro.classe === "badge-zerado") {
        msgCadastro += " Alerta: produto cadastrado SEM ESTOQUE.";
    } else if (sitCadastro.classe === "badge-baixo") {
        msgCadastro += ` Alerta: ESTOQUE BAIXO (qtd: ${quantidade}, mínimo: ${estoqueMinimo}).`;
    }
    showCadastroFeedback(msgCadastro, "success");
    showToast(msgCadastro, sitCadastro.classe === "badge-ok" ? "success" : "warning");
    document.getElementById("form-cadastrar-produto").reset();
    clearCadastroFieldErrors();
}



/* ========== Sessão e Autenticação ========== */

/**
 * Verifica se existe sessão ativa no sessionStorage
 */
function checkSession() {
    const session = sessionStorage.getItem("almoxarifado_session");
    if (session) {
        try {
            const data = JSON.parse(session);
            showApp(data);
        } catch (e) {
            sessionStorage.removeItem("almoxarifado_session");
            showLogin();
        }
    } else {
        showLogin();
    }
}


/**
 * Exibe a tela de login
 */
function showLogin() {
    currentUser = null;
    loginScreen.hidden = false;
    appScreen.hidden = true;
    loginForm.reset();
    loginError.hidden = true;
    loginError.textContent = "";
}

/**
 * Exibe a aplicação principal após login
 */
function showApp(userData) {
    currentUser = userData;
    loginScreen.hidden = true;
    appScreen.hidden = false;

    userInfo.textContent = `Olá, ${userData.displayName}`;
    profileBadgeHeader.textContent = userData.profile;

    if (profileInfo) {
        profileInfo.textContent = `Perfil: ${userData.profile}`;
    }

    renderMenu();
    navigateTo("section-dashboard", "dashboard");
}

/**
 * Realiza o login com validação das credenciais
 */
function handleLogin(event) {
    event.preventDefault();

    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    loginError.hidden = true;
    loginError.textContent = "";

    const user = CREDENTIALS[username];

    if (user && user.password === password) {
        const sessionData = {
            username: username,
            profile: user.profile,
            displayName: user.displayName
        };

        sessionStorage.setItem("almoxarifado_session", JSON.stringify(sessionData));
        showApp(sessionData);
    } else {
        loginError.textContent = "Usuário ou senha incorretos. Tente novamente.";
        loginError.hidden = false;
        passwordInput.value = "";
        passwordInput.focus();
    }
}

/**
 * Realiza o logout
 */
function handleLogout() {
    sessionStorage.removeItem("almoxarifado_session");
    showLogin();
}

/* ========== Event Listeners e Inicialização ========== */

loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", handleLogout);

// Cadastro de produtos
const formCadastrarProduto = document.getElementById("form-cadastrar-produto");
if (formCadastrarProduto) {
    formCadastrarProduto.addEventListener("submit", handleCadastroProduto);
}

const btnLimparCadastro = document.getElementById("btn-limpar-cadastro");
if (btnLimparCadastro) {
    btnLimparCadastro.addEventListener("click", resetCadastroForm);
}

// Gerenciamento de produtos
const formEditarProduto = document.getElementById("form-editar-produto");
if (formEditarProduto) {
    formEditarProduto.addEventListener("submit", handleEdicaoProduto);
}

const btnVoltarLista = document.getElementById("btn-voltar-lista");
if (btnVoltarLista) {
    btnVoltarLista.addEventListener("click", () => {
        showProdutosLista();
        renderProdutosLista();
    });
}

const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener("click", () => {
        showProdutosLista();
        renderProdutosLista();
    });
}

const btnCancelarEdicao2 = document.getElementById("btn-cancelar-edicao-2");
if (btnCancelarEdicao2) {
    btnCancelarEdicao2.addEventListener("click", () => {
        showProdutosLista();
        renderProdutosLista();
    });
}

// Filtros e ordenação da lista de produtos
["filtro-nome", "filtro-codigo"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", () => renderProdutosLista());
    }
});

["filtro-categoria", "filtro-situacao", "filtro-ordenacao"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", () => renderProdutosLista());
    }
});

const btnLimparFiltros = document.getElementById("btn-limpar-filtros");
if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener("click", limparFiltrosProdutos);
}

// Filtros do histórico de movimentações
["hist-filtro-produto", "hist-filtro-usuario"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", () => renderHistorico());
    }
});

["hist-filtro-tipo", "hist-filtro-data-inicio", "hist-filtro-data-fim"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", () => renderHistorico());
    }
});

const btnLimparFiltrosHist = document.getElementById("btn-limpar-filtros-hist");
if (btnLimparFiltrosHist) {
    btnLimparFiltrosHist.addEventListener("click", limparFiltrosHistorico);
}

const btnIrListaEditar = document.getElementById("btn-ir-lista-editar");
if (btnIrListaEditar) {
    btnIrListaEditar.addEventListener("click", () => {
        navigateTo("section-consultar-produtos", "consultar_produtos");
    });
}



const btnIrListaExcluir = document.getElementById("btn-ir-lista-excluir");
if (btnIrListaExcluir) {
    btnIrListaExcluir.addEventListener("click", () => {
        navigateTo("section-consultar-produtos", "consultar_produtos");
    });
}

// Movimentações de estoque
const formEntrada = document.getElementById("form-entrada-estoque");
if (formEntrada) {
    formEntrada.addEventListener("submit", handleEntradaEstoque);
}

const formSaida = document.getElementById("form-saida-estoque");
if (formSaida) {
    formSaida.addEventListener("submit", handleSaidaEstoque);
}

const btnLimparEntrada = document.getElementById("btn-limpar-entrada");
if (btnLimparEntrada) {
    btnLimparEntrada.addEventListener("click", () => resetMovimentacaoForm("entrada"));
}

const btnLimparSaida = document.getElementById("btn-limpar-saida");
if (btnLimparSaida) {
    btnLimparSaida.addEventListener("click", () => resetMovimentacaoForm("saida"));
}

const entradaProdutoSelect = document.getElementById("entrada-produto");
if (entradaProdutoSelect) {
    entradaProdutoSelect.addEventListener("change", () => atualizarInfoEstoque("entrada"));
}

const saidaProdutoSelect = document.getElementById("saida-produto");
if (saidaProdutoSelect) {
    saidaProdutoSelect.addEventListener("change", () => atualizarInfoEstoque("saida"));
}

// Consultar estoque — filtros
const estoqueFiltroBusca = document.getElementById("estoque-filtro-busca");
if (estoqueFiltroBusca) {
    estoqueFiltroBusca.addEventListener("input", () => renderEstoque());
}

const estoqueFiltroSituacao = document.getElementById("estoque-filtro-situacao");
if (estoqueFiltroSituacao) {
    estoqueFiltroSituacao.addEventListener("change", () => renderEstoque());
}

const btnLimparFiltrosEstoque = document.getElementById("btn-limpar-filtros-estoque");
if (btnLimparFiltrosEstoque) {
    btnLimparFiltrosEstoque.addEventListener("click", limparFiltrosEstoque);
}

// Garante dados iniciais e inicia a aplicação
seedInitialData();
checkSession();
