// ========================================
// BENAION DELIVERY - CLIENTE (V5.0)
// ========================================

let currentUser = null;
let taxaCalculada = 6.00;
let lojaSelecionada = null;
let enderecosSalvos = [];
let meusPedidos = [];
let unsubscribePedidos = null;

async function initPaginaCliente() {
  if (!window.Auth || !window.API) { setTimeout(initPaginaCliente, 300); return; }
  if (!window.Auth.requireAuth(['cliente'])) return;
  
  currentUser = window.Auth.getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; return; }
  
  document.getElementById('clienteNome').textContent = `Olá, ${currentUser.name.split(' ')[0]}`;
  carregarEnderecos();
  renderizarEnderecosSalvos();

  if (unsubscribePedidos) unsubscribePedidos();
  unsubscribePedidos = window.API.escutarTodosPedidos((todos) => {
    meusPedidos = todos.filter(p => p.clienteId === currentUser.id);
    meusPedidos.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    document.getElementById('contadorPedidos').textContent = meusPedidos.length;
    renderizarMeusPedidos(meusPedidos);
  });

  carregarParceirosReais();
  atualizarTaxaEstimada();
}

function carregarEnderecos() {
  try {
    enderecosSalvos = JSON.parse(localStorage.getItem('benaion_enderecos')) || [];
  } catch(e) { enderecosSalvos = []; }
}

function salvarEndereco() {
  const retiradaLocal = document.getElementById('pedidoRetiradaLocal')?.value?.trim() || '';
  const entregaLocal = document.getElementById('pedidoEntregaLocal')?.value?.trim() || '';
  const bairroRetirada = document.getElementById('pedidoBairroRetirada')?.value || '';
  const bairroEntrega = document.getElementById('pedidoBairroEntrega')?.value || '';
  
  if (!retiradaLocal || !entregaLocal) return;
  
  enderecosSalvos = enderecosSalvos.filter(e => 
    e.retiradaLocal !== retiradaLocal || e.entregaLocal !== entregaLocal
  );
  
  enderecosSalvos.unshift({ retiradaLocal, bairroRetirada, entregaLocal, bairroEntrega, salvoEm: Date.now() });
  if (enderecosSalvos.length > 5) enderecosSalvos.pop();
  localStorage.setItem('benaion_enderecos', JSON.stringify(enderecosSalvos));
  renderizarEnderecosSalvos();
}

function renderizarEnderecosSalvos() {
  const container = document.getElementById('enderecosSalvos');
  if (!container) return;
  if (enderecosSalvos.length === 0) { container.innerHTML = ''; return; }
  
  container.innerHTML = `
    <div style="margin-bottom:8px; font-size:11px; color:#999;">📌 Endereços salvos:</div>
    ${enderecosSalvos.map((e, i) => `
      <div onclick="usarEnderecoSalvo(${i})" 
           style="background:#f5f5f5; padding:8px 12px; border-radius:8px; margin-bottom:5px; cursor:pointer; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
        <span>📍 ${e.entregaLocal} (${e.bairroEntrega})</span>
        <span style="font-size:10px; color:#999;">${new Date(e.salvoEm).toLocaleTimeString()}</span>
      </div>
    `).join('')}
  `;
}

function usarEnderecoSalvo(index) {
  const e = enderecosSalvos[index];
  if (!e) return;
  
  const retiradaLocal = document.getElementById('pedidoRetiradaLocal');
  const entregaLocal = document.getElementById('pedidoEntregaLocal');
  const bairroRetirada = document.getElementById('pedidoBairroRetirada');
  const bairroEntrega = document.getElementById('pedidoBairroEntrega');
  
  if (retiradaLocal) retiradaLocal.value = e.retiradaLocal || '';
  if (entregaLocal) entregaLocal.value = e.entregaLocal || '';
  if (bairroRetirada) bairroRetirada.value = e.bairroRetirada || 'Centro';
  if (bairroEntrega) bairroEntrega.value = e.bairroEntrega || '';
  
  window.Utils.showToast('📍 Endereço carregado!', 'info');
  atualizarTaxaEstimada();
}

function atualizarTaxaEstimada() {
  const bairroDestino = document.getElementById('pedidoBairroEntrega')?.value || '';
  taxaCalculada = window.API.calcularTaxa(null, bairroDestino);
  const txt = document.getElementById('txtTaxaEstimada');
  if (txt) txt.textContent = window.Utils.formatCurrency(taxaCalculada);
}

