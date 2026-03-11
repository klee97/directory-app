import { execSync } from 'child_process';

export default function globalSetup() {
  try {
    const status = execSync('npx supabase status', { stdio: 'pipe' }).toString();
    if (!status.includes('Project URL')) {
      throw new Error();
    }
  } catch {
    throw new Error(
      '\n\nLocal Supabase is not running.\n' +
      'Start it with: npm run supabase:start\n' +
      'Then retry: npm run test:e2e\n'
    );
  }
}