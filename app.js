/* 다이어리 — app.js
   일상과 생각을 가볍게 나누는 스레드형 한국어 다이어리.
   글은 localStorage(diary.v1)에, 사진·영상은 IndexedDB(diary.media)에 저장한다. */

(() => {
'use strict';

/* ---------- constants ---------- */
const STORE_KEY = 'diary.v1';
const PAGE_URL  = 'https://ajak-75.github.io/diary/';
const MAX_MEDIA  = 4;
const MAX_EDGE   = 1280;
const JPEG_Q     = 0.82;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 15;
const VIDEO_SECONDS_SLACK = 0.25;
const TOP_TAG_LIMIT = 8;
const DEFAULT_TAGS = ['일상', '기록', '오늘', '생각'];
const DB_NAME    = 'diary.media';
const DB_STORE   = 'media';
const AVATAR_DEFAULT = './icons/avatar-default.svg';

/* ---------- 문구 ---------- */
const S = {
  tagline: '일상과 생각을 가볍게 나누는 공간',
  meRole: '나의 기록',
  home: '홈', search: '검색', post: '글쓰기', mydiary: '내 프로필',
  translate: '번역 보기', seeOriginal: '원문 보기', translatedBy: '자동 번역',
  translating: '번역 중…', translateFail: '번역을 불러오지 못했어요 · 다시 눌러 주세요',
  translateSame: '이미 같은 언어로 쓰인 글이에요',
  newPost: '새 글', cancel: '취소', publish: '게시', posted: '게시했어요',
  editPost: '글 수정', save: '저장', savedPost: '수정했어요', edited: '(수정됨)', edit: '수정',
  bodyPlaceholder: '오늘 어떤 하루였나요?', tagPlaceholder: '#일상 #오늘',
  media: '사진·영상', photoHint: `사진·영상 ${MAX_MEDIA}개까지 (영상 15초·15MB 이내)`,
  tooManyPhotos: `사진·영상은 ${MAX_MEDIA}개까지 올릴 수 있어요`,
  videoTooBig: '영상은 15MB까지 올릴 수 있어요', videoTooLong: '영상은 15초 이내로 올려 주세요',
  videoBad: '영상을 불러오지 못했어요', photoBad: '사진을 불러오지 못했어요',
  composeHint: '글은 이 기기에 저장돼요.',
  comment: '댓글', commentPlaceholder: '다정하게 답글을 남겨 보세요…', send: '보내기',
  like: '좋아요', repost: '리포스트', share: '공유',
  copied: '링크를 복사했어요', sharedTo: '공유했어요', shareFail: '공유할 수 없어요',
  reposted: '리포스트했어요', unreposted: '리포스트를 취소했어요',
  deleted: '삭제했어요', confirmDelete: '이 글을 삭제할까요?',
  myPosts: '내 글', myLikes: '좋아요',
  myTitle: '내 프로필', searchTitle: '검색', searchPlaceholder: '본문이나 #태그 검색',
  popTags: '인기 태그', clearFilter: '전체 보기', searchingFor: '표시 중',
  emptyFeed: '아직 글이 없어요.', emptySearch: '검색 결과가 없어요.',
  emptyMine: '아직 쓴 글이 없어요. 첫 글을 남겨 보세요.', emptyLikes: '아직 좋아요한 글이 없어요.',
  emptyHomeTitle: '아직 비어 있는 피드',
  emptyHomeSub: '일상과 생각을 가볍게 나누는 공간이에요. 오늘의 첫 글을 남겨 보세요.',
  emptyHomeCta: '첫 글 쓰기',
  posts: '글', likes: '좋아요',
  offline: '오프라인 — 저장된 글을 보여드려요',
  deleteComment: '삭제',
  needText: '내용을 먼저 써 주세요',
  close: '닫기',
  promiseBtn: '커뮤니티 약속',
  promiseBtnSub: '함께 지키는 다섯 가지 약속',
  promiseTitle: '📜 커뮤니티 약속',
  promiseSub: '누구나 편하게 머무는 공간을 위한 다섯 가지 약속이에요.',
  promiseFoot: '약속을 어긴 글은 경고 안내 뒤에 게시되지 않아요.',
  p1t: '서로 존중하기', p1d: '욕설·비방·혐오 표현은 쓰지 않아요.',
  p2t: '광고·스팸 금지', p2d: '무단 광고나 스팸, 수상한 링크는 올리지 않아요.',
  p3t: '사진·저작권 존중', p3d: '다른 사람의 사진이나 작품을 허락 없이 가져오지 않아요.',
  p4t: '개인정보 지키기', p4d: '전화번호·주소·계좌 같은 개인정보는 남기지 않아요.',
  p5t: '다정하게 나누기', p5d: '서로의 하루를 다정한 마음으로 나눠요.',
  warnTitle: '잠깐, 커뮤니티 약속을 확인해 주세요',
  warnWord: '욕설·비방·도박·성인·스팸으로 보이는 표현이 들어 있어요.',
  warnLink: '외부 링크나 스팸 주소는 여기에 올릴 수 없어요.',
  warnPhone: '전화번호 같은 개인 연락처가 들어 있어요.',
  warnEdit: '표현을 고치면 바로 게시할 수 있어요.',
  profileEdit: '프로필 편집', profilePhoto: '프로필 사진', profilePhotoPick: '사진 선택',
  profilePhotoReset: '기본 이미지로 되돌리기',
  profileNickL: '닉네임', profileNickPh: '20자까지 쓸 수 있어요',
  profileBioL: '한 줄 소개', profileBioPh: '나를 소개하는 한 줄, 80자까지',
  profileHint: '사진·닉네임·소개는 내 글과 댓글에 함께 보여요. 이 기기에 저장돼요.',
  profileNeedNick: '닉네임을 먼저 적어 주세요',
  profileSaved: '프로필을 저장했어요',
  profilePhotoBad: '사진을 불러오지 못했어요',
};

const t = (k) => (k in S ? S[k] : k);

/* ---------- utils ---------- */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const escAttr = (s) => esc(s).replace(/\n/g,' ');

const uid = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);

function timeAgo(ts){
  const d = Date.now() - ts;
  if (d < 60000) return '방금';
  const m = Math.floor(d / 60000);
  if (m < 60) return m + '분 전';
  const h = Math.floor(m / 60);
  if (h < 24) return h + '시간 전';
  const day = Math.floor(h / 24);
  if (day < 7) return day + '일 전';
  return fullDate(ts);
}

function fullDate(ts){
  try { return new Date(ts).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' }); }
  catch(e) { return new Date(ts).toDateString(); }
}

/* ---------- media store (IndexedDB) ----------
   사진과 영상은 IndexedDB에 blob으로 두고, localStorage에는 글과 작은 참조만 남긴다. */
let dbPromise = null;

function dbOpen(){
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((res, rej) => {
    if (!('indexedDB' in window)) { rej(new Error('no-idb')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error || new Error('idb-open'));
  });
  return dbPromise;
}

function mediaPut(id, blob, kind){
  return dbOpen().then(db => new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put({ id, blob, kind, ts: Date.now() });
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  }));
}

function mediaGet(id){
  return dbOpen().then(db => new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const r = tx.objectStore(DB_STORE).get(id);
    r.onsuccess = () => res(r.result || null);
    r.onerror = () => rej(r.error);
  }));
}

function mediaDel(id){
  return dbOpen().then(db => new Promise((res) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => res(true);
    tx.onerror = () => res(false);
  })).catch(() => false);
}

const newMediaId = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* id -> {url, kind}: 세션당 한 번만 object URL로 풀어 둔다 */
const mediaURLs = new Map();

function resolveMedia(posts){
  const missing = [];
  (posts || []).forEach(p => (p.media || []).forEach(m => {
    if (m && m.id && !mediaURLs.has(m.id) && !missing.some(x => x.id === m.id)) missing.push(m);
  }));
  if (!missing.length) return Promise.resolve(false);
  return missing.reduce((chain, m) => chain.then(async (changed) => {
    try {
      const rec = await mediaGet(m.id);
      if (rec && rec.blob) {
        mediaURLs.set(m.id, { url: URL.createObjectURL(rec.blob), kind: rec.kind || m.kind });
        return true;
      }
    } catch (e) { /* 자리만 남긴다 */ }
    return changed;
  }), Promise.resolve(false));
}

