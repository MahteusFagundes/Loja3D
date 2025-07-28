// Função para obter parâmetros da URL
function obterParametroURL(nome) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nome);
}

// Função para carregar detalhes do produto na página de compra
function carregarDetalhesProduto() {
    // Obter ID do produto da URL
    const produtoId = obterParametroURL('produto');
    
    // Se não houver ID do produto, redirecionar para a página de produtos
    if (!produtoId) {
        window.location.href = 'produtos.html';
        return;
    }
    
    // Buscar produto pelo ID
    const produto = getProdutoPorId(produtoId);
    
    // Se o produto não for encontrado, redirecionar para a página de produtos
    if (!produto) {
        window.location.href = 'produtos.html';
        return;
    }
    
    // Atualizar título da página
    document.getElementById('pagina-titulo').textContent = `${produto.nome} - Animatoon 3D`;
    
    // Preencher informações do produto
    document.getElementById('produto-nome').textContent = produto.nome;
    document.getElementById('produto-preco').textContent = `R$ ${produto.preco.toFixed(2)}`;
    document.getElementById('produto-descricao').textContent = produto.descricao;
    
    // Definir imagem principal com tamanho controlado
    const imagemPrincipal = document.getElementById('imagemPrincipal');
    imagemPrincipal.src = `assets/${produto.imagens[0]}`;
    imagemPrincipal.alt = produto.nome;
    
    // Adicionar estilo para controlar o tamanho da imagem
    imagemPrincipal.style.maxWidth = '100%';
    imagemPrincipal.style.maxHeight = '400px';
    imagemPrincipal.style.objectFit = 'contain';
    
    
    
    // Carregar opções de personalização
    const opcoesContainer = document.getElementById('opcoes-personalizacao');
    opcoesContainer.innerHTML = '';
    
    // Para cada tipo de opção (cores, tamanhos, etc.)
    Object.entries(produto.opcoes).forEach(([tipoOpcao, valores]) => {
        const opcaoDiv = document.createElement('div');
        opcaoDiv.className = 'opcao-personalizacao';
        
        const opcaoTitulo = document.createElement('h3');
        // Formatar o nome da opção para exibição (ex: converte 'tamanhos' para 'Tamanhos')
        const tituloFormatado = tipoOpcao.charAt(0).toUpperCase() + tipoOpcao.slice(1);
        opcaoTitulo.textContent = tituloFormatado;
        
        const opcaoSelect = document.createElement('select');
        opcaoSelect.id = `opcao-${tipoOpcao}`;
        opcaoSelect.name = tipoOpcao;
        
        // Adicionar opções ao select
        valores.forEach(valor => {
            const opcao = document.createElement('option');
            opcao.value = valor;
            opcao.textContent = valor;
            opcaoSelect.appendChild(opcao);
        });
        
        opcaoDiv.appendChild(opcaoTitulo);
        opcaoDiv.appendChild(opcaoSelect);
        opcoesContainer.appendChild(opcaoDiv);
    });
}

// Função para calcular frete (simulação com API dos Correios)
function calcularFrete() {
    const cepInput = document.getElementById('cep');
    const resultadoFrete = document.getElementById('resultado-frete');
    const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    // Validar CEP
    if (cep.length !== 8) {
        resultadoFrete.innerHTML = '<p class="erro">CEP inválido. Digite um CEP com 8 dígitos.</p>';
        return;
    }
    
    // Mostrar loading
    resultadoFrete.innerHTML = '<p>Calculando frete...</p>';
    
    // Obter ID do produto atual
    const produtoId = obterParametroURL('produto');
    const produto = getProdutoPorId(produtoId);
    
    // Em um ambiente real, aqui seria feita uma requisição à API dos Correios
    // Como é uma simulação, vamos gerar valores baseados no CEP e no produto
    
    // Simular chamada à API com setTimeout
    setTimeout(() => {
        // Gerar valores de frete baseados no peso do produto e no primeiro dígito do CEP
        const pesoKg = produto.peso;
        const regiaoDigito = parseInt(cep.charAt(0));
        
        // Valores base para cada tipo de frete (em R$ por kg)
        const valorPorKgPAC = 10 + (regiaoDigito * 0.8);
        const valorPorKgSEDEX = 20 + (regiaoDigito * 1.5);
        
        // Calcular valor total do frete
        const valorPAC = (valorPorKgPAC * pesoKg).toFixed(2);
        const valorSEDEX = (valorPorKgSEDEX * pesoKg).toFixed(2);
        
        // Prazos estimados
        const prazoPAC = 3 + regiaoDigito;
        const prazoSEDEX = 1 + Math.floor(regiaoDigito / 3);
        
        // Exibir resultado
        resultadoFrete.innerHTML = `
            <div class="opcoes-frete">
                <div class="opcao-frete">
                    <input type="radio" name="frete" id="frete-pac" value="pac">
                    <label for="frete-pac">PAC: R$ ${valorPAC} (${prazoPAC} dias úteis)</label>
                </div>
                <div class="opcao-frete">
                    <input type="radio" name="frete" id="frete-sedex" value="sedex">
                    <label for="frete-sedex">SEDEX: R$ ${valorSEDEX} (${prazoSEDEX} dias úteis)</label>
                </div>
            </div>
        `;
    }, 1000); // Simular 1 segundo de processamento
}

