const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/mnakamura/.claude/plugins/cache/anthropic-agent-skills/example-skills/69c0b1a06741/skills/pptx/scripts/html2pptx.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/mnakamura/Documents/2026/artLens20260117/workspace/ai-presentation';

const COLORS = {
  teal: '#5EA8A7',
  tealHex: '5EA8A7',
  deepTeal: '#277884',
  deepTealHex: '277884',
  coral: '#FE4447',
  coralHex: 'FE4447',
  dark: '#0D1117',
  darkHex: '0D1117',
  white: '#FFFFFF',
  whiteHex: 'FFFFFF',
  gray: '#8B949E',
  lightBg: '#161B22'
};

async function createGradientBg(filename, color1, color2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}"/>
        <stop offset="100%" style="stop-color:${color2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(filename);
  return filename;
}

// Slide 1: Title
async function createSlide1Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg1.png');
  await createGradientBg(bgPath, COLORS.dark, '#1A2332');

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  background-image: url('${bgPath}'); background-size: cover;
}
.badge-wrap {
  background: ${COLORS.coral};
  padding: 5pt 15pt;
  border-radius: 20pt;
  margin-bottom: 20pt;
}
.badge {
  color: ${COLORS.white};
  font-size: 9pt;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 42pt;
  margin: 0 0 12pt 0;
  text-align: center;
}
.highlight { color: ${COLORS.teal}; }
h2 {
  color: ${COLORS.gray};
  font-size: 18pt;
  margin: 0;
  font-weight: normal;
  text-align: center;
}
.bottom-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 4pt;
  background: linear-gradient(90deg, ${COLORS.teal}, ${COLORS.coral});
  background: ${COLORS.teal};
}
</style></head>
<body>
<div class="badge-wrap"><p class="badge">2025 Trending</p></div>
<h1>注目の<span class="highlight">AIサービス</span></h1>
<h2>ビジネスと日常を変革する最新ツール</h2>
<div class="bottom-bar"></div>
</body>
</html>`;
}

// Slide 2: Overview
async function createSlide2Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg2.png');
  await createGradientBg(bgPath, COLORS.dark, COLORS.lightBg);

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 20pt 40pt;
  display: flex; align-items: center; gap: 15pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
.icon-box {
  width: 40pt; height: 40pt;
  background: ${COLORS.teal};
  border-radius: 10pt;
  display: flex; align-items: center; justify-content: center;
}
.icon-text { color: ${COLORS.white}; font-size: 20pt; margin: 0; font-weight: bold; }
h1 { color: ${COLORS.white}; font-size: 26pt; margin: 0; }
.content {
  display: flex; flex: 1; padding: 20pt 40pt; gap: 25pt;
}
.category {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border-radius: 12pt;
  padding: 18pt;
  border-top: 3pt solid ${COLORS.teal};
}
.category:nth-child(2) { border-top-color: ${COLORS.coral}; }
.category:nth-child(3) { border-top-color: ${COLORS.deepTeal}; }
.cat-title { color: ${COLORS.white}; font-size: 13pt; margin: 0 0 10pt 0; font-weight: bold; }
.cat-item { color: ${COLORS.gray}; font-size: 10pt; margin: 5pt 0; }
</style></head>
<body>
<div class="header">
  <div class="icon-box"><p class="icon-text">AI</p></div>
  <h1>AIサービスカテゴリー</h1>
</div>
<div class="content">
  <div class="category">
    <p class="cat-title">会話・文章生成</p>
    <p class="cat-item">ChatGPT</p>
    <p class="cat-item">Claude</p>
    <p class="cat-item">Gemini</p>
    <p class="cat-item">Perplexity</p>
  </div>
  <div class="category">
    <p class="cat-title">画像・動画生成</p>
    <p class="cat-item">Midjourney</p>
    <p class="cat-item">DALL-E 3</p>
    <p class="cat-item">Stable Diffusion</p>
    <p class="cat-item">Sora</p>
  </div>
  <div class="category">
    <p class="cat-title">開発・業務支援</p>
    <p class="cat-item">GitHub Copilot</p>
    <p class="cat-item">Cursor</p>
    <p class="cat-item">Notion AI</p>
    <p class="cat-item">Jasper</p>
  </div>
</div>
</body>
</html>`;
}

