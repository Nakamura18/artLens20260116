const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/mnakamura/.claude/plugins/cache/anthropic-agent-skills/example-skills/69c0b1a06741/skills/pptx/scripts/html2pptx.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/mnakamura/Documents/2026/artLens20260117/workspace/ai-presentation';

// Color palette
const COLORS = {
  purple: '#B165FB',
  purpleHex: 'B165FB',
  darkNavy: '#181B24',
  darkNavyHex: '181B24',
  emerald: '#40695B',
  emeraldHex: '40695B',
  white: '#FFFFFF',
  whiteHex: 'FFFFFF',
  lightPurple: '#D4A5FF',
  darkPurple: '#7B3FBF'
};

async function createGradientBg(filename, color1, color2, angle = 135) {
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

async function createIcon(iconSvg, filename, size = 128) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${iconSvg}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(filename);
  return filename;
}

async function createSlide1Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide1.png');
  await createGradientBg(bgPath, COLORS.darkNavy, '#2A1F4E');

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}');
  background-size: cover;
}
.container {
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  height: 100%; padding: 40pt;
}
.accent-line {
  width: 80pt; height: 4pt;
  background: ${COLORS.purple};
  margin-bottom: 20pt;
  border-radius: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 44pt;
  margin: 0 0 15pt 0;
  text-align: center;
  letter-spacing: 2pt;
}
h2 {
  color: ${COLORS.lightPurple};
  font-size: 20pt;
  margin: 0;
  font-weight: normal;
  text-align: center;
}
.year {
  color: ${COLORS.purple};
  font-size: 16pt;
  margin-top: 30pt;
}
</style>
</head>
<body>
<div class="container">
  <div class="accent-line"></div>
  <h1>最新AI技術の展望</h1>
  <h2>2025年の革新と未来への道筋</h2>
  <p class="year">Technology Overview 2025</p>
</div>
</body>
</html>`;
}

async function createSlide2Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide2.png');
  await createGradientBg(bgPath, COLORS.darkNavy, '#1E2832');

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}');
  background-size: cover;
}
.header {
  padding: 25pt 40pt 15pt 40pt;
  border-bottom: 2pt solid ${COLORS.purple};
}
h1 {
  color: ${COLORS.white};
  font-size: 28pt;
  margin: 0;
}
.content {
  display: flex;
  flex: 1;
  padding: 20pt 40pt;
  gap: 30pt;
}
.left-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15pt;
}
.stat-box {
  background: rgba(177, 101, 251, 0.15);
  border-left: 4pt solid ${COLORS.purple};
  padding: 15pt 20pt;
  border-radius: 0 8pt 8pt 0;
}
.stat-number {
  color: ${COLORS.purple};
  font-size: 32pt;
  margin: 0;
  font-weight: bold;
}
.stat-label {
  color: ${COLORS.white};
  font-size: 11pt;
  margin: 5pt 0 0 0;
}
.right-col {
  flex: 1.2;
}
.intro-text {
  color: #CCCCCC;
  font-size: 12pt;
  line-height: 1.6;
  margin: 0;
}
</style>
</head>
<body>
<div class="header">
  <h1>アジェンダ</h1>
</div>
<div class="content">
  <div class="left-col">
    <div class="stat-box">
      <p class="stat-number">$184B</p>
      <p class="stat-label">2025年 AI市場規模予測</p>
    </div>
    <div class="stat-box">
      <p class="stat-number">+37%</p>
      <p class="stat-label">年間成長率</p>
    </div>
  </div>
  <div class="right-col">
    <p class="intro-text">本プレゼンテーションでは、2025年のAI技術における主要なトレンドと革新について解説します。大規模言語モデル、マルチモーダルAI、エッジAI、そして企業での実践的な導入戦略まで、包括的にカバーします。</p>
  </div>
</div>
</body>
</html>`;
}

async function createSlide3Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide3.png');
  await createGradientBg(bgPath, COLORS.darkNavy, '#1A1F2E');

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}');
  background-size: cover;
}
.header {
  padding: 25pt 40pt 15pt 40pt;
  border-bottom: 2pt solid ${COLORS.emerald};
}
.tag {
  color: ${COLORS.emerald};
  font-size: 10pt;
  margin: 0 0 5pt 0;
  text-transform: uppercase;
  letter-spacing: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 26pt;
  margin: 0;
}
.content {
  display: flex;
  flex: 1;
  padding: 20pt 40pt;
  gap: 25pt;
}
.card {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12pt;
  padding: 20pt;
  border: 1pt solid rgba(177, 101, 251, 0.3);
}
.card-title {
  color: ${COLORS.purple};
  font-size: 14pt;
  margin: 0 0 10pt 0;
  font-weight: bold;
}
.card-text {
  color: #BBBBBB;
  font-size: 10pt;
  line-height: 1.5;
  margin: 0;
}
</style>
</head>
<body>
<div class="header">
  <p class="tag">Section 01</p>
  <h1>大規模言語モデル (LLM) の進化</h1>
