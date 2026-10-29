# Polinômios irredutíveis de grau 3

Site para gerar e verificar polinômios irredutíveis de grau 3 em ℚ[x], usando só os algarismos dos coeficientes (sinal, algarismo das unidades e soma dos dígitos). Funciona com coeficientes de qualquer tamanho e não precisa fatorar nada.

O método vem do artigo:

> Laerte Bemm e Priscila Costa Ferreira de Jesus Bemm. *Classes de Polinômios Irredutíveis de graus 3 em Q[x]*. REMAT: Revista Eletrônica da Matemática (IFRS), 2021. https://periodicos.ifrs.edu.br/index.php/REMAT/article/view/4212

## O que o site faz

- **Gerador:** cria polinômios dos conjuntos A a L (Tabela 7 do artigo), todos irredutíveis pela classe módulo 5. Aceita uma semente para repetir a mesma lista em aula.
- **Verificador:** decide se um polinômio é irredutível usando as classes módulo 2, 3 e 5 (com o coeficiente líder normalizado) e o critério de Eisenstein. Se os coeficientes são pequenos, também procura uma raiz racional e a mostra como prova de redutibilidade.
- **Ampliar:** acrescenta algarismos à esquerda dos coeficientes de um polinômio irredutível e mostra quais classes se preservam.
- **Conjuntos:** lista as Tabelas 4, 5 e 6 do artigo.

Há três resultados possíveis: irredutível, redutível ou "os critérios não decidem". O terceiro é normal: fora das classes das tabelas, o método do artigo não afirma nada, e para coeficientes grandes a busca de raízes não é feita.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `index.html`, `estilo.css` | A página e a aparência |
| `src/interface.js` | As quatro abas |
| `src/nucleo.js` | As contas (classes, Eisenstein, raízes, gerar, ampliar) |
| `src/dados.js` | As tabelas do artigo |
| `tests/nucleo.test.js` | Testes automáticos do `nucleo.js` |

## Publicar no GitHub Pages

1. Entre em github.com e clique em **New repository**. Dê um nome (por exemplo `polinomios-irredutiveis`), marque **Public** e clique em **Create repository**.
2. Na página do repositório novo, clique em **uploading an existing file**. Arraste para lá o **conteúdo** da pasta `polinomios-irredutiveis` (os arquivos `index.html`, `estilo.css`, `README.md`, `package.json` e as pastas `src` e `tests`). Clique em **Commit changes**.
3. Vá em **Settings**, depois **Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`, e clique em **Save**.
4. Espere cerca de um minuto e atualize a página. O endereço do site aparece no topo, no formato `https://SEU-USUARIO.github.io/polinomios-irredutiveis/`.

Para atualizar o site depois, basta enviar o arquivo novo pelo mesmo caminho (**Add file**, **Upload files**).

**Atenção:** abrir o `index.html` direto do computador (clicando duas vezes) não funciona, porque o navegador bloqueia os módulos JavaScript nesse caso. Use o endereço publicado. Para testar no computador, rode `python3 -m http.server` dentro da pasta e abra `http://localhost:8000`.

## Rodar os testes

Precisa do Node.js 18 ou mais novo. Dentro da pasta, rode:

```
npm test
```

Os testes conferem as tabelas contra o cálculo direto em Z₂, Z₃ e Z₅, os exemplos do artigo e milhares de polinômios pequenos contra uma busca exaustiva de raízes (nenhum polinômio com raiz racional pode ser certificado como irredutível).

## Licença

Escolha uma licença antes de divulgar (por exemplo MIT para o código). O artigo tem os seus próprios direitos autorais e não faz parte deste repositório.