// Slide 3: ChatGPT
async function createSlide3Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg3.png');
  await createGradientBg(bgPath, COLORS.dark, '#1A2332');

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 20pt 40pt 15pt 40pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
.section-tag { color: ${COLORS.teal}; font-size: 9pt; margin: 0 0 5pt 0; text-transform: uppercase; letter-spacing: 2pt; }
h1 { color: ${COLORS.white}; font-size: 26pt; margin: 0; }
.content { display: flex; flex: 1; padding: 15pt 40pt; gap: 30pt; }
.left-col { flex: 1.1; }
.right-col { flex: 1; display: flex; flex-direction: column; gap: 12pt; }
.intro { color: ${COLORS.gray}; font-size: 11pt; line-height: 1.5; margin: 0 0 15pt 0; }
.stats-row { display: flex; gap: 15pt; margin-top: 10pt; }
.stat-box {
  background: rgba(94, 168, 167, 0.15);
  border-radius: 8pt;
  padding: 12pt 15pt;
  flex: 1;
  text-align: center;
}
.stat-num { color: ${COLORS.teal}; font-size: 22pt; margin: 0; font-weight: bold; }
.stat-label { color: ${COLORS.gray}; font-size: 8pt; margin: 3pt 0 0 0; }
.feature-card {
  background: rgba(255,255,255,0.03);
  border-left: 3pt solid ${COLORS.coral};
  padding: 10pt 15pt;
  border-radius: 0 8pt 8pt 0;
}
.feature-title { color: ${COLORS.white}; font-size: 11pt; margin: 0 0 4pt 0; font-weight: bold; }
.feature-desc { color: ${COLORS.gray}; font-size: 9pt; margin: 0; }
</style></head>
<body>
<div class="header">
  <p class="section-tag">Featured Service 01</p>
  <h1>ChatGPT - OpenAI</h1>
</div>
<div class="content">
  <div class="left-col">
    <p class="intro">OpenAIが開発した対話型AIアシスタント。GPT-4 Turboを搭載し、テキスト生成、コード作成、分析、クリエイティブ作業まで幅広く対応。</p>
    <div class="stats-row">
      <div class="stat-box">
        <p class="stat-num">200M+</p>
        <p class="stat-label">週間アクティブユーザー</p>
      </div>
      <div class="stat-box">
        <p class="stat-num">128K</p>
        <p class="stat-label">コンテキスト長</p>
      </div>
    </div>
  </div>
  <div class="right-col">
    <div class="feature-card">
      <p class="feature-title">GPTs カスタマイズ</p>
      <p class="feature-desc">用途別のカスタムAIを作成可能</p>
    </div>
    <div class="feature-card">
      <p class="feature-title">マルチモーダル対応</p>
      <p class="feature-desc">画像認識・音声入出力に対応</p>
    </div>
    <div class="feature-card">
      <p class="feature-title">プラグイン連携</p>
      <p class="feature-desc">外部サービスとのシームレスな統合</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// Slide 4: Claude
async function createSlide4Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg4.png');
  await createGradientBg(bgPath, COLORS.dark, '#1A2332');

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 20pt 40pt 15pt 40pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
.section-tag { color: ${COLORS.teal}; font-size: 9pt; margin: 0 0 5pt 0; text-transform: uppercase; letter-spacing: 2pt; }
h1 { color: ${COLORS.white}; font-size: 26pt; margin: 0; }
.content { display: flex; flex: 1; padding: 15pt 40pt; gap: 30pt; }
.left-col { flex: 1.1; }
.right-col { flex: 1; }
.intro { color: ${COLORS.gray}; font-size: 11pt; line-height: 1.5; margin: 0 0 15pt 0; }
.highlight-box {
  background: rgba(254, 68, 71, 0.1);
  border: 1pt solid rgba(254, 68, 71, 0.3);
  border-radius: 10pt;
  padding: 15pt;
  margin-top: 10pt;
}
.highlight-title { color: ${COLORS.coral}; font-size: 12pt; margin: 0 0 8pt 0; font-weight: bold; }
.highlight-text { color: ${COLORS.gray}; font-size: 10pt; margin: 0; line-height: 1.4; }
.feature-list { margin-top: 10pt; }
.feature-item {
  display: flex; align-items: flex-start; gap: 10pt;
  margin-bottom: 12pt;
}
.feature-dot {
  width: 8pt; height: 8pt;
  background: ${COLORS.deepTeal};
  border-radius: 50%;
  margin-top: 3pt;
  flex-shrink: 0;
}
.feature-content { flex: 1; }
.feature-title { color: ${COLORS.white}; font-size: 11pt; margin: 0; font-weight: bold; }
.feature-desc { color: ${COLORS.gray}; font-size: 9pt; margin: 3pt 0 0 0; }
</style></head>
<body>
<div class="header">
  <p class="section-tag">Featured Service 02</p>
  <h1>Claude - Anthropic</h1>
