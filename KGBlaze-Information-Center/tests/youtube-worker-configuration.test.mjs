test('Cloudflare Dashboard bindings survive automated Wrangler deployment',()=>{
  assert.match(config,/^keep_vars\s*=\s*true$/m);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const config=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');

test('Cloudflare limiter binding matches the manually saved dashboard configuration',()=>{
  assert.match(config,/\[\[ratelimits\]\]\s*name\s*=\s*"YOUTUBE_PREVIEW_LIMITER"\s*namespace_id\s*=\s*"1001"\s*\[ratelimits\.simple\]\s*limit\s*=\s*1\s*period\s*=\s*60/);
});
test('YouTube preview stays off by default and credentials never enter Wrangler',()=>{
  assert.match(config,/^YOUTUBE_CHANNEL_ID\s*=\s*"UCRd_uwPjrsf6Z3CRXwNehEQ"$/m);
  assert.doesNotMatch(config,/^\s*YOUTUBE_PREVIEW_ENABLED\s*=/m);
  assert.doesNotMatch(config,/^\s*YOUTUBE_API_KEY\s*=/m);
  assert.doesNotMatch(config,/^\s*ADMIN_TOKEN\s*=/m);
  assert.doesNotMatch(config,/^\s*crons\s*=\s*\[/m);
});
