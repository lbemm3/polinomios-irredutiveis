import { CONJUNTOS, TABELA_4, TABELA_5, TABELA_6 } from './dados.js';

const TABELAS = { 2: new Set(TABELA_4), 3: new Set(TABELA_5), 5: new Set(TABELA_6) };
const INVERSOS = { 2: { 1: 1 }, 3: { 1: 1, 2: 2 }, 5: { 1: 1, 2: 3, 3: 2, 4: 4 } };
const LIMITE_RAIZ_PADRAO = 1000000n;
const PRIMOS = crivo(1000);

function crivo(n) {
  const marcado = new Uint8Array(n + 1);
  const primos = [];
  for (let i = 2; i <= n; i++) {
    if (marcado[i]) continue;
    primos.push(i);
    for (let j = i * i; j <= n; j += i) marcado[j] = 1;
  }
  return primos;
}

export function lerCoeficiente(valor) {
  if (valor && typeof valor === 'object' && 'digitos' in valor) return valor;
  let texto;
  if (typeof valor === 'bigint') texto = valor.toString();
  else if (typeof valor === 'number') {
    if (!Number.isSafeInteger(valor)) throw new Error('Use texto para números muito grandes.');
    texto = String(valor);
  } else texto = String(valor ?? '').trim();
  if (texto === '') texto = '0';
  if (!/^[+-]?\d+$/.test(texto)) throw new Error(`Coeficiente inválido: "${texto}".`);
  const negativo = texto[0] === '-';
  const digitos = texto.replace(/^[+-]/, '').replace(/^0+(?=\d)/, '');
  return { negativo: negativo && digitos !== '0', digitos };
}

const paraTexto = (c) => (c.negativo ? '-' : '') + c.digitos;
const paraBigInt = (c) => BigInt(paraTexto(c));

export function residuo(valor, p) {
  const c = lerCoeficiente(valor);
  let r;
  if (p === 3) {
    let soma = 0;
    for (const ch of c.digitos) soma += ch.charCodeAt(0) - 48;
    r = soma % 3;
  } else {
    r = (c.digitos.charCodeAt(c.digitos.length - 1) - 48) % p;
  }
  return c.negativo && r !== 0 ? p - r : r;
}

export function classeMod(valores, p) {
  return `(${valores.map((v) => residuo(v, p)).join(',')})`;
}

function conjuntoDaClasse(classe) {
  for (const [letra, conj] of Object.entries(CONJUNTOS)) {
    if (conj.classes.includes(classe)) return letra;
  }
  return null;
}

function criterioModular(coefs, p) {
  const r = coefs.map((c) => residuo(c, p));
  const classe = `(${r.join(',')})`;
  const base = { criterio: `mod${p}`, p, classe };
  if (r[0] === 0) {
    return { ...base, aplicavel: false, certifica: false, motivo: `O coeficiente líder é múltiplo de ${p}.` };
  }
  const multiplicador = INVERSOS[p][r[0]];
  const classeNormalizada = `(${r.map((x) => (x * multiplicador) % p).join(',')})`;
  const naTabela = TABELAS[p].has(classeNormalizada);
  return {
    ...base,
    aplicavel: true,
    multiplicador,
    classeNormalizada,
    naTabela,
    certifica: naTabela,
    conjunto: p === 5 && naTabela ? conjuntoDaClasse(classeNormalizada) : null,
  };
}

function criterioEisenstein(coefs) {
  const [a, b, c, d] = coefs.map(paraBigInt);
  if (d !== 0n) {
    for (const p of PRIMOS) {
      const P = BigInt(p);
      if (a % P !== 0n && b % P === 0n && c % P === 0n && d % P === 0n && d % (P * P) !== 0n) {
        return { criterio: 'eisenstein', aplicavel: true, certifica: true, primo: p };
      }
    }
  }
  return { criterio: 'eisenstein', aplicavel: false, certifica: false, motivo: 'Nenhum primo até 1000 satisfaz as condições.' };
}

function divisores(n) {
  const ds = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      ds.push(i);
      if (i * i !== n) ds.push(n / i);
    }
  }
  return ds;
}

