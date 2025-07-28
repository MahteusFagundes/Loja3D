// Script para integração com Mercado Pago

// Configurações do Mercado Pago
const mercadoPagoConfig = {
    publicKey: 'TEST-12345678-abcd-efgh-ijkl-123456789012', // Substitua pela sua chave pública de teste
    preferenceUrl: 'https://api.mercadopago.com/checkout/preferences', // URL de API para criar preferências
};

// Função para inicializar o SDK do Mercado Pago
function inicializarMercadoPago() {
    // Carregar o SDK do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
        // Inicializar objeto do Mercado Pago
        window.mp = new MercadoPago(mercadoPagoConfig.publicKey);
    };
    document.body.appendChild(script);
}

// Função para criar preferência de pagamento
async function criarPreferenciaPagamento(dadosCompra) {
    try {
        // Em um ambiente real, esta requisição seria feita para o seu backend
        // que se comunicaria com a API do Mercado Pago
        // Simulando com um objeto que seria retornado pelo servidor
        
        // Dados que seriam enviados ao servidor
        const dadosPreferencia = {
            items: [
                {
                    id: dadosCompra.produtoId,
                    title: dadosCompra.produto,
                    description: `${dadosCompra.produto} - ${Object.values(dadosCompra.opcoes).join(', ')}`,
                    quantity: 1,
                    unit_price: parseFloat(dadosCompra.preco)
                }
            ],
            shipments: {
                cost: parseFloat(dadosCompra.frete.valor),
                mode: dadosCompra.frete.tipo
            },
            back_urls: {
                success: `${window.location.origin}/sucesso.html`,
                failure: `${window.location.origin}/falha.html`,
                pending: `${window.location.origin}/pendente.html`
            },
            auto_return: 'approved',
            statement_descriptor: 'ANIMATOON3D'
        };
        
        // Simulação da resposta da API
        // Em um ambiente real, esta resposta viria do seu backend que chamaria a API do Mercado Pago
        const preferenceId = `TEST-${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
        
        return { id: preferenceId };
    } catch (error) {
        console.error('Erro ao criar preferência de pagamento:', error);
        throw error;
    }
}

// Função para renderizar botão de pagamento
function renderizarBotaoPagamento(preferenceId) {
    if (!window.mp) {
        console.error('SDK do Mercado Pago não inicializado');
        return;
    }
    
    const bricksBuilder = window.mp.bricks();
    
    // Renderizar botão de pagamento
    bricksBuilder.create('wallet', 'mercadopago-button', {
        initialization: {
            preferenceId: preferenceId
        },
        callbacks: {
            onReady: () => {
                console.log('Botão do Mercado Pago renderizado');
            },
            onSubmit: () => {
                // Evento disparado quando o usuário clica no botão
                console.log('Redirecionando para checkout do Mercado Pago');
            },
            onError: (error) => {
                console.error('Erro no botão do Mercado Pago:', error);
            }
        }
    });
}

// Função principal para processar pagamento
async function processarPagamentoMercadoPago(dadosCompra) {
    try {
        // Criar preferência de pagamento
        const preferencia = await criarPreferenciaPagamento(dadosCompra);
        
        // Renderizar botão de pagamento
        renderizarBotaoPagamento(preferencia.id);
        
        return preferencia.id;
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
        throw error;
    }
}

// Função para processar checkout completo
async function checkout(produtoId, opcoesSelecionadas, freteInfo) {
    // Obter produto
    const produto = getProdutoPorId(produtoId);
    
    if (!produto) {
        alert('Produto não encontrado');
        return;
    }
    
    // Preparar dados da compra
    const dadosCompra = {
        produtoId: produto.id,
        produto: produto.nome,
        preco: produto.preco.toFixed(2),
        opcoes: opcoesSelecionadas,
        frete: freteInfo,
        valorTotal: (produto.preco + parseFloat(freteInfo.valor)).toFixed(2)
    };
    
    try {
        // Processar pagamento
        await processarPagamentoMercadoPago(dadosCompra);
    } catch (error) {
        console.error('Erro no checkout:', error);
    }
}

// Exportar funções para uso em outros scripts
if (typeof window !== 'undefined') {
    window.mercadoPago = {
        inicializar: inicializarMercadoPago,
        checkout: checkout
    };
}