import {readFile,writeFile} from 'node:fs/promises';
let html=await readFile('dist/index.html','utf8');
for(const match of [...html.matchAll(/<script type="module" crossorigin src="([^"]+)"><\/script>/g)]){const js=await readFile('dist/'+match[1].replace(/^\.\//,''),'utf8');html=html.replace(match[0],()=>'<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>');}
for(const match of [...html.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+)">/g)]){const css=await readFile('dist/'+match[1].replace(/^\.\//,''),'utf8');html=html.replace(match[0],()=>'<style>'+css+'</style>');}
await writeFile('dist/index.html',html);await writeFile('index.html',html);
console.log(`Single-file build: ${(Buffer.byteLength(html)/1024).toFixed(1)} KiB`);