</div>
<div class="content">
  <div class="left-col">
    <p class="intro">Anthropicが開発した安全性重視のAIアシスタント。200Kトークンの長大なコンテキストで、複雑な文書分析や長文作成に特化。</p>
    <div class="highlight-box">
      <p class="highlight-title">Constitutional AI</p>
      <p class="highlight-text">倫理的なガイドラインに基づく安全設計で、企業利用に適した信頼性を提供</p>
    </div>
  </div>
  <div class="right-col">
    <div class="feature-list">
      <div class="feature-item">
        <div class="feature-dot"></div>
        <div class="feature-content">
          <p class="feature-title">長文理解・要約</p>
          <p class="feature-desc">書籍1冊分の分析が可能</p>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-dot"></div>
        <div class="feature-content">
          <p class="feature-title">コード生成</p>
          <p class="feature-desc">高品質なプログラミング支援</p>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-dot"></div>
        <div class="feature-content">
          <p class="feature-title">Artifacts機能</p>
          <p class="feature-desc">リアルタイムでコード実行・可視化</p>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

// Slide 5: Midjourney
async function createSlide5Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg5.png');
  await createGradientBg(bgPath, COLORS.dark, '#1A2332');

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 20pt 40pt 15pt 40pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
.section-tag { color: ${COLORS.coral}; font-size: 9pt; margin: 0 0 5pt 0; text-transform: uppercase; letter-spacing: 2pt; }
h1 { color: ${COLORS.white}; font-size: 26pt; margin: 0; }
.content { display: flex; flex: 1; padding: 15pt 40pt; gap: 25pt; }
.card {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border-radius: 12pt;
  padding: 18pt;
  display: flex;
  flex-direction: column;
}
.card-icon {
  width: 36pt; height: 36pt;
  background: ${COLORS.deepTeal};
  border-radius: 8pt;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12pt;
}
.icon-text { color: ${COLORS.white}; font-size: 16pt; margin: 0; }
.card-title { color: ${COLORS.white}; font-size: 13pt; margin: 0 0 8pt 0; font-weight: bold; }
.card-desc { color: ${COLORS.gray}; font-size: 9pt; margin: 0; line-height: 1.4; flex: 1; }
.card-stat { color: ${COLORS.teal}; font-size: 10pt; margin: 10pt 0 0 0; font-weight: bold; }
</style></head>
<body>
<div class="header">
  <p class="section-tag">Featured Service 03</p>
  <h1>Midjourney - 画像生成AI</h1>
</div>
<div class="content">
  <div class="card">
    <div class="card-icon"><p class="icon-text">V6</p></div>
    <p class="card-title">超高品質画像</p>
    <p class="card-desc">V6モデルによるフォトリアリスティックな画像生成。ディテールと構図の精度が大幅向上</p>
    <p class="card-stat">解像度: 最大4K</p>
  </div>
  <div class="card">
    <div class="card-icon"><p class="icon-text">AI</p></div>
    <p class="card-title">スタイル制御</p>
    <p class="card-desc">アート、写真、イラストなど多彩なスタイルをプロンプトで自在にコントロール</p>
    <p class="card-stat">100+スタイル対応</p>
  </div>
  <div class="card">
    <div class="card-icon"><p class="icon-text">WEB</p></div>
    <p class="card-title">Web版リリース</p>
    <p class="card-desc">Discord不要のWebインターフェースで、より直感的な操作が可能に</p>
    <p class="card-stat">2024年正式公開</p>
  </div>
