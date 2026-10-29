import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TABELA_4, TABELA_5, TABELA_6, CONJUNTOS } from '../src/dados.js';
import { verificar, ampliar, gerar, criarRng, residuo } from '../src/nucleo.js';

function temRaizBruta(a, b, c, d) {
  if (d === 0) return true;
  const A = Math.abs(a);
  const D = Math.abs(d);
  for (let p = 1; p <= D; p++) {
    if (D % p) continue;
    for (let q = 1; q <= A; q++) {
      if (A % q) continue;
      for (const s of [1, -1]) {
        const P = s * p;
        if (a * P ** 3 + b * P * P * q + c * P * q * q + d * q ** 3 === 0) return true;
      }
    }
  }
  return false;
}

function irredutiveisMonicos(p) {
  const saida = [];
  for (let b = 0; b < p; b++) for (let c = 0; c < p; c++) for (let d = 0; d < p; d++) {
    let raiz = false;
    for (let x = 0; x < p; x++) if ((x ** 3 + b * x * x + c * x + d) % p === 0) raiz = true;
    if (!raiz) saida.push(`(1,${b},${c},${d})`);
  }
  return saida.sort();
}

test('tabelas 4, 5 e 6 coincidem com o cálculo direto em Z_p', () => {
  assert.deepEqual([...TABELA_4].sort(), irredutiveisMonicos(2));
  assert.deepEqual([...TABELA_5].sort(), irredutiveisMonicos(3));
  assert.deepEqual([...TABELA_6].sort(), irredutiveisMonicos(5));
});

test('conjuntos A-L são disjuntos e cada um é um produto de restos por coordenada', () => {
  assert.equal(new Set(TABELA_6).size, 40);
  for (const [letra, { classes }] of Object.entries(CONJUNTOS)) {
    const colunas = [0, 1, 2, 3].map((k) => new Set(classes.map((s) => s.slice(1, -1).split(',')[k])));
    const tamanho = colunas.reduce((acc, col) => acc * col.size, 1);
    assert.equal(tamanho, classes.length, `Conjunto ${letra} não é um produto`);
  }
});

test('exemplos do artigo', () => {
  const ex32 = verificar([46, -37, 139, 121]);
  assert.equal(ex32.status, 'irredutivel');
  assert.equal(ex32.criterios[2].classe, '(1,3,4,1)');
  assert.equal(ex32.criterios[2].conjunto, 'K');

  const ex33 = verificar([13, 26, 8, 7]);
  assert.equal(ex33.status, 'irredutivel');
  assert.equal(ex33.criterios[2].classe, '(3,1,3,2)');
  assert.equal(ex33.criterios[2].classeNormalizada, '(1,2,1,4)');
  assert.ok(ex33.criterios[2].certifica);

  const ex34 = verificar([1, 4, 8, 8]);
  assert.equal(ex34.status, 'redutivel');
  assert.deepEqual(ex34.busca.raizes, [{ num: '-2', den: '1' }]);
  assert.equal(ex34.certificados.length, 0);

  const g = verificar([1, 34, 8, 18]);
  assert.equal(g.status, 'irredutivel');
  assert.equal(g.certificados[0].criterio, 'eisenstein');
  assert.equal(g.certificados[0].primo, 2);

  assert.ok(verificar([1, 0, 3, 9]).criterios[0].certifica);
  assert.equal(verificar([1, 21, 30, 27]).criterios[2].conjunto, 'C');
  assert.equal(verificar([1, 75, 63, 33]).criterios[2].conjunto, 'B');

  const ampliado = verificar([46, -1037, 139, 95121]);
  assert.equal(ampliado.status, 'irredutivel');
  assert.equal(ampliado.criterios[2].classe, '(1,3,4,1)');
});

test('classe mod 3 respeita o sinal do coeficiente', () => {
  assert.equal(residuo(-37, 3), 2);
  assert.equal(residuo(37, 3), 1);
  assert.equal(residuo(-12, 3), 0);
  assert.equal(residuo(-37, 5), 3);
  assert.equal(residuo(-37, 2), 1);
  const antigoErro = verificar([1, -12, -11, 2], { buscarRaizes: false });
  assert.equal(antigoErro.criterios[1].certifica, false);
  assert.notEqual(antigoErro.status, 'irredutivel');
});

