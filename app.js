(() => {
"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function imageAttrs(src, sizes = '(max-width: 700px) 100vw, 50vw') {
  const info = window.webImages?.[src];
  if (!info) return '';
  return `width="${info.width}" height="${info.height}" decoding="async" srcset="${info.variants.map(v => `${v.src} ${v.width}w`).join(', ')}" sizes="${sizes}"`;
}
function setImage(image, src) {
  const info = window.webImages?.[src];
  if (info) {
    image.width = info.width;
    image.height = info.height;
    image.sizes = '(max-width: 700px) 100vw, 50vw';
    image.srcset = info.variants.map(v => `${v.src} ${v.width}w`).join(', ');
  } else {
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
    image.removeAttribute('width');
    image.removeAttribute('height');
  }
  image.src = src;
}

const dialog = $('#content-dialog');
let lastFocus;
let readerState = null;
let rosterCharacters = [];
let selectedCharacterId = 'jorge';
function openDialog(context, html) {
  if (!dialog.open) lastFocus = document.activeElement;
  readerState = null;
  $('#dialog-context').textContent = context;
  $('#dialog-body').innerHTML = html;
  if (!dialog.open) dialog.showModal();
  document.body.style.overflow = 'hidden';
  dialog.scrollTop = 0;
  $('.dialog-close').focus();
}
function closeDialog() { dialog.close(); }
$('.dialog-close').addEventListener('click', closeDialog);
dialog.addEventListener('click', e => { if (e.target === dialog) { const box = dialog.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) closeDialog(); } });
dialog.addEventListener('close', () => {
  $('video', dialog)?.pause();
  readerState = null;
  document.body.style.overflow = '';
  lastFocus?.focus({preventScroll:true});
});
const menuToggle = $('.menu-toggle');
function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  $('#main-nav').classList.toggle('open', open);
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
$$('#main-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setMenu(false);
  if (readerState && dialog.open && !['SELECT','INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    if (e.key === 'ArrowRight') { e.preventDefault(); changePage(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); changePage(-1); }
  }
});
const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    $$('#main-nav a').forEach(link => { const active = link.hash === `#${entry.target.id}`; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
}, {rootMargin: '-15% 0px -60% 0px'});
['inicio','juego','manga','arte','noticias'].forEach(id => sectionObserver.observe(document.getElementById(id)));
const descriptions = {
  jorge: 'El más pequeño también puede desatar la tormenta. Ito lleva la electricidad al combate con golpes rápidos y rayos que cruzan la arena.',
  alonso: 'El agua encuentra su camino. A transforma la arena con corrientes y olas, y lleva la fuerza del océano a cada encuentro.',
  mai: 'Un mundo de sueños cabe en sus manos. Mai lleva su energía estelar al combate y convierte cada encuentro en una escena de otro universo.',
  karina: 'El viento nunca se queda quieto. Kary combina ráfagas, desplazamientos y tornados para abrirse camino hasta el corazón de la pelea.',
  umbra: 'Una presencia entre luces y sombras. El doble del eclipse lleva su propia forma de luchar al universo de Element Fight.',
  lunaro: 'Bajo la luna, la manada responde. Conoce al guardián lunar y descubre su Santuario de la luna cazadora.',
  ferro: 'El arsenal entra en movimiento. Ferro lleva la fuerza cinética a una pelea donde cada arma encuentra su momento.',
  roco: 'Una fuerza que ocupa toda la arena. El titán de masa crítica concentra su poder en una última embestida.',
  vela: 'La velocidad se encuentra con el viento. Vela lleva su energía hasta la Cumbre del viento eterno.',
  nucleo: 'La energía también tiene peso. Núcleo concentra su fuerza en un combate que resuena desde su corazón mineral.',
  desfase: 'Algo espera al otro lado del umbral. Desfase abre su camino hasta el Pasillo de las Tres Singularidades.',
  ralf: 'La pelea tiene otra dimensión. Ralf lleva su peso al cuadrilátero y hace de la gravedad parte de su identidad.',
  chronos: 'El instante puede cambiarlo todo. Chronos encuentra su poder en ese segundo en que el mundo parece detenerse.',
  nathy: 'La Catalizadora entra en la arena. Descubre a Natoo y la energía de su Cámara de reacción absoluta.',
  robotr3s: 'Furia robótica con identidad propia. Robotr3s lleva sus prensas al combate y abre las puertas de su fundición.',
  ian: 'Un segundo, cien decisiones. IAN concentra el combate en el instante en que cada movimiento cuenta.',
  eco: 'El hermano mayor de Chronos tiene su propia historia. Eco encuentra su lugar entre el tiempo y su Punto de retorno.',
  regente: 'Una voluntad se mueve tras el velo. El Regente lleva su presencia a la arena y reclama el espacio de su corte.'
};
async function loadRoster() {
  try {
    const embedded = $('#character-data');
    let characters;
    if (embedded) {
      characters = JSON.parse(embedded.textContent);
    } else {
      const response = await fetch('./characters.json');
      if (!response.ok) throw new Error('No se pudo cargar el plantel');
      characters = await response.json();
    }
    rosterCharacters = characters;
    $('#roster-count').textContent = `${characters.length} personajes`;
    $('#roster').innerHTML = characters.map(character => `<button type="button" data-character="${escapeHTML(character.id)}" aria-label="Ver a ${escapeHTML(character.name)}" title="${escapeHTML(character.name)}" aria-pressed="${character.id === 'jorge'}"><img src="${escapeHTML(character.image)}" alt="" loading="lazy" ${imageAttrs(escapeHTML(character.image), '80px')}><span class="roster-name">${escapeHTML(character.name)}</span></button>`).join('');
    const selectCharacter = (id) => {
      const character = characters.find(c => c.id === id);
      if (!character) return;
      const button = $$('#roster [data-character]').find(item => item.dataset.character === id);
      selectedCharacterId = character.id;
      $('#open-profile').setAttribute('aria-label', `Ver ficha de ${character.name}`);
      $('#fighter-name').textContent = character.name;
      $('.fighter-word').textContent = character.name;
      $('#fighter-subtitle').textContent = character.subtitle;
      $('#fighter-description').textContent = descriptions[character.id] || character.subtitle;
      $('#fighter-domain').textContent = character.domain;
      setImage($('#fighter-image'), character.image);
      $('#fighter-image').alt = `Ilustración de ${character.name}, ${character.subtitle}`;
      $$('#roster button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      $('#fighter-position').textContent = `${character.name} · ${characters.indexOf(character) + 1} / ${characters.length}`;
      if (matchMedia('(max-width: 700px)').matches) {
        const roster = $('#roster');
        roster.scrollTo({left: button.offsetLeft - (roster.clientWidth - button.offsetWidth) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      }
    };
    $('#roster').onclick = e => {
      const button = e.target.closest('[data-character]');
      if (button) selectCharacter(button.dataset.character);
    };
    const stepCharacter = step => {
      const index = characters.findIndex(item => item.id === selectedCharacterId);
      selectCharacter(characters[(index + step + characters.length) % characters.length].id);
    };
    $$('[data-fighter-step]').forEach(button => {
      button.onclick = () => stepCharacter(Number(button.dataset.fighterStep));
    });
    const art = $('.fighter-art');
    let touchStart = null;
    art.ontouchstart = e => {
      touchStart = e.touches.length === 1 ? {x:e.touches[0].clientX, y:e.touches[0].clientY} : null;
    };
    art.ontouchend = e => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) stepCharacter(dx < 0 ? 1 : -1);
      touchStart = null;
    };
    art.ontouchcancel = () => { touchStart = null; };
    selectCharacter(selectedCharacterId);
  } catch {
    $('#roster-count').textContent = 'Plantel no disponible';
    $('#roster').innerHTML = '<button class="roster-retry" type="button">Volver a cargar</button>';
    $('.roster-retry').addEventListener('click', loadRoster);
  }
}
loadRoster();
const arenas = [
  {id:'colossus', name:'Jardín del Coloso', description:'Un jardín que despierta. Raíces, fracturas y plataformas que vuelven a crecer.'},
  {id:'clock', name:'Reloj del Vacío', description:'Engranajes y sellos suspendidos. El tiempo transforma las rutas de la pelea.'},
  {id:'tides', name:'Palacio de las Mareas', description:'El océano mueve los apoyos. Las olas y las cadenas cambian el terreno.'},
  {id:'storm', name:'Santuario de la tormenta', description:'Ruinas bajo un cielo agitado. Meteoritos y pilares ponen a prueba tu posición.'},
  {id:'temple', name:'Templo celestial', description:'Una arena entre las nubes. La campana anuncia una onda que atraviesa el templo.'}
];
$('.arena-options').innerHTML = arenas.map((arena, index) => `<button type="button" class="arena-option" data-arena="${arena.id}" aria-pressed="${index === 0}"><img src="assets/${arena.id}.webp" alt="" loading="lazy" ${imageAttrs(`assets/${arena.id}.webp`, '90px')}><span>${arena.name}</span></button>`).join('');
$('.arena-options').addEventListener('click', e => {
  const button = e.target.closest('[data-arena]');
  if (!button) return;
  const arena = arenas.find(a => a.id === button.dataset.arena);
  setImage($('#arena-image'), `assets/${arena.id}.webp`);
  $('#arena-image').alt = `Ilustración del escenario ${arena.name}`;
  $('#arena-title').textContent = arena.name;
  $('#arena-description').textContent = arena.description;
  $$('.arena-option').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
});
const artworks = [
  {id:'mai', title:'Mai, sueños estelares', category:'personajes', src:'assets/mai.webp'},
  {id:'colossus', title:'Jardín del Coloso', category:'escenarios', src:'assets/colossus.webp', wide:true},
  {id:'umbra', title:'Umbra, el doble del eclipse', category:'personajes', src:'assets/umbra.webp'},
  {id:'jorge-super', title:'Rayo fatal', category:'vinetas', src:'assets/jorge-super.webp', wide:true},
  {id:'karina', title:'Kary, guardiana de los tornados', category:'personajes', src:'assets/karina.webp'},
  {id:'tides', title:'Palacio de las Mareas', category:'escenarios', src:'assets/tides.webp'},
  {id:'alonso', title:'A, guardián del agua', category:'personajes', src:'assets/alonso.webp'},
  {id:'karina-super', title:'Vendaval fatal', category:'vinetas', src:'assets/karina-super.webp', wide:true},
  {id:'clock', title:'Reloj del Vacío', category:'escenarios', src:'assets/clock.webp'}
];
function renderGallery(filter = 'all') {
  const visible = artworks.filter(art => filter === 'all' || art.category === filter);
  $('#gallery-count').textContent = `${visible.length} obras`;
  $('#art-grid').innerHTML = visible.map(art => `<button class="art-tile ${art.wide ? 'wide' : ''}" type="button" data-art="${art.id}" aria-label="Ampliar ${art.title}"><img src="${art.src}" alt="${art.title}" loading="lazy" ${imageAttrs(art.src, '(max-width: 700px) 100vw, 50vw')}><span class="art-caption"><span>${art.title}</span><span aria-hidden="true">⤢</span></span></button>`).join('');
}
renderGallery();
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderGallery(button.dataset.filter);
}));
$('#art-grid').addEventListener('click', e => {
  const button = e.target.closest('[data-art]');
  if (!button) return;
  const art = artworks.find(a => a.id === button.dataset.art);
  openDialog('Galería de arte', `<h2 id="dialog-title">${art.title}</h2><img class="dialog-image" src="${art.src}" alt="${art.title}" ${imageAttrs(art.src, '(max-width: 700px) 100vw, 50vw')}><p class="image-credit">Arte original del proyecto Element Fight.</p>`);
});
const chapterEditions = {
  es: {src:'assets/manga/chapter-001/page-001-es.webp', caption:'Alonso atrapa una trucha en el río y se la muestra a su hermano Ito. Lee las viñetas centrales de derecha a izquierda.'},
  en: {src:'assets/manga/chapter-001/page-001-en.webp', caption:'Alonso catches a trout in the river and shows it to his brother Ito. Read the middle panels from right to left.'}
};
const stories = [
  {name:'Capítulo 1 · La pesca de Alonso', pages:[{editions:chapterEditions}]},
  {name:'Ito y A', pages:[{src:'assets/comic-scene.webp',caption:'La preparación: Ito concentra su energía frente a A.'},{src:'assets/comic-impact.webp',caption:'El impacto: la pelea salta a una nueva viñeta.'}]},
  {name:'El dominio de Ito', pages:[{src:'assets/jorge-domain-1.webp',caption:'Cielo de los mil voltios: primera escena.'},{src:'assets/jorge-domain-2.webp',caption:'Cielo de los mil voltios: segunda escena.'},{src:'assets/jorge-domain-3.webp',caption:'Cielo de los mil voltios: tercera escena.'}]}
];
function openReader() {
  openDialog('Web cómic', '<h2 id="dialog-title">Lector de web cómic</h2><label class="sr-only" for="reader-story">Elige una lectura</label><select class="reader-select" id="reader-story">' + stories.map((story,i)=>`<option value="${i}">${story.name}</option>`).join('') + '</select><div id="reader-language-field"><label class="sr-only" for="reader-language">Idioma de la página</label><select class="reader-select" id="reader-language"><option value="es" lang="es">Español</option><option value="en" lang="en">English</option></select></div><figure class="reader-figure"><img class="dialog-image" id="reader-image" alt=""><figcaption id="reader-caption"></figcaption></figure><div class="reader-toolbar" id="reader-toolbar"><button type="button" id="reader-prev">Anterior</button><span class="reader-status" id="reader-status" aria-live="polite"></span><button type="button" id="reader-next">Siguiente</button></div>');
  readerState = {story:0,page:0};
  $('#reader-story').addEventListener('change', e => {readerState.story=Number(e.target.value);readerState.page=0;renderPage();});
  $('#reader-language').addEventListener('change', renderPage);
  $('#reader-prev').addEventListener('click', ()=>changePage(-1));
  $('#reader-next').addEventListener('click', ()=>changePage(1));
  renderPage();
}
function renderPage() {
  const pages = stories[readerState.story].pages;
  const page = pages[readerState.page];
  const hasEditions = Boolean(page.editions);
  const language = hasEditions ? $('#reader-language').value : 'es';
  const {src, caption: description} = hasEditions ? page.editions[language] : page;
  const image = $('#reader-image');
  const caption = $('#reader-caption');
  $('#reader-language-field').hidden = !hasEditions;
  $('#reader-toolbar').hidden = pages.length === 1;
  image.classList.toggle('reader-chapter-image', hasEditions);
  image.lang = language;
  image.alt = description;
  setImage(image, src);
  if (hasEditions) {
    image.width = 1049;
    image.height = 1500;
  }
  caption.lang = language;
  caption.textContent = description;
  $('#reader-status').textContent = `${readerState.page+1} de ${pages.length}`;
  $('#reader-prev').disabled = readerState.page === 0;
  $('#reader-next').disabled = readerState.page === pages.length-1;
}
function changePage(direction) {
  if (!readerState) return;
  const count = stories[readerState.story].pages.length;
  readerState.page=Math.max(0,Math.min(count-1,readerState.page+direction));
  renderPage();
}
$$('[data-reader]').forEach(trigger => trigger.addEventListener('click', event => {
  event.preventDefault();
  openReader();
}));
$$('[data-video]').forEach(button => button.addEventListener('click', () => {
  openDialog('Ito contra A', '<h2 id="dialog-title">Rayos contra mareas.</h2><video class="dialog-video" controls playsinline preload="none" width="960" height="540" aria-label="Ito contra A en el Santuario de la Tormenta" poster="assets/combate-jorge-alonso-poster.webp"><source src="assets/combate-jorge-alonso.mp4" type="video/mp4">Tu navegador no reproduce este video. <a href="assets/combate-jorge-alonso.mp4">Abrir el combate de Ito y A</a>.</video><p class="image-credit">Ito y A en el Santuario de la Tormenta. Técnicas, poderes, ultras y dominios en un montaje de capturas reales del juego.</p><p class="image-credit">Música: Epic Boss Battle · Juhani Junkala (SubspaceAudio) · CC0.</p>');
}));
$('[data-info="game"]').addEventListener('click', () => openDialog('El juego', '<h2 id="dialog-title">Lleva la pelea a tu terreno.</h2><p>Element Fight es un juego de lucha de plataformas 2D en desarrollo. Próximamente estará disponible para iOS y Android. Elige un personaje, entra a la arena y lucha por mantenerte sobre el escenario.</p><div class="controls-list"><div><h3>Ataca y encadena</h3><p>Combina golpes, patadas y poderes. Cada personaje tiene sus propias rutas de combate y remates.</p></div><div><h3>Muévete y regresa</h3><p>Usa el salto, el dash aéreo y el poder hacia arriba para volver al escenario. La pelea sigue también en los bordes.</p></div><div><h3>Desata tu dominio</h3><p>Conoce el dominio de tu personaje. Cada uno expresa su identidad y cambia el momento de la pelea.</p></div></div><p class="image-credit">El juego sigue en desarrollo. Aún no hay un enlace público de descarga disponible en esta web.</p>'));
const articles = {
  combos: {category:'Combate',date:'21 de octubre de 2026',title:'Más ritmo. Más posibilidades. Combos de hasta 15 impactos.',image:'assets/jorge-super.webp',paragraphs:['El plantel amplía sus rutas de combate con cadenas de hasta 15 contactos reales y remates alternativos de 6 y 10 impactos. Las rutas cortas y las habilidades propias de cada luchador siguen formando parte de la pelea.','Eco, IAN, Natoo, Núcleo y Robotr3s amplían sus cadenas con animaciones propias. Desde el cuarto impacto existe una oportunidad de ruptura defensiva, para que la presión tenga también una respuesta.','La actualización busca que cada secuencia tenga continuidad, contacto y una salida clara. El combate y su balance siguen evolucionando durante el desarrollo.'],source:'Notas del proyecto: «Plantel y combos», 21 de octubre de 2026.'},
  arenas: {category:'Escenarios',date:'16 de octubre de 2026',title:'Arenas que responden a cada impacto.',image:'assets/tides.webp',paragraphs:['Las plataformas incorporan inclinaciones que responden a lo que sucede en la arena. El dibujo del apoyo y la superficie sobre la que aterriza el personaje comparten la misma pendiente.','Una raíz gigante en el Jardín del Coloso, un engranaje en el Reloj del Vacío o una ola en el Palacio de las Mareas pueden cambiar la posición de una plataforma. Cada incidente tiene un aviso antes del impacto.','Los cinco escenarios tienen una identidad propia. En el Templo celestial, la campana provoca una onda expansiva mientras las plataformas conservan su superficie plana.'],source:'Notas del proyecto: «Escenarios con impactos e inclinación», 16 de octubre de 2026.'},
  karina: {category:'Personajes',date:'9 de octubre de 2026',title:'Kary trae el corazón del tornado.',image:'assets/karina.webp',paragraphs:['Kary llega al combate con el viento como firma. Ráfaga espiral, Paso de vendaval, Columna de tornado y Remolino del valle dan forma a sus poderes.','Su presentación incluye el súper cómic «Vendaval fatal» y el ultra interactivo «Corazón del tornado», además de defensa, esquiva, agarre y recuperación aérea.','Sus 28 animaciones y 74 dibujos únicos forman parte del material integrado en el proyecto. Puedes explorar su ilustración y las viñetas de su súper en la galería de arte.'],source:'Notas del proyecto: «Kary», 9 de octubre de 2026.'}
};
$$('[data-article]').forEach(button=>button.addEventListener('click',()=>{
  const article=articles[button.dataset.article];
  openDialog(`Noticias · ${article.category}`,`<article class="article-body"><img class="article-image" src="${article.image}" alt="${article.title}" ${imageAttrs(article.image, '(max-width: 700px) 100vw, 50vw')}><p class="article-meta">${article.date}</p><h2 id="dialog-title">${article.title}</h2>${article.paragraphs.map(p=>`<p>${p}</p>`).join('')}<p class="article-source">${article.source}</p></article>`);
}));

