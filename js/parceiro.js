// ========================================
// BENAION DELIVERY - PARCEIRO (V5.0)
// ========================================

let currentUser = null;
let pedidosLoja = [];
let taxaCalculada = 6;
let unsubscribePedidos = null;

async function init() {
  if (!window.Auth || !window.API) { setTimeout(init, 300); return; }
  if (!window.Auth.requireAuth(['parceiro'])) return;
  
  currentUser = window.Auth.getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; return; }
  
  document.getElementById('lojaNome').textContent = currentUser.storeName || currentUser.name;

  const bairros = ["Agreste", "Nova esperança", "Prosperidade", "Castanheira", "Cajari", "Rodovia do gogó", "buritizal", "Sarney", "Nazaré mineiro", "centro", "mirilandia", "Rio branco", "José cesário", "Malvinas", "samaúma", "monte dourado"];
  const comboOrigem = document.getElementById('bairroOrigem');
  const comboDestino = document.getElementById('bairroDestino');
  if (comboOrigem && comboDestino) {
    bairros.forEach(b => { 
      comboOrigem.innerHTML += `<option value="${b}">${b}</option>`; 
      comboDestino.innerHTML += `<option value="${b}">${b}</option>`; 
    });
  }

  if (unsubscribePedidos) unsubscribePedidos();
  unsubscribePedidos = window.API.escutarTodosPedidos((pedidos) => {
    pedidosLoja = pedidos.filter(p => p.lojaId === currentUser.id);
    renderizar();
    atualizarDashboard();
  });
  
  calcularTaxaChamada();
  carregarProdutos();
}

function calcularTaxaChamada() {
  const ori = document.getElementById('bairroOrigem');
  const des = document.getElementById('bairroDestino');
  if (ori && des) {
    taxaCalculada = window.API.calcularTaxa(ori.value, des.value);
    const el = document.getElementById('valorTaxaChamada');
    if (el) el.textContent = window.Utils.formatCurrency(taxaCalculada);
  }
}

function abrirModalChamar() { 
  const modal = document.getElementById('modalChamar');
  if (modal) modal.classList.remove('hidden'); 
}

function fecharModalChamar() { 
  const modal = document.getElementById('modalChamar');
  if (modal) modal.classList.add('hidden'); 
}

async function handleChamarAvulso(e) {
  e.preventDefault();
  const btn = document.getElementById('btnLancarPedido');
  if (btn) { btn.disabled = true; btn.textContent = "⏳ LANÇANDO..."; }

  const pedido = {
    lojaId: currentUser.id, 
    lojaNome: currentUser.storeName || currentUser.name,
    bairroRetirada: document.getElementById('bairroOrigem').value,
    retiradaLocal: currentUser.storeName || currentUser.name,
    bairro: document.getElementById('bairroDestino').value,
    taxaEntrega: taxaCalculada,
    valorProdutos: parseFloat(document.getElementById('valorProdutosAvulso').value) || 0,
    status: 'aguardando_entregador', 
    origem: 'PARCEIRO_AVULSO',
    produto: 'Entrega Avulsa', 
    created_at: Date.now()
  };

  try {
    await window.API.createPedido(pedido);
    window.Utils.showToast("Pedido lançado no Radar!", "success");
    fecharModalChamar();
    e.target.reset();
  } catch (err) { 
    window.Utils.showToast("Erro ao chamar motoboy", "error"); 
  } finally { 
    if (btn) { btn.disabled = false; btn.textContent = "LANÇAR NO RADAR"; } 
  }
}

function renderizar() {
  const lista = document.getElementById('listaPedidos');
  if (!lista) return;
  
  lista.innerHTML = pedidosLoja.length === 0 
    ? '<div style="text-align:center; padding:50px; opacity:0.5;"><i class="fas fa-box-open fa-3x"></i><p>Nenhum pedido hoje.</p></div>'
    : pedidosLoja.sort((a,b) => (b.created_at || 0) - (a.created_at || 0)).map(p => `
      <div class="pedido-card" style="border-left:5px solid ${getStatusColor(p.status)}; margin-bottom:15px; padding:15px; background:white; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#E30613;">#${p.id?.substring(0,6).toUpperCase() || 'N/A'}</b>
          <span style="background:#f0f0f0; padding:4px 12px; border-radius:20px; font-size:10px; font-weight:bold;">${window.Utils.getStatusText(p.status).toUpperCase()}</span>
        </div>
        <p style="margin:10px 0; font-size:13px;">📍 <b>Para:</b> ${p.bairro || p.bairroEntrega || 'N/A'}</p>
        <p style="font-size:13px;">🛵 <b>Entregador:</b> ${p.entregadorNome || 'Buscando...'}</p>
        <p style="font-size:13px;">📦 <b>Produto:</b> ${p.produto || 'N/A'}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px solid #f0f0f0; padding-top:10px;">
          <span style="font-weight:bold; color:#27ae60; font-size:16px;">${window.Utils.formatCurrency(p.taxaEntrega || 0)}</span>
          ${p.status === 'aguardando_entregador' ? 
            `<button onclick="window.cancelarPedidoLoja('${p.id}')" style="background:#ff4757; color:white; border:none; padding:6px 14px; border-radius:8px; font-size:11px; cursor:pointer;">Cancelar</button>` : ''}
        </div>
      </div>
    `).join('');
}