async function ensureMedia(){
  let changed = false;
  try { changed = await resolveMedia(state.diaries); } catch (e) {}
  if (changed) render();
}

/* ---------- data ---------- */
let state = null;

function load(){
  let d = null;
  try { d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch(e) { d = null; }
  if (!d || !Array.isArray(d.diaries)) {
    d = {
      v: 1,
      me: { nick: '나', handle: '@me', bio: '', avatar: null },
      diaries: [],
      filterTag: null, searchQuery: '', meTab: 'mine',
    };
    save(d);
  }
  if (typeof d.filterTag !== 'string') d.filterTag = null;
  if (typeof d.searchQuery !== 'string') d.searchQuery = '';
  if (d.meTab !== 'mine' && d.meTab !== 'likes') d.meTab = 'mine';
  if (!d.me || typeof d.me !== 'object') d.me = { nick: '나', handle: '@me', bio: '', avatar: null };
  if (typeof d.me.handle !== 'string' || !d.me.handle) d.me.handle = '@me';
  if (typeof d.me.nick !== 'string' || !d.me.nick) d.me.nick = '나';
  if (typeof d.me.bio !== 'string') d.me.bio = '';
  if (d.me.avatar !== null && typeof d.me.avatar !== 'string') d.me.avatar = null;
  if (!Array.isArray(d.diaries)) d.diaries = [];
  state = d;
}

function save(d){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }
  catch(e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) toast('저장 공간이 부족해요 — 사진을 지워 주세요');
  }
}

function findPost(id){ return state.diaries.find(p => p.id === id) || null; }

/* ---------- comments ---------- */
function addComment(pid, text){
  const p = findPost(pid); if (!p) return;
  p.comments.push({ id: 'c' + uid(), nick: state.me.nick, handle: state.me.handle, text, ts: Date.now() });
  save(state); render();
}

function deleteComment(pid, cid){
  const p = findPost(pid); if (!p) return;
  p.comments = p.comments.filter(c => c.id !== cid);
  save(state); render();
}

/* ---------- media pipeline ---------- */
function readAsDataURL(file){
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}

function loadImage(src){
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}

/* 휴대폰 사진은 몇백 KB의 JPEG로 다시 인코딩해 둔다. */
async function downscaleImageBlob(file){
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);
  let { width: w, height: h } = img;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  w = Math.max(1, Math.round(w * scale)); h = Math.max(1, Math.round(h * scale));
  let canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  let q = JPEG_Q;
  let blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', q));
  while (blob && blob.size > 1.2e6 && q > 0.4) {
    q -= 0.14;
    blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', q));
  }
  if (blob && blob.size > 1.2e6) {
    const s = 0.7, nw = Math.round(w * s), nh = Math.round(h * s);
    const small = document.createElement('canvas');
    small.width = nw; small.height = nh;
    small.getContext('2d').drawImage(img, 0, 0, nw, nh);
    blob = await new Promise(res => small.toBlob(res, 'image/jpeg', 0.7));
  }
  return blob;
}

/* ---------- 📜 커뮤니티 약속 & 첫 단계 필터 ----------
   다섯 가지 약속은 내 프로필 안의 시트에 있고, 피드에는 나오지 않는다.
   새 글·수정·댓글은 저장 전에 여기서 한 번 걸러 본다: 욕설·비방·혐오,
   도박·성인·광고 문구, 외부/스팸 링크, 개인 연락처. BAN이 조정하는 한 곳이다. */
const BAN = {
  ko: [
    '씨발','시발','씹새','씹년','개새끼','개자식','병신','지랄','좆같','좆밥','니애미','느금마','엠창','창녀','갈보','뒈져','한남충','한녀충','김치녀','틀딱','맘충','짱깨','쪽바리',
    '도박','토토사이트','스포츠토토','사설토토','바카라','카지노','먹튀검증','꽁머니','배팅사이트','보증업체',
    '야동','야설','포르노','성인영상','성인동영상','성인사이트','조건만남','원조교제','오피쓰','오피녀','출장마사지','자위행위','섹스',
    '광고문의','홍보문의','텔레그램문의','카톡문의','고수익','수익보장','재택알바','부업알바','리딩방','주식리딩','코인리딩','다단계','불법대출','무직자대출','대출광고','폰테크','작업대출','소액결제현금화',
  ],
  en: [
    'fuck','fucking','fucked','fucker','motherfucker','shit','bullshit','bitch','bastard','asshole','cunt',
    'nigger','faggot','retard','retarded','whore','slut','dick pic','escort service',
    'porn','porno','pornhub','onlyfans','nudes','viagra',
    'casino','gambling','betting site','sports betting','bet365','1xbet',
    'payday loan','cash advance',
  ],
  ja: ['死ね','殺す','クソ','ブス','キチガイ','シネ','エロ','アダルト','ポルノ','売春','援助交際','パパ活','出会い系','ギャンブル','カジノ','スパム'],
  zh: ['操你','傻逼','妈的','他妈的','贱人','去死','婊子','尼玛','色情','成人视频','裸聊','约炮','卖淫','赌博','赌场','博彩','六合彩','加微信','刷单','兼职日结'],
  es: ['mierda','puta','puto','perra','cabron','cabrón','pendejo','coño','joder','chinga','verga','zorra','maricón','culiao','pornografía','desnudo','apuestas'],
};

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BAN_LATIN_RE = new RegExp('(?:^|[^\\p{L}])(' + BAN.en.concat(BAN.es).map(escRe).join('|') + ')(?![\\p{L}])', 'iu');
const BAN_CJK = BAN.ko.concat(BAN.ja, BAN.zh);
/* 긴 낱말 속에서만 욕처럼 보이는 경우 */
const BENIGN_RE = /시발점/g;

const LINK_RE = /(?:https?:\/\/|www\.|\bt\.me\/|bit\.ly|tinyurl|open\.kakao\.com|linktr\.ee|discord\.gg|forms\.gle|bit\.do|is\.gd|cutt\.ly|rb\.gy|naver\.me|han\.gl|band\.us)/i;
const DOMAIN_RE = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|co|me|ly|gl|gg|tv|kr|jp|cn|cc|xyz|shop|store|site|link|app|biz|info|top|vip|bet|win|club|online)\b/i;
const PHONE_RES = [
  /\b01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}\b/,
  /\b0[2-6]\d?[-.\s]?\d{3,4}[-.\s]?\d{4}\b/,
  /\+\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/,
  /\b\d{3}[-.\s]\d{3,4}[-.\s]\d{4}\b/,
];
const ACCOUNT_RE = /(?:계좌|口座|账号|帳號|cuenta|account\s*(?:number|no\.?))[^\d\n]{0,10}\d[\d\s-]{6,}/i;