test('corretude: nenhum certificado em polinômio com raiz racional (critérios sozinhos)', () => {
  let irredutiveis = 0;
  let certificados = 0;
  for (const a of [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) {
    for (let b = -8; b <= 8; b++) for (let c = -8; c <= 8; c++) for (let d = -8; d <= 8; d++) {
      const verdade = !temRaizBruta(a, b, c, d);
      const r = verificar([a, b, c, d], { buscarRaizes: false });
      if (verdade) irredutiveis++;
      if (r.status === 'irredutivel') {
        certificados++;
        assert.ok(verdade, `Falso irredutível: ${a},${b},${c},${d}`);
      }
    }
  }
  console.log(`cobertura dos critérios: ${certificados} de ${irredutiveis} irredutíveis (${((100 * certificados) / irredutiveis).toFixed(1)}%)`);
});

test('com busca de raízes, coeficientes pequenos nunca ficam indeterminados nem inconsistentes', () => {
  for (const a of [-3, -1, 1, 2, 3, 6]) {
    for (let b = -6; b <= 6; b++) for (let c = -6; c <= 6; c++) for (let d = -6; d <= 6; d++) {
      const r = verificar([a, b, c, d]);
      assert.notEqual(r.status, 'inconsistente');
      assert.notEqual(r.status, 'indeterminado');
      assert.equal(r.status === 'redutivel', temRaizBruta(a, b, c, d));
    }
  }
});

test('gerar produz polinômios do conjunto pedido e irredutíveis', () => {
  const rng = criarRng(2026);
  for (const letra of Object.keys(CONJUNTOS)) {
    for (let i = 0; i < 100; i++) {
      const g = gerar(letra, { rng, digitosExtraMax: 2 });
      const r = verificar(g.coeficientes);
      assert.equal(r.status, 'irredutivel');
      assert.equal(r.criterios[2].conjunto, letra);
      assert.ok(g.coeficientes.every((c) => !c.startsWith('-')));
      const [a, b, c, d] = g.coeficientes.map(Number);
      assert.equal(temRaizBruta(a, b, c, d), false, `${g.polinomio} tem raiz racional`);
    }
  }
});

test('acrescentar dígitos preserva a classe mod 2 e 5, e mod 3 só com soma múltipla de 3', () => {
  const rng = criarRng(7);
  for (let i = 0; i < 300; i++) {
    const base = gerar('ABCDEFGHIJKL'[Math.floor(rng() * 12)], { rng });
    const extras = [0, 1, 2, 3].map(() => {
      let s = '';
      for (let k = Math.floor(rng() * 4); k > 0; k--) s += Math.floor(rng() * 10);
      return s;
    });
    const r = ampliar(base.coeficientes, extras);
    assert.ok(r.classesPreservadas[2]);
    assert.ok(r.classesPreservadas[5]);
    assert.equal(r.verificacao.status, 'irredutivel');
    const somas = extras.map((e) => e.split('').reduce((s, ch) => s + Number(ch), 0));
    assert.equal(r.classesPreservadas[3], somas.every((s) => s % 3 === 0));
  }
});

test('coeficientes enormes são decididos rápido, só com dígitos', () => {
  const rng = criarRng(99);
  const g = gerar('A', { rng, digitosExtraMax: 80 });
  const antes = performance.now();
  const r = verificar(g.coeficientes);
  const ms = performance.now() - antes;
  assert.equal(r.status, 'irredutivel');
  assert.equal(r.busca.executada, false);
  assert.ok(ms < 200, `demorou ${ms} ms`);
});

test('entradas inválidas geram erro claro', () => {
  assert.throws(() => verificar([0, 1, 2, 3]), /líder/);
  assert.throws(() => verificar(['1,5', 1, 2, 3]), /inválido/);
  assert.throws(() => verificar([1, 2, 3]), /quatro/);
});
