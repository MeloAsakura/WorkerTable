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
    configuracaoBotaoTimer(elementos);
    opcaoDeTimer(elementos);
    criarPomodoro(elementos)

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

        buttonTimer: li.querySelector('.buttonTimer'),
        tipoTimer: li.querySelector('.tipoTimer'),
        opcaoPomodoro: li.querySelector('.opcaoPomodoro'),
        timerHora: li.querySelector('.timerHora'),

        botaoData: li.querySelector('.buttonData'),
        areaDatas: li.querySelector('.datasInicioeFim'),
        dataInicio: li.querySelector('.dataInicio'),
        dataFim: li.querySelector('.dataFim'),
        resumoDatas: li.querySelector('.textoHidden'),
        horario: li.querySelector('.horario')

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
    const {botaoNotes, areaNotes, inputNotes, resumoNotes} = elementos;

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
    const {dataInicio, dataFim, botaoData, areaDatas} = elementos;

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
    const {dataInicio, dataFim, resumoDatas} = elementos;

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


//============================TIMER=========================//
function configuracaoBotaoTimer(elementos) {
    const {buttonTimer, tipoTimer} = elementos;

    buttonTimer.addEventListener('click', () => {
        if (tipoTimer.classList.contains('aberto')) {
            fecharTimer(elementos);
        } else {
            tipoTimer.classList.add('aberto');
        }
    });
}

function fecharTimer({tipoTimer}) {
    tipoTimer.classList.remove('aberto', 'expandido');
}

function resetarTela({opcaoPomodoro, timerHora, tipoTimer}) {
    opcaoPomodoro.hidden = false;
    timerHora.hidden = false;
    // Correção: .remove() substituído por .hidden = true para preservar o estado do pomodoro ao fechar o painel
    const pomodoro = tipoTimer.querySelector('.pomodoro');
    if (pomodoro) pomodoro.hidden = true;
}

function opcaoDeTimer(elementos) {
    const {opcaoPomodoro, timerHora, tipoTimer} = elementos;

    opcaoPomodoro.addEventListener('click', () => {
        opcaoPomodoro.hidden = true;
        timerHora.hidden = true;
        tipoTimer.classList.add('expandido');
    });
    tipoTimer.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && !tipoTimer.classList.contains('aberto')) {
            resetarTela(elementos);
        }
    });
}

//=======================================POMODORO=========================================//

function criarPomodoro(elementos) {
    // ERRO 1 e 2 corrigidos: buttonTimer extraído de elementos em vez de document.querySelector('.buttonTimer')
    const {tipoTimer, opcaoPomodoro, timerHora, buttonTimer} = elementos

    // ERRO 4 corrigido: verificação !pomodoro.hidden evita ação quando já oculto
    // ERRO 3 corrigido: e.stopPropagation() evita conflito com configuracaoBotaoTimer
    buttonTimer.addEventListener('click', (e) => {
        const pomodoro = tipoTimer.querySelector('.pomodoro')
        if (pomodoro && !pomodoro.hidden) {
            pomodoro.hidden = true
            opcaoPomodoro.hidden = false
            timerHora.hidden = false
            e.stopPropagation()
        }
    })
    tipoTimer.addEventListener('click', (e) => {
        const opPomodoro = e.target.closest('.opcaoPomodoro')
        if (!opPomodoro) return

        opcaoPomodoro.hidden = true
        timerHora.hidden = true

        let hasPomodoro = tipoTimer.querySelector('.pomodoro')
        if (hasPomodoro) {
            hasPomodoro.hidden = false
            return
        }

        const pomodoro = document.createElement('div')
        pomodoro.classList.add('pomodoro')
        pomodoro.innerHTML = `
  <div class="relogio">
    <svg viewBox="0 0 100 100" class="anel">
      <circle class="trilho" cx="50" cy="50" r="45"/>
      <circle class="progresso" cx="50" cy="50" r="45"/>
    </svg>
    <span class="tempo">30:00</span>
  </div>
  <button type="button" class="botaoStart">Start</button>
`;

        tipoTimer.append(pomodoro)
        contador(pomodoro)
    })
}


