import { spawnSync } from 'node:child_process';

// GitHub Pages 向けビルド。リポジトリ名のサブパス配下で配信されるため basePath を付ける。
// 通常の `npm run build`（Cloudflare / ローカル）はルート配信のまま影響を受けない。
process.env.PAGES_BASE_PATH = process.env.PAGES_BASE_PATH || '/dialogue-verification-model';

const result = spawnSync('npx', ['vinext', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