/* 올릴 수 있으면 null, 아니면 { kind: 'word' | 'link' | 'phone' } */
function checkText(text){
  const raw = String(text == null ? '' : text);
  if (!raw.trim()) return null;
  if (LINK_RE.test(raw) || DOMAIN_RE.test(raw)) return { kind: 'link' };
  if (PHONE_RES.some(re => re.test(raw)) || ACCOUNT_RE.test(raw)) return { kind: 'phone' };
  const flat = raw.replace(BENIGN_RE, '').replace(/[\s\u00b7._\-*~!?/\\|:;,()'"\[\]]+/g, '').toLowerCase();
  if (BAN_CJK.some(w => flat.indexOf(w) >= 0)) return { kind: 'word' };
  if (BAN_LATIN_RE.test(raw)) return { kind: 'word' };
  return null;
}

const PROMISE_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5'];
let composeWarnKind = null;

function renderPromiseSheet(){
  const list = $('#promiseList');
  if (!list) return;
  list.innerHTML = PROMISE_KEYS.map((k, i) => (
    '<li class="promise-item">'
    + '<span class="promise-n" aria-hidden="true">' + (i + 1) + '</span>'
    + '<div class="promise-copy"><b>' + esc(t(k + 't')) + '</b><p>' + esc(t(k + 'd')) + '</p></div>'
    + '</li>'
  )).join('');
}

function openPromiseSheet(){
  const scrim = $('#scrim'), sheet = $('#promiseSheet');
  if (!sheet) return;
  renderPromiseSheet();
  scrim.hidden = false; sheet.hidden = false;
  requestAnimationFrame(() => { scrim.classList.add('is-open'); sheet.classList.add('is-open'); });
}

/* 닫을 때 아래에 있던 시트(글쓰기 등)는 그대로 둔다 */
function closePromiseSheet(){
  const sheet = $('#promiseSheet');
  if (!sheet || sheet.hidden) return;
  sheet.classList.remove('is-open');
  setTimeout(() => {
    sheet.hidden = true;
    const under = ['#composeSheet', '#profileSheet'].some(sel => $(sel) && !$(sel).hidden);
    if (!under) { const scrim = $('#scrim'); scrim.classList.remove('is-open'); scrim.hidden = true; }
  }, 230);
}

function warnHTML(kind){
  const why = kind === 'link' ? t('warnLink') : kind === 'phone' ? t('warnPhone') : t('warnWord');
  return '<div class="warn-head"><span class="warn-ico" aria-hidden="true">🛡️</span><b>' + esc(t('warnTitle')) + '</b></div>'
    + '<p class="warn-why">' + esc(why) + '</p>'
    + '<p class="warn-fix">' + esc(t('warnEdit')) + '</p>'
    + '<button class="warn-cta" type="button" data-promise="1">📜 ' + esc(t('promiseBtn')) + '</button>';
}

function showComposeWarn(kind){
  const el = $('#composeWarn');
  if (!el) return;
  composeWarnKind = kind;
  el.innerHTML = warnHTML(kind);
  el.hidden = false;
  const body = el.closest('.sheet-body');
  if (body) body.scrollTop = 0;
}
function hideComposeWarn(){
  composeWarnKind = null;
  const el = $('#composeWarn');
  if (el) { el.hidden = true; el.innerHTML = ''; }
}

function showCommentWarn(form, kind){
  clearCommentWarn(form);
  const box = document.createElement('div');
  box.className = 'warn warn-inline';
  box.setAttribute('role', 'alert');
  box.innerHTML = warnHTML(kind);
  form.insertAdjacentElement('afterend', box);
  box.scrollIntoView({ block: 'nearest' });
  toast(t('warnTitle'));
}
function clearCommentWarn(form){
  const box = form && form.parentNode;
  if (!box) return;
  $$('.warn-inline', box).forEach(n => n.remove());
}

/* ---------- 👤 내 프로필 ----------
   사진·닉네임·한 줄 소개는 diary.v1(me.avatar / me.nick / me.bio)에 있고,
   사진은 256px 정사각 JPEG로 다시 인코딩해 저장한다. 그래서 한 번 저장하면
   내가 쓴 모든 글과 댓글에 함께 반영된다. */
const PROFILE_PX = 256;
const NICK_MAX = 20;
const BIO_MAX = 80;
let profileDraftAvatar = null;
let profileWarnKind = null;

async function squareAvatarDataURL(file){
  const src = await readAsDataURL(file);
  const img = await loadImage(src);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const side = Math.max(1, Math.min(w, h));
  const sx = Math.max(0, (w - side) / 2);
  const sy = Math.max(0, (h - side) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = PROFILE_PX; canvas.height = PROFILE_PX;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, PROFILE_PX, PROFILE_PX);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, PROFILE_PX, PROFILE_PX);
  let blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.86));
  if (blob && blob.size > 60 * 1024) blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.62));
  if (!blob) return null;
  return await readAsDataURL(blob);
}

function setProfilePhotoPreview(url){
  const img = $('#profilePhotoImg');
  if (img) img.src = url || AVATAR_DEFAULT;
}

function syncProfileCounters(){
  const n = $('#profileNickInput'), b = $('#profileBioInput');
  const nc = $('#profileNickCount'), bc = $('#profileBioCount');
  if (n && nc) nc.textContent = String(n.value.length);
  if (b && bc) bc.textContent = String(b.value.length);
}

function showProfileWarn(kind){
  const el = $('#profileWarn');
  if (!el) return;
  profileWarnKind = kind;
  el.innerHTML = warnHTML(kind);
  el.hidden = false;
  const body = el.closest('.sheet-body');
  if (body) body.scrollTop = 0;
}

function hideProfileWarn(){
  profileWarnKind = null;
  const el = $('#profileWarn');
  if (el) { el.hidden = true; el.innerHTML = ''; }
}

function openProfileSheet(){
  profileDraftAvatar = (state.me && typeof state.me.avatar === 'string' && state.me.avatar) ? state.me.avatar : null;
  hideProfileWarn();
  const n = $('#profileNickInput'), b = $('#profileBioInput'), pi = $('#profilePhotoInput');
  if (n) n.value = state.me.nick || '';
  if (b) b.value = state.me.bio || '';
  if (pi) pi.value = '';
  setProfilePhotoPreview(profileDraftAvatar);
  syncProfileCounters();
  openSheet($('#profileSheet'));
}

async function onProfilePhotoPick(file){
  if (!file) return;
  if (!/^image\//.test(file.type || '')) { toast(t('profilePhotoBad')); return; }
  try {
    const dataUrl = await squareAvatarDataURL(file);
    if (!dataUrl) throw new Error('encode');
    profileDraftAvatar = dataUrl;
    setProfilePhotoPreview(dataUrl);
  } catch (e) {
    toast(t('profilePhotoBad'));
  }
}

/* 저장하면 이미 쓴 글과 댓글의 닉네임까지 함께 바뀐다. */
function saveProfile(){
  const nickEl = $('#profileNickInput'), bioEl = $('#profileBioInput');
  if (!nickEl || !bioEl) return;
  const nick = (nickEl.value || '').trim().slice(0, NICK_MAX);
  const bio = (bioEl.value || '').trim().slice(0, BIO_MAX);
  if (!nick) { toast(t('profileNeedNick')); nickEl.focus(); return; }
  const bad = checkText(nick + '\n' + bio);
  if (bad) { showProfileWarn(bad.kind); return; }
  hideProfileWarn();
  const oldNick = (state.me && state.me.nick) ? state.me.nick : '';
  state.me.nick = nick;
  state.me.bio = bio;
  state.me.avatar = profileDraftAvatar || null;
  const handle = state.me.handle;
  state.diaries.forEach(p => {
    if (p.mine) p.nick = nick;
    (p.comments || []).forEach(c => {
      if (!c) return;
      if ((c.handle && c.handle === handle) || (oldNick && c.nick === oldNick)) c.nick = nick;
    });
  });
  save(state);
  closeSheet($('#profileSheet'));
  render();
  toast(t('profileSaved'));
}

/* ---------- 글쓰기 ----------
   같은 시트가 새 글과 수정을 맡는다: editPostId가 수정 중인 글이고, 수정 모드에서는
   이미 붙인 사진·영상이 편집 가능한 상태로 되살아난다. */
let draftMedia = [];
let editPostId = null;

function clearDraftMedia(){
  draftMedia.forEach(m => { if (!m.id) { try { URL.revokeObjectURL(m.url); } catch (e) {} } });
  draftMedia = [];
  const mi = $('#mediaInput');
  if (mi) mi.value = '';
  renderDraftMedia();
}

function openCompose(prefill){
  editPostId = null;
  hideComposeWarn();
  const seedBody = prefill && prefill.body ? String(prefill.body).slice(0, 500) : '';
  const seedTags = prefill && prefill.tags ? String(prefill.tags) : '';
  $('#bodyInput').value = seedBody;
  $('#tagInput').value = seedTags;
  $('#bodyCount').textContent = String(seedBody.length);
  clearDraftMedia();
  syncComposeMode();
  openSheet($('#composeSheet'));
  setTimeout(() => { const b = $('#bodyInput'); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); b.scrollTop = 0; } }, 260);
}

