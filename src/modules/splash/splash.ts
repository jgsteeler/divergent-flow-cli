import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { getTheme } from '../../config/theme'; // Generic GSC theme

interface PackageJSON { version?: string; name?: string; }

function readPackageVersion(): PackageJSON {
  try {
    const pkgPath = path.resolve(__dirname, '../../../package.json');
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    return JSON.parse(raw) as PackageJSON;
  } catch {
    return { version: '0.0.0' };
  }
}

function buildGradient(text: string): string {
  const theme = getTheme();
  return (gradient as any)(...theme.gradient)(text);
}

interface FigletResult { text: string; width: number; font?: string; }

function renderFiglet(text: string, font: string): FigletResult | null {
  try {
    const rendered = figlet.textSync(text, { font: font as any, horizontalLayout: 'default', verticalLayout: 'default' });
    const width = rendered.split('\n').reduce((m, l) => Math.max(m, l.length), 0);
    return { text: rendered, width, font };
  } catch { return null; }
}

function chooseFigletThatFits(word: string, termWidth: number): FigletResult | null {
  const fonts = ['Standard', 'Small', 'Mini']; // try biggest first now
  const maxWidth = termWidth - 6; // safety for box borders/padding
  let chosen: FigletResult | null = null;
  for (const f of fonts) {
    const res = renderFiglet(word, f);
    if (res && res.width <= maxWidth) { chosen = res; break; }
  }
  return chosen;
}

type TitleMode = 'figlet' | 'simple';

function getRequestedMode(): TitleMode | 'auto' {
  const env = process.env.DF_TITLE_MODE?.toLowerCase();
  if (!env) return 'figlet'; // default try figlet
  if (env === 'figlet' || env === 'simple') return env;
  return 'figlet';
}

export function showSplash() {
  const { version = '0.0.0', name = 'divergent-flow-cli' } = readPackageVersion();
  const termWidth = Math.max(process.stdout.columns || 80, 40);

  const requested = getRequestedMode();
  const tryFiglet = requested !== 'simple';
  const divergentFiglet = tryFiglet ? chooseFigletThatFits('Divergent', termWidth) : null;
  const flowFiglet = tryFiglet ? chooseFigletThatFits('Flow CLI', termWidth) : null;

  let titleBlockColored: string;
  let rawLinesWidth = 0; // width w/o ANSI for the title block only
  if (divergentFiglet && flowFiglet && requested !== 'simple') {
    // Center the second block (Flow CLI) relative to Divergent width
    const baseWidth = Math.max(divergentFiglet.width, flowFiglet.width);
    function centerBlock(block: string, width: number): string {
      return block.split('\n').map(line => {
        const pad = Math.max(0, Math.floor((width - line.length) / 2));
        return ' '.repeat(pad) + line;
      }).join('\n');
    }
    const divergentCentered = centerBlock(divergentFiglet.text, baseWidth);
    const flowCentered = centerBlock(flowFiglet.text, baseWidth);
    const raw = divergentCentered + '\n' + flowCentered;
    rawLinesWidth = baseWidth;
    titleBlockColored = raw.split('\n').map(line => buildGradient(line)).join('\n');
  } else {
    // Simple fallback: plain bold text lines (gradient applied per word)
    const divergentSimple = buildGradient(chalk.bold('Divergent'));
    const flowSimple = buildGradient(chalk.bold('Flow CLI')); // small indent with CLI
    titleBlockColored = divergentSimple + '\n' + flowSimple;
    rawLinesWidth = Math.max('Divergent'.length, 'Flow CLI'.length);
  }

  const versionRaw = `v${version}`;
  const mottoRaw = 'Enabling neurodivergent minds to flow.';
  const theme = getTheme();
  const versionText = chalk.hex(theme.versionColor).bold(versionRaw);
  const motto = chalk.hex(theme.mottoColor).italic(mottoRaw);

  // A: tighten spacing -> single blank line between sections (title, separator, meta)
  // B: gradient separator line sized to title width (rawLinesWidth)
  const separatorWidth = Math.min(rawLinesWidth, termWidth - 4); // safety against overflow
  const separatorRaw = '─'.repeat(Math.max(8, separatorWidth));
  const separator = buildGradient(separatorRaw);

  // Top separator (same width & style) placed above title per request
  const topSeparator = separator; // reuse same styling
  const footerLine1 = chalk.dim('GSC Productivity');
  const footerLine2 = chalk.dim('(a division of Gibson Service Company, LLC)');
  const footerSeparator = chalk.dim('─'.repeat(Math.min( Math.max(12, Math.floor(rawLinesWidth * 0.6)), separatorWidth )));
  const content = [
    topSeparator,
    titleBlockColored,
    separator,
    versionText,
    motto,
    '',
    footerSeparator,
    footerLine1,
    footerLine2
  ].join('\n');

  // E: center relative to title block width (not entire terminal) for a tighter layout
  const lines = content.split('\n');
  const targetWidth = Math.min(rawLinesWidth, termWidth - 2);

  function visibleLength(str: string): number {
    return str.replace(/\x1b\[[0-9;]*m/g,'').length;
  }

  const centered = lines.map(line => {
    const rawLen = visibleLength(line);
    const widthToUse = Math.max(targetWidth, rawLen);
    if (rawLen >= widthToUse) return line;
    const totalPad = widthToUse - rawLen;
    const left = Math.floor(totalPad / 2);
    return ' '.repeat(left) + line;
  }).join('\n');

  console.log('\n' + centered + '\n');
}