function getStatusColor(s) {
  const c = { 
    pendente:'#f1c40f', preparando:'#3498db', pronto:'#9b59b6', 
    aguardando_entregador:'#e67e22', aceito:'#2ecc71', 
    em_entrega:'#e91e63', finalizado:'#27ae60', cancelado:'#e30613' 
  };
  return c[s] || '#ccc';
}

async function cancelarPedidoLoja(id) {
  if (window.Utils.confirmar("Remover este pedido?")) {
    await window.API.deletePedido(id);
    window.Utils.showToast("Pedido cancelado.", "success");
  }
}

function atualizarDashboard() {
  const ativos = pedidosLoja.filter(p => !['finalizado', 'cancelado'].includes(p.status));
  const concluidos = pedidosLoja.filter(p => p.status === 'finalizado');
  const faturamento = concluidos.reduce((acc, p) => acc + (p.valorProdutos || 0), 0);
  
  const elAtivos = document.getElementById('pedidosAtivos');
  const elVendas = document.getElementById('vendasHoje');
  const elFaturamento = document.getElementById('faturamentoHoje');
  
  if (elAtivos) elAtivos.textContent = ativos.length;
  if (elVendas) elVendas.textContent = concluidos.length;
  if (elFaturamento) elFaturamento.textContent = window.Utils.formatCurrency(faturamento);
}

async function carregarProdutos() {
  const grid = document.getElementById('gridProdutos');
  if (!grid || !currentUser) return;
  try {
    const produtos = await window.API.getProdutosLoja(currentUser.id);
    grid.innerHTML = produtos.length === 0 
      ? '<p style="text-align:center; padding:20px; color:#999;">Nenhum produto cadastrado.</p>'
      : produtos.map(d => `
        <div class="product-card" style="background:white; border-radius:12px; padding:12px; text-align:center; position:relative; border:1px solid #eee;">
          <div style="font-weight:bold; font-size:14px;">${d.nome}</div>
          <div style="color:#2ecc71; font-weight:bold; font-size:16px; margin-top:4px;">${window.Utils.formatCurrency(d.preco)}</div>
          <button onclick="window.excluirProduto('${d.id}')" style="position:absolute; top:5px; right:5px; background:none; border:none; color:#e30613; cursor:pointer; font-size:14px;">🗑️</button>
        </div>
      `).join('');
  } catch (e) {}
}

async function handleAddProduto(e) {
  e.preventDefault();
  const nome = document.getElementById('pNome').value.trim();
  const preco = parseFloat(document.getElementById('pPreco').value);
  
  if (!nome) { window.Utils.showToast("Nome do produto é obrigatório", "warning"); return; }
  if (!preco || preco <= 0) { window.Utils.showToast("Preço inválido", "warning"); return; }
  
  try {
    await window.API.addProduto({ lojaId: currentUser.id, nome, preco, created_at: Date.now() });
    window.Utils.showToast("Produto cadastrado!", "success");
    document.getElementById('modalProduto').classList.add('hidden');
    e.target.reset(); 
    carregarProdutos();
  } catch (err) { 
    window.Utils.showToast("Erro ao cadastrar.", "error"); 
  }
}

async function excluirProduto(id) {
  if (window.Utils.confirmar("Excluir este produto?")) {
    await window.API.deleteProduto(id);
    window.Utils.showToast("Produto removido.", "success");
    carregarProdutos();
  }
}

function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const target = document.getElementById(`aba-${tab}`);
  const nav = document.getElementById(`nav-${tab}`);
  if (target) target.classList.remove('hidden');
  if (nav) nav.classList.add('active');
  if (tab === 'produtos') carregarProdutos();
}

window.calcularTaxaChamada = calcularTaxaChamada;
window.abrirModalChamar = abrirModalChamar;
window.fecharModalChamar = fecharModalChamar;
window.cancelarPedidoLoja = cancelarPedidoLoja;
window.switchTab = switchTab;
window.handleAddProduto = handleAddProduto;
window.excluirProduto = excluirProduto;

document.addEventListener('DOMContentLoaded', () => {
  init();
  const formChamar = document.getElementById('formChamarAvulso');
  if (formChamar) formChamar.onsubmit = handleChamarAvulso;
  
  const formProduto = document.getElementById('formAddProduto');
  if (formProduto) formProduto.onsubmit = handleAddProduto;
});
