/* decod.ing 첫 화면 시안용 작은 풀이기. 실제 엔진(packages/engine)이 아니다.
   시안에서 "붙여넣으면 한 문장으로 답한다"를 눌러 볼 수 있게 열 몇 가지 형식만 실제로 푼다.
   값은 이 파일 안에서만 다루고 어디로도 보내지 않는다. */
(function (g) {
  'use strict';
  var HANGUL = /[가-힣]/g;
  var TRACK = /^(utm_[a-z]+|fbclid|gclid|msclkid|igshid|mc_eid|mc_cid|ref|_hsenc|_hsmi|yclid|n_media|n_query|n_ad)$/i;

  function utf8(bytes) { try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch (e) { return null; } }
  function bytesOf(str) { return new TextEncoder().encode(str); }
  function b64ToBytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
    while (s.length % 4) s += '=';
    try { var b = atob(s); var out = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) out[i] = b.charCodeAt(i); return out; } catch (e) { return null; }
  }
  function bytesToB64(bytes) { var s = ''; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s); }
  function readable(t) {
    if (t == null || !t.length) return false;
    var bad = 0; for (var i = 0; i < t.length; i++) { var c = t.charCodeAt(i); if (c < 9 || (c > 13 && c < 32) || c === 0xfffd) bad++; }
    return bad / t.length < 0.02;
  }
  function jsonOf(s) { try { var v = JSON.parse(s); return (v && typeof v === 'object') ? v : null; } catch (e) { return null; } }
  function when(ms) {
    var d = new Date(ms); if (isNaN(d)) return null;
    var txt = d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    var diff = Date.now() - ms, a = Math.abs(diff), unit;
    if (a > 31557600000) unit = Math.round(a / 31557600000) + '년'; else if (a > 86400000) unit = Math.round(a / 86400000) + '일'; else if (a > 3600000) unit = Math.round(a / 3600000) + '시간'; else unit = Math.max(1, Math.round(a / 60000)) + '분';
    return { txt: txt, ago: unit + (diff > 0 ? ' 전' : ' 뒤'), past: diff > 0 };
  }
  // 윈도우 1252 글자 → 바이트 (깨진 글자를 되돌릴 때 쓴다)
  var CP1252 = {};
  (function () { var d = new TextDecoder('windows-1252'); for (var b = 0x80; b <= 0x9f; b++) CP1252[d.decode(new Uint8Array([b]))] = b; })();
  function latinBytes(s) {
    var out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) { var ch = s[i], c = s.charCodeAt(i); if (c <= 0xff) out[i] = c; else if (CP1252[ch] != null) out[i] = CP1252[ch]; else return null; }
    return out;
  }
  function hangulShare(t) { var m = t.match(HANGUL); return m ? m.length / t.replace(/\s/g, '').length : 0; }

  var SECRET_KEY = /pass(word)?|secret|token|api[_-]?key|authorization|private/i;

  // 한 겹을 푼다. { noun, head, how, out, facts, risks, alts }
  function step(s) {
    var t = s.trim(), m;

    // 로그인 토큰(JWT)
    if (/^[\w-]{4,}\.[\w-]{4,}\.[\w-]*$/.test(t)) {
      var p = t.split('.'), hb = b64ToBytes(p[0]), pb = b64ToBytes(p[1]);
      var h = hb && jsonOf(utf8(hb) || ''), pl = pb && jsonOf(utf8(pb) || '');
      if (h && 'alg' in h && pl) {
        var facts = [], risks = [], head = '로그인 토큰(JWT)이에요.';
        if (pl.exp) { var e = when(pl.exp * 1000); if (e) { facts.push(['끝나는 때', e.txt + ' (' + e.ago + ')']); if (e.past) { head = '로그인 토큰(JWT)이에요. ' + e.ago + '에 이미 끝났어요.'; risks.push(['끝난 토큰이에요', '끝난 토큰은 서버가 받아 주지 않아요. 로그인이 안 되는 까닭이 이것일 수 있어요.', 'JWT-EXPIRED']); } else head = '로그인 토큰(JWT)이에요. ' + e.ago + '에 끝나요.'; } }
        else risks.push(['끝나는 때가 없어요', '한 번 새면 계속 쓰일 수 있는 토큰이에요.', 'JWT-NO-EXP']);
        if (pl.iat) { var i2 = when(pl.iat * 1000); if (i2) facts.push(['만든 때', i2.txt]); }
        if (pl.sub) facts.push(['누구 것', String(pl.sub)]);
        if (pl.name) facts.push(['이름', String(pl.name)]);
        facts.push(['잠그는 방식', String(h.alg)]);
        if (/^none$/i.test(h.alg)) risks.push(['잠금이 없는 토큰이에요', '누구나 내용을 바꿔 만들 수 있어요. 로그인 증거로 믿으면 안 돼요.', 'JWT-ALG-NONE']);
        else risks.push(['진짜인지는 아직 몰라요', '내용만 읽었고 서명은 확인하지 않았어요. 열쇠를 넣으면 이 기기에서 확인할 수 있어요.', 'JWT-SIGNATURE-UNVERIFIED']);
        if (!(pl.exp && pl.exp * 1000 < Date.now())) risks.push(['다른 곳에 붙여넣지 마세요', '아직 쓸 수 있는 토큰은 비밀번호와 같아요. 채팅방이나 AI에 붙여넣으면 남이 내 계정에 들어올 수 있어요.', 'SECRET-EXPOSED']);
        return { noun: '로그인 토큰', kind: 'JWT', head: head, how: '점 두 개로 나뉜 세 토막을 각각 풀었어요', out: JSON.stringify(pl, null, 2), facts: facts, risks: risks, final: true, fmt: 'json' };
      }
    }

    // 메일 제목 표기 =?UTF-8?B?...?=
    if (/=\?[\w-]+\?[bq]\?[^?]+\?=/i.test(t)) {
      var fixed = t.replace(/=\?([\w-]+)\?([bq])\?([^?]*)\?=\s*/gi, function (_, cs, mode, body) {
        var by;
        if (/b/i.test(mode)) by = b64ToBytes(body);
        else { var q = body.replace(/_/g, ' '), arr = []; for (var i = 0; i < q.length; i++) { if (q[i] === '=' && /^[0-9a-f]{2}$/i.test(q.substr(i + 1, 2))) { arr.push(parseInt(q.substr(i + 1, 2), 16)); i += 2; } else arr.push(q.charCodeAt(i)); } by = new Uint8Array(arr); }
        try { return new TextDecoder(cs).decode(by); } catch (e) { return _; }
      });
      if (fixed !== t) return { noun: '메일 제목 표기', kind: 'MIME', head: '메일 제목이 풀리지 않은 채로 온 거예요.', how: '메일이 한글을 실어 나를 때 쓰는 표기(=?UTF-8?B?…?=)를 글자로 되돌렸어요', out: fixed, facts: [['원래 글자 방식', (t.match(/=\?([\w-]+)\?/) || [])[1]]], risks: [] };
    }

    // 주소
    if (/^https?:\/\/\S+$/i.test(t)) {
      var u; try { u = new URL(t); } catch (e) { u = null; }
      if (u) {
        var f = [['겉으로 보이는 곳', u.hostname]], r = [], tags = [], keep = [], inner = null, innerKey = null, who = [];
        u.searchParams.forEach(function (v, k) {
          if (TRACK.test(k)) { tags.push(k + ' = ' + v); return; }
          keep.push([k, v]);
          if (!inner) {
            if (/^https?:\/\//i.test(v)) { inner = v; innerKey = k; }
            else if (/^[A-Za-z0-9+/_-]{16,}={0,2}$/.test(v)) { var bb = b64ToBytes(v), tx = bb && utf8(bb); if (tx && /^https?:\/\//i.test(tx)) { inner = tx; innerKey = k; } }
          }
          if (/^(name|email|e-?mail|phone|tel)$/i.test(k) && v) who.push(k + ' = ' + v);
        });
        if (u.protocol === 'http:') r.push(['잠기지 않은 주소예요', 'https가 아니라서 가는 길에 내용을 남이 볼 수 있어요.', 'URL-NO-TLS']);
        if (/^xn--|\.xn--/.test(u.hostname)) r.push(['글자를 바꿔 적은 주소예요', '다른 나라 글자를 영문으로 바꿔 적은 주소(xn--)예요. 진짜와 닮은 가짜 주소에 쓰이기도 해요.', 'IDN-CONFUSABLE']);
        if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) r.push(['이름 없이 숫자로 된 주소예요', '정상 서비스는 보통 이름이 있는 주소를 써요.', 'URL-IP-HOST']);
        if (u.username) r.push(['주소 앞에 다른 이름이 붙어 있어요', '@ 앞은 가는 곳이 아니에요. 진짜 가는 곳은 ' + u.hostname + '예요.', 'URL-USERINFO']);
        if (who.length) r.push(['주소에 사람 정보가 들어 있어요', who.join(', ') + '. 이 주소를 남에게 보내면 같이 넘어가요.', 'URL-PERSONAL']);
        if (tags.length) f.push(['따라붙은 꼬리표', tags.length + '개 (' + tags.map(function (x) { return x.split(' = ')[0]; }).join(', ') + ')']);
        if (inner) {
          var ih = ''; try { ih = new URL(inner).hostname; } catch (e) {}
          f.push(['실제로 가는 곳', ih]);
          r.unshift(['겉 주소와 실제 가는 곳이 달라요', u.hostname + '을 거쳐 ' + ih + ' 쪽으로 보내는 주소예요. 메일·문자 광고에서 흔하지만 속이는 주소도 같은 꼴이에요.', 'URL-REDIRECT']);
          return { noun: '거쳐 가는 주소', kind: 'URL', head: '눌러도 ' + u.hostname + '에 머물지 않아요. 실제로는 ' + ih + ' 쪽으로 가요.', how: '주소 안 ' + innerKey + ' 칸에 숨어 있던 진짜 주소를 꺼냈어요', out: inner, facts: f, risks: r };
        }
        f[0][0] = '가는 곳';
        var clean = u.origin + u.pathname + (keep.length ? '?' + keep.map(function (kv) { return kv[0] + '=' + kv[1]; }).join('&') : '') + u.hash;
        var dec = clean; try { dec = decodeURI(clean); } catch (e) {}
        var changed = dec !== t;
        return { noun: '주소', kind: 'URL', head: tags.length ? u.hostname + ' 쪽으로 가는 주소예요. 꼬리표 ' + tags.length + '개를 떼어 냈어요.' : u.hostname + ' 쪽으로 가는 주소예요.', how: changed ? '꼬리표를 떼고 %로 바뀐 글자를 되돌렸어요' : '주소를 칸칸이 나눠 봤어요', out: dec, facts: f, risks: r, final: true };
      }
    }

    // %로 바뀐 글자
    if (/(%[0-9a-f]{2}){2,}/i.test(t)) {
      var d1 = null; try { d1 = decodeURIComponent(t); } catch (e) {}
      if (d1 && d1 !== t) return { noun: '%로 바꿔 적은 글자', kind: 'URL 인코딩', head: '주소에 넣으려고 %로 바꿔 적은 글자예요.', how: '%와 두 글자씩을 원래 글자로 되돌렸어요', out: d1, facts: [], risks: [] };
      var arr = []; for (var i = 0; i < t.length; i++) { if (t[i] === '%' && /^[0-9a-f]{2}$/i.test(t.substr(i + 1, 2))) { arr.push(parseInt(t.substr(i + 1, 2), 16)); i += 2; } else arr.push(t.charCodeAt(i) & 255); }
      var kr = new TextDecoder('euc-kr').decode(new Uint8Array(arr));
      if (hangulShare(kr) > 0.3) return { noun: '%로 바꿔 적은 옛 방식 한글', kind: 'URL 인코딩 · EUC-KR', head: '옛 방식(EUC-KR) 한글을 %로 바꿔 적은 거예요.', how: '요즘 방식(UTF-8)으로는 안 풀려서 옛 한글 방식으로 풀었어요', out: kr, facts: [['글자 방식', 'EUC-KR (옛 한국어 사이트·관공서에서 씀)']], risks: [] };
    }

    // 깨진 한글
    var hi = (t.match(/[\u0080-ÿŒœŠšŸŽžƒˆ˜–-›€™]/g) || []).length;
    if (hi >= 3 && hi / t.length > 0.25 && !HANGUL.test(t)) {
      HANGUL.lastIndex = 0;
      var lb = latinBytes(t);
      if (lb) {
        var a = utf8(lb);
        if (a && hangulShare(a) > 0.3) return { noun: '깨진 한글', kind: '깨진 글자 · UTF-8', head: '깨진 한글이에요. 되돌릴 수 있는 깨짐이라 원래 글로 되돌렸어요.', how: '요즘 방식(UTF-8)으로 쓴 한글을 서양 글자 방식으로 잘못 읽어서 생긴 깨짐이에요', out: a, facts: [['깨진 까닭', 'UTF-8로 쓴 글을 Windows-1252로 읽음']], risks: [] };
        var b = new TextDecoder('euc-kr').decode(lb);
        if (hangulShare(b) > 0.3 && b.indexOf('\ufffd') < 0) return { noun: '깨진 한글', kind: '깨진 글자 · EUC-KR', head: '깨진 한글이에요. 되돌릴 수 있는 깨짐이라 원래 글로 되돌렸어요.', how: '옛 방식(EUC-KR)으로 쓴 한글을 서양 글자 방식으로 잘못 읽어서 생긴 깨짐이에요', out: b, facts: [['깨진 까닭', 'EUC-KR로 쓴 글을 Latin-1로 읽음']], risks: [] };
      }
    }
    HANGUL.lastIndex = 0;
    // 자음·모음이 풀린 한글 (맥에서 온 파일 이름)
    if (/[ᄀ-ᇿ]/.test(t) && t.normalize('NFC') !== t) return { noun: '자음·모음이 풀린 한글', kind: '한글 풀림 · NFD', head: '자음과 모음이 따로 떨어진 한글이에요. 다시 붙였어요.', how: '맥에서 만든 파일 이름이 윈도우로 가면 생기는 일이에요', out: t.normalize('NFC'), facts: [], risks: [], final: true };

    // 시간 숫자
    if (/^\d{10}$/.test(t) || /^\d{13}$/.test(t)) {
      var ms = t.length === 10 ? +t * 1000 : +t, w = when(ms);
      if (w && ms > 946684800000 && ms < 4102444800000) return { noun: '시간을 적은 숫자', kind: '유닉스 시간', head: '시간을 적은 숫자예요. ' + w.txt + ' (' + w.ago + ')', how: '1970년 1월 1일부터 흐른 ' + (t.length === 10 ? '초' : '밀리초') + '를 날짜로 바꿨어요', out: w.txt + ' (한국 시간)\n' + new Date(ms).toISOString() + ' (세계 표준시)', facts: [['단위', t.length === 10 ? '초' : '밀리초']], risks: [], final: true, alts: ['그냥 숫자', '전화번호·주문번호'] };
    }

    // 고유 번호(UUID)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t)) {
      var v = t[14];
      return { noun: '고유 번호', kind: 'UUID v' + v, head: '겹치지 않게 만든 고유 번호(UUID)예요. 풀 내용은 없어요.', how: '모양과 판 번호를 봤어요', out: t, facts: [['판', v + (v === '4' ? ' (무작위)' : v === '7' || v === '1' ? ' (만든 시간이 들어 있음)' : '')]], risks: [], final: true };
    }

    // 0과 1
    if (/^([01]{8}\s*){2,}$/.test(t)) {
      var bs = t.replace(/\s+/g, '').match(/.{8}/g).map(function (x) { return parseInt(x, 2); }), bt = utf8(new Uint8Array(bs));
      if (readable(bt)) return { noun: '0과 1로 적은 글', kind: '2진수', head: '글자를 0과 1로 적은 거예요.', how: '여덟 자리씩 끊어 글자로 바꿨어요', out: bt, facts: [], risks: [] };
    }

    // 모스 부호
    if (/^[.\-–—·\/\s]{5,}$/.test(t) && /[.\-]/.test(t)) {
      var M = { '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9' };
      var words = t.replace(/[–—]/g, '-').replace(/·/g, '.').split(/\s*\/\s*|\s{3,}/).map(function (wd) { return wd.trim().split(/\s+/).map(function (c) { return M[c] || '?'; }).join(''); });
      var mt = words.join(' ');
      if (mt.indexOf('?') < 0) return { noun: '모스 부호', kind: '모스 부호', head: '모스 부호예요.', how: '점과 줄을 글자로 바꿨어요', out: mt, facts: [], risks: [], final: true };
    }

    // 16진수
    if (/^(0x)?([0-9a-f]{2}[\s:]?){4,}$/i.test(t) && /[a-f]/i.test(t) || /^([0-9a-f]{2}\s){3,}[0-9a-f]{2}$/i.test(t)) {
      var hx = t.replace(/^0x/i, '').replace(/[\s:]/g, '');
      if (hx.length % 2 === 0) {
        var hb2 = new Uint8Array(hx.match(/../g).map(function (x) { return parseInt(x, 16); })), ht = utf8(hb2);
        if (readable(ht)) return { noun: '16진수로 적은 글', kind: '16진수', head: '글자를 16진수로 적은 거예요.', how: '두 자리씩 끊어 글자로 바꿨어요', out: ht, facts: [], risks: [], alts: ['Base64'] };
        var hn = { 32: 'MD5', 40: 'SHA-1', 64: 'SHA-256', 128: 'SHA-512' }[hx.length];
        if (hn) return { noun: '지문 값', kind: hn + ' 해시로 보임', head: '지문 값(해시)으로 보여요. 길이가 ' + hn + '와 같아요. 되돌려 풀 수 있는 값이 아니에요.', how: '글자 수와 쓰인 글자를 봤어요', out: t, facts: [['길이', hx.length + '자 (' + hn + '와 같음)']], risks: [], final: true, alts: ['그냥 16진수 자료'] };
        return { noun: '16진수 자료', kind: '16진수', head: '16진수로 적은 자료예요. 글자는 아니에요.', how: '두 자리씩 끊어 봤지만 읽을 수 있는 글이 아니었어요', out: t, facts: [['크기', hb2.length + '바이트']], risks: [], final: true };
      }
    }

    // Base64
    if (/^[A-Za-z0-9+/_-]{8,}={0,2}$/.test(t.replace(/\s+/g, '')) && t.replace(/\s+/g, '').length % 4 !== 1) {
      var bb2 = b64ToBytes(t), bt2 = bb2 && utf8(bb2);
      if (readable(bt2)) return { noun: 'Base64로 싼 값', kind: 'Base64', head: 'Base64로 싸 놓은 값이에요.', how: '네 글자씩을 세 바이트로 되돌리고 한글까지 글자로 읽었어요', out: bt2, facts: [['크기', bb2.length + '바이트']], risks: [] };
      if (bb2 && bb2.length > 8 && /[A-Z]/.test(t) && /[a-z]/.test(t) && /\d/.test(t)) return { noun: 'Base64로 싼 자료', kind: 'Base64', head: 'Base64로 싸 놓은 자료예요. 풀어 보니 글자가 아니에요.', how: '풀었지만 사진·압축·암호문 같은 자료라 글로는 못 보여 드려요', out: Array.prototype.slice.call(bb2, 0, 24).map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(' ') + (bb2.length > 24 ? ' …' : ''), facts: [['크기', bb2.length + '바이트']], risks: [], final: true };
    }

    // 자료(JSON)
    if (/^[\[{]/.test(t)) {
      var j = jsonOf(t);
      if (j) {
        var rk = [], keys = [];
        (function walk(o, d) { if (d > 6 || !o || typeof o !== 'object') return; Object.keys(o).forEach(function (k) { keys.push(k); if (SECRET_KEY.test(k) && typeof o[k] === 'string' && o[k]) rk.push(k); walk(o[k], d + 1); }); })(j, 0);
        var risks2 = rk.length ? [['비밀 값으로 보이는 칸이 있어요', rk.join(', ') + ' 칸이에요. 남에게 건넬 때는 이 칸을 가리세요.', 'SECRET-EXPOSED']] : [];
        return { noun: '자료 묶음', kind: 'JSON', head: '이름과 값을 묶어 적은 자료(JSON)예요. 칸이 ' + keys.length + '개 있어요.', how: '줄을 맞춰 읽기 좋게 폈어요', out: JSON.stringify(j, null, 2), facts: [['칸 수', keys.length + '개']], risks: risks2, final: true, fmt: 'json' };
      }
    }
    return null;
  }

  function decode(input) {
    var layers = [], facts = [], risks = [], cur = input, seen = {}, last = null;
    for (var d = 0; d < 8; d++) {
      if (seen[cur]) break; seen[cur] = 1;
      var r = step(cur); if (!r) break;
      layers.push({ noun: r.noun, kind: r.kind, how: r.how, input: cur, out: r.out, head: r.head, alts: r.alts || [] });
      facts = facts.concat(r.facts || []); risks = risks.concat(r.risks || []); last = r;
      if (r.final || r.out === cur) break; cur = r.out;
    }
    if (!layers.length) {
      var plain = /[가-힣]|[a-z]{3,}\s+[a-z]{2,}/i.test(input);
      return { ok: false, plain: plain, head: plain ? '싸여 있지 않은 그냥 글이에요.' : '아직 알아보지 못한 값이에요.', final: input, layers: [], facts: [], risks: [] };
    }
    var head = layers[0].head;
    if (layers.length > 1) {
      var inner = layers[layers.length - 1];
      head = (layers.length) + '겹으로 싸여 있었어요. 속은 ' + inner.head.replace(/^[^가-힣]*/, '');
      if (layers[0].kind === 'URL' || /깨진|메일/.test(layers[0].noun)) head = layers[0].head + (inner.kind !== layers[0].kind ? ' 그 안은 ' + inner.noun + '이었어요.' : '');
    }
    return { ok: true, head: head, final: layers[layers.length - 1].out, fmt: last.fmt, layers: layers, facts: facts, risks: risks };
  }

  // 시안에서 누를 수 있는 예시. 실제 값을 여기서 만든다.
  var b = function (s) { return bytesToB64(bytesOf(s)); };
  var jwtPart = function (o) { return b(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_'); };
  var samples = {
    broken: { label: '깨진 글자', icon: 'type', hint: '메일·문자·파일 이름', value: new TextDecoder('windows-1252').decode(bytesOf('안녕하세요, 회의 자료 보내드립니다')) },
    link: { label: '긴 주소', icon: 'link', hint: '눌러도 되는지', value: 'https://click.shopmail.example/r?u=' + b('https://event-gift.example/apply?id=77&name=홍길동&utm_source=kakao&utm_medium=msg&utm_campaign=1111') + '&uid=88231' },
    token: { label: '로그인 토큰', icon: 'key', hint: 'eyJ로 시작하는 값', value: jwtPart({ alg: 'HS256', typ: 'JWT' }) + '.' + jwtPart({ sub: 'user_2231', name: '김서연', iat: 1763000000, exp: 1763003600 }) + '.c2lnbmF0dXJlLWV4YW1wbGU' },
    nested: { label: '여러 겹 싸인 값', icon: 'layers', hint: '끝이 = 로 끝나는 값', value: b(b(JSON.stringify({ order: 'A-20391', paid: true, memo: '문 앞에 놓아 주세요', api_key: 'sk_test_예시값' }))) },
    mail: { label: '메일 제목', icon: 'mail', hint: '=?UTF-8?B? 로 시작', value: '=?UTF-8?B?' + b('[주문 확인] 11월 정기배송 안내') + '?=' },
    time: { label: '숫자 열 자리', icon: 'clock', hint: '1763… 같은 숫자', value: '1763190000' },
    qr: { label: 'QR 사진', icon: 'qr', hint: '찍기 전에 어디로 가는지', value: 'http://192.0.2.44/pay?to=parking&utm_source=sticker', qr: true }
  };

  var ICON = {
    type: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>', link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>', layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v7h-6"/>',
    paste: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/>', camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>', send: '<path d="M4 12l16-8-6 16-3-6-7-2z"/>', box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v5M12 17.5v.5"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    tools: '<path d="M4 6h16M4 12h16M4 18h10"/>', home: '<path d="M4 11l8-7 8 7v9H4z"/>', more: '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>',
    chev: '<path d="M9 6l6 6-6 6"/>', check: '<path d="M5 12l5 5 9-10"/>', swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>', hash: '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>', code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>', img: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 5"/><circle cx="9" cy="9" r="1.5"/>'
  };
  function icon(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || '') + '</svg>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // 답 카드 그리기
  function renderAnswer(res, opt) {
    opt = opt || {};
    if (!res.ok) {
      return '<section class="ans"><p class="verdict">' + esc(res.head) + '</p>' +
        (res.plain ? '<p class="sub">감싸거나 바꿔 적은 흔적이 없어요. 풀 것이 없다는 뜻이에요.</p>'
          : '<p class="sub">아는 형식 42가지와 맞춰 봤지만 확실한 것이 없었어요. 틀린 답을 지어내지 않아요.</p><div class="try"><b>이렇게 해 볼 수 있어요</b><a class="row" href="common.html?s=tool">' + icon('search') + '<span>글자 하나하나 살펴보기</span>' + icon('chev') + '</a><a class="row" href="common.html?s=tool">' + icon('swap') + '<span>풀 방법을 직접 고르기 (ROT13·시저·Base32…)</span>' + icon('chev') + '</a><a class="row" href="#">' + icon('send') + '<span>이 모양을 알려 주기 (값은 보내지 않아요)</span>' + icon('chev') + '</a></div>') + '</section>';
    }
    var h = '<section class="ans" aria-live="polite">';
    h += '<p class="verdict">' + esc(res.head) + '</p>';
    if (res.risks.length) {
      h += '<div class="risks"><div class="rh">' + icon('warn') + '<b>조심할 점 ' + res.risks.length + '가지</b></div><ul>';
      res.risks.forEach(function (r) { h += '<li><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></li>'; });
      h += '</ul></div>';
    } else h += '<div class="okline">' + icon('shield') + '<span>조심할 점은 찾지 못했어요</span></div>';
    h += '<div class="final"><div class="fh"><span>풀린 값</span><button class="mini" data-copy>' + icon('copy') + '복사</button></div><pre>' + esc(res.final) + '</pre></div>';
    if (res.facts.length) { h += '<dl class="facts">'; res.facts.forEach(function (f) { h += '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }); h += '</dl>'; }
    h += '<div class="chain"><div class="ch">어떻게 풀었나 · ' + res.layers.length + '겹</div><ol>';
    res.layers.forEach(function (l, i) { h += '<li class="l' + ((i % 4) + 1) + '"><button data-layer="' + i + '" aria-expanded="false"><span class="n">' + (i + 1) + '</span><span class="k">' + esc(l.noun) + '<small>' + esc(l.kind) + '</small></span>' + icon('chev') + '</button><div class="ld" hidden><p>' + esc(l.how) + '</p><pre>' + esc(l.input.length > 220 ? l.input.slice(0, 220) + '…' : l.input) + '</pre>' + (l.alts.length ? '<p class="alt">다른 가능성: ' + l.alts.map(esc).join(', ') + ' <a href="#">다르게 풀기</a></p>' : '') + '</div></li>'; });
    h += '</ol></div>';
    h += '<div class="acts"><a class="act" href="common.html?s=send">' + icon('send') + '건네기</a><a class="act" href="common.html?s=saved">' + icon('box') + '넣어 두기</a><a class="act" href="common.html?s=tool">' + icon('swap') + '다시 싸기</a></div>';
    h += '</section>';
    return h;
  }
  function wireAnswer(root) {
    root.querySelectorAll('[data-layer]').forEach(function (bn) {
      bn.addEventListener('click', function () { var d = bn.nextElementSibling, open = d.hidden; d.hidden = !open; bn.setAttribute('aria-expanded', String(open)); });
    });
    var c = root.querySelector('[data-copy]');
    if (c) c.addEventListener('click', function () {
      var txt = root.querySelector('.final pre').textContent;
      var done = function () { c.innerHTML = icon('check') + '복사했어요'; setTimeout(function () { c.innerHTML = icon('copy') + '복사'; }, 1600); };
      try { navigator.clipboard.writeText(txt).then(done, done); } catch (e) { done(); }
    });
  }
  function nav(active) {
    var items = [['풀기', 'home', 'option-a.html'], ['도구', 'tools', 'option-c.html'], ['넣어 둔 것', 'box', 'common.html?s=saved'], ['더보기', 'more', 'common.html?s=more']];
    return '<nav class="tab" aria-label="아래 메뉴">' + items.map(function (it) { return '<a href="' + it[2] + '"' + (it[0] === active ? ' aria-current="page"' : '') + '>' + icon(it[1]) + '<span>' + it[0] + '</span></a>'; }).join('') + '</nav>';
  }
  g.Proto = { decode: decode, samples: samples, icon: icon, esc: esc, renderAnswer: renderAnswer, wireAnswer: wireAnswer, nav: nav };
  if (typeof module !== 'undefined') module.exports = g.Proto;
})(typeof window !== 'undefined' ? window : globalThis);
