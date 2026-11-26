/* ============================================================
   WorkTable — demonstração integrada
   Vanilla JS, sem dependências. Estado em localStorage.
   ============================================================ */

(() => {
    'use strict';

    const CHAVE = 'worktable:demo:v1';
    const ACENTOS = ['#f2a93b', '#7faeff', '#63c98a', '#b79bff', '#5fd0c7'];
    const CIRC = 2 * Math.PI * 92;

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const svg = (conteudo) =>
        `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${conteudo}</svg>`;

    const ICO = {
        lixo: svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
        check: svg('<path d="m5 12 4.2 4.2L19 6.5"/>'),
        nota: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
        calendario: svg('<rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M8 2v4M16 2v4M3 10h18"/>'),
        seta: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
        alvo: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>'),
        raio: svg('<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>'),
        download: svg('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/>'),
        reset: svg('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
        play: svg('<path d="M8 5v14l11-7z"/>'),
        pausa: svg('<path d="M8 5v14M16 5v14"/>'),
        busca: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>'),
        quadro: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
        hoje: svg('<rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M8 2v4M16 2v4M3 10h18"/>'),
        feitas: svg('<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4 4.6-5"/>'),
        mais: svg('<path d="M12 5v14M5 12h14"/>')
    };

    const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

    const normalizar = (texto) => String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const doisDigitos = (n) => String(n).padStart(2, '0');

    function isoLocal(data) {
        return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
    }

    function hojeISO() {
        return isoLocal(new Date());
    }

    function isoMais(dias) {
        const d = new Date();
        d.setDate(d.getDate() + dias);
        return isoLocal(d);
    }

    function formatarTempo(totalSegundos) {
        const seg = Math.max(0, Math.round(totalSegundos));
        return `${doisDigitos(Math.floor(seg / 60))}:${doisDigitos(seg % 60)}`;
    }

    function formatarDataCurta(iso) {
        if (!iso) return '';
        const [ano, mes, dia] = iso.split('-').map(Number);
        const data = new Date(ano, mes - 1, dia);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
            .format(data)
            .replace('.', '');
    }

    function dataPorExtenso() {
        const texto = new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        }).format(new Date());
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    const limitar = (valor, min, max) => Math.max(min, Math.min(valor, max));

    function tarefaAtrasada(tarefa) {
        return Boolean(tarefa.prazo) && !tarefa.concluida && tarefa.prazo < hojeISO();
    }

    function tarefaEhHoje(tarefa) {
        return Boolean(tarefa.prazo) && tarefa.prazo === hojeISO();
    }

    /* ---------------- Estado ---------------- */

    function semente() {
        return {
            versao: 1,
            titulo: 'Lançamento do site',
            caixas: [
                {
                    id: uid(),
                    titulo: 'Lançamento do site',
                    acento: 0,
                    x: null, y: null, largura: 340, altura: 400,
                    posicionado: false,
                    z: 1,
                    tarefas: [
                        { id: uid(), titulo: 'Revisar textos da home', descricao: '', concluida: true, prazo: '' },
                        { id: uid(), titulo: 'Aprovar paleta com o time', descricao: 'Levar as duas opções e decidir até o fim do dia.', concluida: false, prazo: isoMais(0) },
                        { id: uid(), titulo: 'Publicar página de preços', descricao: 'Conferir planos, FAQ e botão de contato.', concluida: false, prazo: isoMais(2) },
                        { id: uid(), titulo: 'Configurar analytics', descricao: '', concluida: false, prazo: isoMais(4) },
                        { id: uid(), titulo: 'Definir tom de voz', descricao: '', concluida: true, prazo: '' }
                    ]
                },
                {
                    id: uid(),
                    titulo: 'Pesquisa com usuários',
                    acento: 1,
                    x: null, y: null, largura: 340, altura: 360,
                    posicionado: false,
                    z: 2,
                    tarefas: [
                        { id: uid(), titulo: 'Entrevistar 5 usuários', descricao: 'Roteiro de 30 min. Gravar com consentimento.', concluida: false, prazo: isoMais(0) },
                        { id: uid(), titulo: 'Mapear objeções de compra', descricao: '', concluida: true, prazo: '' },
                        { id: uid(), titulo: 'Sintetizar achados', descricao: '', concluida: false, prazo: isoMais(3) },
                        { id: uid(), titulo: 'Fechar escopo da pesquisa', descricao: '', concluida: true, prazo: '' }
                    ]
                },
                {
                    id: uid(),
                    titulo: 'Operação',
                    acento: 2,
                    x: null, y: null, largura: 340, altura: 300,
                    posicionado: false,
                    z: 3,
                    tarefas: [
                        { id: uid(), titulo: 'Migrar domínio', descricao: '', concluida: false, prazo: isoMais(1) },
                        { id: uid(), titulo: 'Revisar checklist de SEO', descricao: '', concluida: false, prazo: isoMais(0) },
                        { id: uid(), titulo: 'Treinar equipe de suporte', descricao: '', concluida: false, prazo: isoMais(5) }
                    ]
                },
                {
                    id: uid(),
                    titulo: 'Ideias soltas',
                    acento: 3,
                    x: null, y: null, largura: 340, altura: 250,
                    posicionado: false,
                    z: 4,
                    tarefas: [
                        { id: uid(), titulo: 'Testar layout de duas colunas', descricao: '', concluida: false, prazo: '' },
                        { id: uid(), titulo: 'Newsletter mensal', descricao: 'Guardar para depois do lançamento.', concluida: false, prazo: isoMais(7) }
                    ]
                }
            ],
            foco: { duracao: 1500, restante: 1500, rodando: false, fimEm: null, modo: 'foco' }
        };
    }

    function normalizarEstado(dados) {
        if (!dados || !Array.isArray(dados.caixas)) return null;

        const caixas = dados.caixas.map((caixa, indice) => ({
            id: caixa.id || uid(),
            titulo: typeof caixa.titulo === 'string' && caixa.titulo.trim() ? caixa.titulo : 'Caixa sem título',
            acento: Number.isInteger(caixa.acento) ? caixa.acento : indice % ACENTOS.length,
            x: Number.isFinite(caixa.x) ? caixa.x : null,
            y: Number.isFinite(caixa.y) ? caixa.y : null,
            largura: Number.isFinite(caixa.largura) ? caixa.largura : 340,
            altura: Number.isFinite(caixa.altura) ? caixa.altura : 300,
            posicionado: Boolean(caixa.posicionado),
            z: Number.isFinite(caixa.z) ? caixa.z : indice + 1,
            tarefas: Array.isArray(caixa.tarefas) ? caixa.tarefas.map((t) => ({
                id: t.id || uid(),
                titulo: typeof t.titulo === 'string' ? t.titulo : 'Tarefa',
                descricao: typeof t.descricao === 'string' ? t.descricao : '',
                concluida: Boolean(t.concluida),
                prazo: typeof t.prazo === 'string' ? t.prazo : ''
            })) : []
        }));

        const foco = Object.assign(
            { duracao: 1500, restante: 1500, rodando: false, fimEm: null, modo: 'foco' },
            dados.foco || {}
        );

        return {
            versao: 1,
            titulo: typeof dados.titulo === 'string' && dados.titulo.trim() ? dados.titulo : 'Meu quadro',
            caixas,
            foco
        };
    }

    function carregar() {
        try {
            const bruto = localStorage.getItem(CHAVE);
            if (!bruto) return null;
            return normalizarEstado(JSON.parse(bruto));
        } catch (erro) {
            return null;
        }
    }

    let estado = carregar() || semente();
    const foco = estado.foco;

    let timerSalvar = null;

    function salvar() {
        clearTimeout(timerSalvar);
        timerSalvar = setTimeout(() => {
            try {
                localStorage.setItem(CHAVE, JSON.stringify(estado));
            } catch (erro) {
                /* armazenamento indisponível: a demonstração segue em memória */
            }
        }, 180);
    }

    function salvarAgora() {
        clearTimeout(timerSalvar);
        try {
            localStorage.setItem(CHAVE, JSON.stringify(estado));
        } catch (erro) {
            /* ignora */
        }
    }

    /* ---------------- Filtros ---------------- */

    let filtro = 'quadro';
    let busca = '';
    let zTop = Math.max(0, ...estado.caixas.map((c) => c.z || 0));

    function tarefaVisivel(tarefa) {
        if (busca) {
            const alvo = normalizar(`${tarefa.titulo} ${tarefa.descricao}`);
            if (!alvo.includes(normalizar(busca))) return false;
        }
        if (filtro === 'hoje') return tarefa.prazo === hojeISO();
        if (filtro === 'concluidas') return tarefa.concluida;
        return true;
    }

    function caixaTemVisiveis(caixa) {
        return caixa.tarefas.some(tarefaVisivel);
    }

    function caixaDeveAparecer(caixa) {
        if (filtro === 'quadro' && !busca) return true;
        return caixaTemVisiveis(caixa);
    }

    function acharCaixa(id) {
        return estado.caixas.find((c) => c.id === id) || null;
    }

    function acharTarefa(caixa, id) {
        return caixa ? caixa.tarefas.find((t) => t.id === id) || null : null;
    }

    function todasTarefas() {
        return estado.caixas.flatMap((c) => c.tarefas);
    }

    /* ---------------- Elementos ---------------- */

    const els = {
        quadro: $('#quadro'),
        interno: $('#quadroInterno'),
        vazio: $('#quadroVazio'),
        vazioTitulo: $('#vazioTitulo'),
        vazioTexto: $('#vazioTexto'),
        btnVazioAcao: $('#btnVazioAcao'),
        titulo: $('#tituloQuadro'),
        dataHoje: $('#dataHoje'),
        busca: $('#busca'),
        btnNova: $('#btnNovaCaixa'),
        btnComando: $('#btnComando'),
        btnFocoRail: $('#btnFocoRail'),
        pilula: $('#pilulaFoco'),
        pilulaTempo: $('#pilulaTempo'),
        anel: $('#anelProgresso'),
        anelTexto: $('#anelTexto'),
        statsResumo: $('#statsResumo'),

        veu: $('#veu'),
        painel: $('#painelFoco'),
        focoRotulo: $('#focoRotulo'),
        focoSub: $('#focoSub'),
        focoTempo: $('#focoTempo'),
        focoEstado: $('#focoEstado'),
        focoProgresso: $('#focoProgresso'),
        focoPonteiro: $('#focoPonteiro'),
        btnIniciar: $('#btnIniciarFoco'),
        btnReiniciar: $('#btnReiniciarFoco'),
        btnFecharFoco: $('#btnFecharFoco'),
        presets: $('.foco-presets'),

        paletaVeu: $('#paletaVeu'),
        paleta: $('#paleta'),
        paletaBusca: $('#paletaBusca'),
        paletaLista: $('#paletaLista'),

        aviso: $('#aviso')
    };

    /* ---------------- Renderização ---------------- */

    function render(opcoes = {}) {
        renderQuadro(opcoes);
        renderEstatisticas();
        renderFoco();
    }

    function renderQuadro({ focoSel } = {}) {
        $$('.caixa', els.interno).forEach((el) => el.remove());

        const mobile = window.matchMedia('(max-width: 980px)').matches;
        const largura = els.interno.clientWidth || els.quadro.clientWidth || 800;
        const cols = largura >= 1080 ? 3 : largura >= 700 ? 2 : 1;
        const gap = 20;
        const margem = 24;
        const larguraAuto = Math.max(260, Math.min(360,
            (largura - margem * 2 - gap * (cols - 1)) / cols));

        let auto = 0;
        let linhaY = margem;
        let linhaAltura = 0;
        let visiveis = 0;

        estado.caixas.forEach((caixa, indice) => {
            if (!caixaDeveAparecer(caixa)) return;
            visiveis += 1;

            let x;
            let y;
            let w;
            let h;

            if (caixa.posicionado && caixa.x != null && caixa.y != null) {
                w = Math.max(260, caixa.largura || 340);
                h = Math.max(220, caixa.altura || 300);
                x = limitar(caixa.x, 12, Math.max(12, largura - w - 12));
                y = Math.max(12, caixa.y);
            } else {
                const coluna = auto % cols;
                if (coluna === 0 && auto > 0) {
                    linhaY += linhaAltura + gap;
                    linhaAltura = 0;
                }
                w = larguraAuto;
                h = Math.max(240, caixa.altura || 300);
                x = margem + coluna * (w + gap);
                y = linhaY;
                linhaAltura = Math.max(linhaAltura, h);
                auto += 1;
            }

            const el = criarCaixaEl(caixa, indice, x, y, w, h);
            els.interno.appendChild(el);
            atualizarRolagem(el);
        });

        if (!mobile) {
            let maxBottom = 0;
            $$('.caixa', els.interno).forEach((el) => {
                maxBottom = Math.max(maxBottom, el.offsetTop + el.offsetHeight);
            });
            els.interno.style.height = `${Math.max(els.quadro.clientHeight, maxBottom + 24)}px`;
        } else {
            els.interno.style.height = '';
        }

        const temConteudo = visiveis > 0;
        els.vazio.hidden = temConteudo;

        if (!temConteudo) {
            if (busca) {
                els.vazioTitulo.textContent = 'Nada encontrado';
                els.vazioTexto.textContent = `Nenhuma tarefa corresponde a “${busca}”. Tente outro termo.`;
                els.btnVazioAcao.hidden = true;
            } else if (filtro === 'hoje') {
                els.vazioTitulo.textContent = 'Dia livre';
                els.vazioTexto.textContent = 'Nenhuma tarefa com prazo para hoje. Aproveite ou puxe algo do quadro.';
                els.btnVazioAcao.hidden = true;
            } else if (filtro === 'concluidas') {
                els.vazioTitulo.textContent = 'Nada concluído ainda';
                els.vazioTexto.textContent = 'Marque uma tarefa como feita e ela aparece aqui.';
                els.btnVazioAcao.hidden = true;
            } else {
                els.vazioTitulo.textContent = 'Seu quadro está vazio';
                els.vazioTexto.textContent = 'Crie a primeira caixa e comece a organizar o trabalho.';
                els.btnVazioAcao.hidden = false;
            }
        }

        if (focoSel) {
            const alvo = $(focoSel, els.interno);
            if (alvo) {
                alvo.focus({ preventScroll: true });
                if (alvo.tagName === 'INPUT' && alvo.type === 'text') {
                    alvo.select();
                }
            }
        }
    }

    function criarCaixaEl(caixa, indice, x, y, w, h) {
        const total = caixa.tarefas.length;
        const feitas = caixa.tarefas.filter((t) => t.concluida).length;
        const pct = total ? Math.round((feitas / total) * 100) : 0;
        const completa = total > 0 && feitas === total;

        const el = document.createElement('article');
        el.className = `caixa${completa ? ' completa' : ''}`;
        el.dataset.id = caixa.id;
        el.style.setProperty('--x', `${x}px`);
        el.style.setProperty('--y', `${y}px`);
        el.style.setProperty('--w', `${w}px`);
        el.style.setProperty('--h', `${h}px`);
        el.style.setProperty('--z', String(caixa.z || 1));
        el.style.setProperty('--acento', ACENTOS[caixa.acento % ACENTOS.length]);
        el.setAttribute('aria-label', `Caixa ${caixa.titulo}`);

        /* Cabeçalho */
        const topo = document.createElement('div');
        topo.className = 'caixa-topo';

        const numero = document.createElement('span');
        numero.className = 'caixa-indice';
        numero.textContent = doisDigitos(indice + 1);
        numero.setAttribute('aria-hidden', 'true');

        const titulo = document.createElement('input');
        titulo.className = 'caixa-titulo';
        titulo.value = caixa.titulo;
        titulo.maxLength = 48;
        titulo.spellcheck = false;
        titulo.setAttribute('aria-label', 'Título da caixa');

        const contagem = document.createElement('span');
        contagem.className = 'caixa-contagem';
        contagem.textContent = `${feitas}/${total}`;
        contagem.title = `${feitas} de ${total} tarefas concluídas`;

        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'caixa-remover';
        remover.dataset.removerCaixa = caixa.id;
        remover.setAttribute('aria-label', `Remover caixa ${caixa.titulo}`);
        remover.title = 'Remover caixa';
        remover.innerHTML = ICO.lixo;

        topo.append(numero, titulo, contagem, remover);

        /* Progresso */
        const barra = document.createElement('div');
        barra.className = 'caixa-barra';
        barra.setAttribute('role', 'progressbar');
        barra.setAttribute('aria-valuemin', '0');
        barra.setAttribute('aria-valuemax', '100');
        barra.setAttribute('aria-valuenow', String(pct));
        barra.setAttribute('aria-label', `Progresso de ${caixa.titulo}`);
        const preenchimento = document.createElement('span');
        preenchimento.style.width = `${pct}%`;
        barra.appendChild(preenchimento);

        /* Tarefas */
        const lista = document.createElement('ul');
        lista.className = 'caixa-tarefas';

        const visiveis = caixa.tarefas.filter(tarefaVisivel);

        if (visiveis.length === 0) {
            const vazio = document.createElement('li');
            vazio.className = 'caixa-vazia';
            vazio.textContent = caixa.tarefas.length === 0
                ? 'Sem tarefas ainda. Escreva abaixo para começar.'
                : 'Nenhuma tarefa neste filtro.';
            lista.appendChild(vazio);
        } else {
            visiveis.forEach((tarefa) => {
                lista.appendChild(criarTarefaEl(tarefa, caixa));
            });
        }

        const rolagem = document.createElement('div');
        rolagem.className = 'caixa-rolagem';
        rolagem.appendChild(lista);
        lista.addEventListener('scroll', () => atualizarRolagem(el), { passive: true });

        el.append(topo, barra, rolagem);

        /* Adicionar tarefa */
        if (filtro === 'quadro' && !busca) {
            el.appendChild(criarAdicionarEl(caixa));
        }

        /* Alça de redimensionamento */
        const alca = document.createElement('div');
        alca.className = 'caixa-alca';
        alca.setAttribute('aria-hidden', 'true');
        alca.title = 'Redimensionar caixa';
        el.appendChild(alca);

        return el;
    }

    function atualizarRolagem(el) {
        const lista = el.querySelector('.caixa-tarefas');
        const rolagem = lista && lista.parentElement;
        if (!rolagem || !rolagem.classList.contains('caixa-rolagem')) return;

        const rolavel = lista.scrollHeight - lista.clientHeight > 2;
        const noFim = lista.scrollTop + lista.clientHeight >= lista.scrollHeight - 2;

        rolagem.dataset.rolavel = rolavel && !noFim ? 'sim' : 'nao';
        rolagem.dataset.inicio = lista.scrollTop <= 2 ? 'sim' : 'nao';
    }

    function criarTarefaEl(tarefa, caixa) {
        const li = document.createElement('li');
        li.className = `tarefa${tarefa.concluida ? ' concluida' : ''}`;
        li.dataset.tarefaId = tarefa.id;

        const linha = document.createElement('div');
        linha.className = 'tarefa-linha';

        /* Checkbox */
        const label = document.createElement('label');
        label.className = 'tarefa-check';
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = tarefa.concluida;
        check.dataset.concluir = tarefa.id;
        check.setAttribute('aria-label', `${tarefa.concluida ? 'Reabrir' : 'Concluir'}: ${tarefa.titulo}`);
        const marca = document.createElement('span');
        marca.className = 'marca-check';
        marca.setAttribute('aria-hidden', 'true');
        marca.innerHTML = ICO.check;
        label.append(check, marca);

        /* Corpo */
        const corpo = document.createElement('div');
        corpo.className = 'tarefa-corpo';

        const titulo = document.createElement('span');
        titulo.className = 'tarefa-titulo';
        titulo.textContent = tarefa.titulo;
        titulo.tabIndex = 0;
        titulo.setAttribute('role', 'button');
        titulo.setAttribute('aria-label', `Editar tarefa: ${tarefa.titulo}`);
        titulo.title = 'Clique duas vezes para editar';
        corpo.appendChild(titulo);

        const meta = document.createElement('div');
        meta.className = 'tarefa-meta';

        const chip = document.createElement('label');
        chip.className = `chip-data${tarefaEhHoje(tarefa) ? ' hoje' : ''}${tarefaAtrasada(tarefa) ? ' atrasada' : ''}`;
        chip.title = tarefa.prazo ? `Prazo: ${formatarDataCurta(tarefa.prazo)}` : 'Definir prazo';
        const data = document.createElement('input');
        data.type = 'date';
        data.value = tarefa.prazo || '';
        data.dataset.prazo = tarefa.id;
        data.setAttribute('aria-label', `Prazo de ${tarefa.titulo}`);
        chip.append(data);

        const nota = document.createElement('button');
        nota.type = 'button';
        nota.className = `tarefa-nota${tarefa.descricao ? ' tem-nota' : ''}`;
        nota.dataset.nota = tarefa.id;
        nota.setAttribute('aria-label', tarefa.descricao ? 'Descrição preenchida' : 'Adicionar descrição');
        nota.setAttribute('aria-expanded', 'false');
        nota.title = 'Descrição';
        nota.innerHTML = ICO.nota;

        meta.append(chip, nota);
        corpo.appendChild(meta);

        /* Remover */
        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'tarefa-remover';
        remover.dataset.removerTarefa = tarefa.id;
        remover.setAttribute('aria-label', `Remover tarefa ${tarefa.titulo}`);
        remover.title = 'Remover tarefa';
        remover.innerHTML = ICO.lixo;

        linha.append(label, corpo, remover);

        /* Descrição */
        const descricao = document.createElement('div');
        descricao.className = 'tarefa-descricao';
        descricao.hidden = true;
        const area = document.createElement('textarea');
        area.value = tarefa.descricao;
        area.placeholder = 'Escreva uma descrição…';
        area.rows = 2;
        area.maxLength = 500;
        area.dataset.descricao = tarefa.id;
        area.setAttribute('aria-label', `Descrição de ${tarefa.titulo}`);
        descricao.appendChild(area);

        li.append(linha, descricao);
        return li;
    }

    function criarAdicionarEl(caixa) {
        const form = document.createElement('form');
        form.className = 'adicionar';
        form.dataset.adicionar = caixa.id;

        const mais = document.createElement('span');
        mais.className = 'mais';
        mais.setAttribute('aria-hidden', 'true');
        mais.textContent = '+';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Adicionar tarefa…';
        input.maxLength = 120;
        input.autocomplete = 'off';
        input.setAttribute('aria-label', `Nova tarefa em ${caixa.titulo}`);

        const botao = document.createElement('button');
        botao.type = 'submit';
        botao.setAttribute('aria-label', 'Adicionar tarefa');
        botao.title = 'Adicionar';
        botao.innerHTML = ICO.seta;

        form.append(mais, input, botao);
        return form;
    }

    function renderEstatisticas() {
        const todas = todasTarefas();
        const total = todas.length;
        const feitas = todas.filter((t) => t.concluida).length;
        const hoje = todas.filter((t) => tarefaEhHoje(t) && !t.concluida).length;
        const pct = total ? Math.round((feitas / total) * 100) : 0;

        els.anel.style.setProperty('--p', String(pct));
        els.anelTexto.textContent = `${pct}%`;
        els.anel.setAttribute('aria-label', `${pct}% das tarefas concluídas`);
        els.statsResumo.innerHTML = hoje
            ? `<span>${feitas}/${total}</span> <span>${hoje} hoje</span>`
            : `<span>${feitas}/${total}</span> <span>tarefas</span>`;
        els.statsResumo.setAttribute(
            'aria-label',
            `${feitas} de ${total} tarefas concluídas${hoje ? `, ${hoje} para hoje` : ''}`
        );
    }

    function renderFoco() {
        const { duracao, restante, rodando, modo } = foco;
        const tempo = formatarTempo(restante);
        const fracao = duracao > 0 ? limitar(restante / duracao, 0, 1) : 0;
        const concluido = restante <= 0;

        els.focoTempo.textContent = tempo;
        els.pilulaTempo.textContent = tempo;
        els.pilula.dataset.ativa = String(rodando);
        els.pilula.title = rodando ? 'Foco em andamento — abrir painel' : 'Abrir modo foco';

        els.focoProgresso.style.strokeDashoffset = String(CIRC * (1 - fracao));
        els.focoPonteiro.style.setProperty('--angulo', `${360 * (1 - fracao)}deg`);

        els.painel.classList.toggle('concluido', concluido);

        if (concluido) {
            els.focoEstado.textContent = 'Sessão concluída';
        } else if (rodando) {
            els.focoEstado.textContent = modo === 'pausa' ? 'Pausa em andamento' : 'Em andamento';
        } else if (restante < duracao) {
            els.focoEstado.textContent = 'Em pausa';
        } else {
            els.focoEstado.textContent = 'Pronto para começar';
        }

        els.focoRotulo.textContent = modo === 'pausa' ? 'Pausa' : 'Modo foco';
        els.focoSub.textContent = modo === 'pausa'
            ? 'Cinco minutos para respirar.'
            : 'Uma tarefa por vez, sem ruído.';

        if (rodando) {
            els.btnIniciar.textContent = modo === 'pausa' ? 'Pausar pausa' : 'Pausar foco';
        } else if (concluido) {
            els.btnIniciar.textContent = modo === 'pausa' ? 'Nova pausa' : 'Iniciar foco';
        } else if (restante < duracao) {
            els.btnIniciar.textContent = 'Continuar';
        } else {
            els.btnIniciar.textContent = modo === 'pausa' ? 'Iniciar pausa' : 'Iniciar foco';
        }

        $$('[data-min]', els.presets).forEach((btn) => {
            const ativo = modo === 'foco' && Number(btn.dataset.min) * 60 === duracao;
            btn.classList.toggle('ativo', ativo);
            btn.setAttribute('aria-pressed', String(ativo));
        });

        document.title = rodando
            ? `${tempo} · WorkTable`
            : 'WorkTable — Quadro de trabalho';
    }

    /* ---------------- Ações de tarefas e caixas ---------------- */

    function adicionarTarefa(caixa, titulo) {
        caixa.tarefas.push({
            id: uid(),
            titulo,
            descricao: '',
            concluida: false,
            prazo: ''
        });
        salvar();
        render({ focoSel: `[data-adicionar="${caixa.id}"] input` });
    }

    function editarTituloTarefa(tituloEl, caixa, tarefa) {
        if (tituloEl.dataset.editando === 'true') return;
        tituloEl.dataset.editando = 'true';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tarefa-titulo-editor';
        input.value = tarefa.titulo;
        input.maxLength = 120;
        input.setAttribute('aria-label', 'Editar título da tarefa');

        tituloEl.replaceWith(input);
        input.focus();
        input.select();

        let encerrado = false;

        function finalizar(manterMudanca) {
            if (encerrado) return;
            encerrado = true;
            const valor = input.value.trim();
            if (manterMudanca && valor) tarefa.titulo = valor;
            salvar();
            render({ focoSel: `[data-tarefa-id="${tarefa.id}"] .tarefa-titulo` });
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finalizar(true);
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                finalizar(false);
            }
        });

        input.addEventListener('blur', () => finalizar(true));
    }

    function focarTarefa(caixaId, tarefaId) {
        filtro = 'quadro';
        busca = '';
        els.busca.value = '';
        atualizarNav();
        render();

        const alvo = $(`.tarefa[data-tarefa-id="${tarefaId}"]`, els.interno);
        if (!alvo) return;

        alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        alvo.classList.add('piscar');
        setTimeout(() => alvo.classList.remove('piscar'), 1600);
        const titulo = $('.tarefa-titulo', alvo);
        titulo?.focus({ preventScroll: true });
    }

    /* ---------------- Eventos do quadro ---------------- */

    function ligarEventosQuadro() {
        els.quadro.addEventListener('submit', (e) => {
            const form = e.target.closest('[data-adicionar]');
            if (!form) return;
            e.preventDefault();

            const caixa = acharCaixa(form.dataset.adicionar);
            const input = $('input', form);
            if (!caixa || !input) return;

            const titulo = input.value.trim();
            if (!titulo) return;
            adicionarTarefa(caixa, titulo);
        });

        els.quadro.addEventListener('change', (e) => {
            const alvo = e.target;
            const li = alvo.closest('.tarefa');
            if (!li) return;

            const caixa = acharCaixa(li.closest('.caixa')?.dataset.id);
            const tarefa = acharTarefa(caixa, li.dataset.tarefaId);
            if (!tarefa) return;

            if (alvo.matches('[data-concluir]')) {
                tarefa.concluida = alvo.checked;
                salvar();
                render({ focoSel: `[data-tarefa-id="${tarefa.id}"] [data-concluir]` });
            } else if (alvo.matches('[data-prazo]')) {
                tarefa.prazo = alvo.value || '';
                salvar();
                render({ focoSel: `[data-tarefa-id="${tarefa.id}"] [data-prazo]` });
            }
        });

        els.quadro.addEventListener('click', (e) => {
            const removerTarefa = e.target.closest('[data-remover-tarefa]');
            if (removerTarefa) {
                const li = removerTarefa.closest('.tarefa');
                const caixa = acharCaixa(li?.closest('.caixa')?.dataset.id);
                const indice = caixa ? caixa.tarefas.findIndex((t) => t.id === li?.dataset.tarefaId) : -1;

                if (caixa && indice >= 0) {
                    const [tarefa] = caixa.tarefas.splice(indice, 1);
                    salvar();
                    render({ focoSel: `[data-adicionar="${caixa.id}"] input` });
                    mostrarAviso('Tarefa removida.', {
                        rotulo: 'Desfazer',
                        acao: () => {
                            caixa.tarefas.splice(indice, 0, tarefa);
                            salvar();
                            render();
                        }
                    });
                }
                return;
            }

            const removerCaixa = e.target.closest('[data-remover-caixa]');
            if (removerCaixa) {
                const caixa = acharCaixa(removerCaixa.dataset.removerCaixa);
                const indice = caixa ? estado.caixas.indexOf(caixa) : -1;

                if (caixa && indice >= 0) {
                    estado.caixas.splice(indice, 1);
                    salvar();
                    render();
                    mostrarAviso(`Caixa “${caixa.titulo}” removida.`, {
                        rotulo: 'Desfazer',
                        acao: () => {
                            estado.caixas.splice(indice, 0, caixa);
                            salvar();
                            render();
                        }
                    });
                }
                return;
            }

            const nota = e.target.closest('[data-nota]');
            if (nota) {
                const li = nota.closest('.tarefa');
                const descricao = $('.tarefa-descricao', li);
                if (!descricao) return;

                const abrir = descricao.hidden;
                descricao.hidden = !abrir;
                nota.setAttribute('aria-expanded', String(abrir));

                if (abrir) {
                    $('textarea', descricao)?.focus();
                } else {
                    nota.focus();
                }
            }
        });

        els.quadro.addEventListener('dblclick', (e) => {
            const titulo = e.target.closest('.tarefa-titulo');
            if (!titulo) return;
            const li = titulo.closest('.tarefa');
            const caixa = acharCaixa(li?.closest('.caixa')?.dataset.id);
            const tarefa = acharTarefa(caixa, li?.dataset.tarefaId);
            if (tarefa) editarTituloTarefa(titulo, caixa, tarefa);
        });

        els.quadro.addEventListener('keydown', (e) => {
            const titulo = e.target.closest('.tarefa-titulo');
            if (titulo && (e.key === 'Enter' || e.key === 'F2')) {
                e.preventDefault();
                const li = titulo.closest('.tarefa');
                const caixa = acharCaixa(li?.closest('.caixa')?.dataset.id);
                const tarefa = acharTarefa(caixa, li?.dataset.tarefaId);
                if (tarefa) editarTituloTarefa(titulo, caixa, tarefa);
                return;
            }

            const tituloCaixa = e.target.closest('.caixa-titulo');
            if (tituloCaixa && e.key === 'Enter') {
                e.preventDefault();
                tituloCaixa.blur();
                return;
            }

            if (e.target.matches('[data-adicionar] input') && e.key === 'Escape') {
                e.target.value = '';
            }
        });

        els.quadro.addEventListener('input', (e) => {
            const area = e.target.closest('[data-descricao]');
            if (area) {
                const li = area.closest('.tarefa');
                const caixa = acharCaixa(li?.closest('.caixa')?.dataset.id);
                const tarefa = acharTarefa(caixa, li?.dataset.tarefaId);
                if (!tarefa) return;

                tarefa.descricao = area.value;
                const nota = $('[data-nota]', li);
                if (nota) {
                    nota.classList.toggle('tem-nota', Boolean(area.value.trim()));
                    nota.setAttribute('aria-label', area.value.trim() ? 'Descrição preenchida' : 'Adicionar descrição');
                }
                salvar();
                return;
            }

            const tituloCaixa = e.target.closest('.caixa-titulo');
            if (tituloCaixa) {
                const caixa = acharCaixa(tituloCaixa.closest('.caixa')?.dataset.id);
                if (caixa) {
                    caixa.titulo = tituloCaixa.value;
                    salvar();
                }
            }
        });

        els.quadro.addEventListener('focusout', (e) => {
            const tituloCaixa = e.target.closest('.caixa-titulo');
            if (!tituloCaixa) return;

            const caixa = acharCaixa(tituloCaixa.closest('.caixa')?.dataset.id);
            if (!caixa) return;

            const valor = tituloCaixa.value.trim();
            caixa.titulo = valor || 'Caixa sem título';
            tituloCaixa.value = caixa.titulo;
            salvar();
        });
    }

    /* ---------------- Arrastar e redimensionar ---------------- */

    let gesto = null;

    function ajustarAlturaInterno() {
        if (window.matchMedia('(max-width: 980px)').matches) {
            els.interno.style.height = '';
            return;
        }
        let maxBottom = 0;
        $$('.caixa', els.interno).forEach((el) => {
            maxBottom = Math.max(maxBottom, el.offsetTop + el.offsetHeight);
        });
        els.interno.style.height = `${Math.max(els.quadro.clientHeight, maxBottom + 24)}px`;
    }

    function ligarArrasto() {
        els.quadro.addEventListener('pointerdown', (e) => {
            const alvoCaixa = e.target.closest('.caixa');
            if (alvoCaixa) {
                const caixa = acharCaixa(alvoCaixa.dataset.id);
                if (caixa) {
                    caixa.z = ++zTop;
                    alvoCaixa.style.setProperty('--z', String(caixa.z));
                    salvar();
                }
            }

            if (e.button !== 0 || gesto) return;
            if (window.matchMedia('(max-width: 980px)').matches) return;

            const alca = e.target.closest('.caixa-alca');
            const topo = e.target.closest('.caixa-topo');
            if (!alca && !topo) return;
            if (topo && e.target.closest('input, button')) return;

            const el = e.target.closest('.caixa');
            if (!el) return;
            const caixa = acharCaixa(el.dataset.id);
            if (!caixa) return;

            e.preventDefault();

            const x = parseFloat(el.style.getPropertyValue('--x')) || 0;
            const y = parseFloat(el.style.getPropertyValue('--y')) || 0;
            const w = el.offsetWidth;
            const h = el.offsetHeight;

            gesto = {
                el,
                caixa,
                modo: alca ? 'redimensionar' : 'mover',
                inicioX: e.clientX,
                inicioY: e.clientY,
                x, y, w, h,
                nx: x, ny: y, nw: w, nh: h,
                pointerId: e.pointerId,
                moveu: false
            };

            el.classList.add('arrastando');
            try {
                el.setPointerCapture(e.pointerId);
            } catch (erro) {
                /* ponteiro já liberado */
            }
        });

        els.quadro.addEventListener('pointermove', (e) => {
            if (!gesto || e.pointerId !== gesto.pointerId) return;

            const dx = e.clientX - gesto.inicioX;
            const dy = e.clientY - gesto.inicioY;

            if (!gesto.moveu && Math.hypot(dx, dy) < 3) return;
            gesto.moveu = true;

            const maxW = Math.max(260, els.interno.clientWidth - 12);
            const maxH = Math.max(220, els.interno.clientHeight - 12);

            if (gesto.modo === 'mover') {
                gesto.nx = limitar(gesto.x + dx, 0, Math.max(0, maxW - gesto.w));
                gesto.ny = limitar(gesto.y + dy, 0, Math.max(0, maxH - gesto.h));
                gesto.el.style.setProperty('--x', `${gesto.nx}px`);
                gesto.el.style.setProperty('--y', `${gesto.ny}px`);
            } else {
                gesto.nw = limitar(gesto.w + dx, 260, Math.max(260, maxW - gesto.x));
                gesto.nh = limitar(gesto.h + dy, 220, Math.max(220, maxH - gesto.y));
                gesto.el.style.setProperty('--w', `${gesto.nw}px`);
                gesto.el.style.setProperty('--h', `${gesto.nh}px`);
            }
        });

        function encerrarGesto(e) {
            if (!gesto) return;
            if (e && e.pointerId !== gesto.pointerId) return;

            const g = gesto;
            gesto = null;
            g.el.classList.remove('arrastando');

            if (g.el.hasPointerCapture(g.pointerId)) {
                try {
                    g.el.releasePointerCapture(g.pointerId);
                } catch (erro) {
                    /* ignora */
                }
            }

            if (g.moveu) {
                g.caixa.x = g.nx;
                g.caixa.y = g.ny;
                g.caixa.largura = g.nw;
                g.caixa.altura = g.nh;
                g.caixa.posicionado = true;
                salvar();
                ajustarAlturaInterno();
            }
        }

        els.quadro.addEventListener('pointerup', encerrarGesto);
        els.quadro.addEventListener('pointercancel', encerrarGesto);
    }

    /* ---------------- Criar caixa ---------------- */

    function adicionarCaixa() {
        const mobile = window.matchMedia('(max-width: 980px)').matches;
        const largura = els.interno.clientWidth || 800;
        const w = Math.min(340, Math.max(260, largura - 48));
        const h = 300;
        const n = estado.caixas.length;
        const deslocamento = (n % 4) * 38;

        const caixa = {
            id: uid(),
            titulo: 'Nova caixa',
            acento: n % ACENTOS.length,
            x: mobile ? 0 : Math.min(24 + deslocamento, Math.max(12, largura - w - 12)),
            y: mobile ? 0 : Math.min(24 + deslocamento, Math.max(12, els.interno.clientHeight - h - 12)),
            largura: w,
            altura: h,
            posicionado: !mobile,
            z: ++zTop,
            tarefas: []
        };

        estado.caixas.push(caixa);
        salvar();
        render({ focoSel: `[data-id="${caixa.id}"] .caixa-titulo` });
    }

    /* ---------------- Filtros e busca ---------------- */

    function atualizarNav() {
        $$('[data-view]').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.dataset.view === filtro));
        });
    }

    function ligarFiltros() {
        $('.rail-nav').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-view]');
            if (!btn) return;

            filtro = btn.dataset.view;
            busca = '';
            els.busca.value = '';
            atualizarNav();
            render();
        });

        let debounceBusca = null;
        els.busca.addEventListener('input', () => {
            clearTimeout(debounceBusca);
            debounceBusca = setTimeout(() => {
                busca = els.busca.value.trim();
                render();
            }, 120);
        });

        els.busca.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                els.busca.value = '';
                busca = '';
                render();
                els.busca.blur();
            }
        });
    }

    /* ---------------- Título do quadro e botões ---------------- */

    function ligarTituloEBotoes() {
        els.titulo.addEventListener('input', () => {
            estado.titulo = els.titulo.value;
            salvar();
        });

        els.titulo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                els.titulo.blur();
            }
        });

        els.titulo.addEventListener('focusout', () => {
            const valor = els.titulo.value.trim();
            estado.titulo = valor || 'Meu quadro';
            els.titulo.value = estado.titulo;
            salvar();
        });

        els.btnNova.addEventListener('click', adicionarCaixa);
        els.btnVazioAcao.addEventListener('click', adicionarCaixa);
    }

    /* ---------------- Modo foco ---------------- */

    let intervaloTimer = null;

    function salvarFoco() {
        estado.foco = foco;
        salvarAgora();
    }

    function pararIntervalo() {
        if (intervaloTimer) {
            clearInterval(intervaloTimer);
            intervaloTimer = null;
        }
    }

    function tickFoco() {
        if (!foco.rodando || !foco.fimEm) return;

        const restante = Math.max(0, Math.ceil((foco.fimEm - Date.now()) / 1000));
        if (restante !== foco.restante) {
            foco.restante = restante;
            renderFoco();
        }

        if (restante <= 0) concluirFoco();
    }

    function iniciarIntervalo() {
        pararIntervalo();
        intervaloTimer = setInterval(tickFoco, 250);
        tickFoco();
    }

    function iniciarFoco() {
        if (foco.rodando) {
            pausarFoco();
            return;
        }

        if (foco.restante <= 0) foco.restante = foco.duracao;
        foco.rodando = true;
        foco.fimEm = Date.now() + foco.restante * 1000;

        salvarFoco();
        iniciarIntervalo();
        renderFoco();
    }

    function pausarFoco() {
        if (foco.fimEm) {
            foco.restante = Math.max(0, Math.ceil((foco.fimEm - Date.now()) / 1000));
        }
        foco.rodando = false;
        foco.fimEm = null;
        pararIntervalo();
        salvarFoco();
        renderFoco();
    }

    function definirDuracao(minutos, modo = 'foco', iniciarAgora = false) {
        pararIntervalo();
        foco.duracao = minutos * 60;
        foco.restante = minutos * 60;
        foco.modo = modo;
        foco.rodando = false;
        foco.fimEm = null;
        salvarFoco();
        renderFoco();
        if (iniciarAgora) iniciarFoco();
    }

    function tocarSom() {
        try {
            const audio = new Audio('../Music/mixkit-happy-bell-alert-601.wav');
            audio.volume = 0.45;
            audio.play().catch(() => {});
        } catch (erro) {
            /* som indisponível */
        }
    }

    function concluirFoco() {
        pararIntervalo();
        const modoConcluido = foco.modo;

        foco.rodando = false;
        foco.fimEm = null;
        foco.restante = 0;
        salvarFoco();
        renderFoco();
        tocarSom();

        if (modoConcluido === 'foco') {
            mostrarAviso('Foco concluído. Faça uma pausa de 5 minutos.', {
                rotulo: 'Pausa de 5 min',
                acao: () => definirDuracao(5, 'pausa', true)
            });
        } else {
            mostrarAviso('Pausa concluída. Hora de voltar ao foco.', {
                rotulo: 'Novo foco',
                acao: () => definirDuracao(25, 'foco', true)
            });
        }
    }

    function abrirFoco() {
        els.painel.dataset.aberto = 'true';
        els.painel.removeAttribute('inert');
        els.painel.setAttribute('aria-hidden', 'false');
        els.veu.hidden = false;
        els.btnFecharFoco.focus({ preventScroll: true });
    }

    function fecharFoco() {
        els.painel.dataset.aberto = 'false';
        els.painel.setAttribute('inert', '');
        els.painel.setAttribute('aria-hidden', 'true');
        els.veu.hidden = true;
        els.btnFocoRail.focus({ preventScroll: true });
    }

    function restaurarFoco() {
        if (foco.rodando && foco.fimEm) {
            const restante = Math.ceil((foco.fimEm - Date.now()) / 1000);
            if (restante > 0) {
                foco.restante = restante;
                iniciarIntervalo();
            } else {
                foco.rodando = false;
                foco.restante = 0;
                foco.fimEm = null;
                salvarFoco();
            }
        }
        renderFoco();
    }

    function ligarFoco() {
        els.btnFocoRail.addEventListener('click', abrirFoco);
        els.pilula.addEventListener('click', abrirFoco);
        els.btnFecharFoco.addEventListener('click', fecharFoco);
        els.veu.addEventListener('click', fecharFoco);

        els.btnIniciar.addEventListener('click', iniciarFoco);

        els.btnReiniciar.addEventListener('click', () => {
            definirDuracao(Math.round(foco.duracao / 60), foco.modo, false);
        });

        els.presets.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-min]');
            if (!btn) return;
            definirDuracao(Number(btn.dataset.min), 'foco', false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape'
                && els.painel.dataset.aberto === 'true'
                && els.paleta.hidden) {
                fecharFoco();
            }
        });
    }

    /* ---------------- Avisos ---------------- */

    let timerAviso = null;

    function esconderAviso() {
        clearTimeout(timerAviso);
        els.aviso.dataset.visivel = 'false';
    }

    function mostrarAviso(texto, opcoes = {}) {
        const { rotulo, acao } = opcoes;

        els.aviso.innerHTML = '';
        const mensagem = document.createElement('span');
        mensagem.textContent = texto;
        els.aviso.appendChild(mensagem);

        if (rotulo && typeof acao === 'function') {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.textContent = rotulo;
            botao.addEventListener('click', () => {
                acao();
                esconderAviso();
            });
            els.aviso.appendChild(botao);
        }

        els.aviso.dataset.visivel = 'true';
        clearTimeout(timerAviso);
        timerAviso = setTimeout(esconderAviso, 6500);
    }

    /* ---------------- Paleta de comandos ---------------- */

    let paletaItens = [];
    let indicePaleta = 0;
    let origemPaleta = null;

    function acoesPaleta() {
        return [
            {
                id: 'nova',
                rotulo: 'Nova caixa',
                detalhe: 'criar',
                icone: ICO.mais,
                executar: adicionarCaixa
            },
            {
                id: 'foco',
                rotulo: 'Abrir modo foco',
                detalhe: formatarTempo(foco.restante),
                icone: ICO.alvo,
                executar: abrirFoco
            },
            {
                id: 'quadro',
                rotulo: 'Ver quadro completo',
                detalhe: 'filtro',
                icone: ICO.quadro,
                executar: () => {
                    filtro = 'quadro';
                    busca = '';
                    els.busca.value = '';
                    atualizarNav();
                    render();
                }
            },
            {
                id: 'hoje',
                rotulo: 'Ver tarefas de hoje',
                detalhe: 'filtro',
                icone: ICO.hoje,
                executar: () => {
                    filtro = 'hoje';
                    busca = '';
                    els.busca.value = '';
                    atualizarNav();
                    render();
                }
            },
            {
                id: 'feitas',
                rotulo: 'Ver tarefas concluídas',
                detalhe: 'filtro',
                icone: ICO.feitas,
                executar: () => {
                    filtro = 'concluidas';
                    busca = '';
                    els.busca.value = '';
                    atualizarNav();
                    render();
                }
            },
            {
                id: 'limpar',
                rotulo: 'Limpar tarefas concluídas',
                detalhe: 'manutenção',
                icone: ICO.check,
                executar: limparConcluidas
            },
            {
                id: 'exportar',
                rotulo: 'Exportar quadro (.json)',
                detalhe: 'dados',
                icone: ICO.download,
                executar: exportarQuadro
            },
            {
                id: 'exemplo',
                rotulo: 'Restaurar quadro de exemplo',
                detalhe: 'reset',
                icone: ICO.reset,
                executar: restaurarExemplo
            }
        ];
    }

    function limparConcluidas() {
        const concluidas = todasTarefas().filter((t) => t.concluida).length;
        if (!concluidas) {
            mostrarAviso('Nenhuma tarefa concluída para limpar.');
            return;
        }

        const snapshot = JSON.parse(JSON.stringify(estado.caixas));
        estado.caixas.forEach((caixa) => {
            caixa.tarefas = caixa.tarefas.filter((t) => !t.concluida);
        });
        salvar();
        render();
        mostrarAviso(`${concluidas} ${concluidas === 1 ? 'tarefa removida' : 'tarefas removidas'}.`, {
            rotulo: 'Desfazer',
            acao: () => {
                estado.caixas = snapshot;
                salvar();
                render();
            }
        });
    }

    function exportarQuadro() {
        const conteudo = JSON.stringify(estado, null, 2);
        const blob = new Blob([conteudo], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'worktable-quadro.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
        mostrarAviso('Quadro exportado em JSON.');
    }

    function restaurarExemplo() {
        clearTimeout(timerSalvar);
        try {
            localStorage.removeItem(CHAVE);
        } catch (erro) {
            /* ignora */
        }
        window.location.reload();
    }

    function resultadosTarefas() {
        const termo = normalizar(els.paletaBusca.value.trim());
        if (!termo) return [];

        const itens = [];
        estado.caixas.forEach((caixa) => {
            caixa.tarefas.forEach((tarefa) => {
                const alvo = normalizar(`${tarefa.titulo} ${tarefa.descricao} ${caixa.titulo}`);
                if (alvo.includes(termo)) {
                    itens.push({
                        id: `tarefa-${tarefa.id}`,
                        rotulo: tarefa.titulo,
                        detalhe: caixa.titulo,
                        icone: tarefa.concluida ? ICO.feitas : ICO.nota,
                        executar: () => focarTarefa(caixa.id, tarefa.id)
                    });
                }
            });
        });
        return itens.slice(0, 8);
    }

    function criarItemPaleta(item, indice) {
        const li = document.createElement('li');
        li.className = 'paleta-item';
        li.id = `paleta-item-${indice}`;
        li.dataset.indice = String(indice);
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');

        const icone = document.createElement('span');
        icone.className = 'icone';
        icone.innerHTML = item.icone;

        const texto = document.createElement('span');
        texto.className = 'texto';
        texto.textContent = item.rotulo;

        li.append(icone, texto);

        if (item.detalhe) {
            const detalhe = document.createElement('span');
            detalhe.className = 'detalhe';
            detalhe.textContent = item.detalhe;
            li.appendChild(detalhe);
        }

        li.addEventListener('click', () => executarPaleta(indice));
        li.addEventListener('pointermove', () => {
            if (indicePaleta !== indice) {
                indicePaleta = indice;
                atualizarAtivoPaleta();
            }
        });

        return li;
    }

    function atualizarAtivoPaleta() {
        $$('.paleta-item', els.paletaLista).forEach((li) => {
            const ativo = Number(li.dataset.indice) === indicePaleta;
            li.classList.toggle('ativo', ativo);
            li.setAttribute('aria-selected', String(ativo));
            if (ativo) {
                els.paletaBusca.setAttribute('aria-activedescendant', li.id);
                li.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function renderPaleta() {
        const termo = normalizar(els.paletaBusca.value.trim());
        const acoes = acoesPaleta().filter((a) => !termo
            || normalizar(`${a.rotulo} ${a.detalhe}`).includes(termo));
        const tarefas = resultadosTarefas();

        els.paletaLista.innerHTML = '';
        paletaItens = [];

        function grupo(titulo) {
            const li = document.createElement('li');
            li.className = 'paleta-grupo';
            li.setAttribute('role', 'presentation');
            li.textContent = titulo;
            els.paletaLista.appendChild(li);
        }

        if (acoes.length) {
            grupo('Ações');
            acoes.forEach((acao) => {
                paletaItens.push(acao);
                els.paletaLista.appendChild(criarItemPaleta(acao, paletaItens.length - 1));
            });
        }

        if (tarefas.length) {
            grupo('Tarefas');
            tarefas.forEach((tarefa) => {
                paletaItens.push(tarefa);
                els.paletaLista.appendChild(criarItemPaleta(tarefa, paletaItens.length - 1));
            });
        }

        if (!paletaItens.length) {
            const vazio = document.createElement('li');
            vazio.className = 'paleta-vazio';
            vazio.textContent = 'Nenhum comando ou tarefa encontrado.';
            els.paletaLista.appendChild(vazio);
        }

        indicePaleta = 0;
        atualizarAtivoPaleta();
    }

    function executarPaleta(indice) {
        const item = paletaItens[indice];
        if (!item) return;
        fecharPaleta(false);
        item.executar();
    }

    function abrirPaleta() {
        origemPaleta = document.activeElement;
        els.paleta.hidden = false;
        els.paletaVeu.hidden = false;
        els.paletaBusca.value = '';
        renderPaleta();
        els.paletaBusca.focus();
    }

    function fecharPaleta(restaurar = true) {
        if (els.paleta.hidden) return;
        els.paleta.hidden = true;
        els.paletaVeu.hidden = true;
        els.paletaBusca.setAttribute('aria-activedescendant', '');

        if (restaurar && origemPaleta && origemPaleta.isConnected) {
            origemPaleta.focus({ preventScroll: true });
        }
    }

    function ligarPaleta() {
        els.btnComando.addEventListener('click', abrirPaleta);
        els.paletaVeu.addEventListener('click', () => fecharPaleta());

        els.paletaBusca.addEventListener('input', renderPaleta);

        els.paletaBusca.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (paletaItens.length) {
                    indicePaleta = (indicePaleta + 1) % paletaItens.length;
                    atualizarAtivoPaleta();
                }
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (paletaItens.length) {
                    indicePaleta = (indicePaleta - 1 + paletaItens.length) % paletaItens.length;
                    atualizarAtivoPaleta();
                }
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                executarPaleta(indicePaleta);
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                fecharPaleta();
            }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (els.paleta.hidden) {
                    abrirPaleta();
                } else {
                    fecharPaleta();
                }
            }
        });
    }

    /* ---------------- Inicialização ---------------- */

    let timerResize = null;

    function iniciar() {
        els.dataHoje.textContent = dataPorExtenso();
        els.titulo.value = estado.titulo;
        atualizarNav();

        ligarEventosQuadro();
        ligarArrasto();
        ligarFiltros();
        ligarTituloEBotoes();
        ligarFoco();
        ligarPaleta();

        render();
        restaurarFoco();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                $$('.caixa', els.interno).forEach(atualizarRolagem);
            });
        }

        window.addEventListener('resize', () => {
            clearTimeout(timerResize);
            timerResize = setTimeout(render, 180);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
