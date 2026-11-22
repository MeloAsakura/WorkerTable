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
  <!-- COMO FOI FEITO: Container para os ciclos de pomodoro completados -->
  <!-- Cada ciclo é um <div class="ciclo"> criado dinamicamente -->
  <!-- pela função ciclosPomodoro() quando o timer termina. -->
  <div class="ciclos"></div>
`;

        tipoTimer.append(pomodoro)
        contador(pomodoro)
    })
}


/**
 * Inicializa um timer Pomodoro dentro de um elemento.
 *
 * Estrutura HTML esperada dentro de `elemento`:
 *   .relogio > .tempo   -> texto no formato "MM:SS" (ex.: "25:00")
 *   .botaoStart         -> botão Start/Pause
 *   .progresso          -> <circle> do SVG usado como anel de progresso
 *
 * Retorna uma função `destruir()` que deve ser chamada quando a tarefa for
 * removida da tela (para parar o timer e remover a miniatura do DOM).
 */
function contador(elemento) {

    // =====================================================================
    // FUNÇÕES AUXILIARES (puras, não dependem do estado do timer)
    // =====================================================================

    // Converte segundos totais em "MM:SS". Ex.: 90 -> "01:30"
    // (nomes min/seg evitam sombrear as variáveis de fora)
    function formatar(total) {
        const min = Math.floor(total / 60)
        const seg = total % 60

        return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
    }

    // Converte "MM:SS" em segundos totais.
    // Retorna null se o formato for inválido ou se o tempo for zero.
    function converterParaSegundos(tempo) {
        const partes = tempo.split(':')

        if (partes.length !== 2) return null

        const [min, seg] = partes.map(Number)

        if (
            !Number.isInteger(min) ||
            !Number.isInteger(seg) ||
            min < 0 ||
            seg < 0 ||
            seg > 59
        ) {
            return null
        }

        const total = min * 60 + seg

        return total > 0 ? total : null
    }

    // =====================================================================
    // REFERÊNCIAS DO DOM
    // =====================================================================

    const divPomodoro = elemento
    const divTimer = divPomodoro.querySelector('.relogio')
    const timer = divTimer.querySelector('.tempo')
    const buttonStart = divPomodoro.querySelector('.botaoStart')
    const progresso = divPomodoro.querySelector('.progresso')

    // OPÇÃO 2: Referência ao botão do timer e painel para transformar o botão em miniatura
    // Em vez de criar um <span> separado, o próprio buttonTimer mostra o tempo
    const liTarefa = divPomodoro.closest('li')
    const buttonTimer = liTarefa ? liTarefa.querySelector('.buttonTimer') : null
    const tipoTimer = liTarefa ? liTarefa.querySelector('.tipoTimer') : null
    // Guardamos o HTML original do botão para restaurar quando o painel abrir
    const buttonTimerHTMLOriginal = buttonTimer ? buttonTimer.innerHTML : ''

    // =====================================================================
    // ESTADO
    // =====================================================================

    // Lê o tempo inicial do HTML. Se estiver inválido ou "00:00",
    // usa 25:00 como padrão (evita divisão por zero / NaN no anel).
    const TEMPO_PADRAO = 25 * 60
    let tempoInicial = converterParaSegundos(timer.textContent.trim()) ?? TEMPO_PADRAO
    let totalSegundos = tempoInicial
    timer.textContent = formatar(totalSegundos)

    let intervalo = null // id do setInterval (null = timer parado)

    // =====================================================================
    // ANEL DE PROGRESSO
    // =====================================================================

    // Lê o raio direto do SVG; se não conseguir, usa 45 como fallback
    const raio = progresso.r?.baseVal?.value || 45
    const circunferencia = 2 * Math.PI * raio

    progresso.style.strokeDasharray = circunferencia
    progresso.style.strokeDashoffset = 0

    // Atualiza o anel conforme a proporção de tempo restante
    function atualizarAnel() {
        const proporcao = totalSegundos / tempoInicial
        progresso.style.strokeDashoffset = circunferencia * (1 - proporcao)
    }

    // =====================================================================
    // OPÇÃO 2: BOTÃO TIMER VIRA MINIATURA
    // =====================================================================
    // COMO FOI FEITO: Em vez de criar um <span> separado (miniaturaPomodoro) e
    // anexá-lo a .caixaDeTarefas, o próprio buttonTimer é transformado para
    // mostrar o tempo formatado ao lado do ícone do relógio.
    //
    // Quando o painel do timer (.tipoTimer) está aberto/expandido, o botão
    // volta ao ícone original. Quando o painel fecha, o botão mostra "🕐 MM:SS".
    //
    // Isso foi feito substituindo o innerHTML do buttonTimer dinamicamente
    // a cada tick do timer, e restaurando o HTML original ao abrir o painel.
    // =====================================================================

    // Função que verifica se o painel do timer está visível na tela
    // Usado para decidir se o botão deve mostrar o tempo ou o ícone original
    function painelEstaVisivel() {
        return tipoTimer && (tipoTimer.classList.contains('aberto') || tipoTimer.classList.contains('expandido'))
    }

    // Flag para saber se o pomodoro já foi iniciado pelo usuário
    // A miniatura só aparece depois que o timer é iniciado, não na criação
    let pomodoroIniciado = false

    // Atualiza o botão do timer para mostrar o tempo ou o ícone original
    // COMO FOI FEITO: A cada chamada, verifica se o painel está visível.
    // Se estiver visível, restaura o ícone SVG original.
    // Se estiver escondido E o pomodoro foi iniciado, substitui o conteúdo
    // por ícone + tempo formatado. Se o pomodoro não foi iniciado, não altera o botão.
    function atualizarBotaoTimer() {
        if (!buttonTimer) return

        if (painelEstaVisivel()) {
            // Painel aberto: restaura o ícone original do botão
            buttonTimer.innerHTML = buttonTimerHTMLOriginal
            buttonTimer.classList.remove('pomodoroAtivo')
        } else if (pomodoroIniciado) {
            // Painel fechado e pomodoro já foi iniciado: botão vira a miniatura
            // Formato: ícone de relógio + tempo "MM:SS"
            buttonTimer.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg"
                     width="16" height="16"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="2"
                     stroke-linecap="round"
                     stroke-linejoin="round"
                     style="margin-right: 4px;">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="tempoMiniatura">${formatar(totalSegundos)}</span>
            `
            buttonTimer.classList.add('pomodoroAtivo')
        } else {
            buttonTimer.addEventListener('dblclick', () => {
                buttonTimer.classList.remove('pomodoroAtivo')

            })

        }
    }

    // Renomeada de atualizarMiniatura para atualizarBotaoTimer
    // Agora chama a função acima em vez de atualizar um <span> separado
    function atualizarMiniatura() {
        atualizarBotaoTimer()
    }

    // O clique no buttonTimer para abrir/fechar o painel já é gerenciado por
    // configuracaoBotaoTimer() (linha ~190). Não é necessário adicionar outro
    // listener aqui — o botão já abre o painel ao ser clicado, mesmo mostrando
    // o tempo da miniatura.

    // =====================================================================
    // EFEITOS DE FIM DE TIMER
    // =====================================================================

    function alertaTerminado() {
        const li = divPomodoro.closest('li')
        if (!li) return
        li.classList.add('tarefaConcluida')
    }

    function ciclosPomodoro() {
        if (tipoTimer && tipoTimer.classList.contains('expandido')) {

            const pomodoroAbertoExpandido = divPomodoro
            const ciclosContainer = pomodoroAbertoExpandido.querySelector('.ciclos')

            const ciclo = document.createElement('button')
            ciclo.classList.add('ciclo')
            ciclo.textContent = '+'

            if (!ciclosContainer) return

            ciclosContainer.append(ciclo)

            ciclo.addEventListener('click',(e)=>{
                const circuloDeCiclo = document.createElement('div')
                circuloDeCiclo.classList.add('circuloDeCiclo')
                circuloDeCiclo.style.width='20px'
                circuloDeCiclo.style.height='20px'
                circuloDeCiclo.style.background='black'

                ciclosContainer.append(circuloDeCiclo)
            })

        }
    }

    ciclosPomodoro()

    function somConcluido() {
        // `new Audio` não cria elemento no DOM, então nada se acumula.
        // O .catch evita erro no console se o navegador bloquear o autoplay.
        new Audio('Music/mixkit-happy-bell-alert-601.wav').play().catch(() => {
        })
    }

    // =====================================================================
    // CONTROLE DO TIMER
    // =====================================================================

    function iniciar() {
        if (intervalo !== null || totalSegundos <= 0) return

        // Marca que o pomodoro foi iniciado — a miniatura agora aparece no botão
        pomodoroIniciado = true

        const li = divPomodoro.closest('li')
        if (li) li.classList.remove('tarefaConcluida')

        const fim = Date.now() + totalSegundos * 1000

        intervalo = setInterval(() => {
            totalSegundos = Math.max(0, Math.ceil((fim - Date.now()) / 1000))

            timer.textContent = formatar(totalSegundos)
            atualizarAnel()
            atualizarMiniatura()

            if (totalSegundos <= 0) finalizar()
        }, 250) // 250ms deixa a atualização precisa sem pesar
    }

    function pausar() {
        clearInterval(intervalo)
        intervalo = null
        atualizarMiniatura()
    }

    // Chamado quando o tempo chega a zero
    function finalizar() {
        clearInterval(intervalo)
        intervalo = null

        // Volta para o tempo inicial, pronto para recomeçar
        totalSegundos = tempoInicial
        timer.textContent = formatar(totalSegundos)
        buttonStart.textContent = 'Start'

        atualizarAnel()
        atualizarMiniatura()

        alertaTerminado()
        somConcluido()
    }

    // =====================================================================
    // EDIÇÃO DO TEMPO (duplo clique no relógio)
    // =====================================================================

    function inputTimer() {

        timer.addEventListener('dblclick', () => {

            // Não permite editar enquanto o timer está rodando
            if (intervalo !== null) return

            const divInput = document.createElement('input')
            divInput.classList.add('divInputPomodoro')
            divInput.type = 'text'
            divInput.inputMode = 'numeric'
            divInput.value = timer.textContent

            timer.replaceWith(divInput)
            divInput.focus()

            // Flag que impede a lógica de rodar duas vezes: ao fazer
            // replaceWith, o navegador pode disparar `blur` no input.
            let encerrado = false

            // Aceita só dígitos (máx. 4) e insere o ":" automaticamente
            divInput.addEventListener('input', () => {
                const digitos = divInput.value.replace(/\D/g, '').slice(0, 4)

                divInput.value = digitos.length > 2
                    ? `${digitos.slice(0, 2)}:${digitos.slice(2)}`
                    : digitos
            })

            // Completa/normaliza o que foi digitado. Ex.: "12:5" -> "12:05"
            function completarValor() {
                const digitos = divInput.value.replace(/\D/g, '')

                if (!digitos) {
                    divInput.value = ''
                    return
                }

                const min = parseInt(digitos.slice(0, 2), 10)
                // padStart: "5" vira "05" (5 segundos). Antes era padEnd ("50").
                const seg = Math.min(parseInt(digitos.slice(2).padStart(2, '0'), 10), 59)

                divInput.value = formatar(min * 60 + seg)
            }

            // Fecha o input e devolve o <span> do relógio ao DOM.
            // salvar = true  -> aplica o novo tempo (se for válido)
            // salvar = false -> descarta a edição
            function encerrarEdicao(salvar) {
                if (encerrado) return
                encerrado = true

                if (salvar) {
                    const novoTempo = converterParaSegundos(divInput.value.trim())

                    if (novoTempo !== null) {
                        totalSegundos = novoTempo
                        tempoInicial = novoTempo
                    }
                }

                // Sempre reexibe o tempo atual (novo ou antigo)
                timer.textContent = formatar(totalSegundos)
                divInput.replaceWith(timer)

                atualizarAnel()
                atualizarMiniatura()
            }

            // Clicou fora: aplica se for válido, senão descarta.
            // (Antes o input ficava preso na tela e o relógio sumia.)
            divInput.addEventListener('blur', () => {
                completarValor()
                encerrarEdicao(true)
            })

            divInput.addEventListener('keydown', (e) => {

                if (e.key === 'Enter') {
                    completarValor()

                    // Valor inválido (ex.: vazio ou 00:00): mantém o foco
                    // para o usuário corrigir.
                    if (converterParaSegundos(divInput.value.trim()) === null) {
                        divInput.focus()
                        return
                    }

                    encerrarEdicao(true)
                }

                if (e.key === 'Escape') {
                    encerrarEdicao(false)
                }
            })
        })
    }

    // =====================================================================
    // BOTÃO START / PAUSE
    // =====================================================================

    buttonStart.addEventListener('click', () => {
        if (intervalo !== null) {
            pausar()
            buttonStart.textContent = 'Start'
        } else {
            iniciar()
            buttonStart.textContent = 'Pause'
        }
    })

    // =====================================================================
    // INICIALIZAÇÃO
    // =====================================================================

    inputTimer()
    atualizarAnel()
    atualizarMiniatura()

    // OPÇÃO 2: Quando o painel do timer fecha (transição de opacity termina),
    // o botão é atualizado para mostrar o tempo
    // COMO FOI FEITO: Adicionado listener no transitionend do tipoTimer para
    // chamar atualizarBotaoTimer() assim que o painel desaparecer, garantindo
    // que o botão mostre o tempo "MM:SS" ao lado do ícone.
    if (tipoTimer) {
        tipoTimer.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity') {
                atualizarBotaoTimer()
            }
        })
    }

    // OPÇÃO 2: Limpeza atualizada — não há mais <span> miniatura para remover
    // COMO FOI FEITO: Removida a linha `miniaturaPomodoro.remove()` porque a miniatura
    // agora é o próprio buttonTimer, que faz parte do DOM da tarefa e será removido
    // junto com o elemento <li> quando a tarefa for deletada.
    // Resta apenas parar o intervalo e restaurar o botão ao estado original.
    return function destruir() {
        clearInterval(intervalo)
        intervalo = null
        // Restaurar o botão ao ícone original, caso ainda exista
        if (buttonTimer) {
            buttonTimer.innerHTML = buttonTimerHTMLOriginal
            buttonTimer.classList.remove('pomodoroAtivo')
        }
    }
}


//========================================================================================//

function editarNomeTarefa(li) {
    const liNomeTarefa = li.querySelector('.textoTitulo');

    const inputNovoNome = document.createElement('input');
    inputNovoNome.style.width = '150px'
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
