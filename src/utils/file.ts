import fs from 'fs';

/**
 * Lê as últimas N linhas de um arquivo de forma eficiente.
 */
export function readLastLines(filePath: string, maxLines: number): string {
  if (!fs.existsSync(filePath)) return 'Arquivo não encontrado.';
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length <= maxLines) return content;
  
  return lines.slice(-maxLines).join('\n');
}
