export const REFERENCIA = {
  titulo: 'Classes de Polinômios Irredutíveis de graus 3 em Q[x]',
  autores: 'Laerte Bemm e Priscila Costa Ferreira de Jesus Bemm',
  revista: 'REMAT: Revista Eletrônica da Matemática (IFRS)',
  ano: 2021,
  url: 'https://periodicos.ifrs.edu.br/index.php/REMAT/article/view/4212',
};

export const TABELA_4 = ['(1,0,1,1)', '(1,1,0,1)'];

export const TABELA_5 = [
  '(1,0,2,1)', '(1,0,2,2)', '(1,1,0,2)', '(1,1,1,2)',
  '(1,1,2,1)', '(1,2,0,1)', '(1,2,1,1)', '(1,2,2,2)',
];

export const CONJUNTOS = {
  A: { classes: ['(1,0,1,1)', '(1,0,1,4)', '(1,0,2,1)', '(1,0,2,4)'] },
  B: { classes: ['(1,0,3,2)', '(1,0,3,3)', '(1,0,4,2)', '(1,0,4,3)'] },
  C: { classes: ['(1,1,0,1)', '(1,1,0,2)'] },
  D: { classes: ['(1,2,0,1)', '(1,2,0,3)'] },
  E: { classes: ['(1,3,0,2)', '(1,3,0,4)'] },
  F: { classes: ['(1,4,0,3)', '(1,4,0,4)'] },
  G: { classes: ['(1,1,1,3)', '(1,1,1,4)', '(1,2,1,3)', '(1,2,1,4)'] },
  H: { classes: ['(1,3,1,1)', '(1,3,1,2)', '(1,4,1,1)', '(1,4,1,2)'] },
  I: { classes: ['(1,2,2,2)', '(1,2,2,3)', '(1,3,2,2)', '(1,3,2,3)'] },
  J: { classes: ['(1,1,3,1)', '(1,1,3,4)', '(1,4,3,1)', '(1,4,3,4)'] },
  K: { classes: ['(1,1,4,1)', '(1,1,4,3)', '(1,3,4,1)', '(1,3,4,3)'] },
  L: { classes: ['(1,2,4,2)', '(1,2,4,4)', '(1,4,4,2)', '(1,4,4,4)'] },
};

export const TABELA_6 = Object.values(CONJUNTOS).flatMap((c) => c.classes);