</div>
</body>
</html>`;
}

// Slide 6: GitHub Copilot
async function createSlide6Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg6.png');
  await createGradientBg(bgPath, COLORS.dark, '#1A2332');

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 18pt 40pt 12pt 40pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
.section-tag { color: ${COLORS.teal}; font-size: 9pt; margin: 0 0 4pt 0; text-transform: uppercase; letter-spacing: 2pt; }
h1 { color: ${COLORS.white}; font-size: 24pt; margin: 0; }
.content { display: flex; flex: 1; padding: 12pt 40pt 25pt 40pt; gap: 25pt; }
.left-col { flex: 1; }
.right-col { flex: 1; }
.intro { color: ${COLORS.gray}; font-size: 10pt; line-height: 1.4; margin: 0 0 12pt 0; }
.metric-grid { display: flex; flex-wrap: wrap; gap: 8pt; }
.metric-box {
  width: calc(50% - 4pt);
  background: rgba(39, 120, 132, 0.2);
  border-radius: 6pt;
  padding: 10pt;
  text-align: center;
}
.metric-num { color: ${COLORS.teal}; font-size: 18pt; margin: 0; font-weight: bold; }
.metric-label { color: ${COLORS.gray}; font-size: 7pt; margin: 3pt 0 0 0; }
.placeholder {
  background: rgba(94, 168, 167, 0.1);
  border: 1pt dashed ${COLORS.teal};
  border-radius: 8pt;
  height: 160pt;
}
</style></head>
<body>
<div class="header">
  <p class="section-tag">Featured Service 04</p>
  <h1>GitHub Copilot - 開発支援AI</h1>
</div>
<div class="content">
  <div class="left-col">
    <p class="intro">GitHub と OpenAI が共同開発したAIペアプログラマー。コードの自動補完、関数生成、バグ修正をリアルタイムで支援。</p>
    <div class="metric-grid">
      <div class="metric-box">
        <p class="metric-num">55%</p>
        <p class="metric-label">コーディング速度向上</p>
      </div>
      <div class="metric-box">
        <p class="metric-num">1.8M</p>
        <p class="metric-label">有料ユーザー数</p>
      </div>
      <div class="metric-box">
        <p class="metric-num">40%</p>
        <p class="metric-label">コード採用率</p>
      </div>
      <div class="metric-box">
        <p class="metric-num">100+</p>
        <p class="metric-label">対応言語</p>
      </div>
    </div>
  </div>
  <div class="right-col">
    <div id="chart" class="placeholder"></div>
  </div>
</div>
</body>
</html>`;
}

// Slide 7: Comparison
async function createSlide7Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg7.png');
  await createGradientBg(bgPath, COLORS.dark, COLORS.lightBg);

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 20pt 40pt 15pt 40pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
h1 { color: ${COLORS.white}; font-size: 24pt; margin: 0; }
.content { flex: 1; padding: 15pt 40pt; }
.table-wrapper {
  background: rgba(255,255,255,0.02);
  border-radius: 10pt;
  padding: 15pt;
}
.placeholder {
  background: rgba(94, 168, 167, 0.05);
  border: 1pt dashed rgba(94, 168, 167, 0.3);
  border-radius: 4pt;
  height: 200pt;
}
</style></head>
<body>
<div class="header">
  <h1>主要AIサービス機能比較</h1>
</div>
<div class="content">
  <div class="table-wrapper">
    <div id="table" class="placeholder"></div>
  </div>
</div>
</body>
</html>`;
}

// Slide 8: Use Cases
async function createSlide8Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg8.png');
  await createGradientBg(bgPath, COLORS.dark, '#1A2332');

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 20pt 40pt 15pt 40pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
h1 { color: ${COLORS.white}; font-size: 24pt; margin: 0; }
.content { display: flex; flex: 1; padding: 15pt 40pt; gap: 20pt; }
.use-case {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border-radius: 12pt;
  padding: 15pt;
  border-bottom: 3pt solid ${COLORS.teal};
}
.use-case:nth-child(2) { border-bottom-color: ${COLORS.coral}; }
.use-case:nth-child(3) { border-bottom-color: ${COLORS.deepTeal}; }
.use-case:nth-child(4) { border-bottom-color: #9B59B6; }
.case-title { color: ${COLORS.white}; font-size: 12pt; margin: 0 0 8pt 0; font-weight: bold; }
.case-desc { color: ${COLORS.gray}; font-size: 9pt; margin: 0 0 10pt 0; line-height: 1.3; }
.case-tools { color: ${COLORS.teal}; font-size: 8pt; margin: 0; }
</style></head>
<body>
<div class="header">
  <h1>業種別活用シーン</h1>
</div>
<div class="content">
  <div class="use-case">
    <p class="case-title">マーケティング</p>
    <p class="case-desc">コンテンツ作成、広告コピー、SNS運用の効率化</p>
    <p class="case-tools">ChatGPT / Jasper / Midjourney</p>
  </div>
  <div class="use-case">
    <p class="case-title">ソフトウェア開発</p>
    <p class="case-desc">コード生成、デバッグ、ドキュメント作成</p>
    <p class="case-tools">Copilot / Claude / Cursor</p>
  </div>
  <div class="use-case">
    <p class="case-title">リサーチ・分析</p>
    <p class="case-desc">情報収集、データ分析、レポート作成</p>
    <p class="case-tools">Perplexity / Claude / Gemini</p>
  </div>
  <div class="use-case">
    <p class="case-title">クリエイティブ</p>
    <p class="case-desc">デザイン、動画制作、音楽生成</p>
    <p class="case-tools">Midjourney / Sora / Suno</p>
  </div>
</div>
</body>
</html>`;
}

