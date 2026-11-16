import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('Production HTTP music verifier parses before merge and deployment',()=>{
 const file=fileURLToPath(new URL('../scripts/verify-current-music-production.mjs',import.meta.url));
 const output=execFileSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(output,'');
});
