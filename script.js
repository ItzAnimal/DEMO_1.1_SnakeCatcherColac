// script.js — site interactions + Discord widget + Victorian Snakes (tabs/list/detail)

const HOTLINE = "0498063229";

// Cache common nodes
const links = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.service-section');
const logoArea = document.getElementById('logoArea');
const servicesToggle = document.getElementById('servicesToggle');
const vicToggle = document.getElementById('vicToggle');

// Small popup
function showPopup(message){
  const popup = document.createElement('div');
  popup.className = 'copy-popup';
  popup.textContent = message;
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('visible'));
  setTimeout(() => {
    popup.classList.remove('visible');
    setTimeout(() => popup.remove(), 300);
  }, 1500);
}

// Open one section + active states
function openSection(id){
  try { if (id !== 'victorian-snakes') { const d = document.getElementById('spDetail'); if (d) d.hidden = true; } } catch(_) {}
  links.forEach(a => a.classList.toggle('active', a.dataset.target === id));
  if (vicToggle){ vicToggle.classList.toggle('active', id === 'victorian-snakes'); }

  sections.forEach(sec => {
    const isTarget = sec.id === id;
    const wasActive = sec.classList.contains('active');
    sec.classList.toggle('active', isTarget);
    if (isTarget && !wasActive){
      sec.classList.add('just-opened');
      setTimeout(() => sec.classList.remove('just-opened'), 800);
      const rect = sec.getBoundingClientRect();
      if (rect.bottom > window.innerHeight || rect.top < 0){
        sec.scrollIntoView({behavior:'smooth', block:'nearest'});
      }
    }
  });
}

// Nav links -> open their section
links.forEach(link => {
  link.addEventListener('click', e => { e.preventDefault(); openSection(link.dataset.target); });
});

// Logo expand / copy hotline (desktop)
function toggleLogoArea(){
  const isOpen = logoArea.classList.toggle('open');
  logoArea.setAttribute('aria-expanded', String(isOpen));
  if (!/Mobi|Android/i.test(navigator.userAgent)){
    navigator.clipboard.writeText(HOTLINE).then(()=> showPopup('Number copied!')).catch(()=>{});
  }
}
if (logoArea){
  logoArea.addEventListener('click', toggleLogoArea);
  logoArea.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleLogoArea(); }
  });
}

// Services title -> toggle all (except Victorian Snakes)
if (servicesToggle){
  const mains = Array.from(sections).filter(s => s.id !== 'victorian-snakes');
  function toggleAll(){
    const allOpen = mains.every(s => s.classList.contains('active'));
    mains.forEach(sec => {
      const shouldOpen = !allOpen;
      const wasActive = sec.classList.contains('active');
      sec.classList.toggle('active', shouldOpen);
      if (shouldOpen && !wasActive){
        sec.classList.add('just-opened');
        setTimeout(() => sec.classList.remove('just-opened'), 800);
      }
    });
  }
  servicesToggle.addEventListener('click', toggleAll);
  servicesToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleAll(); }
  });
}

// Left-side button -> open Victorian Snakes
if (vicToggle){
  const openVs = () => { openSection('victorian-snakes'); try { setCategory('venomous'); } catch(_) {} };
  vicToggle.addEventListener('click', openVs);
  vicToggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openVs(); try { setCategory('venomous'); } catch(_) {} } });
}

// Close buttons inside each section
Array.from(document.querySelectorAll('.close-btn')).forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.service-section')?.classList.remove('active','just-opened'));
});

// Copy hotline when clicking the visible number (desktop only)
Array.from(document.querySelectorAll('[data-copy]')).forEach(link => {
  link.addEventListener('click', e => {
    if (/Mobi|Android/i.test(navigator.userAgent)) return; // allow tel: on mobile
    e.preventDefault();
    const num = link.getAttribute('data-copy') || HOTLINE;
    navigator.clipboard.writeText(num).then(() => showPopup('Number copied!'));
  });
});

/* ===== Discord corner widget (RIGHT SIDE) ===== */
const discordFab = document.getElementById('discordFab');
const discordPanel = document.getElementById('discordPanel');

function toggleDiscordPanel(force){
  if (!discordFab || !discordPanel) return;
  const willOpen = typeof force === 'boolean' ? force : !discordPanel.classList.contains('open');
  discordPanel.classList.toggle('open', willOpen);
  discordFab.classList.toggle('active', willOpen);
  discordFab.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) discordPanel.focus();
}

if (discordFab && discordPanel){
  discordFab.addEventListener('click', () => toggleDiscordPanel());
  discordFab.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleDiscordPanel(); }
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!discordPanel.classList.contains('open')) return;
    const t = e.target;
    if (!discordPanel.contains(t) && !discordFab.contains(t)) toggleDiscordPanel(false);
  });

  // Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && discordPanel.classList.contains('open')) toggleDiscordPanel(false);
  });
}