function syncComposeMode(){
  const editing = !!editPostId;
  const title = $('#composeTitle'), submit = $('#composeSubmit');
  if (title) title.textContent = t(editing ? 'editPost' : 'newPost');
  if (submit) submit.textContent = t(editing ? 'save' : 'publish');
}

function openEditPost(p){
  if (!p) return;
  editPostId = p.id;
  hideComposeWarn();
  $('#bodyInput').value = p.body || '';
  $('#tagInput').value = (p.tags || []).map(x => '#' + x).join(' ');
  $('#bodyCount').textContent = String(($('#bodyInput').value || '').length);
  clearDraftMedia();
  syncComposeMode();
  openSheet($('#composeSheet'));
  loadDraftFromPost(p);
  setTimeout(() => { const b = $('#bodyInput'); if (b && !draftMedia.length) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } }, 260);
}

async function loadDraftFromPost(p){
  const wanted = [];
  (Array.isArray(p.media) ? p.media : []).slice(0, MAX_MEDIA).forEach(m => { if (m && m.id) wanted.push({ id: m.id, kind: m.kind || 'image', data: m.data || null }); });
  if (!wanted.length && Array.isArray(p.photos)) {
    p.photos.slice(0, MAX_MEDIA).forEach((src) => { if (typeof src === 'string') wanted.push({ id: null, kind: 'image', data: src }); });
  }
  for (const w of wanted) {
    let blob = null, kind = w.kind;
    try {
      if (w.id) {
        const rec = await mediaGet(w.id);
        if (rec && rec.blob) { blob = rec.blob; kind = rec.kind || kind; }
      }
      if (!blob && w.data) blob = await (await fetch(w.data)).blob();
    } catch (e) { blob = null; }
    if (!blob) {
      const hit = w.id ? mediaURLs.get(w.id) : null;
      if (hit && hit.url) { draftMedia.push({ kind: hit.kind || kind, blob: null, url: hit.url, id: w.id }); continue; }
      continue;
    }
    draftMedia.push({ kind, blob, url: URL.createObjectURL(blob), id: w.id || null });
  }
  if (editPostId !== p.id) return;
  renderDraftMedia();
}

/* #을 떼고 소문자로 맞춘 태그를 8개까지 */
function parseTags(raw){
  return String(raw || '').split(/[\s,]+/).map(s => s.replace(/^#+/, '').trim().toLowerCase())
    .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
}

function renderDraftMedia(){
  const strip = $('#photoStrip');
  if (!strip) return;
  strip.hidden = draftMedia.length === 0;
  strip.innerHTML = draftMedia.map((m, i) => (
    '<div class="photo-thumb' + (m.kind === 'video' ? ' is-video' : '') + '">'
    + (m.kind === 'video'
        ? '<video src="' + escAttr(m.url) + '" muted playsinline preload="metadata"></video><span class="thumb-play" aria-hidden="true">\u25b6</span>'
        : '<img src="' + escAttr(m.url) + '" alt="">')
    + '<button type="button" class="rm" data-i="' + i + '" aria-label="삭제">\u2715</button></div>'
  )).join('');
}

/* 영상 길이는 메타데이터만 읽어 확인한다. 0은 "알 수 없음"이므로 막지 않는다. */
function videoSeconds(file){
  return new Promise((resolve) => {
    const v = document.createElement('video');
    let url = '', settled = false, timer = 0;
    const finish = (secs) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      v.removeAttribute('src');
      try { v.load(); } catch (e) {}
      if (url) { try { URL.revokeObjectURL(url); } catch (e) {} }
      resolve(secs);
    };
    const read = () => {
      const d = v.duration;
      if (typeof d === 'number' && isFinite(d) && d > 0) finish(d);
    };
    v.preload = 'metadata';
    v.muted = true;
    v.playsInline = true;
    v.addEventListener('loadedmetadata', read);
    v.addEventListener('durationchange', read);
    v.addEventListener('error', () => finish(0));
    timer = setTimeout(() => finish(0), 5000);
    url = URL.createObjectURL(file);
    v.src = url;
    try { v.load(); } catch (e) { finish(0); }
  });
}

async function addMediaFiles(files){
  for (const f of Array.from(files || [])) {
    if (draftMedia.length >= MAX_MEDIA) { toast(t('tooManyPhotos')); break; }
    const isImage = /^image\//.test(f.type);
    const isVideo = /^video\//.test(f.type);
    if (!isImage && !isVideo) continue;
    if (isVideo && f.size > MAX_VIDEO_BYTES) { toast(t('videoTooBig')); continue; }
    try {
      if (isImage) {
        const blob = await downscaleImageBlob(f);
        if (!blob) throw new Error('encode');
        draftMedia.push({ kind: 'image', blob, url: URL.createObjectURL(blob) });
      } else {
        const secs = await videoSeconds(f);
        if (secs > MAX_VIDEO_SECONDS + VIDEO_SECONDS_SLACK) { toast(t('videoTooLong')); continue; }
        draftMedia.push({ kind: 'video', blob: f, url: URL.createObjectURL(f) });
      }
    } catch (e) {
      toast(t(isVideo ? 'videoBad' : 'photoBad'));
    }
  }
  renderDraftMedia();
}

async function storeDraftMedia(items){
  const refs = [];
  for (const m of items) {
    if (m.id) { refs.push({ id: m.id, kind: m.kind }); continue; }
    if (!m.blob) continue;
    try {
      const id = newMediaId();
      await mediaPut(id, m.blob, m.kind);
      mediaURLs.set(id, { url: m.url, kind: m.kind });
      refs.push({ id, kind: m.kind });
    } catch (e) {
      if (m.kind === 'image') {
        try { refs.push({ id: newMediaId(), kind: 'image', data: await readAsDataURL(m.blob) }); } catch (e2) {}
      }
    }
  }
  return refs;
}

function setComposeBusy(on){
  const btn = $('#composeSubmit');
  if (btn) btn.disabled = !!on;
}

async function submitPost(){
  const body = ($('#bodyInput').value || '').trim();
  if (!body) { toast(t('needText')); return; }
  const bad = checkText(body + '\n' + ($('#tagInput').value || ''));
  if (bad) { showComposeWarn(bad.kind); return; }
  hideComposeWarn();
  const tags = parseTags($('#tagInput').value);
  setComposeBusy(true);
  let media = [];
  try { media = await storeDraftMedia(draftMedia); } catch (e) { media = []; }
  setComposeBusy(false);
  const inlinePhotos = media.filter(m => m.data).map(m => m.data);
  const refs = media.filter(m => !m.data);
  const p = {
    id: uid(), nick: state.me.nick, handle: state.me.handle, avatar: null,
    body, tags, media: refs, translations: {}, mine: true, verified: false,
    ts: Date.now(), likes: 0, liked: false, reposts: 0, reposted: false, comments: [],
  };
  if (inlinePhotos.length) p.photos = inlinePhotos;
  state.diaries.unshift(p);
  save(state);
  draftMedia = [];
  editPostId = null;
  closeSheet($('#composeSheet'));
  toast(t('posted'));
  if (state.filterTag && !p.tags.includes(state.filterTag)) state.filterTag = null;
  go('home', true);
}

/* 수정: 본문·태그·사진이 바뀌고, 글의 정체성·좋아요·리포스트·댓글·작성 시각은 남는다. */
async function submitEdit(){
  const p = findPost(editPostId);
  if (!p) { editPostId = null; closeSheet($('#composeSheet')); return; }
  const body = ($('#bodyInput').value || '').trim();
  if (!body) { toast(t('needText')); return; }
  const bad = checkText(body + '\n' + ($('#tagInput').value || ''));
  if (bad) { showComposeWarn(bad.kind); return; }
  hideComposeWarn();
  const tags = parseTags($('#tagInput').value);
  setComposeBusy(true);
  const kept = new Set(draftMedia.filter(m => m.id).map(m => m.id));
  const dropped = (Array.isArray(p.media) ? p.media : []).filter(m => m && m.id && !kept.has(m.id));
  let media = [];
  try { media = await storeDraftMedia(draftMedia); } catch (e) { media = p.media || []; }
  setComposeBusy(false);
  const inlinePhotos = media.filter(m => m.data).map(m => m.data);
  p.body = body;
  p.tags = tags;
  p.media = media.filter(m => !m.data);
  if (inlinePhotos.length) p.photos = inlinePhotos; else delete p.photos;
  p.editedAt = Date.now();
  /* 고친 본문에 예전 번역이 답하면 안 된다 */
  p.translations = {};
  delete trState[p.id];
  Array.from(trCache.keys()).forEach(k => { if (k.indexOf(p.id + '|') === 0) trCache.delete(k); });
  dropped.forEach(m => { mediaDel(m.id); mediaURLs.delete(m.id); });
  save(state);
  draftMedia = [];
  editPostId = null;
  closeSheet($('#composeSheet'));
  toast(t('savedPost'));
  if (state.filterTag && !p.tags.includes(state.filterTag)) state.filterTag = null;
  render();
}

function onComposeSubmit(){ if (editPostId) submitEdit(); else submitPost(); }

/* ---------- sheet ---------- */
function openSheet(sheet){
  const scrim = $('#scrim');
  scrim.hidden = false; sheet.hidden = false;
  requestAnimationFrame(() => { scrim.classList.add('is-open'); sheet.classList.add('is-open'); });
}
function closeSheet(sheet){
  const scrim = $('#scrim');
  scrim.classList.remove('is-open'); sheet.classList.remove('is-open');
  setTimeout(() => {
    scrim.hidden = true; sheet.hidden = true;
    if (sheet === $('#composeSheet')) { editPostId = null; clearDraftMedia(); syncComposeMode(); }
    if (sheet === $('#profileSheet')) { profileDraftAvatar = null; hideProfileWarn(); }
  }, 230);
}

/* ---------- toast ---------- */
let toastTimer = null;
function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2400);
}