</div>
<div class="content">
  <div class="card">
    <p class="card-title">GPT-4 Turbo</p>
    <p class="card-text">128Kコンテキスト対応、マルチモーダル機能の強化、より低コストでの運用が可能に</p>
  </div>
  <div class="card">
    <p class="card-title">Claude 3.5</p>
    <p class="card-text">長文理解の精度向上、倫理的AIの実装、企業向け安全性機能</p>
  </div>
  <div class="card">
    <p class="card-title">Gemini Ultra</p>
    <p class="card-text">ネイティブマルチモーダル、科学的推論能力、Google製品との統合</p>
  </div>
</div>
</body>
</html>`;
}

async function createSlide4Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide4.png');
  await createGradientBg(bgPath, COLORS.darkNavy, '#1A1F2E');

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}');
  background-size: cover;
}
.header {
  padding: 25pt 40pt 15pt 40pt;
  border-bottom: 2pt solid ${COLORS.emerald};
}
.tag {
  color: ${COLORS.emerald};
  font-size: 10pt;
  margin: 0 0 5pt 0;
  text-transform: uppercase;
  letter-spacing: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 26pt;
  margin: 0;
}
.content {
  display: flex;
  flex: 1;
  padding: 20pt 40pt;
  gap: 30pt;
}
.left-col {
  flex: 1;
}
.feature-item {
  margin-bottom: 15pt;
}
.feature-title {
  color: ${COLORS.purple};
  font-size: 13pt;
  margin: 0 0 5pt 0;
  font-weight: bold;
}
.feature-desc {
  color: #AAAAAA;
  font-size: 10pt;
  margin: 0;
  line-height: 1.4;
}
.right-col {
  flex: 1;
}
.placeholder {
  background: rgba(177, 101, 251, 0.1);
  border: 1pt dashed ${COLORS.purple};
  border-radius: 8pt;
  height: 100%;
}
</style>
</head>
<body>
<div class="header">
  <p class="tag">Section 02</p>
  <h1>マルチモーダルAI</h1>
</div>
<div class="content">
  <div class="left-col">
    <div class="feature-item">
      <p class="feature-title">画像生成・編集</p>
      <p class="feature-desc">DALL-E 3, Midjourney V6による高品質な画像生成と精密な編集機能</p>
    </div>
    <div class="feature-item">
      <p class="feature-title">動画生成</p>
      <p class="feature-desc">Sora, Runway Gen-3による革新的な動画コンテンツ自動生成</p>
    </div>
    <div class="feature-item">
      <p class="feature-title">音声合成</p>
      <p class="feature-desc">自然な音声生成と多言語リアルタイム翻訳の実現</p>
    </div>
  </div>
  <div class="right-col">
    <div id="chart" class="placeholder"></div>
  </div>
</div>
</body>
</html>`;
}

async function createSlide5Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide5.png');
  await createGradientBg(bgPath, COLORS.darkNavy, '#1A1F2E');

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}');
  background-size: cover;
}
.header {
  padding: 25pt 40pt 15pt 40pt;
  border-bottom: 2pt solid ${COLORS.emerald};
}
.tag {
  color: ${COLORS.emerald};
  font-size: 10pt;
  margin: 0 0 5pt 0;
  text-transform: uppercase;
  letter-spacing: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 26pt;
  margin: 0;
}
.content {
  display: flex;
  flex: 1;
  padding: 20pt 40pt;
  gap: 25pt;
}
.card {
  flex: 1;
  background: linear-gradient(180deg, rgba(64, 105, 91, 0.2) 0%, rgba(64, 105, 91, 0.05) 100%);
  background: rgba(64, 105, 91, 0.15);
  border-radius: 12pt;
  padding: 18pt;
  border-top: 3pt solid ${COLORS.emerald};
}
.card-number {
  color: ${COLORS.emerald};
  font-size: 28pt;
  margin: 0;
  font-weight: bold;
}
.card-title {
  color: ${COLORS.white};
  font-size: 13pt;
  margin: 8pt 0;
  font-weight: bold;
}
.card-text {
  color: #AAAAAA;
  font-size: 9pt;
  line-height: 1.4;
  margin: 0;
}
</style>
</head>
<body>
<div class="header">
  <p class="tag">Section 03</p>
  <h1>エッジAI と IoT</h1>