/* ===== Victorian Snakes: categories + details ===== */
(function(){
  const sectionVS = document.getElementById('victorian-snakes');
const list = document.getElementById('vsList');
  const detail = document.getElementById('spDetail');
  const tabs = Array.from(document.querySelectorAll('.vs-tab'));
  const items = list ? Array.from(list.querySelectorAll('.sp-item')) : [];

  if (!list || !detail || !tabs.length) return;

  // Species data (includes two pythons specific to Victoria)
  const DATA = {
    'eastern-brown': {
      title: 'Eastern Brown Snake',
      latin: 'Pseudonaja textilis',
      chips: ['Medically significant:danger'],
      desc: 'Highly variable brown/tan; fast and alert. Often in open farmland and town edges.',
      bullets: [
        'Activity: Warm months; daylight.',
        'Habitats: Farmland, grassland, peri-urban.',
        'Advice: Stand still, give space—do not attempt to move it.'
      ]
    },
    'tiger': {
      title: 'Tiger Snake',
      latin: 'Notechis scutatus',
      chips: ['Medically significant:danger'],
      desc: 'Often banded yellow/olive and black (can be plain). Common near water.',
      bullets: [
        'Activity: Warm months; can bask on cooler days.',
        'Habitats: Wetlands, dams, creeks, coastal.',
        'Advice: Back away slowly; do not corner.'
      ]
    },
    'red-bellied': {
      title: 'Red-bellied Black Snake',
      latin: 'Pseudechis porphyriacus',
      chips: ['Medically significant:danger'],
      desc: 'Glossy black upper with red/pink flanks and belly. Often near water and forest fringes.',
      bullets: [
        'Activity: Daytime in warm seasons.',
        'Habitats: Waterways, forests, suburban edges.',
        'Advice: Usually shy—will retreat if given space.'
      ]
    },
    'copperhead': {
      title: 'Lowland Copperhead',
      latin: 'Austrelaps superbus',
      chips: ['Medically significant:danger'],
      desc: 'Brown/grey with coppery tinge around head/neck. Cooler-climate specialist; often near water.',
      bullets: [
        'Activity: Spring–autumn; active on cooler days.',
        'Habitats: Damp heath, creeks, coastal.',
        'Advice: Calm if left alone—call for relocation if in/around buildings.'
      ]
    },
    // Pythons (Victoria)
    'diamond-python': {
      title: 'Diamond Python',
      latin: 'Morelia spilota spilota',
      chips: ['Python (non-venomous):caution'],
      desc: 'A Carpet Python subspecies with pale diamond patterns. Occurs in far eastern Victoria.',
      bullets: [
        'Activity: Mostly nocturnal; also basks during the day.',
        'Habitats: Forests, woodlands, rocky areas, sheds/roofs.',
        'Advice: Non-venomous but strong—do not attempt to move.'
      ]
    },
    'murray-darling': {
      title: 'Murray Darling Python',
      latin: 'Morelia spilota metcalfei',
      chips: ['Python (non-venomous):caution'],
      desc: 'Large python from the Murray–Darling basin, including north-western Victoria.',
      bullets: [
        'Activity: Warm months; often crepuscular/nocturnal.',
        'Habitats: River red gum forests, rocky gorges, farmland outbuildings.',
        'Advice: Harmless constrictor; call for safe relocation if in buildings.'
      ]
    }
  };

  function showDetail(id){
    const d = DATA[id];
    if (!d) return;

    items.forEach(b => b.classList.toggle('active', b.dataset.id === id));

    detail.querySelector('.spd-title').textContent = d.title;
    detail.querySelector('.spd-latin').innerHTML = `<em>${d.latin}</em>`;
    detail.querySelector('.spd-desc').textContent = d.desc;

    const chipsWrap = detail.querySelector('.spd-chips');
    chipsWrap.innerHTML = '';
    d.chips.forEach(c => {
      const [label, kind] = c.split(':');
      const span = document.createElement('span');
      span.className = `spd-chip ${kind||''}`;
      span.textContent = label;
      chipsWrap.appendChild(span);
    });

    const ul = detail.querySelector('.spd-bullets');
    ul.innerHTML = '';
    d.bullets.forEach(t => {
      const li = document.createElement('li'); li.textContent = t; ul.appendChild(li);
    });

    detail.hidden = false;
    const rect = detail.getBoundingClientRect();
    if (rect.bottom > window.innerHeight){
      detail.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
  }

  function setCategory(cat){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.cat === cat)));
    items.forEach(btn => {
      const match = btn.dataset.cat === cat;
      btn.hidden = !match;
      if (!match) btn.classList.remove('active');
    });
    detail.hidden = true;
  }

  items.forEach(btn => btn.addEventListener('click', () => {
  if (!sectionVS || !sectionVS.classList.contains('active')) return;
  showDetail(btn.dataset.id);
}));
  tabs.forEach(tab => tab.addEventListener('click', () => {
    if (!sectionVS || !sectionVS.classList.contains('active')) return;
    setCategory(tab.dataset.cat);
  }));

  // Default: Venomous
  setCategory('venomous');
})();
