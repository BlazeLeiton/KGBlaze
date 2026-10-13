import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const wrangler=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');

test('Cloudflare deploy preserves dashboard-managed plaintext variables',()=>{
 assert.match(wrangler,/^keep_vars\s*=\s*true\s*$/m);
});

test('User-approved YouTube preview remains ready without a manual flag toggle',()=>{
 assert.match(wrangler,/^YOUTUBE_PREVIEW_ENABLED\s*=\s*"true"\s*$/m);
 assert.match(wrangler,/^YOUTUBE_CHANNEL_ID\s*=\s*"UCRd_uwPjrsf6Z3CRXwNehEQ"\s*$/m);
 assert.match(wrangler,/^name\s*=\s*"YOUTUBE_PREVIEW_LIMITER"\s*$/m);
 assert.doesNotMatch(wrangler,/^\s*(ADMIN_TOKEN|YOUTUBE_API_KEY)\s*=/m);
});

test('No automatic polling or cron is enabled by this configuration',()=>{
 assert.doesNotMatch(wrangler,/^\s*\[triggers\]\s*$/m);
 assert.doesNotMatch(wrangler,/^\s*crons\s*=/m);
});