function mdc(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function buscarRaizes(coefs, limite) {
  const [a, b, c, d] = coefs.map(paraBigInt);
  if (d === 0n) return { executada: true, raizes: [{ num: '0', den: '1' }] };
  const absA = a < 0n ? -a : a;
  const absD = d < 0n ? -d : d;
  if (absA > limite || absD > limite) {
    return { executada: false, raizes: [], motivo: 'Coeficientes grandes demais para a busca de raízes.' };
  }
  const raizes = [];
  for (const p of divisores(Number(absD))) {
    for (const q of divisores(Number(absA))) {
      if (mdc(p, q) !== 1) continue;
      for (const sinal of [1n, -1n]) {
        const P = sinal * BigInt(p);
        const Q = BigInt(q);
        if (a * P ** 3n + b * P * P * Q + c * P * Q * Q + d * Q ** 3n === 0n) {
          raizes.push({ num: P.toString(), den: Q.toString() });
        }
      }
    }
  }
  return { executada: true, raizes };
}

const SUPERESCRITO = { 3: '³', 2: '²' };

export function formatar(entrada) {
  const coefs = entrada.map(lerCoeficiente);
  const graus = [3, 2, 1, 0];
  let saida = '';
  coefs.forEach((c, i) => {
    if (c.digitos === '0') return;
    const g = graus[i];
    const x = g === 0 ? '' : g === 1 ? 'x' : 'x' + SUPERESCRITO[g];
    const corpo = c.digitos === '1' && g > 0 ? x : c.digitos + x;
    if (saida === '') saida = (c.negativo ? '-' : '') + corpo;
    else saida += (c.negativo ? ' - ' : ' + ') + corpo;
  });
  return saida || '0';
}

export function formatarLatex(entrada) {
  return formatar(entrada).replace('³', '^{3}').replace('²', '^{2}');
}

export function verificar(entrada, opcoes = {}) {
  const { buscarRaizes: buscar = true, limiteRaiz = LIMITE_RAIZ_PADRAO } = opcoes;
  if (!Array.isArray(entrada) || entrada.length !== 4) {
    throw new Error('Informe os quatro coeficientes [a, b, c, d].');
  }
  const coefs = entrada.map(lerCoeficiente);
  if (coefs[0].digitos === '0') throw new Error('O coeficiente líder deve ser diferente de zero.');

  const criterios = [criterioModular(coefs, 2), criterioModular(coefs, 3), criterioModular(coefs, 5), criterioEisenstein(coefs)];
  const certificados = criterios.filter((c) => c.certifica);
  const busca = buscar ? buscarRaizes(coefs, BigInt(limiteRaiz)) : { executada: false, raizes: [], motivo: 'Busca desativada.' };

  let status;
  if (busca.raizes.length > 0 && certificados.length > 0) status = 'inconsistente';
  else if (busca.raizes.length > 0) status = 'redutivel';
  else if (certificados.length > 0) status = 'irredutivel';
  else if (busca.executada) status = 'irredutivel';
  else status = 'indeterminado';

  return {
    polinomio: formatar(coefs),
    coeficientes: coefs.map(paraTexto),
    status,
    certificados,
    criterios,
    busca,
    detalhes: coefs.map((c) => ({
      valor: paraTexto(c),
      unidades: Number(c.digitos[c.digitos.length - 1]),
      resto2: residuo(c, 2),
      resto3: residuo(c, 3),
      resto5: residuo(c, 5),
    })),
  };
}

export function ampliar(entrada, acrescimos) {
  const antes = entrada.map(lerCoeficiente);
  const depois = antes.map((c, i) => {
    const extra = String(acrescimos[i] ?? '');
    if (!/^\d*$/.test(extra)) throw new Error('Os acréscimos devem conter apenas algarismos.');
    return lerCoeficiente((c.negativo ? '-' : '') + extra + c.digitos);
  });
  const preservada = (p) => antes.every((c, i) => residuo(c, p) === residuo(depois[i], p));
  return {
    coeficientes: depois.map(paraTexto),
    polinomio: formatar(depois),
    classesPreservadas: { 2: preservada(2), 3: preservada(3), 5: preservada(5) },
    verificacao: verificar(depois),
  };
}

export function criarRng(semente) {
  let t = semente >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function gerar(letra, { rng = Math.random, digitosExtraMax = 3 } = {}) {
  const conjunto = CONJUNTOS[letra];
  if (!conjunto) throw new Error(`Conjunto desconhecido: ${letra}.`);
  const classe = conjunto.classes[Math.floor(rng() * conjunto.classes.length)];
  const restos = classe.slice(1, -1).split(',').map(Number);
  const coeficientes = restos.map((resto) => {
    const unidade = resto + (rng() < 0.5 ? 0 : 5);
    const n = Math.floor(rng() * (digitosExtraMax + 1));
    let prefixo = '';
    for (let k = 0; k < n; k++) prefixo += Math.floor(rng() * 10);
    return lerCoeficiente(prefixo + unidade).digitos;
  });
  return { conjunto: letra, classe, coeficientes, polinomio: formatar(coeficientes) };
}
