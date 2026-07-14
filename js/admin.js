// ========================================
// BENAION DELIVERY - ADMIN (V5.0)
// ========================================

let todosPedidos = [];
let filtroAtual = 'todos';
let unsubscribePedidos = null;

async function initAdmin() {
  if (!window.Auth || !window.API) { setTimeout(initAdmin, 300); return; }
  if (!window.Auth.requireAuth(['admin'])) return;

  if (unsubscribePedidos) unsubscribePedidos();
  unsubscribePedidos = window.API.escutarTodosPedidos((pedidos) => {
    todosPedidos = pedidos.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    atualizarDashboard();
    renderizarPedidosAdmin();
  });

  setTimeout(carregarTaxas, 500);
}

function atualizarDashboard() {
  const hoje = new Date().toLocaleDateString();
  const pedidosHoje = todosPedidos.filter(p => new Date(p.created_at).toLocaleDateString() === hoje);
  const ativos = todosPedidos.filter(p => ['pendente', 'aguardando_entregador', 'aceito', 'em_entrega'].includes(p.status)).length;
  const faturamento = pedidosHoje.reduce((acc, p) => acc + (p.taxaEntrega || 0), 0);

  updateStat('statPedidosHoje', pedidosHoje.length);
  updateStat('statPedidosAtivos', ativos);
  updateStat('statFaturamento', window.Utils.formatCurrency(faturamento));
}

function updateStat(id, valor) { 
  const el = document.getElementById(id); 
  if (el) el.textContent = valor; 
}

function carregarTaxas() {
  const container = document.getElementById('listaConfigTaxas');
  if (!container) return;
  
  const taxas = window.TAXAS_LOCAIS || {};
  const bairros = ["Agreste", "Nova esperança", "Prosperidade", "Castanheira", "Cajari", "Rodovia do gogó", "buritizal", "Sarney", "Nazaré mineiro", "centro", "mirilandia", "Rio branco", "José cesário", "Malvinas", "samaúma", "monte dourado"];
  
  container.innerHTML = bairros.map(b => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #eee;">
      <span>${b}</span>
      <div style="display:flex; align-items:center; gap:8px;">
        <span>R$</span>
        <input type="number" step="0.50" class="input-taxa" data-bairro="${b}" value="${taxas[b] || '6.00'}" style="width:80px; padding:5px; border:1px solid #ddd; border-radius:6px; text-align:center; font-weight:bold;">
      </div>
    </div>
  `).join('');
}

async function salvarTaxas() {
  const inputs = document.querySelectorAll('.input-taxa');
  const novaTabela = {};
  inputs.forEach(i => novaTabela[i.dataset.bairro] = parseFloat(i.value) || 6);
  await window.API.salvarTaxas(novaTabela);
}

function filtrarPedidos(status) {
  filtroAtual = status;
  renderizarPedidosAdmin();
  document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
  if (event?.target) event.target.classList.add('active');
}

function renderizarPedidosAdmin() {
  const container = document.getElementById('containerPedidosAdmin');
  if (!container) return;

  const pedidos = filtroAtual === 'todos' ? todosPedidos : todosPedidos.filter(p => p.status === filtroAtual);

  if (pedidos.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:#999;"><i class="fas fa-search fa-2x"></i><p>Nenhum pedido.</p></div>';
    return;
  }

  container.innerHTML = pedidos.map(p => `
    <div style="border-left:5px solid ${getStatusColor(p.status)}; background:white; padding:15px; margin-bottom:12px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <b>#${(p.id||'').substring(0,6).toUpperCase()}</b>
          <div style="color:#e30613; font-weight:bold; font-size:13px;">${p.lojaNome || 'AVULSO'}</div>
        </div>
        <span style="background:${getStatusColor(p.status)}; color:white; padding:4px 12px; border-radius:20px; font-size:10px; font-weight:bold;">${window.Utils.getStatusText(p.status).toUpperCase()}</span>
      </div>
      <div style="margin:10px 0; font-size:13px; line-height:1.6;">
        <p>📤 ${p.bairroRetirada || 'N/A'} → 📥 ${p.bairro || p.bairroEntrega || 'N/A'}</p>
        ${p.entregadorNome ? `<p>🛵 ${p.entregadorNome}</p>` : ''}
        <p>👤 ${p.clienteNome || 'N/A'}</p>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f0f0f0; padding-top:10px;">
        <span style="font-weight:800; color:#27ae60;">${window.Utils.formatCurrency(p.taxaEntrega || 0)}</span>
        <button onclick="window.cancelarPedidoAdmin('${p.id}')" style="background:#ff4757; color:white; border:none; padding:6px 12px; border-radius:8px; font-size:11px; cursor:pointer;">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function cancelarPedidoAdmin(id) {
  if (window.Utils.confirmar("Remover este pedido?")) {
    await window.API.deletePedido(id);
    window.Utils.showToast("Pedido removido.", "success");
  }
}

async function lancarPedidoManual(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = '⏳ Enviando...';
  
  const data = {
    clienteNome: document.getElementById('manualCliente').value.trim(),
    produto: document.getElementById('manualProduto').value.trim(),
    bairroRetirada: document.getElementById('manualBairroRet').value.trim(),
    bairro: document.getElementById('manualBairroEnt').value.trim(),
    taxaEntrega: parseFloat(document.getElementById('manualTaxa').value),
    status: 'aguardando_entregador', 
    created_at: Date.now(), 
    origem: 'ADMIN'
  };
  
  try {
    await window.API.createPedido(data);
    window.Utils.showToast("Pedido lançado!", "success");
    window.Utils.hideModal('novoPedidoModal');
    e.target.reset();
  } catch (e) { 
    window.Utils.showToast("Erro ao lançar.", "error"); 
  } finally { 
    btn.disabled = false; 
    btn.textContent = 'Lançar no Radar'; 
  }
}

function getStatusColor(s) {
  const c = { 
    pendente:'#f1c40f', preparando:'#3498db', pronto:'#9b59b6', 
    aguardando_entregador:'#95a5a6', aceito:'#3498db', 
    em_entrega:'#e67e22', finalizado:'#2ecc71', cancelado:'#e30613' 
  };
  return c[s] || '#ccc';
}

window.filtrarPedidos = filtrarPedidos;
window.salvarNovasTaxas = salvarTaxas;
window.lancarPedidoManual = lancarPedidoManual;
window.cancelarPedidoAdmin = cancelarPedidoAdmin;

document.addEventListener('DOMContentLoaded', initAdmin);