// Slide 9: Future Trends
async function createSlide9Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg9.png');
  await createGradientBg(bgPath, COLORS.dark, '#1A2332');

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}'); background-size: cover;
}
.header {
  padding: 20pt 40pt 15pt 40pt;
  border-bottom: 1pt solid rgba(94, 168, 167, 0.3);
}
h1 { color: ${COLORS.white}; font-size: 24pt; margin: 0; }
.content { display: flex; flex: 1; padding: 15pt 40pt; gap: 25pt; }
.timeline { flex: 1; display: flex; flex-direction: column; gap: 12pt; }
.year-block {
  display: flex; gap: 15pt; align-items: flex-start;
}
.year-badge-wrap {
  background: ${COLORS.deepTeal};
  padding: 6pt 12pt;
  border-radius: 6pt;
  min-width: 50pt;
  text-align: center;
}
.year-badge {
  color: ${COLORS.white};
  font-size: 11pt;
  margin: 0;
  font-weight: bold;
}
.year-content { flex: 1; }
.trend-title { color: ${COLORS.white}; font-size: 12pt; margin: 0 0 4pt 0; font-weight: bold; }
.trend-desc { color: ${COLORS.gray}; font-size: 9pt; margin: 0; line-height: 1.3; }
.insight-panel {
  width: 200pt;
  background: rgba(254, 68, 71, 0.1);
  border: 1pt solid rgba(254, 68, 71, 0.3);
  border-radius: 12pt;
  padding: 18pt;
}
.insight-title { color: ${COLORS.coral}; font-size: 12pt; margin: 0 0 10pt 0; font-weight: bold; }
.insight-text { color: ${COLORS.gray}; font-size: 10pt; margin: 0; line-height: 1.5; }
</style></head>
<body>
<div class="header">
  <h1>今後のトレンド予測</h1>
</div>
<div class="content">
  <div class="timeline">
    <div class="year-block">
      <div class="year-badge-wrap"><p class="year-badge">2025</p></div>
      <div class="year-content">
        <p class="trend-title">エージェントAIの台頭</p>
        <p class="trend-desc">自律的にタスクを実行するAIエージェントが実用化</p>
      </div>
    </div>
    <div class="year-block">
      <div class="year-badge-wrap"><p class="year-badge">2025</p></div>
      <div class="year-content">
        <p class="trend-title">マルチモーダル統合</p>
        <p class="trend-desc">テキスト・画像・音声・動画の統合処理が標準に</p>
      </div>
    </div>
    <div class="year-block">
      <div class="year-badge-wrap"><p class="year-badge">2026</p></div>
      <div class="year-content">
        <p class="trend-title">パーソナルAI</p>
        <p class="trend-desc">個人に最適化されたAIアシスタントの普及</p>
      </div>
    </div>
  </div>
  <div class="insight-panel">
    <p class="insight-title">Key Insight</p>
    <p class="insight-text">AIサービスは「ツール」から「パートナー」へ進化。業務の自動化から意思決定支援まで、その役割は大きく拡大していきます。</p>
  </div>
</div>
</body>
</html>`;
}

// Slide 10: Thank You
async function createSlide10Html() {
  const bgPath = path.join(WORKSPACE, 'svc-bg10.png');
  await createGradientBg(bgPath, '#1A2332', COLORS.dark);

  return `<!DOCTYPE html>
<html><head><style>
html { background: ${COLORS.dark}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  background-image: url('${bgPath}'); background-size: cover;
}
.container { text-align: center; }
.top-line {
  width: 50pt; height: 3pt;
  background: ${COLORS.coral};
  margin: 0 auto 20pt auto;
  border-radius: 2pt;
}
h1 { color: ${COLORS.white}; font-size: 36pt; margin: 0 0 12pt 0; }
h2 { color: ${COLORS.teal}; font-size: 16pt; margin: 0 0 25pt 0; font-weight: normal; }
.contact { color: ${COLORS.gray}; font-size: 10pt; margin: 0; }
</style></head>
<body>
<div class="container">
  <div class="top-line"></div>
  <h1>Thank You</h1>
  <h2>AIで、新しい働き方を</h2>
  <p class="contact">Questions? ai-services@example.com</p>
