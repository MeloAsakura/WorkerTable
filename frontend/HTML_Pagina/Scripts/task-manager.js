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
    configurarParticipantes(elementos);
    configuracaoBotaoTimer(elementos);
    opcaoDeTimer(elementos);
    criarPomodoro(elementos)
    criarHora(elementos)


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

        buttonParticipantes:li.querySelector('.buttonParticipantes'),

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
//============================PARTICIPANTES=================//

function configurarParticipantes(elementos) {
    const {buttonParticipantes,li} = elementos

    function divDeParticipantes() {
        if (li.querySelector('.participantes')) return;

        const createDivParticipante = document.createElement('div')
        const inputParticipantes = inputParticipante()
        const inputEmails = inputEmailParticipante()
        const cont=contadorParticipantes()

        createDivParticipante.append(inputParticipantes, inputEmails)
        createDivParticipante.classList.add('participantes');
        li.append(createDivParticipante,cont);

    }

    function impedirAutofill(input) {
        input.autocomplete = 'new-password';
        input.setAttribute('data-form-type', 'other');
        input.setAttribute('data-lpignore', 'true');
        input.setAttribute('data-1p-ignore', '');
        input.setAttribute('data-bwignore', 'true');
    }

    function inputParticipante() {
        const inputParticipantes = document.createElement('input');
        inputParticipantes.classList.add('inputParticipantes');
        inputParticipantes.type = 'text';
        inputParticipantes.name = 'participante-nome';
        inputParticipantes.placeholder = 'Nome do participante';
        inputParticipantes.setAttribute('aria-label', 'Nome do participante');
        impedirAutofill(inputParticipantes);

        return inputParticipantes
    }

    function inputEmailParticipante(){
        const inputEmailParticantes = document.createElement('input');
        inputEmailParticantes.classList.add('inputEmailParticipante');
        inputEmailParticantes.type = 'email';
        inputEmailParticantes.name = 'participante-email';
        inputEmailParticantes.required = true;
        inputEmailParticantes.placeholder = 'Email do participante';
        inputEmailParticantes.setAttribute('aria-label', 'Email do participante');
        impedirAutofill(inputEmailParticantes);

        return inputEmailParticantes;
    }

    function contadorParticipantes(){
        const contadorPart = document.createElement('span')
        contadorPart.classList.add('contadorPart')
        contadorPart.text='1'
        contadorPart.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <circle cx="12" cy="8" r="4"></circle>
                                <path d="M4 21a8 8 0 0 1 16 0"></path>
                            </svg>
       <span class="contadorNum">1</span>`;

        return contadorPart
    }
    let cont=0
    buttonParticipantes.addEventListener('click',()=>{
        let contadorSpan=document.querySelector('.contadorNum')
        cont++;
        contadorSpan.textContent=cont;

    })


}


//============================TIMER=========================//
function configuracaoBotaoTimer(elementos) {
    const {buttonTimer, tipoTimer} = elementos;

    buttonTimer.addEventListener('click', () => {
        if (tipoTimer.classList.contains('aberto')) {
            fecharTimer(elementos);
        } else {
            definirTarefaAtiva(elementos);
            tipoTimer.classList.add('aberto');
        }
    });
}

function fecharTimer({tipoTimer}) {
    tipoTimer.classList.remove('aberto', 'expandido');
}

function resetarTela({opcaoPomodoro, timerHora, tipoTimer,horario}) {
    opcaoPomodoro.hidden = false;
    timerHora.hidden = false;
    horario.hidden = true;
    horario.setAttribute('aria-expanded', 'false');
    const pomodoro = tipoTimer.querySelector('.pomodoro');
    if (pomodoro) pomodoro.hidden = true;
}

function opcaoDeTimer(elementos) {
    const {opcaoPomodoro, timerHora, tipoTimer,horario} = elementos;

    opcaoPomodoro.addEventListener('click', () => {
        opcaoPomodoro.hidden = true;
        timerHora.hidden = true;
        tipoTimer.classList.add('expandido');
    });
    timerHora.addEventListener('click',()=>{
        opcaoPomodoro.hidden=true
        timerHora.hidden=true
        horario.hidden=false
        horario.setAttribute('aria-expanded', 'true');
        tipoTimer.classList.add('expandido')
    })
    tipoTimer.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && !tipoTimer.classList.contains('aberto')) {
            resetarTela(elementos);
        }
    });
}

//=======================================POMODORO=========================================//

function criarPomodoro(elementos) {
    const {tipoTimer, opcaoPomodoro, timerHora, buttonTimer} = elementos

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
  <div class="ciclos"></div>
`;

        tipoTimer.append(pomodoro)
        contador(pomodoro)
    })
}
function contador(elemento) {

    // =====================================================================
    // FUNÇÕES AUXILIARES
    // ====================================================================

    // Converte segundos totais em "MM:SS". Ex: 90 -> "01:30"
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

    const liTarefa = divPomodoro.closest('li')
    const buttonTimer = liTarefa ? liTarefa.querySelector('.buttonTimer') : null
    const tipoTimer = liTarefa ? liTarefa.querySelector('.tipoTimer') : null

    const buttonTimerHTMLOriginal = buttonTimer ? buttonTimer.innerHTML : ''

    // =====================================================================
    // ESTADO
    // =====================================================================

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

    function painelEstaVisivel() {
        return tipoTimer && (tipoTimer.classList.contains('aberto') || tipoTimer.classList.contains('expandido'))
    }


    let pomodoroIniciado = false
    let listenerDblclickAdicionado = false
    let emPausa = false

    const TEMPO_PAUSA = 5*60
    let tempoFoco = tempoInicial

    function atualizarBotaoTimer() {
        if (!buttonTimer) return

        if (painelEstaVisivel()) {
            buttonTimer.innerHTML = buttonTimerHTMLOriginal
            buttonTimer.classList.remove('pomodoroAtivo')
        } else if (pomodoroIniciado) {
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
        } else if (!listenerDblclickAdicionado) {
            buttonTimer.addEventListener('dblclick', () => {
                buttonTimer.classList.remove('pomodoroAtivo')
            })
            listenerDblclickAdicionado = true
        }
    }

    function atualizarMiniatura() {
        atualizarBotaoTimer()
    }

    // =====================================================================
    // EFEITOS DE FIM DE TIMER
    // =====================================================================

    function alertaTerminado() {
        const li = divPomodoro.closest('li')
        if (!li) return
        li.classList.add('tarefaConcluida')
    }

    function ciclosPomodoro(divPomodoro) {
        const ciclosContainer = divPomodoro.querySelector('.ciclos')
        if (!ciclosContainer) return null
        if (ciclosContainer.querySelector('.ciclo')) return null

        const botaoCiclo = document.createElement('button')
        botaoCiclo.classList.add('ciclo')
        botaoCiclo.textContent = '+'
        ciclosContainer.append(botaoCiclo)

        const circulos = []
        let concluidos = 0

        botaoCiclo.addEventListener('click', () => {
            const circulo = document.createElement('div')
            circulo.classList.add('circuloDeCiclo')
            ciclosContainer.append(circulo)
            circulos.push(circulo)
        })


        return function concluirCiclo() {
            if (concluidos < circulos.length) {
                circulos[concluidos].classList.add('concluido')
                concluidos++
            }
        }
    }

    const concluirCiclo = ciclosPomodoro(divPomodoro)


    function somConcluido() {
        new Audio('Music/mixkit-happy-bell-alert-601.wav').play().catch(() => {
        })
    }

// =====================================================================
// CONTROLE DO TIMER
// =====================================================================

    function iniciar() {
        if (intervalo !== null || totalSegundos <= 0) return

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
    let q= 0
    const PAUSA_LONGA=900
    function finalizar() {
        clearInterval(intervalo)
        intervalo = null

        if (!emPausa) {
            tempoFoco = tempoInicial
            emPausa = true
            if (concluirCiclo) concluirCiclo()

            q++
            const pausa = q % 4 === 0 ? PAUSA_LONGA : TEMPO_PAUSA

            tempoInicial = pausa
            totalSegundos = pausa
            timer.textContent = formatar(totalSegundos)
            buttonStart.textContent = 'Pause'

            iniciar()
        } else {
            emPausa = false
            tempoInicial = tempoFoco
            totalSegundos = tempoFoco
            timer.textContent = formatar(totalSegundos)
            buttonStart.textContent = 'Start'
        }
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


            function completarValor() {
                const digitos = divInput.value.replace(/\D/g, '')
                if (!digitos) {
                    divInput.value = ''
                    return
                }
                const min = parseInt(digitos.slice(0, 2), 10)
                const seg = Math.min(parseInt(digitos.slice(2).padStart(2, '0'), 10), 59)

                divInput.value = formatar(min * 60 + seg)
            }
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


                timer.textContent = formatar(totalSegundos)
                divInput.replaceWith(timer)

                atualizarAnel()
                atualizarMiniatura()
            }
            divInput.addEventListener('blur', () => {
                completarValor()
                encerrarEdicao(true)
            })

            divInput.addEventListener('keydown', (e) => {

                if (e.key === 'Enter') {
                    completarValor()
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
    if (tipoTimer) {
        tipoTimer.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity') {
                atualizarBotaoTimer()
            }
        })
    }

    return function destruir() {
        clearInterval(intervalo)
        intervalo = null
        if (buttonTimer) {
            buttonTimer.innerHTML = buttonTimerHTMLOriginal
            buttonTimer.classList.remove('pomodoroAtivo')
        }
    }
}

function criarHora(elementos){
    const{horario,tipoTimer, titulo} = elementos

    const inicio = horario.querySelector('.inputHoraInicio')
    const fim = horario.querySelector('.inputHoraFim')
    if(!inicio || !fim) return

    const buttonAddHora = document.createElement('button')
    buttonAddHora.type='button'
    buttonAddHora.textContent='✓'
    buttonAddHora.classList.add('buttonAddHora')
    horario.append(buttonAddHora)

    const span = document.createElement('span')
    span.classList.add('spanHoras')
    titulo.insertAdjacentElement('afterend',span)

    function horaParaMinutos(valor){
        if(!valor) return null

        const [h, m] = valor.split(':').map(Number)
        return h * 60 + m
    }

    function minutosParaHora(valor){
        const h = Math.floor(valor / 60)
        const m = valor % 60
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    }



    function validarHora(){

        let valorInicio = horaParaMinutos(inicio.value)
        let valorFim = horaParaMinutos(fim.value)

        if(valorInicio === null || valorFim === null) return null

        if(valorFim < valorInicio){
            [valorInicio, valorFim] = [valorFim, valorInicio]
        }
        return {
            i:minutosParaHora(valorInicio),
            f:minutosParaHora(valorFim),
        }
    }

    function attTextoHora(){
        const hora = validarHora()
        span.textContent = hora?`${hora.i} - ${hora.f}` :""
    }
    buttonAddHora.addEventListener('click',attTextoHora)
    if(tipoTimer.classList.contains('aberto'))attTextoHora()
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

// Fecha o menu de ações de uma tarefa e sincroniza o aria-expanded
function fecharAcoes(textoTopo) {
    textoTopo.classList.remove('opcoes-abertas');
    const botao = textoTopo.querySelector('.buttonOpcoes');
    if (botao) botao.setAttribute('aria-expanded', 'false');
}

// Escolhe a tarefa ativa: fecha ações e timers de todas as outras tarefas
function definirTarefaAtiva(elementos) {
    document.querySelectorAll('.textoTopo.opcoes-abertas').forEach(textoTopo => {
        if (!textoTopo.contains(elementos.li)) fecharAcoes(textoTopo);
    });

    document.querySelectorAll('.tipoTimer.aberto, .tipoTimer.expandido').forEach(tipoTimer => {
        if (tipoTimer.closest('li') !== elementos.li) fecharTimer({tipoTimer});
    });
}

// Configura o botão de opções
function configurarOpcoes(elementos) {
    const {botaoOpcoes, areaAcoes} = elementos;
    botaoOpcoes.setAttribute('aria-expanded', 'false');
    botaoOpcoes.addEventListener('click', (e) => {
        e.stopPropagation();
        const textoTopo = areaAcoes.parentElement;
        if (!textoTopo.classList.contains('opcoes-abertas')) definirTarefaAtiva(elementos);
        alternarOpcoes(textoTopo, botaoOpcoes);
    });
}

// Fecha todos os dropdowns abertos ao clicar fora
document.addEventListener('click', (e) => {
    document.querySelectorAll('.textoTopo.opcoes-abertas').forEach(textoTopo => {
        if (!textoTopo.contains(e.target)) fecharAcoes(textoTopo);
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
