/* 기기 언어를 가장 먼저 읽어 html lang·dir 만 잡아 둔다(문구는 app.js가 갈아 끼운다).
   잠깐이라도 한국어 화면이 번쩍이지 않도록 첫 페인트 전에 방향과 언어를 정한다.
   헤드에서 블로킹으로 불러오므로 화면이 그려지기 전에 실행된다.
   (index.html 안에 두지 않고 파일로 나눈 이유: CSP가 인라인 스크립트를 막기 때문) */
(function () {
  try {
    var q = (new URLSearchParams(location.search).get('lang') || '').toLowerCase().replace('_', '-');
    var raw = q || (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    var l = String(raw).toLowerCase().replace('_', '-');
    var base = l.split('-')[0];
    var shown = base;
    if (base === 'zh') shown = (l === 'zh' || l === 'zh-cn' || l === 'zh-hans' || l === 'zh-sg') ? 'zh-Hans' : 'zh-Hant';
    document.documentElement.setAttribute('lang', shown);
    var RTL = ['ar', 'he', 'fa', 'ur', 'yi', 'dv', 'ps', 'ckb', 'sd', 'ug'];
    document.documentElement.setAttribute('dir', RTL.indexOf(base) >= 0 ? 'rtl' : 'ltr');
  } catch (e) {}
})();
