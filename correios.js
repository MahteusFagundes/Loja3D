/**
 * Calculadora de Frete dos Correios
 * Implementação JavaScript pura
 */

// Configurações dos Correios
const CORREIOS_CONFIG = {
    servicosPAC: '04510',
    servicosSEDEX: '04014',
    formato: '1', // 1 = Caixa/Pacote, 2 = Rolo/Prisma, 3 = Envelope
    maoPropriaValue: 'N',
    avisoRecebimentoValue: 'N',
    valorDeclarado: '0',
    // URL da API dos Correios - em produção, você precisará configurar um proxy
    // devido a limitações de CORS
    apiUrl: 'https://seu-servidor.com/api/calculador-correios'
};

/**
 * Formata CEP removendo caracteres não numéricos
 * @param {string} cep - CEP a ser formatado
 * @return {string} CEP formatado apenas com números
 */
function formatarCEP(cep) {
    return cep.replace(/\D/g, '');
}

/**
 * Formata valor monetário em formato brasileiro
 * @param {number|string} valor - Valor a ser formatado
 * @return {string} Valor formatado no padrão R$ 0,00
 */
function formatarValor(valor) {
    return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
}

/**
 * Valida os dados de entrada para cálculo de frete
 * @param {Object} dados - Objeto com dados de entrada
 * @return {Object} Resultado da validação { valido: boolean, mensagem: string }
 */
function validarDadosEntrada(dados) {
    const { cepOrigem, cepDestino, peso, comprimento, largura, altura } = dados;
    
    if (!cepOrigem || formatarCEP(cepOrigem).length !== 8) {
        return { valido: false, mensagem: 'CEP de origem inválido' };
    }
    
    if (!cepDestino || formatarCEP(cepDestino).length !== 8) {
        return { valido: false, mensagem: 'CEP de destino inválido' };
    }
    
    if (!peso || isNaN(peso) || peso <= 0 || peso > 30) {
        return { valido: false, mensagem: 'Peso inválido. Deve estar entre 0,1 e 30 kg' };
    }
    
    if (!comprimento || comprimento < 16 || comprimento > 105) {
        return { valido: false, mensagem: 'Comprimento inválido. Deve estar entre 16 e 105 cm' };
    }
    
    if (!largura || largura < 11 || largura > 105) {
        return { valido: false, mensagem: 'Largura inválida. Deve estar entre 11 e 105 cm' };
    }
    
    if (!altura || altura < 2 || altura > 105) {
        return { valido: false, mensagem: 'Altura inválida. Deve estar entre 2 e 105 cm' };
    }
    
    // Validação da soma das dimensões (máximo 200cm)
    const somaDimensoes = parseFloat(comprimento) + parseFloat(largura) + parseFloat(altura);
    if (somaDimensoes > 200) {
        return { valido: false, mensagem: 'A soma das dimensões não pode ultrapassar 200 cm' };
    }
    
    return { valido: true, mensagem: '' };
}

/**
 * Calcula o frete usando a API real dos Correios
 * @param {Object} dados - Objeto com dados para cálculo
 * @return {Promise} Promise com resultado do cálculo
 */