</div>
</body>
</html>`;
}

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = '注目のAIサービス 2025';
  pptx.author = 'AI Services Team';

  // Slide 1: Title
  const slide1Html = await createSlide1Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide1.html'), slide1Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide1.html'), pptx);

  // Slide 2: Overview
  const slide2Html = await createSlide2Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide2.html'), slide2Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide2.html'), pptx);

  // Slide 3: ChatGPT
  const slide3Html = await createSlide3Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide3.html'), slide3Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide3.html'), pptx);

  // Slide 4: Claude
  const slide4Html = await createSlide4Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide4.html'), slide4Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide4.html'), pptx);

  // Slide 5: Midjourney
  const slide5Html = await createSlide5Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide5.html'), slide5Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide5.html'), pptx);

  // Slide 6: GitHub Copilot with Chart
  const slide6Html = await createSlide6Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide6.html'), slide6Html);
  const { slide: slide6, placeholders: ph6 } = await html2pptx(path.join(WORKSPACE, 'svc-slide6.html'), pptx);

  if (ph6.length > 0) {
    slide6.addChart(pptx.charts.BAR, [{
      name: '開発効率向上率 (%)',
      labels: ['コード補完', 'バグ修正', 'ドキュメント', 'テスト作成'],
      values: [55, 40, 62, 35]
    }], {
      ...ph6[0],
      barDir: 'bar',
      showTitle: false,
      showLegend: false,
      showCatAxisTitle: false,
      showValAxisTitle: true,
      valAxisTitle: '効率向上 (%)',
      valAxisMaxVal: 70,
      valAxisMinVal: 0,
      chartColors: [COLORS.tealHex],
      dataLabelPosition: 'outEnd',
      showValue: true,
      dataLabelColor: COLORS.whiteHex,
      dataLabelFontSize: 9
    });
  }

  // Slide 7: Comparison Table
  const slide7Html = await createSlide7Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide7.html'), slide7Html);
  const { slide: slide7, placeholders: ph7 } = await html2pptx(path.join(WORKSPACE, 'svc-slide7.html'), pptx);

  if (ph7.length > 0) {
    const tableData = [
      [
        { text: 'サービス', options: { fill: { color: COLORS.tealHex }, color: COLORS.whiteHex, bold: true } },
        { text: '主な用途', options: { fill: { color: COLORS.tealHex }, color: COLORS.whiteHex, bold: true } },
        { text: '料金', options: { fill: { color: COLORS.tealHex }, color: COLORS.whiteHex, bold: true } },
        { text: '特徴', options: { fill: { color: COLORS.tealHex }, color: COLORS.whiteHex, bold: true } }
      ],
      ['ChatGPT Plus', '汎用対話', '$20/月', 'GPT-4、プラグイン対応'],
      ['Claude Pro', '長文分析', '$20/月', '200Kコンテキスト'],
      ['Midjourney', '画像生成', '$10~/月', 'アート品質No.1'],
      ['GitHub Copilot', 'コード補完', '$10/月', 'IDE統合'],
      ['Perplexity Pro', 'リサーチ', '$20/月', 'リアルタイム検索']
    ];

    slide7.addTable(tableData, {
      x: ph7[0].x,
      y: ph7[0].y,
      w: ph7[0].w,
      h: ph7[0].h,
      colW: [1.6, 1.5, 1.2, 2.7],
      border: { pt: 0.5, color: '333333' },
      fill: { color: COLORS.lightBg.replace('#', '') },
      color: 'CCCCCC',
      fontSize: 10,
      align: 'center',
      valign: 'middle'
    });
  }

  // Slide 8: Use Cases
  const slide8Html = await createSlide8Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide8.html'), slide8Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide8.html'), pptx);

  // Slide 9: Future Trends
  const slide9Html = await createSlide9Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide9.html'), slide9Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide9.html'), pptx);

  // Slide 10: Thank You
  const slide10Html = await createSlide10Html();
  fs.writeFileSync(path.join(WORKSPACE, 'svc-slide10.html'), slide10Html);
  await html2pptx(path.join(WORKSPACE, 'svc-slide10.html'), pptx);

  // Save presentation
  const outputPath = path.join(WORKSPACE, 'AI_Services_2025.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation saved to: ${outputPath}`);
}

main().catch(console.error);
