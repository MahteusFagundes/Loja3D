// Array com todos os produtos da loja
const produtos = [
    {
        id: 'luminaria-acdc',
        nome: 'Luminária ACDC',
        preco: 149.90,
        descricao: 'Luminária como nome da banda ACDC com textura realista e iluminação LED',
        imagens: ['acdc-produto1.jpg', 'acdc-produto2.jpg', 'acdc-produto3.jpg'],
        categorias: ['luminaria', 'musica'],
        peso: 0.5, // em kg
        dimensoes: {
            altura: 20,
            largura: 30,
            comprimento: 10
        },
        opcoes: {
           
        }
    },
    {
        id: 'luminaria-dino',
        nome: 'Luminária Dino',
        preco: 179.90,
        descricao: 'Luminária personalizada com tema especial de um dinossauro',
        imagens: ['dino.jpg', 'dino-2.jpg', 'dino-3.jpg'],
        categorias: ['luminaria', 'infantil'],
        peso: 0.7, // em kg
        dimensoes: {
            altura: 25,
            largura: 20,
            comprimento: 15
        },
        opcoes: {
            
        }
    },
    {
        id: 'chaveiros-emotes',
        nome: 'Chaveiros de emotes',
        preco: 19.90,
        descricao: 'Chaveiro de emotes para te acompanhar no dia a dia',
        imagens: ['emoticom.jpg', 'emoticom-2.jpg', 'emoticom-3.jpg'],
        categorias: ['acessorios', 'chaveiros'],
        peso: 0.05, // em kg
        dimensoes: {
            altura: 5,
            largura: 5,
            comprimento: 1
        },
        opcoes: {
            modelos: ['Feliz', 'Triste', 'Apaixonado', 'Surpreso'],
           
        }
    },
    {
        id: 'porta-caneta',
        nome: 'Porta Caneta Personalizado',
        preco: 39.90,
        descricao: 'Porta caneta personalizado com design exclusivo para seu escritório',
        imagens: ['porta-caneta.jpg', 'porta-caneta-2.jpg'],
        categorias: ['escritorio', 'decoracao'],
        peso: 0.3, // em kg
        dimensoes: {
            altura: 10,
            largura: 8,
            comprimento: 8
        },
        opcoes: {
           
        }
    },
    {
        id: 'luminaria-lua',
        nome: 'Luminária Lua 3D',
        preco: 129.90,
        descricao: 'Luminária em formato de lua com superfície texturizada e iluminação LED',
        imagens: ['lua.jpg', 'lua-2.jpg', 'lua-3.jpg'],
        categorias: ['luminaria', 'decoracao'],
        peso: 0.6, // em kg
        dimensoes: {
            altura: 15,
            largura: 15,
            comprimento: 15
        },
        opcoes: {
           
        }
    }
];

// Função para carregar todos os produtos na página de produtos
function carregarProdutos() {
    const produtosContainer = document.getElementById('produtos-container');
    
    // Se o container não existir, sair da função
    if (!produtosContainer) return;
    
    // Limpar o container antes de adicionar produtos
    produtosContainer.innerHTML = '';
    
    // Adicionar cada produto ao container
    produtos.forEach(produto => {
        // Criar card de produto
        const produtoCard = document.createElement('div');
        produtoCard.className = 'product-card';
        
        // Criar a imagem do produto
        const imagemContainer = document.createElement('div');
        imagemContainer.className = 'product-image';
        
        const imagem = document.createElement('img');
        imagem.src = `assets/${produto.imagens[0]}`;
        imagem.alt = produto.nome;
        
        imagemContainer.appendChild(imagem);
        produtoCard.appendChild(imagemContainer);
        
        // Criar informações do produto
        const infoContainer = document.createElement('div');
        infoContainer.className = 'product-info';
        
        const nome = document.createElement('h3');
        nome.textContent = produto.nome;
        
        const descricao = document.createElement('p');
        descricao.textContent = produto.descricao;
        
        const preco = document.createElement('span');
        preco.className = 'price';
        preco.textContent = `R$ ${produto.preco.toFixed(2)}`;
        
        const botaoComprar = document.createElement('a');
        botaoComprar.href = `compra.html?produto=${produto.id}`;
        botaoComprar.className = 'btn';
        botaoComprar.textContent = 'Comprar Agora';
        
        // Adicionar elementos à info container
        infoContainer.appendChild(nome);
        infoContainer.appendChild(descricao);
        infoContainer.appendChild(preco);
        infoContainer.appendChild(botaoComprar);
        
        // Adicionar info container ao card
        produtoCard.appendChild(infoContainer);
        
        // Adicionar card ao container principal
        produtosContainer.appendChild(produtoCard);
    });
}

// Inicializar a página de produtos quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
});

// Função para buscar um produto pelo ID
function getProdutoPorId(id) {
    return produtos.find(produto => produto.id === id);
}

// Exportar funções e dados para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { produtos, getProdutoPorId };
}