
const nomeTarefa = document.getElementById('nomeTarefa');
const modeloTarefa = document.getElementById('modeloTarefa');
const listaTarefa = document.querySelector('.listaDeTarefas');
const buttonAddTarefa = document.querySelector('.buttonAdicionar');




// Cria uma tarefa e coordena suas configurações
function criarTarefa(titulo, lista) {
    titulo = titulo.trim();
    if (titulo === '') return;

    const tarefa = modeloTarefa.content.cloneNode(true);
    const li = tarefa.querySelector('li');

    const elementos = obterElementosTarefa(li);

    configurarTitulo(elementos, titulo);
    configurarRemocao(elementos);
    configurarNomeTarefa(elementos)
    configurarConclusao(elementos);
    configurarNotes(elementos);
    configurarDatas(elementos);
    configurarOpcoes(elementos);

    adicionarTarefaNaLista(tarefa, lista);
}

// Centraliza os seletores dos elementos da tarefa
function obterElementosTarefa(li) {
    return {
        li,
        titulo: li.querySelector('.textoTitulo'),
        botaoRemover: li.querySelector('.buttonRemover'),
        botaoConcluido: li.querySelector('.buttonConcluido'),
        botaoOpcoes: li.querySelector('.buttonOpcoes'),
        areaAcoes: li.querySelector('.acoes'),

        botaoNotes: li.querySelector('.buttonNotes'),
        areaNotes: li.querySelector('.descricaoNotes'),
        inputNotes: li.querySelector('.inputDescricao'),
        resumoNotes: li.querySelector('.descricaoHidden'),

        botaoData: li.querySelector('.buttonData'),
        areaDatas: li.querySelector('.datasInicioeFim'),
        dataInicio: li.querySelector('.dataInicio'),
        dataFim: li.querySelector('.dataFim'),
        resumoDatas: li.querySelector('.textoHidden')
    };
}

// Define o título da tarefa
function configurarTitulo(elementos, titulo) {
    elementos.titulo.textContent = titulo;
}

// Remove a tarefa da lista
function configurarRemocao(elementos) {
    elementos.botaoRemover.addEventListener('click', () => {
        elementos.li.remove();
    });
}

// Alterna o estado de conclusão
function configurarConclusao(elementos) {
    const botao = elementos.botaoConcluido;

    botao.setAttribute('aria-pressed', 'false');

    botao.addEventListener('click', () => {
        const concluida = botao.getAttribute('aria-pressed') !== 'true';

        botao.setAttribute('aria-pressed', String(concluida));
        elementos.li.classList.toggle('tarefaConcluida', concluida);
    });
}

// Configura a área de descrição da tarefa
function configurarNotes(elementos) {
    const { botaoNotes, areaNotes, inputNotes, resumoNotes } = elementos;

    botaoNotes.setAttribute('aria-expanded', 'false');

    botaoNotes.addEventListener('click', () => {
        alternarNotes(areaNotes, botaoNotes, inputNotes);
    });

    inputNotes.addEventListener('input', () => {
        atualizarResumoNotes(inputNotes, resumoNotes);
    });

    inputNotes.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter' && !evento.shiftKey) {
            evento.preventDefault();
            fecharNotes(areaNotes, botaoNotes);
        }
    });
}

// Abre ou fecha a descrição
function alternarNotes(area, botao, input) {
    const vaiAbrir = area.hidden;

    area.hidden = !vaiAbrir;
    botao.setAttribute('aria-expanded', String(vaiAbrir));

    if (vaiAbrir) {
        input.focus();
    }
}

// Fecha a descrição e devolve o foco ao botão
function fecharNotes(area, botao) {
    area.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    botao.focus();
}


// Atualiza o resumo da descrição
function atualizarResumoNotes(input, resumo) {
    const texto = input.value.trim();

    resumo.textContent = texto;
    resumo.hidden = texto === '';
}

