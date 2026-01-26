
import { Artist } from '../types';

export const ARTISTS: Artist[] = [
  {
    id: 'van-gogh',
    name: 'Vincent van Gogh',
    period: 'Post-Impressionism (1853-1890)',
    bio: 'オランダの画家。情熱的で鮮やかな色彩と大胆な筆致で知られ、現代美術に多大な影響を与えた。',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg',
    timeline: [
      { year: 1880, event: '画家の道を志す', mood: 2, description: '伝道師としての挫折の後、絵画の世界へ。', category: 'personal' },
      { year: 1885, event: '「ジャガイモを食べる人々」制作', mood: -1, description: '農民の貧しさと力強さを描く暗い時代。', category: 'artistic' },
      { year: 1886, event: 'パリ移住', mood: 3, description: '印象派との出会い。色彩が劇的に明るくなる。', category: 'personal' },
      { year: 1888, event: 'アルルへ移動', mood: 5, description: '「黄色い家」での共同生活。創作意欲の頂点。', category: 'personal' },
      { year: 1888, event: '耳切り事件', mood: -5, description: 'ゴーギャンとの衝突、精神の崩壊が始まる。', category: 'personal' },
      { year: 1889, event: 'サン＝レミの療養院', mood: -2, description: '「星月夜」を制作。苦悩の中の安らぎ。', category: 'artistic' },
      { year: 1890, event: 'オーヴェール＝シュル＝オワーズ', mood: -4, description: '最後の傑作群を残し、37歳でこの世を去る。', category: 'personal' }
    ],
    paintings: [
      {
        id: 'starry-night',
        title: '星月夜',
        titleEn: 'The Starry Night',
        year: 1889,
        location: 'サン＝レミ',
        collection: 'ニューヨーク近代美術館 (MoMA)',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
        description: 'サン＝レミの療養院の窓から見た夜明け前の風景。',
        insiderStory: 'このうねるような空は、単なる視覚的な記録ではなく、彼の激動する精神状態と宇宙へのあこがれが混ざり合ったものです。実は、鉄格子越しに見た風景でした。',
        overlays: [
          { id: '1', x: 20, y: 55, title: 'うねる糸杉', content: '死の象徴とされる糸杉が、天へと昇る炎のように描かれています。' },
          { id: '2', x: 85, y: 15, title: '巨大な三日月', content: '太陽のような強烈な光を放つ月。彼の憧憬を象徴しています。' },
          { id: '3', x: 45, y: 35, title: '渦巻く星雲', content: '当時の天文学の発見（渦巻銀河）に影響を受けたという説もあります。' }
        ]
      },
      {
        id: 'sunflowers',
        title: 'ひまわり',
        titleEn: 'Sunflowers',
        year: 1888,
        location: 'アルル',
        collection: 'ナショナル・ギャラリー（ロンドン）',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg',
        description: 'ゴーギャンを歓迎するために描かれた、友情の象徴。',
        insiderStory: 'ゴーギャンが来るのを待ちわびながら、彼は狂ったようにひまわりを描き続けました。黄色は彼にとって「希望」そのものでした。',
        overlays: [
          { id: '1', x: 50, y: 40, title: '黄色の共鳴', content: '背景から花まで、わずかに異なる黄色を使い分けて深みを出しています。' }
        ]
      }
    ]
  },
  {
    id: 'monet',
    name: 'Claude Monet',
    period: 'Impressionism (1840-1926)',
    bio: '印象派の創設者の一人。光の移ろいと色彩の変化を執拗に追い求めた。',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Claude_Monet_1899_Nadar_crop.jpg/800px-Claude_Monet_1899_Nadar_crop.jpg',
    timeline: [
      { year: 1870, event: '普仏戦争', mood: -3, description: 'ロンドンへ避難。霧の風景に魅了される。', category: 'historical' },
      { year: 1874, event: '第1回印象派展', mood: 2, description: '「印象・日の出」が酷評されるが、新たな時代の幕開け。', category: 'artistic' },
      { year: 1883, event: 'ジヴェルニーへ移住', mood: 4, description: '理想の庭園を作り始める。', category: 'personal' },
      { year: 1911, event: '妻アリスの死', mood: -4, description: '最愛の妻を失い、深い悲しみに。', category: 'personal' },
      { year: 1918, event: '白内障の悪化', mood: -2, description: '視力が衰える中、巨大な睡蓮の連作に挑む。', category: 'personal' }
    ],
    paintings: [
      {
        id: 'water-lilies',
        title: '睡蓮',
        titleEn: 'Water Lilies',
        year: 1915,
        location: 'ジヴェルニー',
        collection: 'オランジュリー美術館',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Claude_Monet_-_Water_Lilies_-_Google_Art_Project.jpg/1280px-Claude_Monet_-_Water_Lilies_-_Google_Art_Project.jpg',
        description: 'ジヴェルニーの庭の池を描いた壮大な連作の一部。',
        insiderStory: '晩年の睡蓮は、白内障の影響で赤みが強く、より抽象的になっています。彼は「形」ではなく「光の記憶」を描こうとしていました。',
        overlays: [
          { id: '1', x: 30, y: 60, title: '水の透明感', content: '空の映り込みと池の底が見えるような多重の層。' }
        ]
      }
    ]
  }
];