</div>
<div class="content">
  <div class="card">
    <p class="card-number">01</p>
    <p class="card-title">デバイス上処理</p>
    <p class="card-text">クラウド不要のリアルタイム推論により、低遅延・高プライバシーを実現</p>
  </div>
  <div class="card">
    <p class="card-number">02</p>
    <p class="card-title">省電力AI</p>
    <p class="card-text">TinyMLによる超低消費電力での機械学習実行が可能に</p>
  </div>
  <div class="card">
    <p class="card-number">03</p>
    <p class="card-title">スマート製造</p>
    <p class="card-text">予知保全と品質管理の自動化による生産性向上</p>
  </div>
</div>
</body>
</html>`;
}

async function createSlide6Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide6.png');
  await createGradientBg(bgPath, COLORS.darkNavy, '#1A1F2E');

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}');
  background-size: cover;
}
.header {
  padding: 25pt 40pt 15pt 40pt;
  border-bottom: 2pt solid ${COLORS.emerald};
}
.tag {
  color: ${COLORS.emerald};
  font-size: 10pt;
  margin: 0 0 5pt 0;
  text-transform: uppercase;
  letter-spacing: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 26pt;
  margin: 0;
}
.content {
  display: flex;
  flex: 1;
  padding: 15pt 40pt;
  gap: 30pt;
}
.left-col {
  flex: 1.2;
}
.right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.placeholder {
  background: rgba(177, 101, 251, 0.1);
  border: 1pt dashed ${COLORS.purple};
  border-radius: 8pt;
  height: 220pt;
}
.insight-box {
  background: rgba(177, 101, 251, 0.1);
  border-radius: 8pt;
  padding: 15pt;
  margin-top: 10pt;
}
.insight-title {
  color: ${COLORS.purple};
  font-size: 11pt;
  margin: 0 0 8pt 0;
  font-weight: bold;
}
.insight-text {
  color: #BBBBBB;
  font-size: 10pt;
  margin: 0;
  line-height: 1.4;
}
</style>
</head>
<body>
<div class="header">
  <p class="tag">Section 04</p>
  <h1>AI市場成長予測</h1>
</div>
<div class="content">
  <div class="left-col">
    <div id="chart" class="placeholder"></div>
  </div>
  <div class="right-col">
    <div class="insight-box">
      <p class="insight-title">市場インサイト</p>
      <p class="insight-text">2025年以降、生成AIと企業向けソリューションが市場成長を牽引。特にヘルスケア、金融、製造業での導入が加速しています。</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

async function createSlide7Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide7.png');
  await createGradientBg(bgPath, COLORS.darkNavy, '#1A1F2E');

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  background-image: url('${bgPath}');
  background-size: cover;
}
.header {
  padding: 25pt 40pt 15pt 40pt;
  border-bottom: 2pt solid ${COLORS.emerald};
}
.tag {
  color: ${COLORS.emerald};
  font-size: 10pt;
  margin: 0 0 5pt 0;
  text-transform: uppercase;
  letter-spacing: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 26pt;
  margin: 0;
}
.content {
  flex: 1;
  padding: 15pt 40pt;
}
.table-container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8pt;
  padding: 15pt;
}
.table-title {
  color: ${COLORS.white};
  font-size: 12pt;
  margin: 0 0 10pt 0;
}
.placeholder {
  background: rgba(177, 101, 251, 0.05);
  border: 1pt dashed rgba(177, 101, 251, 0.3);
  border-radius: 4pt;
  height: 180pt;
}
</style>
</head>
<body>
<div class="header">
  <p class="tag">Section 05</p>
  <h1>主要AIモデル比較</h1>
</div>
<div class="content">
  <div class="table-container">
    <p class="table-title">2025年主要モデルの機能比較</p>
    <div id="table" class="placeholder"></div>
  </div>
</div>
</body>
</html>`;
}

async function createSlide8Html() {
  const bgPath = path.join(WORKSPACE, 'bg-slide8.png');
  await createGradientBg(bgPath, '#2A1F4E', COLORS.darkNavy);

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: ${COLORS.darkNavy}; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  font-family: Arial, sans-serif;
  display: flex; flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url('${bgPath}');
  background-size: cover;
}
.container {
  text-align: center;
  padding: 40pt;
}
.accent-line {
  width: 60pt; height: 3pt;
  background: ${COLORS.purple};
  margin: 0 auto 25pt auto;
  border-radius: 2pt;
}
h1 {
  color: ${COLORS.white};
  font-size: 36pt;
  margin: 0 0 15pt 0;
}
h2 {
  color: ${COLORS.lightPurple};
  font-size: 16pt;
  margin: 0 0 30pt 0;
  font-weight: normal;
}
.contact {
  color: #888888;
  font-size: 11pt;
  margin: 0;
}
</style>
</head>
<body>
<div class="container">
  <div class="accent-line"></div>
  <h1>Thank You</h1>
  <h2>AIが拓く新しい未来へ</h2>
  <p class="contact">Questions? Contact: ai-team@example.com</p>
