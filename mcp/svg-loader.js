import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

export async function load(url, context, nextLoad) {
  if (url.endsWith('.svg')) {
    const path = fileURLToPath(url);
    const source = `export default ${JSON.stringify(readFileSync(path, 'utf8'))};`;
    return { format: 'module', source, shortCircuit: true };
  }
  return nextLoad(url, context);
}