/* ---------- 공유 ---------- */
function postLink(p){ return PAGE_URL + '#d=' + p.id; }

async function sharePost(p){
  const data = { title: '다이어리', text: p.body.slice(0, 120), url: postLink(p) };
  if (navigator.share) {
    try { await navigator.share(data); toast(t('sharedTo')); return; }
    catch(e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(data.url); toast(t('copied')); }
  catch(e) {
    const ta = document.createElement('textarea');
    ta.value = data.url; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(t('copied')); }
    catch(e2) { toast(data.url); }
    ta.remove();
  }
}

/* ---------- 딥링크 ---------- */
function readDeepLink(){
  const m = (location.hash || '').match(/d=([A-Za-z0-9_\-]+)/);
  return m ? m[1] : null;
}

/* ---------- rendering ---------- */
let currentView = 'home';
let deepLinkedId = null;

function visiblePosts(){
  let list = state.diaries.slice();
  if (currentView === 'search') {
    const q = (state.searchQuery || '').trim().toLowerCase();
    const tag = state.filterTag;
    if (q) list = list.filter(p => p.body.toLowerCase().includes(q) || p.tags.some(x => x.includes(q)) || p.nick.toLowerCase().includes(q));
    if (tag) list = list.filter(p => p.tags.includes(tag));
  } else if (currentView === 'me') {
    if (state.meTab === 'likes') { list = list.filter(p => p.liked); }
    else { list = list.filter(p => p.mine); }
  }
  return list.sort((a, b) => b.ts - a.ts);
}

function render(){
  const y = window.scrollY;
  renderMain();
  markTabs();
  const composeAva = $('#composeAvatar');
  if (composeAva) composeAva.src = profileAvatarSrc();
  if (composeWarnKind && $('#composeWarn') && !$('#composeWarn').hidden) showComposeWarn(composeWarnKind);
  if (profileWarnKind && $('#profileWarn') && !$('#profileWarn').hidden) showProfileWarn(profileWarnKind);
  if (y) window.scrollTo(0, y);
}

function markTabs(){
  $$('.tab[data-view]').forEach(b => b.classList.toggle('is-active', b.dataset.view === currentView));
}

const ICO = {
  heart: (cls) => '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.3 4.9 13a4.9 4.9 0 0 1 0-6.9 4.7 4.7 0 0 1 6.8 0l.3.3.3-.3a4.7 4.7 0 0 1 6.8 0 4.9 4.9 0 0 1 0 6.9Z"/></svg>',
  bubble: '<svg class="ico" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.8a8.4 8.4 0 0 1-8.5 8.3 8.9 8.9 0 0 1-3.3-.6L4 21l1.6-4.3a8 8 0 0 1-1.1-4.9A8.4 8.4 0 0 1 13 3.5a8.4 8.4 0 0 1 8 8.3Z"/></svg>',
  repeat: (cls) => '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.5 21 6.5l-4 4"/><path d="M21 6.5H8a4 4 0 0 0-4 4v1"/><path d="M7 21.5l-4-4 4-4"/><path d="M3 17.5h13a4 4 0 0 0 4-4v-1"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2.5 11 13"/><path d="M21.5 2.5 15 21.5l-4-8.5-8.5-4Z"/></svg>',
  globe: '<svg class="globe" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg>',
  pencil: '<svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4.2L19.1 9.1a2.35 2.35 0 0 0-3.3-3.3L4.9 16.7Z"/><path d="M14.4 7.2l2.4 2.4"/></svg>',
  trash: '<svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6.5 7l1 13h9l1-13M9 7V4.5h6V7"/></svg>',
};

/* 내가 쓴 글·댓글인지: @me 핸들로도 확인한다(예전 글은 avatar가 null이다) */
function isMeWriter(p){
  if (!p) return false;
  if (p.mine || p.me) return true;
  const handle = state && state.me ? state.me.handle : '@me';
  return !!p.handle && p.handle === handle;
}

function profileAvatarSrc(){
  return (state && state.me && typeof state.me.avatar === 'string' && state.me.avatar) ? state.me.avatar : AVATAR_DEFAULT;
}

function avatarHTML(p, size){
  const cls = 'avatar-' + size;
  const src = isMeWriter(p) ? profileAvatarSrc() : (p.avatar || '');
  if (src) return '<img class="avatar ' + cls + '" src="' + escAttr(src) + '" alt="" width="' + size + '" height="' + size + '">';
  const letter = (p.nick || '?').trim().charAt(0);
  return '<span class="avatar-fallback ' + cls + '" aria-hidden="true">' + esc(letter) + '</span>';
}

function tagChipHTML(tag, count, label){
  const n = count ? '<b class="chip-n">' + count + '</b>' : '';
  return '<button type="button" class="chip" data-tag="' + escAttr(tag) + '">#' + esc(label || tag) + n + '</button>';
}

/* 글에 붙은 사진·영상: IndexedDB 참조 또는 예전 인라인 data-URL */
function postMediaItems(p){
  const items = [];
  if (Array.isArray(p.media) && p.media.length) {
    p.media.slice(0, MAX_MEDIA).forEach(m => {
      const hit = m.id ? mediaURLs.get(m.id) : null;
      items.push({ kind: m.kind || 'image', url: hit ? hit.url : null, id: m.id || '' });
    });
  } else if (Array.isArray(p.photos) && p.photos.length) {
    p.photos.slice(0, MAX_MEDIA).forEach((src, i) => items.push({ kind: 'image', url: src, id: 'ph' + i }));
  }
  return items;
}

function mediaHTML(p){
  const items = postMediaItems(p);
  if (!items.length) return '';
  const n = items.length;
  const vids = items.filter(x => x.kind === 'video').length;
  let inner = '';
  items.forEach((it, i) => {
    if (it.kind === 'video') {
      inner += it.url
        ? '<video class="ph-video" src="' + escAttr(it.url) + '" controls playsinline webkit-playsinline preload="metadata" data-video="' + i + '"></video>'
        : '<div class="ph-skel ph-video-skel"><span>\u25b6</span></div>';
    } else {
      inner += it.url
        ? '<img src="' + escAttr(it.url) + '" alt="" loading="lazy" data-photo="' + i + '">'
        : '<div class="ph-skel"></div>';
    }
  });
  return '<div class="post-photos" data-n="' + n + '" data-vids="' + vids + '">' + inner + '</div>';
}

