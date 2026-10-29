import { REFERENCIA, TABELA_4, TABELA_5, CONJUNTOS } from './dados.js';
import { verificar, ampliar, gerar, criarRng, formatar, formatarLatex } from './nucleo.js';

const $ = (seletor) => document.querySelector(seletor);

function h(tag, atributos = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (valor === false || valor == null) continue;
    if (chave.startsWith('on')) el.addEventListener(chave.slice(2), valor);
    else if (chave === 'class') el.className = valor;
    else el.setAttribute(chave, valor === true ? '' : valor);
  }
  for (const filho of filhos.flat()) {
    if (filho == null || filho === false) continue;
    el.append(filho.nodeType ? filho : document.createTextNode(String(filho)));
  }
  return el;
}

const NOMES = ['a', 'b', 'c', 'd'];
const ROTULOS = ['a (de x³)', 'b (de x²)', 'c (de x)', 'd (constante)'];

function lerCampo(texto, nome, obrigatorio) {
  let t = String(texto).replace(/\s/g, '').replace(/[−–]/g, '-');
  if (t === '') {
    if (obrigatorio) throw new Error(`Preencha o coeficiente ${nome}.`);
    return '0';
  }
  if (/^[+-]?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  if (!/^[+-]?\d+$/.test(t)) {
    throw new Error(`O coeficiente ${nome} deve ser um número inteiro, só com algarismos (sem vírgula nem ponto decimal).`);
  }
  return t.replace(/^\+/, '');
}

function campos(prefixo, valores = ['', '', '', ''], { obrigatorioA = true, rotulos = ROTULOS } = {}) {
  const entradas = NOMES.map((n, i) => h('input', {
    type: 'text', id: `${prefixo}-${n}`, inputmode: 'numeric', autocomplete: 'off', spellcheck: 'false',
    value: valores[i], placeholder: i === 0 && obrigatorioA ? 'obrigatório' : '0',
  }));
  const grade = h('div', { class: 'coefs' }, NOMES.map((n, i) => h('div', { class: 'campo' },
    h('label', { for: `${prefixo}-${n}` }, rotulos[i]), entradas[i])));
  return {
    grade,
    entradas,
    ler: () => entradas.map((e, i) => lerCampo(e.value, NOMES[i], i === 0 && obrigatorioA)),
    definir: (vs) => entradas.forEach((e, i) => { e.value = String(vs[i]); }),
  };
}

function mensagemErro(texto) {
  return h('p', { class: 'erro', role: 'alert' }, texto);
}

function abreviar(valor) {
  const digitos = valor.replace('-', '');
  if (digitos.length <= 22) return valor;
  return `${valor.slice(0, valor[0] === '-' ? 10 : 9)}…${valor.slice(-9)} (${digitos.length} algarismos)`;
}

async function copiar(texto, botao) {
  const original = botao.textContent;
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const area = h('textarea', {}, texto);
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  botao.textContent = 'Copiado';
  setTimeout(() => { botao.textContent = original; }, 1500);
}

const TABELA_DO = { 2: 4, 3: 5, 5: 6 };
const TITULOS = {
  mod2: 'Módulo 2 (Tabela 4)',
  mod3: 'Módulo 3 (Tabela 5)',
  mod5: 'Módulo 5 (Tabela 6, conjuntos A a L)',
  eisenstein: 'Critério de Eisenstein',
};

function textoRaizes(raizes) {
  return raizes.map((r) => `x = ${r.den === '1' ? r.num : `${r.num}/${r.den}`}`).join(', ');
}

function descreverCriterio(c) {
  if (c.criterio === 'eisenstein') {
    return c.certifica
      ? `O primo ${c.primo} divide b, c e d, não divide a, e ${c.primo}² não divide d. Logo o polinômio é irredutível.`
      : 'Nenhum primo até 1000 satisfaz as condições do critério. Ele não decide.';
  }
  if (!c.aplicavel) return `Não se aplica. ${c.motivo}`;
  const partes = [`Classe do polinômio: ${c.classe}.`];
  if (c.multiplicador !== 1) {
    partes.push(`Multiplicando por ${c.multiplicador} para deixar o coeficiente líder igual a 1 (módulo ${c.p}), a classe vira ${c.classeNormalizada}.`);
  }
  if (c.naTabela) {
    partes.push(`Essa classe está na Tabela ${TABELA_DO[c.p]}: o polinômio é irredutível módulo ${c.p} e, portanto, em ℚ[x].`);
    if (c.conjunto) partes.push(`Pertence ao Conjunto ${c.conjunto}.`);
  } else {
    partes.push('Essa classe não está na tabela, então este critério não decide.');
  }
  return partes.join(' ');
}

function estadoCriterio(c) {
  if (c.certifica) return 'Certifica';
  if (c.aplicavel === false && c.criterio !== 'eisenstein') return 'Não se aplica';
  return 'Não decide';
}

function itemCriterio(c) {
  return h('li', { class: c.certifica ? 'certifica' : '' },
    h('strong', {}, TITULOS[c.criterio]), h('span', { class: 'estado' }, estadoCriterio(c)),
    h('p', {}, descreverCriterio(c)));
}

function itemBusca(b) {
  let estado = 'Não executada';
  let texto = b.motivo;
  let classe = '';
  if (b.executada && b.raizes.length > 0) {
    estado = 'Encontrou raiz';
    texto = `Raiz racional: ${textoRaizes(b.raizes)}. Um polinômio de grau 3 com raiz racional é redutível.`;
    classe = 'raiz';
  } else if (b.executada) {
    estado = 'Sem raiz racional';
    texto = 'Nenhum candidato ±p/q (p divide d, q divide a) é raiz. Como o grau é 3, isso também prova a irredutibilidade.';
  }
  return h('li', { class: classe },
    h('strong', {}, 'Busca de raiz racional'), h('span', { class: 'estado' }, estado), h('p', {}, texto));
}

function veredito(r) {
  const nomes = r.certificados.map((c) => {
    if (c.criterio === 'eisenstein') return `Eisenstein (p = ${c.primo})`;
    if (c.criterio === 'mod5' && c.conjunto) return `módulo 5 (Conjunto ${c.conjunto})`;
    return `módulo ${c.p}`;
  });
  if (r.status === 'irredutivel') {
    return {
      classe: 'ok', marca: '✓', titulo: 'Irredutível em ℚ[x]',
      texto: nomes.length ? `Certificado por: ${nomes.join('; ')}.` : 'Sem raízes racionais; como o grau é 3, o polinômio é irredutível.',
    };
  }
  if (r.status === 'redutivel') {
    return { classe: 'no', marca: '✗', titulo: 'Redutível em ℚ[x]', texto: `Tem a raiz racional ${textoRaizes(r.busca.raizes)}.` };
  }
  if (r.status === 'indeterminado') {
    return {
      classe: 'talvez', marca: '?', titulo: 'Os critérios do artigo não decidem',
      texto: `Nenhuma classe das tabelas e nenhum primo de Eisenstein serviu. ${r.busca.motivo ?? ''} Isso não significa que o polinômio seja redutível.`,
    };
  }
  return { classe: 'no', marca: '!', titulo: 'Resultado inconsistente', texto: 'Houve um erro interno: um critério e uma raiz racional se contradizem. Avise quem mantém o site.' };
}

function tabelaRestos(detalhes) {
  return h('div', { class: 'tabela-rolagem' }, h('table', {},
    h('thead', {}, h('tr', {}, ['Coeficiente', 'Algarismo das unidades', 'Resto mod 2', 'Resto mod 3', 'Resto mod 5'].map((t) => h('th', { scope: 'col' }, t)))),
    h('tbody', {}, detalhes.map((d, i) => h('tr', {},
      h('th', { scope: 'row', class: 'num', title: d.valor }, `${NOMES[i]} = ${abreviar(d.valor)}`),
      h('td', {}, d.unidades), h('td', {}, d.resto2), h('td', {}, d.resto3), h('td', {}, d.resto5))))));
}

function resultadoVerificacao(r) {
  const v = veredito(r);
  return h('div', { class: 'resultado' },
    h('p', { class: 'polinomio' }, 'p(x) = ', r.polinomio),
    h('div', { class: `veredito ${v.classe}` },
      h('span', { class: 'marca', 'aria-hidden': 'true' }, v.marca),
      h('div', {}, h('strong', {}, v.titulo), h('p', {}, v.texto))),
    h('h3', {}, 'Como o artigo decide'),
    h('p', {}, 'Cada critério olha só o sinal, o algarismo das unidades (mod 2 e mod 5) ou a soma dos dígitos (mod 3) de cada coeficiente.'),
    tabelaRestos(r.detalhes),
    h('ul', { class: 'criterios' }, r.criterios.map(itemCriterio), itemBusca(r.busca)));
}

const EXEMPLOS = [
  { rotulo: 'Exemplo 3.2 do artigo', c: [46, -37, 139, 121] },
  { rotulo: 'Exemplo 3.3: líder que não é 1', c: [13, 26, 8, 7] },
  { rotulo: 'Exemplo 3.4: tem raiz −2', c: [1, 4, 8, 8] },
  { rotulo: 'Eisenstein com p = 2', c: [1, 34, 8, 18] },
  { rotulo: 'Coeficientes com 45 algarismos', c: ['7'.repeat(44) + '1', '9'.repeat(44) + '5', '4'.repeat(44) + '7', '8'.repeat(44) + '4'] },
];

function montarVerificador() {
  const painel = $('#painel-verificador');
  const f = campos('v');
  const busca = h('input', { type: 'checkbox', id: 'v-busca', checked: true });
  const saida = h('div', { 'aria-live': 'polite' });

  function executar() {
    saida.replaceChildren();
    try {
      saida.append(resultadoVerificacao(verificar(f.ler(), { buscarRaizes: busca.checked })));
    } catch (e) {
      saida.append(mensagemErro(e.message));
    }
  }
  f.grade.addEventListener('keydown', (e) => { if (e.key === 'Enter') executar(); });

  painel.append(
    h('h2', {}, 'Verificar um polinômio'),
    h('p', {}, 'Digite os coeficientes inteiros de p(x) = ax³ + bx² + cx + d. Deixe em branco os que valem 0. Números muito grandes são aceitos.'),
    h('div', { class: 'exemplos' }, EXEMPLOS.map((ex) => h('button', {
      type: 'button', class: 'chip', onclick: () => { f.definir(ex.c); executar(); },
    }, ex.rotulo))),
    f.grade,
    h('label', { class: 'opcao', for: 'v-busca' }, busca, 'Procurar raiz racional quando os coeficientes forem pequenos (até 1.000.000)'),
    h('button', { type: 'button', class: 'botao', onclick: executar }, 'Verificar'),
    saida);

  return { definir(cs) { f.definir(cs); executar(); } };
}

function digitosUnidade(letra, k) {
  const restos = [...new Set(CONJUNTOS[letra].classes.map((c) => Number(c.slice(1, -1).split(',')[k])))];
  return restos.flatMap((r) => [r, r + 5]).sort((x, y) => x - y);
}

function listaOu(lista) {
  return lista.length === 1 ? String(lista[0]) : `${lista.slice(0, -1).join(', ')} ou ${lista[lista.length - 1]}`;
}

function regrasDoConjunto(letra) {
  return NOMES.map((n, k) => `${n} termina em ${listaOu(digitosUnidade(letra, k))}`).join('; ') + '.';
}

function montarGerador(irParaVerificador) {
  const painel = $('#painel-gerador');
  const conjunto = h('select', { id: 'g-conjunto' }, Object.keys(CONJUNTOS).map((l) =>
    h('option', { value: l }, `Conjunto ${l} (${CONJUNTOS[l].classes.length} classes)`)));
  const tamanho = h('select', { id: 'g-tamanho' }, [
    ['1', 'Pequenos (até 2 algarismos)'], ['6', 'Médios (até 7 algarismos)'], ['40', 'Grandes (até 41 algarismos)'],
  ].map(([v, t]) => h('option', { value: v }, t)));
  const semente = h('input', { type: 'text', id: 'g-semente', inputmode: 'numeric', autocomplete: 'off', placeholder: 'opcional' });
  const regras = h('p', { class: 'regras' });
  const saida = h('div', { 'aria-live': 'polite' });

  const atualizarRegras = () => { regras.textContent = `Algarismo das unidades no Conjunto ${conjunto.value}: ${regrasDoConjunto(conjunto.value)}`; };
  conjunto.addEventListener('change', atualizarRegras);
  atualizarRegras();

  function executar() {
    saida.replaceChildren();
    const texto = semente.value.trim();
    if (texto !== '' && !/^\d{1,9}$/.test(texto)) {
      saida.append(mensagemErro('A semente deve ser um número inteiro com até 9 algarismos.'));
      return;
    }
    const rng = texto === '' ? Math.random : criarRng(Number(texto));
    const itens = [];
    for (let i = 0; i < 5; i++) {
      const g = gerar(conjunto.value, { rng, digitosExtraMax: Number(tamanho.value) });
      const r = verificar(g.coeficientes, { buscarRaizes: false });
      const botaoCopiar = h('button', { type: 'button', class: 'mini' }, 'Copiar');
      botaoCopiar.addEventListener('click', () => copiar(g.polinomio, botaoCopiar));
      const botaoLatex = h('button', { type: 'button', class: 'mini' }, 'Copiar em LaTeX');
      botaoLatex.addEventListener('click', () => copiar(formatarLatex(g.coeficientes), botaoLatex));
      itens.push(h('li', {},
        h('p', { class: 'polinomio' }, 'p(x) = ', g.polinomio),
        h('p', { class: 'meta' }, `${r.status === 'irredutivel' ? 'Irredutível em ℚ[x]' : 'Verifique este polinômio'} · classe mod 5 ${g.classe} · Conjunto ${g.conjunto}`),
        h('div', { class: 'acoes' }, botaoCopiar, botaoLatex,
          h('button', { type: 'button', class: 'mini', onclick: () => irParaVerificador(g.coeficientes) }, 'Ver a verificação'))));
    }
    saida.append(h('h3', {}, 'Polinômios gerados'), h('ul', { class: 'lista-gerada' }, itens));
  }

  painel.append(
    h('h2', {}, 'Gerar polinômios irredutíveis'),
    h('p', {}, 'Escolha um conjunto da Tabela 7 do artigo. Todo polinômio gerado tem a classe módulo 5 irredutível, então é irredutível em ℚ[x] sem precisar fatorar.'),
    h('div', { class: 'linha-opcoes' },
      h('div', { class: 'campo' }, h('label', { for: 'g-conjunto' }, 'Conjunto'), conjunto),
      h('div', { class: 'campo' }, h('label', { for: 'g-tamanho' }, 'Tamanho dos coeficientes'), tamanho),
      h('div', { class: 'campo' }, h('label', { for: 'g-semente' }, 'Semente (mesma semente, mesma lista)'), semente)),
    regras,
    h('p', {}, h('button', { type: 'button', class: 'botao', onclick: executar }, 'Gerar 5 polinômios')),
    saida);
}

function montarAmpliar() {
  const painel = $('#painel-ampliar');
  const base = campos('m', ['46', '-37', '139', '121']);
  const extras = campos('e', ['', '10', '', '95'], {
    obrigatorioA: false,
    rotulos: ['à esquerda de a', 'à esquerda de b', 'à esquerda de c', 'à esquerda de d'],
  });
  const saida = h('div', { 'aria-live': 'polite' });

  function executar() {
    saida.replaceChildren();
    try {
      const partida = base.ler();
      const acrescimos = extras.entradas.map((e) => e.value.replace(/\s/g, ''));
      const r = ampliar(partida, acrescimos);
      const antes = verificar(partida, { buscarRaizes: false });
      const nomesP = { 2: 'módulo 2', 3: 'módulo 3', 5: 'módulo 5' };
      const preservadas = r.classesPreservadas;
      const herdado = antes.certificados.find((c) => c.p && preservadas[c.p]);
      saida.append(
        h('p', { class: 'polinomio' }, 'p(x) = ', r.polinomio),
        h('h3', {}, 'A classe de cada módulo foi preservada?'),
        h('ul', { class: 'criterios' }, [2, 3, 5].map((p) => h('li', { class: preservadas[p] ? 'certifica' : '' },
          h('strong', {}, nomesP[p]), h('span', { class: 'estado' }, preservadas[p] ? 'Preservada' : 'Alterada'),
          p === 3 && !preservadas[3] ? h('p', {}, 'No módulo 3 a classe só se preserva quando a soma dos algarismos acrescentados a cada coeficiente é múltipla de 3.') : null))),
        herdado
          ? h('p', {}, `O polinômio de partida é irredutível pelo critério do ${nomesP[herdado.p]}, e essa classe foi preservada. Por isso o novo polinômio continua irredutível.`)
          : h('p', {}, 'O polinômio de partida não foi certificado por uma classe preservada. A verificação abaixo vale por si só.'),
        resultadoVerificacao(r.verificacao));
    } catch (e) {
      saida.append(mensagemErro(e.message));
    }
  }
  base.grade.addEventListener('keydown', (e) => { if (e.key === 'Enter') executar(); });
  extras.grade.addEventListener('keydown', (e) => { if (e.key === 'Enter') executar(); });

  painel.append(
    h('h2', {}, 'Ampliar um polinômio irredutível'),
    h('p', {}, 'Parta de um polinômio irredutível e acrescente algarismos à esquerda dos algarismos das unidades de cada coeficiente. Nos módulos 2 e 5 a classe não muda, então o novo polinômio continua irredutível.'),
    h('h3', {}, 'Polinômio de partida'), base.grade,
    h('h3', {}, 'Algarismos a acrescentar (deixe em branco para não acrescentar)'), extras.grade,
    h('button', { type: 'button', class: 'botao', onclick: executar }, 'Ampliar'),
    saida);
  executar();
}

function polinomioDaClasse(classe) {
  return formatar(classe.slice(1, -1).split(','));
}

function montarConjuntos() {
  const painel = $('#painel-conjuntos');
  const tabelaClasses = (lista) => h('ul', { class: 'classes-mono' }, lista.map((c) => h('li', {}, `${c}  ${polinomioDaClasse(c)}`)));
  painel.append(
    h('h2', {}, 'Classes e conjuntos do artigo'),
    h('p', {}, 'Uma classe módulo p é a lista dos restos de a, b, c e d na divisão por p. Se a classe (com o líder igual a 1) está nas tabelas abaixo, o polinômio é irredutível em ℚ[x].'),
    h('h3', {}, 'Módulo 2 (Tabela 4): 2 classes'), tabelaClasses(TABELA_4),
    h('h3', {}, 'Módulo 3 (Tabela 5): 8 classes'), tabelaClasses(TABELA_5),
    h('h3', {}, 'Módulo 5 (Tabela 6): 40 classes em 12 conjuntos'),
    h('p', {}, 'Para a > 0 e b, c, d ≥ 0, o algarismo das unidades de cada coeficiente diz a que conjunto o polinômio pertence.'),
    h('div', { class: 'tabela-rolagem' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Conjunto', 'Algarismos das unidades', 'Classes módulo 5'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, Object.entries(CONJUNTOS).map(([letra, { classes }]) => h('tr', {},
        h('th', { scope: 'row' }, letra),
        h('td', {}, regrasDoConjunto(letra)),
        h('td', { class: 'num' }, classes.join('  '))))))),
    h('p', { class: 'nota' }, `Fonte: ${REFERENCIA.autores}, ${REFERENCIA.titulo}, ${REFERENCIA.revista}, ${REFERENCIA.ano}.`));
}

