// ========================================
// BENAION DELIVERY - ENTREGADOR (V5.0)
// ========================================

let currentUser = null;
let pedidosEscutados = [];
let historicoCompleto = [];
let unsubscribePedidos = null;

async function initEntregador() {
  if (!window.Auth || !window.API || !window.auth) { setTimeout(initEntregador, 300); return; }
  if (!window.Auth.requireAuth(['entregador'])) return;
  
  currentUser = window.Auth.getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; return; }
  
  document.getElementById('entregadorNome').textContent = "Olá, " + currentUser.name.split(' ')[0];
  
  const perfil = await window.API.getUserProfile(currentUser.id);
  currentUser.online = perfil?.online || false;
  sincronizarUIStatus(currentUser.online);

  if (unsubscribePedidos) unsubscribePedidos();
  unsubscribePedidos = window.API.escutarTodosPedidos((pedidos) => {
    pedidosEscutados = pedidos;
    renderizarListas();
    atualizarEstatisticas();
  });

  carregarHistorico();
}

function sincronizarUIStatus(isOnline) {
  const indicator = document.getElementById('statusIndicator');
  const textNav = document.getElementById('navTextStatus');
  const iconNav = document.getElementById('navIconStatus');
  const btnHeader = document.getElementById('btnStatusHeader');

  if (isOnline) {
    if(indicator) { indicator.style.background = "#d4f8e2"; indicator.style.color = "#2ecc71"; indicator.innerHTML = '<i class="fas fa-circle" style="font-size:8px;"></i> NO RADAR'; }
    if(textNav) textNav.textContent = "Online";
    if(iconNav) iconNav.style.color = "#2ecc71";
    if(btnHeader) btnHeader.style.color = "#2ecc71";
  } else {
    if(indicator) { indicator.style.background = "#eee"; indicator.style.color = "#95a5a6"; indicator.innerHTML = '<i class="fas fa-circle" style="font-size:8px;"></i> OFFLINE'; }
    if(textNav) textNav.textContent = "Offline";
    if(iconNav) iconNav.style.color = "#95a5a6";
    if(btnHeader) btnHeader.style.color = "#666";
  }
}

async function toggleStatus() {
  const novoStatus = !currentUser.online;
  try {
    await window.API.updateUser(currentUser.id, { online: novoStatus });
    currentUser.online = novoStatus;
    localStorage.setItem('benaion_user', JSON.stringify(currentUser));
    sincronizarUIStatus(novoStatus);
    renderizarListas();
    window.Utils.showToast(novoStatus ? "✅ Você está Online!" : "⏸️ Você saiu do radar", "info");
  } catch (e) { 
    window.Utils.showToast("Erro ao mudar status", "error"); 
  }
}

function renderizarListas() {
  const dispContainer = document.getElementById('listaPedidosDisponiveis');
  const minhasContainer = document.getElementById('listaMinhasEntregas');
  if (!dispContainer || !minhasContainer) return;

  const disponiveis = currentUser.online 
    ? pedidosEscutados.filter(p => ['aguardando_entregador', 'pronto'].includes(p.status) && !p.entregadorId)
    : [];

  const minhas = pedidosEscutados.filter(p => p.entregadorId === currentUser.id && ['aceito', 'em_entrega'].includes(p.status));

  dispContainer.innerHTML = disponiveis.length === 0 
    ? `<div style="text-align:center; padding:40px; color:#999;">
        <i class="fas ${currentUser.online ? 'fa-box-open' : 'fa-toggle-off'} fa-2x"></i>
        <p style="margin-top:10px;">${currentUser.online ? 'Sem pedidos no momento...' : 'Fique Online para ver o Radar'}</p>
       </div>`
    : disponiveis.map(p => `
      <div style="background:white; border-radius:16px; padding:16px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border-left:6px solid #E30613;">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <div>
            <b style="color:#E30613;">📤 ${p.bairroRetirada?.toUpperCase() || 'N/A'}</b>
            <b style="display:block; color:#2c3e50;">📥 ${p.bairro?.toUpperCase() || 'N/A'}</b>
            <p style="margin-top:8px; color:#666; font-size:12px;"><i class="fas fa-box"></i> ${p.produto || 'Entrega'}</p>
            ${p.lojaNome ? `<p style="font-size:11px; color:#999;"><i class="fas fa-store"></i> ${p.lojaNome}</p>` : ''}
          </div>
          <b style="color:#2ecc71; font-size:22px;">${window.Utils.formatCurrency(p.taxaEntrega || 0)}</b>
        </div>
        <button onclick="window.aceitarCorrida('${p.id}', this)" class="btn-aceitar">ACEITAR ENTREGA</button>
      </div>
    `).join('');

  minhasContainer.innerHTML = minhas.length === 0
    ? '<div style="text-align:center; padding:40px; color:#999;"><i class="fas fa-route fa-2x"></i><p style="margin-top:10px;">Sem entregas ativas.</p></div>'
    : minhas.map(p => `
      <div class="card" style="border-left:6px solid #3498db; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <b>#${p.id ? p.id.substring(0,6).toUpperCase() : 'N/A'}</b>
          <span style="background:#3498db; color:white; font-size:10px; padding:4px 12px; border-radius:20px; font-weight:bold;">${window.Utils.getStatusText(p.status)}</span>
        </div>
        <p style="font-size:13px; margin:4px 0;"><i class="fas fa-store"></i> <b>Retirada:</b> ${p.retiradaLocal || 'Loja'} (${p.bairroRetirada || 'N/A'})</p>
        <p style="font-size:13px; margin:4px 0;"><i class="fas fa-map-marker-alt"></i> <b>Entrega:</b> ${p.entregaLocal || 'Endereço'} (${p.bairro || 'N/A'})</p>
        <p style="font-size:13px; margin:4px 0; color:#2ecc71; font-weight:bold;">${window.Utils.formatCurrency(p.taxaEntrega || 0)}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">
          <button onclick="window.Utils.openGoogleMaps('${p.bairroRetirada}', '${p.bairro}')" style="background:#f1f1f1; border:none; padding:10px; border-radius:10px; font-weight:bold; cursor:pointer;">🗺️ ROTA</button>
          <button onclick="window.finalizarEntrega('${p.id}')" style="background:#2ecc71; color:white; border:none; padding:10px; border-radius:10px; font-weight:bold; cursor:pointer;">✅ ENTREGUE</button>
        </div>
      </div>
    `).join('');
}