/* 댓글창은 한 번 연 글에서 계속 열려 있게 한다(댓글을 쓰고 나서 다시 눌러야 하는 일이 없도록). */
const openComments = new Set();

function commentsHTML(p){
  if (!p.comments.length) return '';
  return p.comments.map(c => (
    '<div class="comment" data-cid="' + escAttr(c.id) + '">'
    + avatarHTML(c, 28)
    + '<div class="comment-main"><div class="comment-head">'
    + '<span class="comment-author">' + esc(c.nick) + '</span>'
    + '<span class="comment-time">' + timeAgo(c.ts) + '</span></div>'
    + '<p class="comment-text">' + esc(c.text) + '</p>'
    + (c.nick === state.me.nick ? '<button type="button" class="comment-del" data-del-comment="' + escAttr(c.id) + '">' + t('deleteComment') + '</button>' : '')
    + '</div></div>'
  )).join('');
}

/* ---------- 번역 ----------
   글마다 번역 보기/원문 보기로 전환한다. 한국어 글이면 영어로, 그 밖의 글이면
   한국어로 옮긴다. 같은 글은 같은 언어로 두 번 보내지 않는다. */
let trState = {};
const trCache = new Map();

const TR_TARGET = { en:'en', ko:'ko', ja:'ja', zh:'zh-CN', es:'es' };
const TR_LIBRE_TARGET = { en:'en', ko:'ko', ja:'ja', zh:'zh', es:'es' };

function hasHangul(s){ return /[\uAC00-\uD7A3]/.test(String(s || '')); }

function sameLang(a, b){
  if (!a || !b) return false;
  return String(a).slice(0, 2).toLowerCase() === String(b).slice(0, 2).toLowerCase();
}

async function trGoogle(text, target){
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='
    + encodeURIComponent(target) + '&dt=t';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: 'q=' + encodeURIComponent(text),
  });
  if (!res.ok) throw new Error('gtx ' + res.status);
  const j = await res.json();
  const out = (j[0] || []).map(seg => (seg && seg[0]) || '').join('');
  if (!out.trim()) throw new Error('gtx empty');
  return { text: out, src: j[2] || null };
}

async function trClients5(text, target){
  const url = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl='
    + encodeURIComponent(target) + '&q=' + encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error('c5 ' + res.status);
  const j = await res.json();
  let out = '';
  if (Array.isArray(j)) {
    if (typeof j[0] === 'string') out = j.join(' ');
    else if (Array.isArray(j[0])) out = j.map(s => (Array.isArray(s) ? (s[0] || '') : (s || ''))).join('');
    else if (j[0] && Array.isArray(j[0].sentences)) out = j[0].sentences.map(s => s.trans || '').join('');
  } else if (j && Array.isArray(j.sentences)) {
    out = j.sentences.map(s => s.trans || '').join('');
  }
  if (!out.trim()) throw new Error('c5 empty');
  return { text: out, src: null };
}

async function trLibre(text, target){
  const res = await fetch('https://translate.astian.org/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'auto', target: TR_LIBRE_TARGET[target] || target, format: 'text' }),
  });
  if (!res.ok) throw new Error('libre ' + res.status);
  const j = await res.json();
  const out = (j && j.translatedText) || '';
  if (!out.trim()) throw new Error('libre empty');
  return { text: out, src: j.detectedLanguage && j.detectedLanguage.language ? j.detectedLanguage.language : null };
}