// Configura os campos de data
function configurarDatas(elementos) {
    const { dataInicio, dataFim, botaoData, areaDatas } = elementos;

    botaoData.addEventListener('click', () => {
        alternarDatas(areaDatas, botaoData);
    });

    if (typeof flatpickr !== 'function') return;

    flatpickr(dataInicio, {
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: () => atualizarResumoDatas(elementos)
    });

    flatpickr(dataFim, {
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: () => atualizarResumoDatas(elementos)
    });
}

// Abre ou fecha os campos de data
function alternarDatas(area, botao) {
    const vaiAbrir = area.hidden;

    area.hidden = !vaiAbrir;
    botao.setAttribute('aria-expanded', String(vaiAbrir));
}

// Atualiza o resumo das datas escolhidas
function atualizarResumoDatas(elementos) {
    const { dataInicio, dataFim, resumoDatas } = elementos;

    const inicio = dataInicio.value.trim();
    const fim = dataFim.value.trim();

    if (!inicio && !fim) {
        resumoDatas.textContent = '';
        resumoDatas.hidden = true;
        return;
    }

    resumoDatas.textContent = `Início: ${inicio || 'Não definido'} | Fim: ${fim || 'Não definido'}`;
    resumoDatas.hidden = false;
}


function editarNomeTarefa(li) {
    const liNomeTarefa = li.querySelector('.textoTitulo');

    const inputNovoNome = document.createElement('input');
    inputNovoNome.value = liNomeTarefa.textContent;

    liNomeTarefa.replaceWith(inputNovoNome);
    inputNovoNome.select();

    function finalizar() {
        const novoNome = inputNovoNome.value.trim();
        if (novoNome) liNomeTarefa.textContent = novoNome;
        inputNovoNome.replaceWith(liNomeTarefa);
    }

    inputNovoNome.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finalizar();
    });

    inputNovoNome.addEventListener('blur', finalizar, { once: true });
}

function configurarNomeTarefa(elemento){
    elemento.titulo.addEventListener('dblclick',()=>{
        editarNomeTarefa(elemento.li)
    })
}

// Alterna a visibilidade das opções
function alternarOpcoes(textoTopo, botaoOpcoes) {
    textoTopo.classList.toggle('opcoes-abertas');
    const isOpen = textoTopo.classList.contains('opcoes-abertas');
    botaoOpcoes.setAttribute('aria-expanded', String(isOpen));
}

// Configura o botão de opções
function configurarOpcoes(elementos) {
    const { botaoOpcoes, areaAcoes, li } = elementos;
    botaoOpcoes.setAttribute('aria-expanded', 'false');
    botaoOpcoes.addEventListener('click', (e) => {
        e.stopPropagation();
        alternarOpcoes(areaAcoes.parentElement, botaoOpcoes);
    });
}

// Fecha todos os dropdowns abertos ao clicar fora
document.addEventListener('click', (e) => {
    // Fecha dropdowns de ações
    document.querySelectorAll('.textoTopo.opcoes-abertas').forEach(textoTopo => {
        if (!textoTopo.contains(e.target)) {
            textoTopo.classList.remove('opcoes-abertas');
            const botao = textoTopo.querySelector('.buttonOpcoes');
            if (botao) botao.setAttribute('aria-expanded', 'false');
        }
    });
});

// Adiciona a tarefa ao final da lista
function adicionarTarefaNaLista(tarefa,lista) {
    lista.appendChild(tarefa);
}

/*--------------------Criar nova Box---------------------------*/

function adicionarNaBoxOriginal() {
    criarTarefa(nomeTarefa.value, listaTarefa);
    nomeTarefa.value = '';
}


if (buttonAddTarefa && nomeTarefa) {
    buttonAddTarefa.addEventListener('click', adicionarNaBoxOriginal);

    nomeTarefa.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            adicionarNaBoxOriginal();
        }
    });
}
