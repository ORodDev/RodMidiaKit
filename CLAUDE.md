# RodMidiaKit

Media Kit online do RodDev (criador de conteúdo / YouTuber / game dev). Público-alvo do site: gerentes de marca, agências e parceiros comerciais que precisam ver números e contato rapidamente.

## Hospedagem e deploy

- Hospedado no **GitHub Pages** a partir da branch `main`, raiz do repositório. Push em `main` = deploy.
- Domínio próprio: `www.rodgame.dev` (arquivo `CNAME`). **Nunca apagar ou renomear o `CNAME`.**
- Site 100% estático: sem build step, sem servidor, sem backend. Qualquer coisa que precise de build (bundler, framework) exigiria um workflow de GitHub Actions — evitar a menos que seja combinado.
- Bibliotecas externas apenas via CDN com versão fixa; preferir JS/CSS puros.

## Estrutura

Conceito **RodEngine**: o media kit é uma "cena" dentro de um editor de game engine fictício (original, não imita Unity/Godot). Paleta "Rod Night" tirada da foto do Rod: noite `#0e1020`, laranja `#ff8a3d`, âmbar `#ffc857`, menta `#3ee6c1`, rosa `#ff4d8d`, violeta `#8b7bff`. Cada seção tem a sua cor.

- `index.html` — shell: toolbar, Hierarchy, viewport, Inspector, Console, meta tags OG.
- `assets/js/data.js` — **todos os textos e números** (`window.KIT`). Para atualizar dados, mexer só aqui.
- `assets/js/app.js` — renderiza as seções a partir do KIT, scrollspy, seleção + Inspector, Console com comandos, Play Mode e Build PDF.
- `assets/js/fx.js` — efeitos (`window.FX`): grid vivo em canvas (lente no cursor, ondas ao trocar de seção, cor da seção ativa), cursor de editor (só em mouse), efeito de texto "decode" e a abertura do editor (1x por sessão, pulada com `prefers-reduced-motion` ou aba em segundo plano). Carrega antes do `app.js`.
- Transições de entrada por seção: mapa `CHOREO` em `app.js` atribui `data-rv` (rise, flip, pop, slide, wipe, iris, blur, scan, scramble); os estados ficam em `style.css`.
- `assets/css/style.css` — layout, responsivo (≤1180px some o Inspector; ≤860px vira layout mobile com abas) e `@media print` para o PDF.
- `assets/img/rod.webp` — foto original; `rod-hero.webp` é a versão otimizada usada no site; `og.jpg` é a imagem de compartilhamento (1200×630, gerada com ffmpeg).
- Play Mode usa Matter.js 0.19.0 via cdnjs, carregado sob demanda. Elementos com classe `.phys` viram corpos físicos; só os totalmente visíveis entram na simulação.
- Rodar localmente: `python -m http.server 8080` na raiz (config em `.claude/launch.json`).

## Conteúdo (fonte da verdade dos dados)

Os textos e números abaixo estão em `assets/js/data.js` (formato pt-BR, vírgula decimal):

- **Bio:** criador de conteúdo, desenvolvedor de games e reviewer de tecnologia; comunidade apaixonada por games e tech. Tags: Games, Tech, Dev, Reviews.
- **Totais (all time):** 356,7M+ views (YouTube + TikTok) · 1,2M+ seguidores · 4,5M+ horas assistidas (YT + TikTok, ~16B segundos).
- **YouTube** `@Roddev` — https://www.youtube.com/Roddev — 658,9K inscritos · 256,7M views · 3,1M horas assistidas · 224,9M impressões · CTR médio 6,36%.
- **TikTok** `@roddev_` — https://www.tiktok.com/@roddev_ — 450K+ seguidores · 100M+ views.
- **Instagram** `@rodgamedev` — https://www.instagram.com/rodgamedev/ — 90K+ seguidores.
- **Audiência:** faixa etária (% views) 18–24: 36% · 25–34: 16% · 35–44: 8% · outros: 40%. Geografia: Brasil (base principal), Portugal (Europa), Angola e Moçambique (África). Não usar o termo "lusófono" no site. Público jovem-adulto, predominantemente masculino, engajado com tech e games.
- **Jogos próprios:** 400K+ downloads · 30K+ wishlists na Steam · ~61% de conversão (400K downloads ÷ 658,9K inscritos). Mensagem: "Minha comunidade não só assiste — ela joga o que eu crio."
- **Marcas parceiras:** Petrobras (Energia), McDonald's (Food), Logitech (Tech), LevelUp (Games), Lenovo (Hardware), Intel (Tech), Sebrae (Negócios).
- **Contato comercial:** contato@rodgame.dev
- **Formatos:** Vídeo Integrado, Review Dedicado, Menção Patrocinada, Multiplataforma, Jogo Personalizado, Stories, Vídeos Curtos e Longos.

## Princípios de design

- Divertido e pessoal, mas **o funcional vem primeiro**: números principais e contato visíveis sem precisar "jogar" ou aprender controles.
- Funcionar bem no celular (links de media kit costumam ser abertos pelo WhatsApp/e-mail no telefone).
- Idioma principal: português (pt-BR).
