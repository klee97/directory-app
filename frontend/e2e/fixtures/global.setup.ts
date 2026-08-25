import { execSync } from 'child_process';

export default function globalSetup() {
  try {
    const status = execSync('npx supabase status', { stdio: 'pipe' }).toString();
    // Older CLIs print a "Project URL" table; newer ones emit JSON with API_URL.
    if (!status.includes('Project URL') && !status.includes('API_URL')) {
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