/*
 * RodEngine — dados do media kit.
 * Para atualizar números, edite só este arquivo.
 * Formato pt-BR: use vírgula nos textos exibidos (ex.: "658,9K").
 * Campos `count` alimentam a animação de contagem: { to, dec, suf }.
 */
window.KIT = {
  email: 'contato@rodgame.dev',

  profile: {
    first: 'Rod',
    last: 'Dev',
    photo: 'assets/img/rod-hero.webp',
    role: 'Criador de conteúdo · Game dev · Reviews de tech',
    bio: 'Eu crio conteúdo sobre games e tecnologia, desenvolvo meus próprios jogos e faço reviews de tech. Já são mais de 356 milhões de visualizações e uma comunidade que não só assiste: ela joga o que eu crio.',
    tags: [
      ['Games', 'orange'],
      ['Tech', 'pink'],
      ['Dev', 'mint'],
      ['Reviews', 'amber'],
    ],
  },

  totals: {
    views: { label: 'views', display: '356,7M+', count: { to: 356.7, dec: 1, suf: 'M+' }, note: 'YouTube + TikTok, all time' },
    followers: { label: 'seguidores', display: '1,2M+', count: { to: 1.2, dec: 1, suf: 'M+' }, note: 'somando as três redes' },
    hours: { label: 'horas assistidas', display: '4,5M+', count: { to: 4.5, dec: 1, suf: 'M+' }, note: '≈ 16 bilhões de segundos' },
    impressions: { label: 'impressões no YouTube', display: '224,9M', count: { to: 224.9, dec: 1, suf: 'M' }, note: 'all time' },
    ctr: { label: 'CTR médio no YouTube', display: '6,36%', count: { to: 6.36, dec: 2, suf: '%' }, note: 'taxa de cliques das impressões' },
  },

  // Divisão das views totais (para a barra de proporção)
  viewsSplit: [
    { name: 'YouTube', value: 256.7, display: '256,7M', color: 'pink' },
    { name: 'TikTok', value: 100, display: '100M+', color: 'mint' },
  ],

  platforms: [
    {
      id: 'youtube', name: 'YouTube', handle: '@Roddev', url: 'https://www.youtube.com/Roddev',
      color: 'pink', main: '658,9K', mainLabel: 'inscritos',
      count: { to: 658.9, dec: 1, suf: 'K' },
      stats: [['Views', '256,7M'], ['Horas assistidas', '3,1M'], ['Impressões', '224,9M'], ['CTR médio', '6,36%']],
    },
    {
      id: 'tiktok', name: 'TikTok', handle: '@roddev_', url: 'https://www.tiktok.com/@roddev_',
      color: 'mint', main: '450K+', mainLabel: 'seguidores',
      count: { to: 450, dec: 0, suf: 'K+' },
      stats: [['Views', '100M+']],
    },
    {
      id: 'instagram', name: 'Instagram', handle: '@rodgamedev', url: 'https://www.instagram.com/rodgamedev/',
      color: 'violet', main: '90K+', mainLabel: 'seguidores',
      count: { to: 90, dec: 0, suf: 'K+' },
      stats: [['Conteúdo', 'Visual e bastidores']],
    },
  ],

  audience: {
    ages: [
      ['18–24 anos', 36],
      ['25–34 anos', 16],
      ['35–44 anos', 8],
      ['Outros', 40],
    ],
    geo: [
      ['BR', 'Brasil', 'Base principal'],
      ['PT', 'Portugal', 'Europa'],
      ['AO', 'Angola', 'África'],
      ['MZ', 'Moçambique', 'África'],
    ],
    profile: 'Público jovem-adulto, predominantemente masculino e altamente engajado com tecnologia e games.',
  },

  games: {
    intro: 'Além de criar conteúdo sobre games, eu desenvolvo os meus próprios jogos. Cada título foi pensado para a minha comunidade, e os números mostram que ela joga o que eu faço.',
    downloads: { display: '400K+', count: { to: 400, dec: 0, suf: 'K+' } },
    wishlists: { display: '30K+', count: { to: 30, dec: 0, suf: 'K+' } },
    conversion: 61,
    conversionNote: '400K downloads ÷ 658,9K inscritos no YouTube',
    quote: 'Minha comunidade não só assiste. Ela joga o que eu crio.',
  },

  brands: [
    ['Petrobras', 'Energia'],
    ['McDonald\'s', 'Food'],
    ['Logitech', 'Tech'],
    ['LevelUp', 'Games'],
    ['Lenovo', 'Hardware'],
    ['Intel', 'Tech'],
    ['Sebrae', 'Negócios'],
  ],
  brandSectors: 'Energia · Food · Tech · Hardware · Negócios',

  formats: [
    'Vídeo integrado',
    'Review dedicado',
    'Menção patrocinada',
    'Multiplataforma',
    'Jogo personalizado',
    'Stories',
    'Vídeos curtos e longos',
  ],
};