</div>
</body>
</html>`;
}

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = '最新AI技術の展望';
  pptx.author = 'AI Technology Team';

  // Slide 1: Title
  const slide1Html = await createSlide1Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide1.html'), slide1Html);
  await html2pptx(path.join(WORKSPACE, 'slide1.html'), pptx);

  // Slide 2: Agenda
  const slide2Html = await createSlide2Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide2.html'), slide2Html);
  await html2pptx(path.join(WORKSPACE, 'slide2.html'), pptx);

  // Slide 3: LLM Evolution
  const slide3Html = await createSlide3Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide3.html'), slide3Html);
  await html2pptx(path.join(WORKSPACE, 'slide3.html'), pptx);

  // Slide 4: Multimodal AI with Chart
  const slide4Html = await createSlide4Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide4.html'), slide4Html);
  const { slide: slide4, placeholders: ph4 } = await html2pptx(path.join(WORKSPACE, 'slide4.html'), pptx);

  if (ph4.length > 0) {
    slide4.addChart(pptx.charts.PIE, [{
      name: 'Market Share',
      labels: ['画像生成', '動画生成', '音声合成', 'その他'],
      values: [42, 28, 18, 12]
    }], {
      ...ph4[0],
      showPercent: true,
      showLegend: true,
      legendPos: 'b',
      chartColors: [COLORS.purpleHex, COLORS.emeraldHex, 'D4A5FF', '666666']
    });
  }

  // Slide 5: Edge AI
  const slide5Html = await createSlide5Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide5.html'), slide5Html);
  await html2pptx(path.join(WORKSPACE, 'slide5.html'), pptx);

  // Slide 6: Market Growth with Chart
  const slide6Html = await createSlide6Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide6.html'), slide6Html);
  const { slide: slide6, placeholders: ph6 } = await html2pptx(path.join(WORKSPACE, 'slide6.html'), pptx);

  if (ph6.length > 0) {
    slide6.addChart(pptx.charts.BAR, [{
      name: 'AI市場規模 (十億ドル)',
      labels: ['2022', '2023', '2024', '2025', '2026'],
      values: [87, 120, 150, 184, 230]
    }], {
      ...ph6[0],
      barDir: 'col',
      showTitle: false,
      showLegend: false,
      showCatAxisTitle: true,
      catAxisTitle: '年度',
      showValAxisTitle: true,
      valAxisTitle: '市場規模 ($B)',
      valAxisMaxVal: 250,
      valAxisMinVal: 0,
      chartColors: [COLORS.purpleHex],
      dataLabelPosition: 'outEnd',
      showValue: true,
      dataLabelColor: COLORS.whiteHex,
      dataLabelFontSize: 9
    });
  }

  // Slide 7: Model Comparison Table
  const slide7Html = await createSlide7Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide7.html'), slide7Html);
  const { slide: slide7, placeholders: ph7 } = await html2pptx(path.join(WORKSPACE, 'slide7.html'), pptx);

  if (ph7.length > 0) {
    const tableData = [
      [
        { text: 'モデル', options: { fill: { color: COLORS.purpleHex }, color: COLORS.whiteHex, bold: true } },
        { text: 'コンテキスト長', options: { fill: { color: COLORS.purpleHex }, color: COLORS.whiteHex, bold: true } },
        { text: 'マルチモーダル', options: { fill: { color: COLORS.purpleHex }, color: COLORS.whiteHex, bold: true } },
        { text: '特徴', options: { fill: { color: COLORS.purpleHex }, color: COLORS.whiteHex, bold: true } }
      ],
      ['GPT-4 Turbo', '128K', '○', '汎用性・API充実'],
      ['Claude 3.5', '200K', '○', '長文理解・安全性'],
      ['Gemini Ultra', '1M', '○', 'Google統合'],
      ['Llama 3', '32K', '△', 'オープンソース']
    ];

    slide7.addTable(tableData, {
      x: ph7[0].x,
      y: ph7[0].y,
      w: ph7[0].w,
      h: ph7[0].h,
      colW: [1.8, 1.5, 1.3, 2.4],
      border: { pt: 0.5, color: '444444' },
      fill: { color: '1E2530' },
      color: 'CCCCCC',
      fontSize: 10,
      align: 'center',
      valign: 'middle'
    });
  }

  // Slide 8: Thank You
  const slide8Html = await createSlide8Html();
  fs.writeFileSync(path.join(WORKSPACE, 'slide8.html'), slide8Html);
  await html2pptx(path.join(WORKSPACE, 'slide8.html'), pptx);

  // Save presentation
  const outputPath = path.join(WORKSPACE, 'AI_Technology_2025.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation saved to: ${outputPath}`);
}

main().catch(console.error);
