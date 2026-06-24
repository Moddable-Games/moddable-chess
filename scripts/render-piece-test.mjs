import { renderSvg } from '../js/chess-svg.js';
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';

const fen = process.argv[2] || 'rnbqkacm/spfgylh1/8/8/8/8/SPFGYLH1/RNBQKACM w - - 0 1';
const size = parseInt(process.argv[3] || '480');

const svg = renderSvg({ variant: 'standard', fen, size });
if (!svg) { console.error('Failed to render SVG'); process.exit(1); }

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
const png = resvg.render().asPng();
const outPath = '/tmp/piece-test.png';
writeFileSync(outPath, png);
console.log(`Rendered to ${outPath} (${png.length} bytes)`);