async function translateText(text, target){
  const q = String(text || '').slice(0, 4000);
  let lastErr = null;
  for (const fn of [trGoogle, trClients5, trLibre]) {
    try {
      const out = await fn(q, target);
      if (out && out.text) return out;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('translate failed');
}

function translateRowHTML(p){
  const st = trState[p.id];
  const isOpen = !!(st && st.status === 'done');
  let label = t('translate');
  if (st && st.status === 'loading') label = t('translating');
  else if (isOpen) label = t('seeOriginal');
  let body = '';
  if (isOpen) {
    body = '<div class="translate-body">' + esc(st.text)
      + '<div class="translate-meta">' + esc(st.same ? t('translateSame') : t('translatedBy')) + '</div></div>';
  } else if (st && st.status === 'error') {
    body = '<div class="translate-note">' + esc(t('translateFail')) + '</div>';
  }
  return '<div class="translate-row"><button type="button" class="translate-btn'
    + (st && st.status === 'loading' ? ' is-loading' : '') + '" data-translate="' + escAttr(p.id) + '">'
    + ICO.globe + '<span>' + esc(label) + '</span></button>' + body + '</div>';
}

async function startTranslate(p){
  const cur = trState[p.id];
  if (cur) {
    if (cur.status === 'done') { delete trState[p.id]; render(); return; }
    if (cur.status === 'loading') return;
  }
  const target = hasHangul(p.body) ? 'en' : 'ko';
  const key = p.id + '|' + target;
  if (trCache.has(key)) {
    trState[p.id] = Object.assign({ lang: target, status: 'done' }, trCache.get(key));
    render();
    return;
  }
  trState[p.id] = { lang: target, status: 'loading' };
  render();
  try {
    const out = await translateText(p.body, TR_TARGET[target] || target);
    const entry = { text: out.text, src: out.src || null, same: sameLang(out.src, target) };
    trCache.set(key, entry);
    trState[p.id] = Object.assign({ lang: target, status: 'done' }, entry);
  } catch (e) {
    trState[p.id] = { lang: target, status: 'error' };
  }
  render();
}

/* ---------- 글 한 장 ---------- */
function postHTML(p){
  const tags = p.tags.map((tg) => tagChipHTML(tg)).join('');
  return (
    '<article class="post" id="p-' + escAttr(p.id) + '" data-pid="' + escAttr(p.id) + '">'
    + '<div class="post-top">'
    +   avatarHTML(p, 36)
    +   '<div class="post-headline">'
    +     '<div class="byline">'
    +       '<span class="byline-name">' + esc(p.nick) + '</span>'
    +       '<span class="byline-handle">' + esc(p.handle) + '</span>'
    +       '<span class="dot">\u00b7</span>'
    +       '<span class="byline-time" data-ts="' + p.ts + '">' + timeAgo(p.ts) + '</span>'
    +       (p.editedAt ? '<span class="edited-mark">' + esc(t('edited')) + '</span>' : '')
    +     '</div>'
    +     '<p class="post-body">' + esc(p.body) + '</p>'
    +     (tags ? '<div class="post-tags">' + tags + '</div>' : '')
    +   '</div>'
    + '</div>'
    + mediaHTML(p)
    + translateRowHTML(p)
    + '<div class="post-actions">'
    +   '<button type="button" class="act' + (p.liked ? ' is-liked' : '') + '" data-act="like" aria-pressed="' + (p.liked ? 'true' : 'false') + '" aria-label="' + escAttr(t('like')) + '">' + ICO.heart() + '<span class="cnt">' + (p.likes || '') + '</span></button>'
    +   '<button type="button" class="act" data-act="comment" aria-label="' + escAttr(t('comment')) + '">' + ICO.bubble + '<span class="cnt">' + (p.comments.length || '') + '</span></button>'
    +   '<button type="button" class="act' + (p.reposted ? ' is-reposted' : '') + '" data-act="repost" aria-pressed="' + (p.reposted ? 'true' : 'false') + '" aria-label="' + escAttr(t('repost')) + '">' + ICO.repeat() + '<span class="cnt">' + (p.reposts || '') + '</span></button>'
    +   '<button type="button" class="act" data-act="share" aria-label="' + escAttr(t('share')) + '">' + ICO.send + '</button>'
    +   (p.mine ? '<span class="post-tools">'
    +   '<button type="button" class="act" data-act="edit" aria-label="' + escAttr(t('edit')) + '" title="' + escAttr(t('edit')) + '">' + ICO.pencil + '</button>'
    +   '<button type="button" class="act" data-act="delete" aria-label="삭제" title="삭제">' + ICO.trash + '</button>'
    +   '</span>' : '')
    + '</div>'
    + '<div class="comments"' + (openComments.has(p.id) ? '' : ' hidden') + '>'
    +   commentsHTML(p)
    +   '<form class="comment-form" data-cform="' + escAttr(p.id) + '">'
    +     avatarHTML({ nick: state.me.nick, handle: state.me.handle, mine: true }, 28)
    +     '<input class="comment-input" type="text" maxlength="280" placeholder="' + escAttr(t('commentPlaceholder')) + '" aria-label="' + escAttr(t('comment')) + '">'
    +     '<button class="send-btn" type="submit" aria-label="' + escAttr(t('send')) + '">' + ICO.send + '</button>'
    +   '</form>'
    + '</div>'
    + '</article>'
  );
}

function emptyHTML(msg){
  return '<div class="empty">' + esc(msg) + '</div>';
}

function emptyHomeHTML(){
  return (
    '<div class="empty-home">'
    + '<svg class="empty-ico" viewBox="0 0 48 48" width="46" height="46" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
    +   '<path d="M10 7h20l8 8v26H10z"/><path d="M30 7v8h8"/><path d="M16 24h16M16 30h16M16 36h9"/>'
    + '</svg>'
    + '<b class="empty-title">' + esc(t('emptyHomeTitle')) + '</b>'
    + '<p class="empty-sub">' + esc(t('emptyHomeSub')) + '</p>'
    + '<button type="button" class="pill primary empty-cta" data-empty-post="1">' + esc(t('emptyHomeCta')) + '</button>'
    + '</div>'
  );
}

function renderMain(){
  const main = $('#main');
  const v = currentView;

  if (v === 'home') {
    const posts = visiblePosts();
    main.innerHTML = '<div class="feed-head-pad"></div>'
      + (posts.length ? posts.map(postHTML).join('') : emptyHomeHTML());
    return;
  }
  if (v === 'search') {
    const tags = topTags();
    main.innerHTML =
      '<div class="view-head"><h2 class="view-title">' + esc(t('searchTitle')) + '</h2></div>'
      + '<div class="search-wrap"><input id="searchInput" class="search-input" type="search" placeholder="' + escAttr(t('searchPlaceholder')) + '" value="' + escAttr(state.searchQuery || '') + '"></div>'
      + '<div class="tag-cloud-head">' + esc(t('popTags')) + '</div>'
      + '<div class="tag-cloud">' + tags.map(tg => tagChipHTML(tg.tag, tg.count, tg.label)).join('') + '</div>'
      + '<div id="searchResults">' + searchResultsHTML() + '</div>';
    /* 결과 목록만 다시 그린다: 입력창은 그대로 두어 한글 조합 중에도 커서가 흔들리지 않게 */
    const si = $('#searchInput');
    if (si) {
      si.addEventListener('input', () => {
        state.searchQuery = si.value;
        state.filterTag = null;   /* 글자로 찾기 시작하면 태그 필터는 풀린다 */
        save(state);
        const box = $('#searchResults');
        if (box) box.innerHTML = searchResultsHTML();
      });
    }
    return;
  }
  if (v === 'me') {
    const mine = state.diaries.filter(p => p.mine).length;
    const liked = state.diaries.filter(p => p.liked).length;
    const isLikes = state.meTab === 'likes';
    const bio = (state.me.bio || '').trim();
    main.innerHTML =
      '<div class="view-head"><h2 class="view-title">' + esc(t('myTitle')) + '</h2></div>'
      + '<section class="me-card">'
      +   '<div class="me-card-top">'
      +     '<img class="me-card-ava" src="' + escAttr(profileAvatarSrc()) + '" alt="" width="72" height="72">'
      +     '<div class="me-card-body">'
      +       '<b class="me-card-name">' + esc(state.me.nick) + '</b>'
      +       '<span class="me-card-role">' + esc(t('meRole')) + '</span>'
      +       (bio ? '<p class="me-card-bio">' + esc(bio) + '</p>' : '')
      +     '</div>'
      +   '</div>'
      +   '<button class="pill me-card-edit" type="button" data-profile-edit="1">'
      +     ICO.pencil + '<span>' + esc(t('profileEdit')) + '</span></button>'
      + '</section>'
      /* 커뮤니티 약속은 피드가 아니라 내 프로필에 있다 */
      + '<button type="button" class="promise-row" data-promise="1" aria-haspopup="dialog">'
      +   '<span class="promise-row-ico" aria-hidden="true">📜</span>'
      +   '<span class="promise-row-copy"><b>' + esc(t('promiseBtn')) + '</b><span>' + esc(t('promiseBtnSub')) + '</span></span>'
      +   '<span class="promise-row-go" aria-hidden="true">\u203a</span>'
      + '</button>'
      + '<div class="me-tabs">'
      + '<button type="button" class="me-tab' + (!isLikes ? ' is-active' : '') + '" data-metab="mine">' + esc(t('myPosts')) + '</button>'
      + '<button type="button" class="me-tab' + (isLikes ? ' is-active' : '') + '" data-metab="likes">' + esc(t('myLikes')) + '</button>'
      + '</div>'
      + '<div class="me-stats">'
      + '<div class="me-stat"><b>' + mine + '</b><span>' + esc(t('posts')) + '</span></div>'
      + '<div class="me-stat"><b>' + liked + '</b><span>' + esc(t('likes')) + '</span></div>'
      + '</div>'
      + (visiblePosts().length ? visiblePosts().map(postHTML).join('') : emptyHTML(isLikes ? t('emptyLikes') : t('emptyMine')));
    return;
  }
}

/* 검색 결과 영역만 새로 그린다 */
function searchResultsHTML(){
  const found = visiblePosts();
  const note = (state.filterTag || state.searchQuery)
    ? '<div class="filter-note"><span>' + esc(t('searchingFor')) + ' <b>' + esc(state.filterTag ? '#' + state.filterTag : state.searchQuery) + '</b></span>'
      + '<button type="button" id="clearFilter">' + esc(t('clearFilter')) + '</button></div>'
    : '';
  return note + (found.length
    ? found.map(postHTML).join('')
    : emptyHTML(state.searchQuery || state.filterTag ? t('emptySearch') : t('emptyFeed')));
}

/* 인기 태그: 실제로 쓴 태그를 세어 많은 순서로 8개. 같은 수면 최근 사용이 앞선다.
   아직 아무 태그도 없을 때만 추천 태그가 자리를 채운다. */
function topTags(){
  const m = new Map();
  state.diaries.forEach(p => {
    (p.tags || []).forEach(tg => {
      if (!tg) return;
      const e = m.get(tg) || { tag: tg, count: 0, last: 0 };
      e.count += 1;
      if ((p.ts || 0) > e.last) e.last = p.ts || 0;
      m.set(tg, e);
    });
  });
  if (!m.size) return DEFAULT_TAGS.map(tg => ({ tag: tg, label: tg, count: 0, fallback: true }));
  return Array.from(m.values())
    .sort((a, b) => (b.count - a.count) || (b.last - a.last) || a.tag.localeCompare(b.tag))
    .slice(0, TOP_TAG_LIMIT);
}

/* ---------- interactions ---------- */
function go(view, force){
  if (!force && currentView === view) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  currentView = view;
  render();
  window.scrollTo(0, 0);
}

function findPostElFrom(node){
  return node && node.closest ? node.closest('.post') : null;
}

function onMainClick(e){
  const target = e.target;

  const profileBtn = target.closest('[data-profile-edit]');
  if (profileBtn) { openProfileSheet(); return; }

  const promiseBtn = target.closest('[data-promise]');
  if (promiseBtn) { openPromiseSheet(); return; }

  const emptyPostBtn = target.closest('[data-empty-post]');
  if (emptyPostBtn) { openCompose(); return; }

  const translateBtn = target.closest('[data-translate]');
  if (translateBtn) {
    const postEl = findPostElFrom(translateBtn);
    const p = postEl ? findPost(postEl.dataset.pid) : null;
    if (p) startTranslate(p);
    return;
  }

  const delCommentBtn = target.closest('[data-del-comment]');
  if (delCommentBtn) { deleteComment(findPostElFrom(delCommentBtn).dataset.pid, delCommentBtn.dataset.delComment); return; }

  const chip = target.closest('[data-tag]');
  if (chip) {
    state.searchQuery = '';
    state.filterTag = chip.dataset.tag;
    save(state);
    if (currentView === 'search') render(); else go('search');
    return;
  }

  const clearBtn = target.closest('#clearFilter');
  if (clearBtn) { state.filterTag = null; state.searchQuery = ''; save(state); render(); return; }

  const photoEl = target.closest('[data-photo]');
  if (photoEl) {
    const postEl = findPostElFrom(photoEl);
    const p = postEl ? findPost(postEl.dataset.pid) : null;
    if (!p) return;
    const i = parseInt(photoEl.dataset.photo, 10) || 0;
    const item = postMediaItems(p)[i];
    if (item && item.url && item.kind === 'image') openViewer(item.url);
    return;
  }

  const actBtn = target.closest('[data-act]');
  if (actBtn) {
    const post = findPostElFrom(actBtn);
    const p = post ? findPost(post.dataset.pid) : null;
    if (!p) return;
    const act = actBtn.dataset.act;
    if (act === 'like') { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; if (p.likes < 0) p.likes = 0; save(state); render(); }
    else if (act === 'repost') { p.reposted = !p.reposted; p.reposts += p.reposted ? 1 : -1; if (p.reposts < 0) p.reposts = 0; save(state); render(); toast(t(p.reposted ? 'reposted' : 'unreposted')); }
    else if (act === 'share') { sharePost(p); }
    else if (act === 'edit') { openEditPost(p); }
    else if (act === 'comment') {
      openComments.add(p.id);
      const box = post.querySelector('.comments');
      box.hidden = false;
      const inp = box.querySelector('.comment-input');
      inp.focus();
      box.scrollIntoView({ block: 'nearest' });
    }
    else if (act === 'delete') {
      if (confirm(t('confirmDelete'))) {
        (p.media || []).forEach(m => {
          if (!m || !m.id) return;
          mediaDel(m.id);
          mediaURLs.delete(m.id);
        });
        delete trState[p.id];
        openComments.delete(p.id);
        state.diaries = state.diaries.filter(x => x.id !== p.id);
        save(state); render(); toast(t('deleted'));
      }
    }
    return;
  }
}

function onMainSubmit(e){
  const form = e.target.closest('[data-cform]');
  if (!form) return;
  e.preventDefault();
  const pid = form.dataset.cform;
  const inp = form.querySelector('.comment-input');
  const text = (inp.value || '').trim();
  if (!text) return;
  const bad = checkText(text);
  if (bad) { showCommentWarn(form, bad.kind); return; }
  clearCommentWarn(form);
  addComment(pid, text);
}

function openViewer(src){
  $('#viewerImg').src = src;
  $('#viewer').hidden = false;
}
function closeViewer(){ $('#viewer').hidden = true; $('#viewerImg').src = ''; }

/* ---------- offline ---------- */
function updateOnline(){
  let bar = $('#offlineBar');
  if (!navigator.onLine) {
    if (!bar) { bar = document.createElement('div'); bar.id = 'offlineBar'; bar.className = 'offline-bar'; document.body.appendChild(bar); }
    bar.textContent = t('offline');
  } else if (bar) bar.remove();
}

/* ---------- boot ---------- */
function bind(){
  $('#composeBtn').addEventListener('click', () => openCompose());
  $('#composeCancel').addEventListener('click', () => closeSheet($('#composeSheet')));
  $('#scrim').addEventListener('click', () => {
    if (!$('#promiseSheet').hidden) { closePromiseSheet(); return; }
    if (!$('#composeSheet').hidden) closeSheet($('#composeSheet'));
    if (!$('#profileSheet').hidden) closeSheet($('#profileSheet'));
  });
  $('#composeSubmit').addEventListener('click', onComposeSubmit);

  $('#bodyInput').addEventListener('input', () => { $('#bodyCount').textContent = String($('#bodyInput').value.length); });

  const mediaInput = $('#mediaInput'), photoBtn = $('#photoBtn');
  if (photoBtn && mediaInput) {
    photoBtn.addEventListener('click', () => mediaInput.click());
    mediaInput.addEventListener('change', (e) => { addMediaFiles(e.target.files); e.target.value = ''; });
  }
  if ($('#photoStrip')) $('#photoStrip').addEventListener('click', (e) => {
    const rm = e.target.closest('.rm');
    if (rm) {
      const i = parseInt(rm.dataset.i, 10);
      const gone = draftMedia.splice(i, 1)[0];
      if (gone) { try { URL.revokeObjectURL(gone.url); } catch (err) {} }
      renderDraftMedia();
    }
  });

  $$('.tab[data-view]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.view)));

  const main = $('#main');
  main.addEventListener('click', onMainClick);
  main.addEventListener('submit', onMainSubmit);
  main.addEventListener('input', (e) => {
    if (!e.target.classList || !e.target.classList.contains('comment-input')) return;
    const form = e.target.closest('[data-cform]');
    if (form) clearCommentWarn(form);
  });
  main.addEventListener('click', (e) => {
    const metaBtn = e.target.closest('[data-metab]');
    if (metaBtn) { state.meTab = metaBtn.dataset.metab; save(state); render(); return; }
  });

  $('#viewer').addEventListener('click', closeViewer);
  $('#viewerClose').addEventListener('click', closeViewer);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#promiseSheet').hidden) { closePromiseSheet(); return; }
    closeViewer();
    if (!$('#composeSheet').hidden) closeSheet($('#composeSheet'));
    if (!$('#profileSheet').hidden) closeSheet($('#profileSheet'));
  });

  /* 커뮤니티 약속 시트, 그리고 그 시트로 안내하는 경고 */
  if ($('#promiseSheet')) $('#promiseClose').addEventListener('click', closePromiseSheet);
  if ($('#composeWarn')) $('#composeWarn').addEventListener('click', (e) => {
    if (e.target.closest('[data-promise]')) openPromiseSheet();
  });
  ['#bodyInput', '#tagInput'].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('input', hideComposeWarn);
  });

  /* 내 프로필 시트 */
  if ($('#profileSheet')) {
    $('#profileCancel').addEventListener('click', () => closeSheet($('#profileSheet')));
    $('#profileSave').addEventListener('click', saveProfile);
    $('#profilePhotoBtn').addEventListener('click', () => { const i = $('#profilePhotoInput'); if (i) i.click(); });
    $('#profilePhotoPick').addEventListener('click', () => { const i = $('#profilePhotoInput'); if (i) i.click(); });
    $('#profilePhotoInput').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      onProfilePhotoPick(f);
      e.target.value = '';
    });
    $('#profilePhotoReset').addEventListener('click', () => { profileDraftAvatar = null; setProfilePhotoPreview(null); });
    ['#profileNickInput', '#profileBioInput'].forEach(sel => {
      const el = $(sel);
      if (!el) return;
      el.addEventListener('input', () => { syncProfileCounters(); hideProfileWarn(); });
    });
    $('#profileWarn').addEventListener('click', (e) => {
      if (e.target.closest('[data-promise]')) openPromiseSheet();
    });
  }

  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);
}

function boot(){
  load();
  bind();
  updateOnline();

  const dl = readDeepLink();
  if (dl) {
    deepLinkedId = dl; currentView = 'home'; render();
    requestAnimationFrame(() => { const el = document.getElementById('p-' + dl); if (el) el.scrollIntoView({ block: 'center' }); });
  } else render();

  ensureMedia();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', boot);
})();
