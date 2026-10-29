# Polinômios irredutíveis de grau 3

Aplicativo web que **gera e verifica polinômios irredutíveis de grau 3 em ℚ[x]** olhando apenas os **algarismos dos coeficientes**, sem fatorar nada. Como os critérios usam só o sinal, o algarismo das unidades e a soma dos dígitos, o método funciona com **coeficientes de qualquer tamanho**, inclusive com dezenas de algarismos.

O método é o do artigo **"Classes de Polinômios Irredutíveis de graus 3 em Q[x]"**, de Laerte Bemm e Priscila Costa Ferreira de Jesus Bemm (REMAT: Revista Eletrônica da Matemática, IFRS, 2021):

📄 <https://periodicos.ifrs.edu.br/index.php/REMAT/article/view/4212>

🔗 **Acesse online:** <https://lbemm3.github.io/polinomios-irredutiveis/>

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Como usar](#como-usar)
- [Abas do aplicativo](#abas-do-aplicativo)
- [Fundamentação matemática](#fundamentação-matemática)
- [Como o verificador decide](#como-o-verificador-decide)
- [Exemplos](#exemplos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Testes automatizados](#testes-automatizados)
- [Acessibilidade e interface](#acessibilidade-e-interface)
- [Limitações](#limitações)
- [Executando localmente](#executando-localmente)
- [Publicação via GitHub Pages](#publicação-via-github-pages)
- [Referência](#referência)
- [Autoria e licença](#autoria-e-licença)

---

## Funcionalidades

- **Verificador**: informe a, b, c e d de p(x) = ax³ + bx² + cx + d e veja se o polinômio é irredutível em ℚ[x], com a justificativa de cada critério.
- **Gerador**: gera 5 polinômios irredutíveis de um dos 12 conjuntos (A a L) do artigo, em três tamanhos de coeficiente e com **semente opcional** para resultados reproduzíveis.
- **Ampliar**: acrescenta algarismos à esquerda das unidades de cada coeficiente de um polinômio irredutível e mostra quais classes módulo 2, 3 e 5 foram preservadas.
- **Conjuntos**: consulta às Tabelas 4, 5 e 6 do artigo e aos conjuntos A a L, com as regras sobre os algarismos das unidades.
- **Quatro critérios**: módulo 2, módulo 3, módulo 5 (com identificação do conjunto A a L) e critério de Eisenstein.
- **Busca de raiz racional** para os coeficientes pequenos, que decide os casos que os critérios não cobrem e exibe a raiz quando o polinômio é redutível.
- **Números enormes**: aceita coeficientes com dezenas de algarismos e decide em milissegundos.
- **Cópia em texto e em LaTeX** dos polinômios gerados.
- **Sem dependências** e sem backend: JavaScript puro (módulos ES), que roda no navegador.

## Como usar

1. Abra a página publicada.
2. Escolha uma aba: **Gerador**, **Verificador**, **Ampliar** ou **Conjuntos**.
3. No **Verificador**, digite os coeficientes (deixe em branco os que valem 0) e clique em **Verificar** (ou pressione **Enter**). Os botões de exemplo preenchem os campos e já executam a verificação.
4. No **Gerador**, escolha o conjunto, o tamanho dos coeficientes e, se quiser, uma semente. Clique em **Gerar 5 polinômios**. O botão *Ver a verificação* de cada polinômio abre o Verificador já preenchido.

Os coeficientes devem ser inteiros. São aceitos sinal (`+` ou `-`, inclusive o menos tipográfico `−`), espaços e pontos como separador de milhar (por exemplo, `1.234.567`). Vírgula e ponto decimal são recusados com mensagem de erro.

## Abas do aplicativo

| Aba | O que faz |
|---|---|
| **Gerador** | Gera 5 polinômios irredutíveis do conjunto escolhido (A a L). Mostra o polinômio, a classe módulo 5 e o conjunto, e oferece *Copiar*, *Copiar em LaTeX* e *Ver a verificação*. Exibe também a regra dos algarismos das unidades de cada coeficiente no conjunto. |
| **Verificador** | Recebe a, b, c, d e mostra o veredito, a tabela de restos módulo 2, 3 e 5 de cada coeficiente e o parecer de cada critério (*Certifica*, *Não decide* ou *Não se aplica*). Há uma opção para ligar ou desligar a busca de raiz racional. |
| **Ampliar** | Parte de um polinômio (por padrão, o Exemplo 3.2: 46x³ − 37x² + 139x + 121), acrescenta algarismos à esquerda dos coeficientes e informa se a classe de cada módulo foi preservada, seguida da verificação completa do novo polinômio. |
| **Conjuntos** | Lista as 2 classes da Tabela 4 (módulo 2), as 8 da Tabela 5 (módulo 3) e as 40 da Tabela 6 (módulo 5), distribuídas nos 12 conjuntos A a L, com os algarismos das unidades de cada um. |

### Tamanhos de coeficiente no Gerador

| Opção | Algarismos acrescentados (no máximo) | Tamanho resultante |
|---|---|---|
| Pequenos | 1 | até 2 algarismos |
| Médios | 6 | até 7 algarismos |
| Grandes | 40 | até 41 algarismos |

A **semente** deve ser um inteiro de até 9 algarismos. Com a mesma semente, o conjunto e o tamanho, a lista gerada é sempre a mesma.

## Fundamentação matemática

### Grau 3 e raízes racionais

Um polinômio de grau 3 em ℚ[x] é redutível se e somente se tem uma **raiz racional**. Por isso:

- se há raiz racional, o polinômio é redutível;
- se não há, é irredutível.

### Teste de raiz racional

Para p(x) = ax³ + bx² + cx + d com d ≠ 0, as raízes racionais são da forma ±p/q, com p divisor de d, q divisor de a e mdc(p, q) = 1. O aplicativo testa todos os candidatos, usando inteiros de precisão arbitrária (`BigInt`). Se d = 0, x = 0 é raiz.

### Redução módulo p

Se p não divide o coeficiente líder a e a redução de p(x) módulo p é irredutível em ℤₚ[x], então p(x) é irredutível em ℚ[x]. Em grau 3, a redução é irredutível quando não tem raiz em ℤₚ. Para cada p ∈ {2, 3, 5} existe uma lista finita de classes irredutíveis:

| Módulo | Tabela do artigo | Nº de classes |
|---|---|---|
| 2 | Tabela 4 | 2 |
| 3 | Tabela 5 | 8 |
| 5 | Tabela 6 | 40 (em 12 conjuntos, A a L) |

Uma **classe** módulo p é a lista (a, b, c, d) dos restos dos coeficientes na divisão por p. Para comparar com as tabelas, que têm líder 1, o aplicativo multiplica a classe pelo inverso do líder módulo p:

| Módulo | Inversos usados |
|---|---|
| 3 | 1 → 1, 2 → 2 |
| 5 | 1 → 1, 2 → 3, 3 → 2, 4 → 4 |

### Só os algarismos importam

| Módulo | Como obter o resto de um coeficiente |
|---|---|
| 2 e 5 | Pelo **algarismo das unidades** |
| 3 | Pela **soma dos algarismos** |
| Qualquer um | Para coeficiente negativo, o resto r ≠ 0 vira p − r |

Como nenhuma conta usa o valor numérico inteiro, os coeficientes podem ter qualquer tamanho.

### Critério de Eisenstein

Se existe um primo p tal que p ∤ a, p | b, p | c, p | d e p² ∤ d, então o polinômio é irredutível. O aplicativo testa todos os primos até 1000.

### Conjuntos A a L (Tabela 7)

Os 40 polinômios irredutíveis módulo 5 (com líder 1) se organizam em 12 conjuntos, de modo que cada conjunto é um produto de restos por coordenada. Para a > 0 e b, c, d ≥ 0, o **algarismo das unidades** de cada coeficiente diz a que conjunto o polinômio pertence. Por exemplo, no Conjunto A as classes são (1,0,1,1), (1,0,1,4), (1,0,2,1) e (1,0,2,4): a termina em 1 ou 6, b termina em 0 ou 5, c termina em 1, 2, 6 ou 7 e d termina em 1, 4, 6 ou 9.

### Ampliar

Acrescentar algarismos à esquerda do algarismo das unidades de um coeficiente (mantendo o sinal) não altera o resto módulo 2 nem módulo 5. Portanto, partindo de um polinômio irredutível por essas classes, o novo continua irredutível. No módulo 3, a classe só é preservada quando a **soma dos algarismos acrescentados a cada coeficiente é múltipla de 3**.

## Como o verificador decide

A função `verificar` aplica, nesta ordem, os quatro critérios e a busca de raiz racional:

| Etapa | O que faz |
|---|---|
| 1. Módulo 2, 3 e 5 | Calcula a classe, normaliza o líder e consulta a tabela. Não se aplica quando o líder é múltiplo de p. |
| 2. Eisenstein | Procura um primo até 1000 que satisfaça as condições. |
| 3. Busca de raiz racional | Executada quando está ativada e \|a\| e \|d\| são no máximo 1.000.000. |

Resultado:

| Situação | Veredito |
|---|---|
| Há raiz racional e nenhum critério certifica | **Redutível** (mostra a raiz) |
| Algum critério certifica e não há raiz | **Irredutível** (mostra os certificados) |
| Nenhum critério certifica, mas a busca foi executada e não achou raiz | **Irredutível** (grau 3 sem raiz racional) |
| Nenhum critério certifica e a busca não foi executada | **Indeterminado** (os critérios do artigo não decidem; isso não significa que seja redutível) |
| Critério certifica e há raiz racional ao mesmo tempo | **Inconsistente** (sinal de erro interno; não deve ocorrer) |

## Exemplos

Resultados obtidos executando a própria lógica do aplicativo:

| Polinômio | Resultado |
|---|---|
| 46x³ − 37x² + 139x + 121 (Exemplo 3.2) | **Irredutível.** Certificado pelo módulo 3 e pelo módulo 5 (classe (1,3,4,1), Conjunto K). |
| 13x³ + 26x² + 8x + 7 (Exemplo 3.3) | **Irredutível.** Módulo 5: classe (3,1,3,2); multiplicando por 2, vira (1,2,1,4), do Conjunto G. |
| x³ + 4x² + 8x + 8 (Exemplo 3.4) | **Redutível.** Tem a raiz racional x = −2. |
| x³ + 34x² + 8x + 18 | **Irredutível** por Eisenstein com p = 2. |
| Coeficientes com 45 algarismos (7…71, 9…95, 4…47, 8…84) | **Irredutível** pelo módulo 5 (Conjunto A), sem busca de raiz. |
| x³ − 12x² − 11x + 2 | **Redutível**: tem a raiz x = −1. Com a busca desligada, o resultado é **Indeterminado**. |

**Ampliar:** de 46x³ − 37x² + 139x + 121, acrescentando "10" a b e "95" a d, obtém-se 46x³ − 1037x² + 139x + 95121. As classes módulo 2 e 5 foram preservadas e a do módulo 3 foi alterada (1 + 0 = 1 não é múltiplo de 3), mas o polinômio continua irredutível, pois a classe módulo 5 preservada já o certifica.

## Estrutura do projeto

```
polinomios-irredutiveis/
├── index.html           Página e esqueleto das abas
├── estilo.css           Estilo (folha pautada, cores semânticas)
├── package.json         Script de teste (npm test)
├── src/
│   ├── dados.js         Referência do artigo, Tabelas 4, 5 e 6, conjuntos A a L
│   ├── nucleo.js        Lógica matemática, sem acesso à página
│   └── interface.js     Interface: abas, formulários e exibição dos resultados
└── tests/
    └── nucleo.test.js   Testes automatizados do núcleo
```

| Arquivo | Funções principais |
|---|---|
| `dados.js` | `REFERENCIA`, `TABELA_4`, `TABELA_5`, `TABELA_6`, `CONJUNTOS` |
| `nucleo.js` | `lerCoeficiente`, `residuo`, `verificar`, `ampliar`, `gerar`, `criarRng`, `formatar`, `formatarLatex` |
| `interface.js` | `montarVerificador`, `montarGerador`, `montarAmpliar`, `montarConjuntos`, `ativarAba` |

O núcleo é independente da interface: os mesmos módulos podem ser importados em Node.js, como fazem os testes.

## Testes automatizados

A suíte usa o executor nativo do Node.js (`node:test`), sem dependências:

```bash
npm test
```

São 10 testes, que verificam, entre outros pontos:

- as Tabelas 4, 5 e 6 coincidem com o cálculo direto dos cúbicos mônicos irredutíveis em ℤ₂, ℤ₃ e ℤ₅;
- os 12 conjuntos são disjuntos, somam 40 classes e cada um é um produto de restos por coordenada;
- os exemplos do artigo (3.2, 3.3 e 3.4), Eisenstein e o caso ampliado;
- o resto módulo 3, 2 e 5 respeita o sinal do coeficiente;
- **corretude**: nenhum certificado em polinômio com raiz racional (a ∈ {±1, …, ±5} e b, c, d ∈ [−8, 8]);
- com a busca de raiz, polinômios de coeficientes pequenos nunca ficam indeterminados nem inconsistentes, e "redutível" coincide com a busca por força bruta;
- `gerar` produz polinômios do conjunto pedido, sem raiz racional;
- `ampliar` preserva as classes módulo 2 e 5, e a do módulo 3 apenas com soma múltipla de 3;
- coeficientes com cerca de 80 algarismos acrescentados são decididos em menos de 200 ms;
- entradas inválidas geram mensagens de erro claras.

O teste de corretude também imprime a **cobertura dos critérios**: na faixa testada, os critérios sozinhos (sem busca de raiz) certificam **28.380 dos 40.420 polinômios irredutíveis (70,2%)**. Os demais ficam para a busca de raiz racional.

## Acessibilidade e interface

- Abas com os papéis `tablist`, `tab` e `tabpanel`, navegáveis por **←** e **→**.
- Link "Pular para o conteúdo" e resultados anunciados por leitores de tela (`aria-live`).
- O endereço registra a aba atual (`#gerador`, `#verificador`, `#ampliar`, `#conjuntos`), o que permite compartilhar um link direto para cada uma.
- Indicador de foco visível e redução de animações para quem prefere menos movimento.
- Layout responsivo, com a margem pautada ajustada em telas estreitas.
- Coeficientes muito longos são abreviados na tabela (primeiros e últimos algarismos e a contagem total), com o valor completo na dica do campo.
- A cópia usa a área de transferência do navegador, com alternativa para navegadores antigos.

## Limitações

- Só trata **polinômios de grau 3 com coeficientes inteiros**.
- Para polinômios redutíveis, o aplicativo mostra a **raiz racional**, não a fatoração completa.
- A **busca de raiz racional** só é executada quando |a| e |d| são no máximo 1.000.000. Com coeficientes maiores, se nenhum critério certificar, o resultado é *Indeterminado*, o que **não** significa que o polinômio seja redutível.
- Eisenstein é testado apenas para os **primos até 1000**.
- Os critérios modulares cobrem os módulos **2, 3 e 5**. Na faixa testada, eles certificam cerca de 70% dos irredutíveis.
- O **Gerador** só produz coeficientes positivos e polinômios da classe módulo 5 do conjunto escolhido.
- A **semente** aceita no máximo 9 algarismos.
- A página **não funciona abrindo o `index.html` com duplo clique**: o navegador bloqueia os módulos JavaScript em `file://`. A página exibe um aviso nesse caso. Use o endereço publicado ou um servidor local.
- Ferramenta de fins didáticos; para uso formal, consulte o artigo.

## Executando localmente

Como o aplicativo usa módulos ES, é preciso servir os arquivos por HTTP:

```bash
git clone https://github.com/lbemm3/polinomios-irredutiveis.git
cd polinomios-irredutiveis
python3 -m http.server 8000
# acesse http://localhost:8000/
```

Para rodar os testes, é necessário o Node.js (versão 18 ou superior):

```bash
npm test
```

## Publicação via GitHub Pages

1. Mantenha `index.html`, `estilo.css` e a pasta `src/` na raiz do repositório (os caminhos são relativos).
2. Vá em **Settings → Pages**.
3. Em *Build and deployment*, selecione **Deploy from a branch**.
4. Escolha a branch principal (`main`) e a pasta `/ (root)`, e clique em **Save**.
5. Após alguns minutos, o aplicativo estará em <https://lbemm3.github.io/polinomios-irredutiveis/>.

## Referência

> Bemm, L.; Bemm, P. C. F. J. *Classes de Polinômios Irredutíveis de graus 3 em Q[x].* REMAT: Revista Eletrônica da Matemática, IFRS, 2021.
> <https://periodicos.ifrs.edu.br/index.php/REMAT/article/view/4212>

## Autoria e licença

Desenvolvido por **Laerte Bemm** (Departamento de Matemática, Universidade Estadual de Maringá – UEM), com base no método do artigo citado.

Licença: defina a licença do repositório (por exemplo, MIT) e inclua o arquivo `LICENSE`.