function renderizarMeusPedidos(pedidos) {
  const container = document.getElementById('listaPedidos');
  if (!container) return;

  if (!pedidos || pedidos.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; opacity:0.6;">
        <i class="fas fa-box-open" style="font-size:48px; color:#ccc;"></i>
        <p style="margin-top:15px; color:#999;">Nenhum pedido ainda</p>
        <p style="font-size:12px; color:#bbb;">Peça sua primeira entrega agora!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pedidos.map(p => {
    const statusSteps = {
      'pendente': 0, 'preparando': 1, 'pronto': 2,
      'aguardando_entregador': 3, 'aceito': 4, 'em_entrega': 5, 'finalizado': 6
    };
    const step = statusSteps[p.status] !== undefined ? statusSteps[p.status] : 0;
    const statusColor = getStatusColor(p.status);
    
    return `
    <div class="card" style="border-left:5px solid ${statusColor}; margin-bottom:12px; padding:15px; background:white; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <b style="color:var(--primary-red); font-size:14px;">#${p.id ? p.id.substring(0,6).toUpperCase() : 'N/A'}</b>
        <span style="background:${statusColor}; color:white; padding:3px 12px; border-radius:20px; font-size:10px; font-weight:bold; letter-spacing:0.5px;">
          ${window.Utils.getStatusText(p.status)}
        </span>
      </div>
      
      <div class="progress-bar" style="display:flex; justify-content:space-between; margin:10px 0; position:relative;">
        ${['📝','👨‍🍳','📦','🔍','🛵','🚀','✅'].map((icon, i) => `
          <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
            <div style="width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;
                ${i < step ? 'background:#2ecc71; color:white;' : 
                  i === step ? 'background:var(--primary-red); color:white; box-shadow:0 0 0 3px rgba(227,6,19,0.2);' : 
                  'background:#eee; color:#ccc;'}">
              ${i <= step ? icon : ''}
            </div>
            <span style="font-size:7px; margin-top:3px; color:#999; text-align:center; max-width:40px; line-height:1.2;">
              ${['Pend','Prep','Pront','Radar','Aceit','Entrega','Fim'][i]}
            </span>
          </div>
        `).join('')}
      </div>
      
      <div style="font-size:13px; margin:10px 0; line-height:1.6;">
        <p style="margin:2px 0;"><b>📤 Retirada:</b> ${p.retiradaLocal || 'Loja'} (${p.bairroRetirada || 'N/A'})</p>
        <p style="margin:2px 0;"><b>📥 Entrega:</b> ${p.entregaLocal || 'Endereço'} (${p.bairro || p.bairroEntrega || 'N/A'})</p>
        ${p.entregadorNome ? `<p style="margin:2px 0;"><b>🛵 Entregador:</b> ${p.entregadorNome}</p>` : ''}
        <p style="color:var(--primary-red); font-weight:bold; font-size:18px; margin-top:5px;">${window.Utils.formatCurrency(p.taxaEntrega || 0)}</p>
      </div>
      
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
        ${p.status === 'aguardando_entregador' ? 
          `<button onclick="cancelarMeuPedido('${p.id}')" class="btn btn-small" style="background:#ff4757; color:white; border:none; padding:6px 14px; border-radius:8px; font-size:11px; cursor:pointer;">✕ Cancelar</button>` : ''}
        ${p.status === 'finalizado' ? 
          `<button onclick="repetirPedido('${p.id}')" class="btn btn-small" style="background:#3498db; color:white; border:none; padding:6px 14px; border-radius:8px; font-size:11px; cursor:pointer;">🔄 Repetir</button>` : ''}
        ${p.status === 'finalizado' && p.entregadorId ? 
          `<button onclick="avaliarEntrega('${p.id}','${p.entregadorId||''}')" class="btn btn-small" style="background:#f39c12; color:white; border:none; padding:6px 14px; border-radius:8px; font-size:11px; cursor:pointer;">⭐ Avaliar</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function repetirPedido(id) {
  const p = meusPedidos.find(x => x.id === id);
  if (!p) { window.Utils.showToast('Pedido não encontrado', 'warning'); return; }
  
  document.getElementById('pedidoRetiradaLocal').value = p.retiradaLocal || '';
  document.getElementById('pedidoEntregaLocal').value = p.entregaLocal || '';
  document.getElementById('pedidoProduto').value = p.produto || '';
  document.getElementById('pedidoBairroEntrega').value = p.bairro || p.bairroEntrega || '';
  document.getElementById('pedidoBairroRetirada').value = p.bairroRetirada || 'Centro';
  
  atualizarTaxaEstimada();
  window.Utils.showModal('novoPedidoModal');
  window.Utils.showToast('📝 Pedido carregado!', 'success');
}

async function cancelarMeuPedido(id) {
  if (!window.Utils.confirmar("Cancelar este pedido?")) return;
  try {
    await window.API.deletePedido(id);
    window.Utils.showToast("✅ Pedido cancelado", "success");
  } catch(e) {
    window.Utils.showToast("❌ Erro ao cancelar", "error");
  }
}

async function avaliarEntrega(pedidoId, entregadorId) {
  if (!entregadorId) { window.Utils.showToast('Entregador não identificado', 'warning'); return; }
  
  const nota = prompt("⭐ Avalie a entrega (1 a 5):", "5");
  if (!nota || isNaN(nota) || nota < 1 || nota > 5) {
    window.Utils.showToast('Nota inválida', 'warning');
    return;
  }
  
  try {
    await window.API.addAvaliacao({ pedidoId, entregadorId, clienteId: currentUser.id, nota: parseInt(nota) });
    window.Utils.showToast("⭐ Obrigado pela avaliação!", "success");
  } catch(e) {
    window.Utils.showToast("Erro ao avaliar", "error");
  }
}

async function handleNovoPedido(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  
  const retiradaLocal = document.getElementById('pedidoRetiradaLocal').value.trim();
  const bairroEntrega = document.getElementById('pedidoBairroEntrega').value;
  const entregaLocal = document.getElementById('pedidoEntregaLocal').value.trim();
  const produto = document.getElementById('pedidoProduto').value.trim();
  
  if (!retiradaLocal) { window.Utils.showToast('Informe o local de retirada', 'warning'); return; }
  if (!bairroEntrega) { window.Utils.showToast('Selecione o bairro de entrega', 'warning'); return; }
  if (!entregaLocal) { window.Utils.showToast('Informe o endereço de entrega', 'warning'); return; }
  if (!produto) { window.Utils.showToast('Informe o produto', 'warning'); return; }
  
  btn.disabled = true;
  btn.textContent = '⏳ Enviando...';

  const codigoConfirmacao = window.Utils.gerarCodigo();
  
  const data = {
    clienteId: currentUser.id,
    clienteNome: currentUser.name,
    clienteTel: currentUser.telefone || '',
    lojaId: lojaSelecionada?.id || null,
    lojaNome: lojaSelecionada?.nome || null,
    bairroRetirada: document.getElementById('pedidoBairroRetirada').value,
    retiradaLocal,
    bairro: bairroEntrega,
    entregaLocal,
    produto,
    taxaEntrega: taxaCalculada,
    codigoConfirmacao,
    status: 'aguardando_entregador',
    created_at: Date.now()
  };

  try {
    await window.API.createPedido(data);
    salvarEndereco();
    window.Utils.sons.tocar('pedidoNovo');
    window.Utils.showToast(`🚀 Pedido enviado! Código: ${codigoConfirmacao}`, 'success');
    window.Utils.hideModal('novoPedidoModal');
    lojaSelecionada = null;
    e.target.reset();
    atualizarTaxaEstimada();
  } catch (err) {
    window.Utils.showToast("Erro ao enviar pedido", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = 'CONFIRMAR E PEDIR';
  }
}

async function carregarParceirosReais() {
  const container = document.getElementById('listaParceiros');
  if (!container) return;
  try {
    const parceiros = await window.API.getUsersByType('parceiro');
    if (parceiros.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:20px; opacity:0.5;">🏪 Nenhuma loja parceira ainda</p>';
      return;
    }
    container.innerHTML = parceiros.map(p => `
      <div onclick="selecionarLojaParceira('${p.id}','${p.storeName||p.name}')" style="text-align:center; min-width:75px; cursor:pointer;">
        <div style="width:55px;height:55px;background:linear-gradient(135deg,#E30613,#c00510);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 4px 15px rgba(227,6,19,0.2);">
          <i class="fas fa-store" style="font-size:22px;color:white;"></i>
        </div>
        <p style="font-size:10px;margin-top:6px;font-weight:700;">${p.storeName||p.name}</p>
      </div>
    `).join('');
  } catch(e) {
    container.innerHTML = '<p style="text-align:center;opacity:0.5;">Erro ao carregar</p>';
  }
}

function selecionarLojaParceira(lojaId, lojaNome) {
  lojaSelecionada = { id: lojaId, nome: lojaNome };
  document.getElementById('pedidoBairroRetirada').value = 'Centro';
  document.getElementById('pedidoRetiradaLocal').value = lojaNome;
  window.Utils.showToast(`🏪 ${lojaNome} selecionada!`, 'success');
  window.Utils.showModal('novoPedidoModal');
  atualizarTaxaEstimada();
}

function getStatusColor(s) {
  const c = { 
    pendente:'#f1c40f', preparando:'#3498db', pronto:'#9b59b6', 
    aguardando_entregador:'#e67e22', aceito:'#2ecc71', 
    em_entrega:'#e91e63', finalizado:'#27ae60', cancelado:'#e30613' 
  };
  return c[s] || '#999';
}

window.atualizarTaxaEstimada = atualizarTaxaEstimada;
window.handleNovoPedido = handleNovoPedido;
window.selecionarLojaParceira = selecionarLojaParceira;
window.cancelarMeuPedido = cancelarMeuPedido;
window.avaliarEntrega = avaliarEntrega;
window.repetirPedido = repetirPedido;
window.usarEnderecoSalvo = usarEnderecoSalvo;

document.addEventListener('DOMContentLoaded', initPaginaCliente);
