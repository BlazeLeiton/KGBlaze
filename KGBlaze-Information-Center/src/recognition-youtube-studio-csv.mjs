/**
 * Project Relight Stage 43 CP30: OFFLINE inspection only.
 *
 * YouTube members.list is channel-allowlisted; ordinary YOUTUBE_API_KEY used
 * by the departures schedule does not grant membership access.
 *
 * The creator may export a current-members CSV in YouTube Studio:
 * Earn > Memberships > members > Download. This module does NOT assert that
 * a row represents an auto-renewing subscription, paid receipt, active API
 * grant, opt-in to public recognition, or a stable YouTube channel identity.
 *
 * Importing or publicly projecting any data is NOT supported here.
 * Read-only parsing of the real CSV schema comes BEFORE designing a mapping.
 * Absolutely no network, D1 writes, Worker route, scheduled job or token.
 */
const MAX_BYTES=2*1024*1024;
const MAX_ROWS=10000;
const MAX_COLUMNS=64;
const MAX_CELL_CHARS=8192;
const MAX_HEADER_CHARS=128;
const failed=reason=>({ok:false,reason});
const CONTROLS=/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

/** A strict quote-aware CSV/TSV parser, including CRLF and quoted newlines. */
export function parseYouTubeStudioCsvRecords(input){
 if(typeof input!=='string'||!input||
    new TextEncoder().encode(input).length>MAX_BYTES)
  return failed('csv_empty_or_over_limit');
 const content=input.charCodeAt(0)===0xfeff?input.slice(1):input;
 const first=content.split(/\r?\n/u,1)[0]||'';
 const csvCount=(first.match(/,/g)||[]).length;
 const semiCount=(first.match(/;/g)||[]).length;
 const tabCount=(first.match(/\t/g)||[]).length;
 const delimiter=tabCount>csvCount&&tabCount>=semiCount?'\t':
  semiCount>csvCount?';':',';
 const records=[];
 let row=[],field='',quoted=false,afterQuote=false,atFieldStart=true;
 const append=()=>{
  if(field.length>MAX_CELL_CHARS)throw Error('cell_too_long');
  row.push(field);field='';afterQuote=false;atFieldStart=true;
  if(row.length>MAX_COLUMNS)throw Error('too_many_columns');
 };
 const complete=()=>{
  append();
  if(row.some(v=>v.trim()!=='')||records.length===0)records.push(row);
  row=[];
  if(records.length>MAX_ROWS+1)throw Error('too_many_rows');
 };
 try{
  for(let i=0;i<content.length;i++){
   const ch=content[i];
   if(quoted){
    if(ch==='"'){
     if(content[i+1]==='"'){field+='"';i++;}
     else{quoted=false;afterQuote=true;}
    }else field+=ch;
    if(field.length>MAX_CELL_CHARS)throw Error('cell_too_long');
    continue;
   }
   if(afterQuote&&ch!==' '&&ch!=='\t'&&
      ch!==delimiter&&ch!=='\n'&&ch!=='\r')
    throw Error('unexpected_text_after_quote');
   if(ch===delimiter){append();continue}
   if(ch==='\n'||ch==='\r'){
    if(ch==='\r'&&content[i+1]==='\n')i++;
    complete();continue;
   }
   if(ch==='"'){
    if(atFieldStart){quoted=true;atFieldStart=false;continue}
    throw Error('unexpected_quote');
   }
   if(afterQuote&&ch===' ')continue;
   field+=ch;atFieldStart=false;
   if(field.length>MAX_CELL_CHARS)throw Error('cell_too_long');
  }
  if(quoted)throw Error('unterminated_quote');
  if(field||row.length||afterQuote)complete();
  if(records.length===0)throw Error('empty_csv');
  const width=records[0].length;
  if(width<1||width>MAX_COLUMNS)throw Error('invalid_header_width');
  if(records.some(r=>r.length!==width))throw Error('inconsistent_columns');
  return {ok:true,records};
 }catch(e){
  const reason=e?.message||'invalid_csv';
  return failed([
   'too_many_rows','too_many_columns','cell_too_long',
   'unexpected_text_after_quote','unexpected_quote','unterminated_quote',
   'empty_csv','invalid_header_width','inconsistent_columns'
  ].includes(reason)?reason:'invalid_csv');
 }
}
/**
 * Deliberately returns only schema headings and the number of export rows.
 * NO member names, emails, IDs, tiers, payments or raw data are ever returned.
 *
 * We must SEE the real export before implementing membership status logic;
 * do not infer a "Channel ID" column or an "active" status that is absent.
 */
export function inspectYouTubeStudioMembershipCsv(input){
 const parsed=parseYouTubeStudioCsvRecords(input);
 if(!parsed.ok)return parsed;
 const [header,...rows]=parsed.records;
 const columns=header.map(s=>s.trim());
 if(columns.some(s=>!s||s.length>MAX_HEADER_CHARS||CONTROLS.test(s))||
    new Set(columns.map(s=>s.toLocaleLowerCase('en-US'))).size!==columns.length)
  return failed('invalid_csv_headers');
 return {ok:true,columns,recordCount:rows.length,source:'unverified_local_csv',
  needsRealSchemaReview:true,publicNamesEnabled:false,
  activeStatusVerified:false};
}