function openCharacterProfile(id) {
  const character = rosterCharacters.find(item => item.id === id);
  if (!character?.profile) return;
  openDialog('Plantel · Ficha del personaje', `
    <div class="character-profile">
      <div class="profile-heading">
        <img class="profile-portrait" src="${character.image}" alt="" ${imageAttrs(character.image, '96px')}>
        <div><h2 id="dialog-title">${escapeHTML(character.name)}</h2><p class="profile-subtitle">${escapeHTML(character.subtitle)}</p></div>
        <label class="profile-switch">Cambiar personaje<select id="profile-character">${rosterCharacters.map(item => `<option value="${item.id}" ${item.id === id ? 'selected' : ''}>${escapeHTML(item.name)}</option>`).join('')}</select></label>
      </div>
      <div class="profile-intro"><p>${escapeHTML(descriptions[id] || character.subtitle)}</p></div>
      <div class="profile-traits">${character.profile.abilities.map(ability => `<div><h4>${escapeHTML(ability.name)}</h4><p>${escapeHTML(ability.description)}</p></div>`).join('')}</div>
    </div>`);
  $('#profile-character').addEventListener('change', event => openCharacterProfile(event.target.value));
}
$('#open-profile').addEventListener('click', () => openCharacterProfile(selectedCharacterId));

})();