const ABAS = ['gerador', 'verificador', 'ampliar', 'conjuntos'];

function ativarAba(id, foco = false) {
  const alvo = ABAS.includes(id) ? id : 'gerador';
  for (const a of ABAS) {
    const aba = $(`#aba-${a}`);
    const selecionada = a === alvo;
    aba.setAttribute('aria-selected', String(selecionada));
    aba.tabIndex = selecionada ? 0 : -1;
    $(`#painel-${a}`).hidden = !selecionada;
    if (selecionada && foco) aba.focus();
  }
  try { history.replaceState(null, '', `#${alvo}`); } catch { /* sem histórico disponível */ }
}

function iniciar() {
  const verificador = montarVerificador();
  montarGerador((coeficientes) => { ativarAba('verificador', true); verificador.definir(coeficientes); });
  montarAmpliar();
  montarConjuntos();

  for (const a of ABAS) $(`#aba-${a}`).addEventListener('click', () => ativarAba(a));
  $('.abas').addEventListener('keydown', (e) => {
    const atual = ABAS.findIndex((a) => $(`#aba-${a}`).getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowRight') ativarAba(ABAS[(atual + 1) % ABAS.length], true);
    if (e.key === 'ArrowLeft') ativarAba(ABAS[(atual + ABAS.length - 1) % ABAS.length], true);
  });
  window.addEventListener('hashchange', () => ativarAba(location.hash.slice(1)));
  ativarAba(location.hash.slice(1));
}

iniciar();