function contador(elemento) {


    const divPomodoro = elemento
    const divTimer = divPomodoro.querySelector('.relogio')

    const timer = divTimer.querySelector('.tempo')
    const buttonStart = divPomodoro.querySelector('.botaoStart')

    const progresso = divPomodoro.querySelector('.progresso')
    const circunferencia = 2 * Math.PI * 45

    progresso.style.strokeDasharray = circunferencia
    progresso.style.strokeDashoffset = 0

    const [minutos, segundos] = timer.textContent.split(":").map(Number)
    let totalSegundos = minutos * 60 + segundos
    let tempoInicial = totalSegundos

    function formatar(totalSegundos) {
        let minutos = Math.floor(totalSegundos / 60)
        let segundos = totalSegundos % 60

        const m = String(minutos).padStart(2, "0")
        const s = String(segundos).padStart(2, "0")

        return `${m}:${s}`
    }

    function converterParaSegundos(tempo) {
        const partes = tempo.split(':')

        if (partes.length !== 2) return null

        const [minutos, segundos] = partes.map(Number)

        if (
            !Number.isInteger(minutos) ||
            !Number.isInteger(segundos) ||
            minutos < 0 ||
            segundos < 0 ||
            segundos > 59
        ) {
            return null
        }

        const total = minutos * 60 + segundos

        return total > 0 ? total : null
    }

    let intervalo = null

    function inputTimer() {

        timer.addEventListener('dblclick', (e) => {

            if (!e.target.closest('.tempo')) return

            if (intervalo !== null) return

            const divInput = document.createElement('input')
            divInput.classList.add('divInputPomodoro')
            divInput.type = 'text'
            divInput.inputMode = 'numeric'
            divInput.value = timer.textContent

            timer.replaceWith(divInput)
            divInput.focus()


            divInput.addEventListener('input', () => {
                const digitos = divInput.value.replace(/\D/g, '').slice(0, 4)

                divInput.value = digitos.length > 2
                    ? `${digitos.slice(0, 2)}:${digitos.slice(2)}`
                    : digitos
            })

            function completarValor() {
                const digitos = divInput.value.replace(/\D/g, '')

                if (!digitos) {
                    divInput.value = ''
                    return
                }

                const minutos = parseInt(digitos.slice(0, 2), 10)
                const segundos = Math.min(parseInt(digitos.slice(2).padEnd(2, '0'), 10), 59)

                divInput.value = formatar(minutos * 60 + segundos)
            }

            divInput.addEventListener('blur', () => {
                completarValor()
            })
            divInput.addEventListener('keydown', (e) => {

                if (e.key === 'Enter') {
                    completarValor()
                    const input = divInput.value.trim()
                    divInput.value = divInput.value.replace(/[^0-9:]/g, '')
                    const novoTempo = converterParaSegundos(input)

                    if (novoTempo === null) {
                        divInput.focus()
                        return
                    }

                    totalSegundos = novoTempo
                    tempoInicial = novoTempo

                    timer.textContent = formatar(totalSegundos)
                    atualizarAnel()
                    divInput.replaceWith(timer)
                }

                if (e.key === 'Escape') {
                    timer.textContent = formatar(totalSegundos)
                    divInput.replaceWith(timer)
                }
            })
        })
    }

    function atualizarAnel() {
        const proporcao = totalSegundos / tempoInicial
        const offset = circunferencia * (1 - proporcao)
        progresso.style.strokeDashoffset = offset
    }

    function iniciar() {
        if (intervalo !== null || totalSegundos <= 0) return

        intervalo = setInterval(() => {

            totalSegundos--

            timer.textContent = formatar(totalSegundos)
            atualizarAnel()

            if (totalSegundos <= 0) {
                clearInterval(intervalo)
                intervalo = null

                buttonStart.textContent = 'Start'
                alertaTerminado()
            }else{
                intervalo=null
                div
            }

        }, 1000)
    }

    function pausar() {
        clearInterval(intervalo)
        intervalo = null
    }

    function alertaTerminado() {
        const li = divPomodoro.closest('li');
        if (!li) return;

        somConcluido()
        li.classList.add('tarefaConcluida');
    }

    function somConcluido(){
        const audio= document.createElement('audio')
        audio.src='Music/mixkit-happy-bell-alert-601.wav'
        audio.hidden=true
        audio.play()

        divPomodoro.append(audio)
    }
    buttonStart.addEventListener('click', () => {
        if (intervalo !== null) {
            pausar()
            buttonStart.textContent = 'Start'
        } else {
            iniciar()
            buttonStart.textContent = 'Pause'
        }
    })

    inputTimer()
}


//========================================================================================//

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

    inputNovoNome.addEventListener('blur', finalizar, {once: true});
}

function configurarNomeTarefa(elemento) {
    elemento.titulo.addEventListener('dblclick', () => {
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
    const {botaoOpcoes, areaAcoes, li} = elementos;
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
function adicionarTarefaNaLista(tarefa, lista) {
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
