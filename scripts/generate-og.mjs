import { mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const output = 'apps/web/public/images/og'
mkdirSync(output, {recursive:true})
const xml = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const text=(x,y,value,size=24,color='#1b2128',family='Arial, sans-serif')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-family="${family}">${xml(value)}</text>`
const copy={
 en:{local:'ON YOUR DEVICE',footer:'No account. No input upload.',home:['Paste anything.','See what it is.','An answer first. Every layer stays here.'],tool:['Format. Convert.','Keep it local.','Useful tools for the next step.'],format:['See how it','was written.','Compare the evidence. Open every layer.'],before:'Before',after:'After',sample:'SGVsbG8=',decoded:'Hello',answer:'This is Base64. One layer opened.',bytes:'bytes',fields:'fields'},
 ko:{local:'\uc774 \uae30\uae30 \uc548\uc5d0\uc11c',footer:'\uacc4\uc815 \uc5c6\uc774. \uc785\ub825\uac12 \uc5c5\ub85c\ub4dc \uc5c6\uc774.',home:['\ubaa8\ub974\ub294 \uac12\uc744','\ubd99\uc5ec\ub123\uc73c\uc138\uc694','\ub2f5\ubd80\ud130 \ubcf4\uace0, \uacb9\ub9c8\ub2e4 \uc0b4\ud3b4\ubd10\uc694.'],tool:['\uc904\uc744 \ub9de\ucd94\uace0 \ubc14\uafb8\uae30.','\uc774 \uae30\uae30 \uc548\uc5d0\uc11c.','\ud544\uc694\ud55c \ub2e4\uc74c \uc791\uc5c5\uc744 \ubc14\ub85c \uc774\uc5b4\uc11c.'],format:['\uc5b4\ub5a4 \ubc29\uc2dd\uc778\uc9c0','\uae4c\ub2ed\uae4c\uc9c0 \ubcf4\uc138\uc694','\ud615\uc2dd\uc758 \uadfc\uac70\uc640 \uc548\ucabd \uacb9\uc744 \uc0b4\ud3b4\ubcf4\uc138\uc694.'],before:'\ub123\uc740 \uac12',after:'\uc815\ub9ac\ud55c \uacb0\uacfc',sample:'7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==',decoded:'\uc548\ub155\ud558\uc138\uc694 \uc138\uacc4',answer:'Base64\ub85c \uc2fc \uac12\uc774\uc5d0\uc694. \ud55c \uacb9 \ud480\uc5c8\uc5b4\uc694.',bytes:'\ubc14\uc774\ud2b8',fields:'\uc790\ub8cc'}
}
for(const locale of ['en','ko'])for(const kind of ['home','tool','format']){
 const c=copy[locale],family="Arial, Apple SD Gothic Neo, sans-serif"
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fff"/><g font-family="${family}"><g transform="translate(72 64)"><rect width="56" height="56" rx="8" fill="#fff" stroke="#1b2128" stroke-width="2"/><path d="M10 13h36v7H10z" fill="#dce7f9" stroke="#1b2128"/><path d="M10 26h27v7H10z" fill="#ddf1e2" stroke="#1b2128"/><path d="M10 39h18v6H10z" fill="#f9edc8" stroke="#1b2128"/></g>${text(150,105,'decod.ing',36)}${text(855,101,c.local,20,'#387346',family)}${text(72,218,c[kind][0],52,'#1b2128',family)}${text(72,280,c[kind][1],52,'#1b2128',family)}${text(72,330,c[kind][2],25,'#606b78',family)}`
 if(kind==='home')svg+=`<rect x="72" y="378" width="1056" height="172" rx="8" fill="#f6f8fa" stroke="#d8dee6"/>${text(100,416,c.sample,24,'#606b78','monospace')}${text(100,463,c.answer,27,'#1b2128',family)}<rect x="96" y="482" width="1008" height="48" rx="4" fill="#ddf1e2"/>${text(112,516,c.decoded,30,'#1b2128',family)}`
 if(kind==='tool')svg+=`<rect x="72" y="378" width="1056" height="172" rx="8" fill="#f6f8fa" stroke="#d8dee6"/>${text(100,412,c.before,20,'#606b78',family)}${text(100,467,'{"ok":true,"count":2}',27,'#1b2128','monospace')}${text(573,473,'\u2192',35)}${text(650,412,c.after,20,'#606b78',family)}${['{','  "ok": true,','  "count": 2','}'].map((line,i)=>text(650,440+i*29,line,24,'#1b2128','monospace')).join('')}`
 if(kind==='format')svg+=`<rect x="72" y="378" width="1056" height="48" fill="#dce7f9"/>${text(96,411,'Base64 \u2192 '+c.bytes,26,'#1b2128',family)}<rect x="112" y="440" width="920" height="48" fill="#ddf1e2"/>${text(136,473,'JSON \u2192 '+c.fields,26,'#1b2128',family)}<rect x="152" y="502" width="660" height="48" fill="#f9edc8"/>${text(176,535,'{"ok":true}',26,'#1b2128','monospace')}`
 svg+=`${text(72,598,c.footer,22,'#606b78',family)}</g></svg>`
 const source=`${output}/${kind}-${locale}.svg`,png=`${output}/${kind}-${locale}.png`
 writeFileSync(source,svg)
 execFileSync('sips',['-s','format','png',source,'--out',png],{stdio:'ignore'})
 console.log(`${kind}-${locale}: 1200x630 source + PNG`)
}
