// Creator's historical cover collections; independent of original commercial releases.
// Track sequence and album publication date are not yet confirmed. No album art/audio is published.
export const coverAlbums=[{id:'no-puedo-ser-un-idol',titles:{es:'¿No puedo ser un idol?',en:"So I can't be an idol?",ja:"So I can't be an idol?"},kind:'ep',historicalTitle:'¿No puedo ser idol?',historicalCredit:'Rebel Miku',concept:{es:'El inicio de su trayectoria como VTuber y VSinger: ser hombre no impide interpretar canciones de idols.',en:'The beginning of his VTuber and VSinger career: being male does not prevent him from performing idol songs.'},releaseDate:null,ordered:false,artworkStatus:'reference-only',audioStatus:'deferred',tracks:[
 {song:'only-one-yell',version:'es'},{song:'blue-spirit',version:'es'},{song:'caesura-of-despair',version:'es'},{song:'watashi-no-na-wa-hikari',version:'es'},{song:'song-for-you',version:'es'}
]}];
export function albumsForVersion(slug,version){return coverAlbums.filter(a=>a.tracks.some(t=>t.song===slug&&t.version===version));}