async function aceitarCorrida(id, btn) {
  if (btn) { btn.disabled = true; btn.textContent = "⏳ PROCESSANDO..."; }
  try {
    await window.API.updatePedido(id, { 
      entregadorId: currentUser.id, 
      entregadorNome: currentUser.name, 
      status: 'aceito', 
      aceito_em: Date.now() 
    });
    window.Utils.showToast("🚀 Pedido aceito!", "success");
    window.Utils.vibrate([100, 50, 100]);
    mostrarAba('minhas');
  } catch (e) {
    window.Utils.showToast("Pedido já foi pego.", "error");
    if (btn) { btn.disabled = false; btn.textContent = "ACEITAR ENTREGA"; }
  }
}

async function finalizarEntrega(id) {
  if (!window.Utils.confirmar("Confirmar entrega finalizada?")) return;
  try {
    await window.API.updatePedido(id, { status: 'finalizado', finalizado_em: Date.now() });
    window.Utils.showToast("✅ Entrega finalizada!", "success");
    window.Utils.sons.tocar('sucesso');
    carregarHistorico();
  } catch (e) { 
    window.Utils.showToast("Erro ao finalizar.", "error"); 
  }
}

async function carregarHistorico() {
  try {
    historicoCompleto = await window.API.getHistoricoEntregador(currentUser.id);
    atualizarEstatisticas();
  } catch (e) {}
}

function atualizarEstatisticas() {
  const hojeStr = new Date().toLocaleDateString();
  const concluidosHoje = pedidosEscutados.filter(p => {
    if (p.entregadorId !== currentUser.id || p.status !== 'finalizado') return false;
    const data = p.finalizado_em ? new Date(p.finalizado_em).toLocaleDateString() : '';
    return data === hojeStr;
  });

  const ganhosHoje = concluidosHoje.reduce((acc, p) => acc + (parseFloat(p.taxaEntrega) || 0), 0);

  const statHoje = document.getElementById('statHoje');
  const statSaldo = document.getElementById('statSaldo');
  if (statHoje) statHoje.textContent = concluidosHoje.length;
  if (statSaldo) statSaldo.textContent = window.Utils.formatCurrency(ganhosHoje);
}

function mostrarAba(aba) {
  const disp = document.getElementById('abaDisponiveis');
  const minhas = document.getElementById('abaMinhas');
  if (disp) disp.classList.toggle('hidden', aba !== 'disponiveis');
  if (minhas) minhas.classList.toggle('hidden', aba !== 'minhas');
  
  const btnDisp = document.getElementById('btnTabDisp');
  const btnMinhas = document.getElementById('btnTabMinhas');
  if (btnDisp) btnDisp.className = aba === 'disponiveis' ? 'btn btn-primary' : 'btn btn-outline';
  if (btnMinhas) btnMinhas.className = aba === 'minhas' ? 'btn btn-primary' : 'btn btn-outline';
}

window.toggleStatus = toggleStatus;
window.aceitarCorrida = aceitarCorrida;
window.finalizarEntrega = finalizarEntrega;
window.mostrarAba = mostrarAba;

document.addEventListener('DOMContentLoaded', initEntregador);
