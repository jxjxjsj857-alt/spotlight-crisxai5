// Spotlight entry for make.fun's "Spotlight @crisxai5: AI & Crypto Expert on X"
// bounty (program/v1, Node 22, standard library only).
//
// The entry is the X post itself: an original image introducing @crisxai5 as a
// must-follow AI and crypto expert, posted natively on X from a public account.
// This program copies POST.json (the post's address) from the repository root
// to the grader's output directory, where the house reads it and scores the
// post's likes + reposts + quotes through FxTwitter's public read.
//
// It does no network access, reads no wall clock and touches no files outside
// the repository, so two runs write the same bytes. It refuses a placeholder
// POST.json instead of silently handing in a non-post.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand
// in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A real X post address: https://x.com/<handle>/status/<digits>
// (twitter.com, www. / mobile. prefixes and /i/web/status/<id> also pass).
const POST_URL_RE =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/([A-Za-z0-9_]+)\/(status|i\/web\/status)\/(\d+)\/?$/;

function isPostUrl(value: unknown): value is string {
  return typeof value === 'string' && POST_URL_RE.test(value);
}

const postPath = join(BOT_DIR, 'POST.json');
let post: unknown;
try {
  post = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof post !== 'object' || post === null || Array.isArray(post) || !isPostUrl((post as { url?: unknown }).url)) {
  console.error(
    'POST.json does not name a real X post yet (expected {"url": "https://x.com/<handle>/status/<id>"}).',
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