// Formatação automática do campo CEP
function formatarCEP() {
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            let cep = e.target.value.replace(/\D/g, ''); // Remove não-números
            
            if (cep.length > 5) {
                cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
            }
            
            e.target.value = cep;
        });
    }
}

// Função para integração com Mercado Pago
function abrirMercadoPago() {
    // Obter ID do produto atual
    const produtoId = obterParametroURL('produto');
    const produto = getProdutoPorId(produtoId);
    
    // Obter opções selecionadas pelo usuário
    const opcoesSelecionadas = {};
    Object.keys(produto.opcoes).forEach(tipoOpcao => {
        const select = document.getElementById(`opcao-${tipoOpcao}`);
        if (select) {
            opcoesSelecionadas[tipoOpcao] = select.value;
        }
    });
    
    // Obter opção de frete selecionada
    let freteOpcao = '';
    let freteValor = 0;
    const fretePAC = document.getElementById('frete-pac');
    const freteSEDEX = document.getElementById('frete-sedex');
    
    if (fretePAC && fretePAC.checked) {
        freteOpcao = 'PAC';
        // Extrair valor do texto do label
        const labelPAC = document.querySelector('label[for="frete-pac"]');
        if (labelPAC) {
            const match = labelPAC.textContent.match(/R\$ (\d+\.\d+)/);
            if (match) {
                freteValor = parseFloat(match[1]);
            }
        }
    } else if (freteSEDEX && freteSEDEX.checked) {
        freteOpcao = 'SEDEX';
        // Extrair valor do texto do label
        const labelSEDEX = document.querySelector('label[for="frete-sedex"]');
        if (labelSEDEX) {
            const match = labelSEDEX.textContent.match(/R\$ (\d+\.\d+)/);
            if (match) {
                freteValor = parseFloat(match[1]);
            }
        }
    }
    
    // Verificar se uma opção de frete foi selecionada
    if (!freteOpcao) {
        alert('Por favor, selecione uma opção de frete antes de continuar.');
        return;
    }
    
    // Calcular valor total
    const valorTotal = produto.preco + freteValor;
    
    // Em um ambiente real, aqui seria feita a integração com o SDK do Mercado Pago
    // Para simular, vamos apenas exibir um alerta com os dados que seriam enviados
    
    const dadosCompra = {
        produto: produto.nome,
        preco: produto.preco.toFixed(2),
        opcoes: opcoesSelecionadas,
        frete: {
            tipo: freteOpcao,
            valor: freteValor.toFixed(2)
        },
        valorTotal: valorTotal.toFixed(2)
    };
    
    alert(`
        Redirecionando para o Mercado Pago...
        
        Produto: ${dadosCompra.produto}
        Preço: R$ ${dadosCompra.preco}
        Opções: ${JSON.stringify(dadosCompra.opcoes)}
        Frete: ${dadosCompra.frete.tipo} - R$ ${dadosCompra.frete.valor}
        Valor Total: R$ ${dadosCompra.valorTotal}
    `);
    
    // Em um cenário real, aqui seria aberto o Mercado Pago em um iframe ou redirecionamento
    // window.location.href = 'https://www.mercadopago.com.br/checkout...';
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    carregarDetalhesProduto();
    formatarCEP();
});

// Função para obter produto por ID (caso o arquivo produtos.js não esteja disponível)
function getProdutoPorId(id) {
    // Verificar se a função já existe (importada de produtos.js)
    if (typeof window.getProdutoPorId === 'function') {
        return window.getProdutoPorId(id);
    }
    
    // Se não existir, usar os produtos definidos aqui (duplicação para independência dos scripts)
    const produtosDefault = [
        {
            id: 'luminaria-acdc',
            nome: 'Luminária ACDC',
            preco: 149.90,
            descricao: 'Luminária como nome da banda ACDC com textura realista e iluminação LED',
            imagens: ['acdc-produto1.jpg', ],
            categorias: ['luminaria', 'musica'],
            peso: 0.5,
            opcoes: {
                
                
                    
            }
        },
        {
            id: 'luminaria-dino',
            nome: 'Luminária Dino',
            preco: 179.90,
            descricao: 'Luminária personalizada com tema especial de um dinossauro',
            imagens: ['dino.jpg', ],
            categorias: ['luminaria', 'infantil'],
            peso: 0.7,
            opcoes: {
                
            }
        },
        {
            id: 'chaveiros-emotes',
            nome: 'Chaveiros de emotes',
            preco: 19.90,
            descricao: 'Chaveiro de emotes para te acompanhar no dia a dia',
            imagens: ['emoticom.jpg',],
            categorias: ['acessorios', 'chaveiros'],
            peso: 0.05,
            opcoes: {
                modelos: ['Feliz', 'Triste', 'Apaixonado', 'Surpreso'],
                cores: ['Amarelo', 'Azul', 'Verde', 'Vermelho']
            }
        }
    ];
    
    return produtosDefault.find(produto => produto.id === id);
}