async function calcularFreteAPI(dados) {
    const { cepOrigem, cepDestino, peso, comprimento, largura, altura } = dados;
    
    // Validar dados de entrada
    const validacao = validarDadosEntrada(dados);
    if (!validacao.valido) {
        throw new Error(validacao.mensagem);
    }
    
    // Preparar parâmetros para API dos Correios
    const params = new URLSearchParams({
        nCdServico: `${CORREIOS_CONFIG.servicosPAC},${CORREIOS_CONFIG.servicosSEDEX}`,
        sCepOrigem: formatarCEP(cepOrigem),
        sCepDestino: formatarCEP(cepDestino),
        nVlPeso: peso,
        nCdFormato: CORREIOS_CONFIG.formato,
        nVlComprimento: comprimento,
        nVlAltura: altura,
        nVlLargura: largura,
        nVlDiametro: 0,
        sCdMaoPropria: CORREIOS_CONFIG.maoPropriaValue,
        nVlValorDeclarado: CORREIOS_CONFIG.valorDeclarado,
        sCdAvisoRecebimento: CORREIOS_CONFIG.avisoRecebimentoValue
    });
    
    try {
        // Fazer chamada à API
        const response = await fetch(`${CORREIOS_CONFIG.apiUrl}?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`Erro na consulta: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Verificar erro na resposta
        if (data.erro) {
            throw new Error(`Erro nos Correios: ${data.msg || 'Erro desconhecido'}`);
        }
        
        // Processar resultados
        return processarRespostaCorreios(data);
    } catch (error) {
        console.error('Erro ao calcular frete:', error);
        throw error;
    }
}

/**
 * Processa a resposta da API dos Correios
 * @param {Object} resposta - Resposta da API
 * @return {Array} Array com serviços de frete processados
 */
function processarRespostaCorreios(resposta) {
    // A resposta dos Correios normalmente vem no formato Correios.CalcPrecoPrazo ou em um formato XML
    // Este é um exemplo simplificado para JSON
    try {
        const servicos = [];
        
        // Caso seja uma resposta XML convertida para JSON
        if (resposta.Servicos && resposta.Servicos.cServico) {
            const servicosArray = Array.isArray(resposta.Servicos.cServico) 
                ? resposta.Servicos.cServico 
                : [resposta.Servicos.cServico];
            
            servicosArray.forEach(servico => {
                // Verificar se o serviço não retornou erro
                if (servico.Erro === '0') {
                    servicos.push({
                        codigo: servico.Codigo,
                        nome: servico.Codigo === CORREIOS_CONFIG.servicosPAC ? 'PAC' : 'SEDEX',
                        valor: servico.Valor.replace(',', '.'),
                        prazoEntrega: parseInt(servico.PrazoEntrega),
                        entregaDomiciliar: servico.EntregaDomiciliar === 'S',
                        entregaSabado: servico.EntregaSabado === 'S'
                    });
                }
            });
        } 
        // Caso seja uma resposta do tipo array direta
        else if (Array.isArray(resposta)) {
            resposta.forEach(servico => {
                if (servico.Erro === '0' || servico.erro === '0') {
                    servicos.push({
                        codigo: servico.Codigo || servico.codigo,
                        nome: getServicoNome(servico.Codigo || servico.codigo),
                        valor: (servico.Valor || servico.valor || '0').replace(',', '.'),
                        prazoEntrega: parseInt(servico.PrazoEntrega || servico.prazoEntrega),
                        entregaDomiciliar: (servico.EntregaDomiciliar || servico.entregaDomiciliar) === 'S',
                        entregaSabado: (servico.EntregaSabado || servico.entregaSabado) === 'S'
                    });
                }
            });
        }
        
        return servicos;
    } catch (error) {
        console.error('Erro ao processar resposta dos Correios:', error);
        throw new Error('Erro ao processar resposta dos Correios');
    }
}

/**
 * Retorna o nome do serviço com base no código
 * @param {string} codigo - Código do serviço
 * @return {string} Nome do serviço
 */
function getServicoNome(codigo) {
    const servicos = {
        '04510': 'PAC',
        '04014': 'SEDEX',
        '40215': 'SEDEX 10',
        '40290': 'SEDEX Hoje',
        '04804': 'SEDEX Hoje'
    };
    
    return servicos[codigo] || `Serviço (${codigo})`;
}

/**
 * Função de simulação para testes sem API
 * @param {Object} dados - Dados para simulação
 * @return {Promise} Promise com resultados simulados
 */
async function simularCalculoFrete(dados) {
    const { cepOrigem, cepDestino, peso, comprimento, largura, altura } = dados;
    
    // Validar dados de entrada
    const validacao = validarDadosEntrada(dados);
    if (!validacao.valido) {
        throw new Error(validacao.mensagem);
    }
    
    // Simula atraso de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculando valores baseados nas dimensões e distância dos CEPs
    const distancia = Math.abs(parseInt(formatarCEP(cepOrigem).substring(0, 3)) - 
                              parseInt(formatarCEP(cepDestino).substring(0, 3)));
    
    const volume = parseFloat(comprimento) * parseFloat(largura) * parseFloat(altura);
    const pesoNum = parseFloat(peso);
    
    // Simulação de cálculo de frete
    const pacValue = ((distancia * 0.02) + (pesoNum * 5) + (volume * 0.000025) + 15).toFixed(2);
    const sedexValue = ((distancia * 0.04) + (pesoNum * 7.5) + (volume * 0.00005) + 25).toFixed(2);
    
    // Simulação de prazo baseado na distância
    const pacPrazo = Math.min(Math.max(Math.floor(distancia / 100) + 3, 3), 15);
    const sedexPrazo = Math.min(Math.max(Math.floor(distancia / 300) + 1, 1), 5);
    
    // Retorna opções de frete
    return [
        {
            codigo: CORREIOS_CONFIG.servicosPAC,
            nome: 'PAC',
            valor: pacValue,
            prazoEntrega: pacPrazo,
            entregaDomiciliar: true,
            entregaSabado: false
        },
        {
            codigo: CORREIOS_CONFIG.servicosSEDEX,
            nome: 'SEDEX',
            valor: sedexValue,
            prazoEntrega: sedexPrazo,
            entregaDomiciliar: true,
            entregaSabado: true
        }
    ];
}

/**
 * Função principal para calcular frete - escolhe entre API real ou simulação
 * @param {Object} dados - Dados para cálculo
 * @param {boolean} usarSimulacao - Se deve usar simulação (true) ou API real (false)
 * @return {Promise} Promise com resultados do cálculo
 */
async function calcularFrete(dados, usarSimulacao = true) {
    try {
        // Disparar evento de início de cálculo
        document.dispatchEvent(new CustomEvent('freteCalculoIniciado'));
        
        // Escolher entre simulação ou API real
        const resultado = usarSimulacao 
            ? await simularCalculoFrete(dados) 
            : await calcularFreteAPI(dados);
        
        // Disparar evento de conclusão com sucesso
        document.dispatchEvent(new CustomEvent('freteCalculado', {
            detail: { 
                servicos: resultado,
                timestamp: new Date().toISOString()
            }
        }));
        
        return resultado;
    } catch (error) {
        // Disparar evento de erro
        document.dispatchEvent(new CustomEvent('freteCalculoErro', {
            detail: { 
                erro: error.message,
                timestamp: new Date().toISOString()
            }
        }));
        
        throw error;
    }
}

/**
 * Manipula o evento de formulário de cálculo de frete
 * @param {Event} event - Evento de submit do formulário
 */
async function handleFormularioFrete(event) {
    // Prevenir comportamento padrão do formulário
    if (event) event.preventDefault();
    
    // Elementos do formulário - adapte os IDs conforme seu HTML
    const elementos = {
        cepOrigem: document.getElementById('cepOrigem'),
        cepDestino: document.getElementById('cepDestino'),
        peso: document.getElementById('peso'),
        comprimento: document.getElementById('comprimento'),
        largura: document.getElementById('largura'),
        altura: document.getElementById('altura'),
        resultado: document.getElementById('resultado-frete'),
        loading: document.getElementById('loading-frete')
    };
    
    // Mostrar loading
    if (elementos.loading) elementos.loading.style.display = 'block';
    if (elementos.resultado) elementos.resultado.style.display = 'none';
    
    try {
        // Preparar dados para cálculo
        const dados = {
            cepOrigem: elementos.cepOrigem.value,
            cepDestino: elementos.cepDestino.value,
            peso: elementos.peso.value,
            comprimento: elementos.comprimento.value,
            largura: elementos.largura.value,
            altura: elementos.altura.value
        };
        
        // Calcular frete - true para usar simulação, false para API real
        const servicos = await calcularFrete(dados, true);
        
        // Mostrar resultados
        if (elementos.resultado && servicos.length > 0) {
            exibirResultadosFrete(servicos, elementos.resultado);
        } else {
            throw new Error('Nenhuma opção de frete disponível');
        }
    } catch (error) {
        // Mostrar erro
        alert(`Erro ao calcular frete: ${error.message}`);
    } finally {
        // Esconder loading
        if (elementos.loading) elementos.loading.style.display = 'none';
    }
}

/**
 * Exibe os resultados do cálculo de frete na interface
 * @param {Array} servicos - Array de serviços de frete
 * @param {HTMLElement} elementoResultado - Elemento onde mostrar resultados
 */
function exibirResultadosFrete(servicos, elementoResultado) {
    // Limpar resultados anteriores
    elementoResultado.innerHTML = '<h3>Opções de Frete</h3>';
    
    // Criar elemento para cada serviço
    servicos.forEach(servico => {
        const itemElement = document.createElement('div');
        itemElement.className = 'opcao-frete';
        
        // Adaptar conforme o HTML/CSS do seu site
        itemElement.innerHTML = `
            <div class="nome-servico">${servico.nome}</div>
            <div class="prazo">Prazo: ${servico.prazoEntrega} dia(s)</div>
            <div class="valor">${formatarValor(servico.valor)}</div>
            <div class="detalhes">
                <span>${servico.entregaDomiciliar ? 'Entrega domiciliar' : 'Retirada na agência'}</span>
                <span>${servico.entregaSabado ? 'Entrega sábado' : 'Sem entrega sábado'}</span>
            </div>
        `;
        
        // Adicionar ao elemento de resultado
        elementoResultado.appendChild(itemElement);
    });
    
    // Mostrar resultado
    elementoResultado.style.display = 'block';
}

/**
 * Inicializa os comportamentos da calculadora de frete
 */
function inicializarCalculadoraFrete() {
    // Buscar elementos - adapte os IDs conforme seu HTML
    const form = document.getElementById('form-frete');
    const btnCalcular = document.getElementById('calcular-frete');
    const inputsCep = document.querySelectorAll('input[type="text"][id$="cep"], input[id="cepOrigem"], input[id="cepDestino"]');
    
    // Adicionar máscara de CEP
    inputsCep.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    });
    
    // Adicionar evento ao formulário
    if (form) {
        form.addEventListener('submit', handleFormularioFrete);
    }
    
    // Adicionar evento ao botão de calcular
    if (btnCalcular) {
        btnCalcular.addEventListener('click', handleFormularioFrete);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarCalculadoraFrete);

// Exportar funções para uso externo (global)
if (typeof window !== 'undefined') {
    window.correiosFrete = {
        calcular: calcularFrete,
        inicializar: inicializarCalculadoraFrete,
        formatar: {
            cep: formatarCEP,
            valor: formatarValor
        }
    };
}