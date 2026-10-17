(() => {
  'use strict';
  const c = window.SALON, $ = id => document.getElementById(id);
  const escape = v => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let selectedService = c.services[0].id;
  let previousFocus = null;

  document.querySelectorAll('.wordmark').forEach(mark => {mark.innerHTML=`${escape(c.shortName)}<span>SALON & SPA</span>`;mark.setAttribute('aria-label',c.name+' home');});
  document.querySelector('.about-signature').innerHTML=`${escape(c.shortName)}<span>SALON & SPA</span>`;
  document.querySelector('.hero-bottom>a').innerHTML=`${escape(c.address)} <span aria-hidden="true">↗</span>`;
  document.querySelector('.about-copy>p:not(.eyebrow)').textContent=`Find ${c.name} at ${c.address}, ${c.cityLine}.`;
  document.querySelector('.footer-bottom>span').textContent=`Independent design concept for ${c.name}`;
  document.title=c.name+' · Website Concept';

  $('hero-title').innerHTML = `${escape(c.hero.lineOne)}<br><em>${escape(c.hero.lineTwo)}</em>`;
  $('hero-intro').textContent = c.hero.intro;
  $('hero-locality').textContent = c.locality.toUpperCase();
  $('hero-image').src = c.hero.image; $('hero-image').alt = c.hero.alt;
  $('interior-image').src = c.interior.image; $('interior-image').alt = c.interior.alt;
  $('address').innerHTML = `${escape(c.address)}<br>${escape(c.cityLine)}`;
  $('map-link').href = c.map;
  $('phone-link').href = `tel:${c.phoneHref}`; $('phone-link').textContent = c.phone;
  $('instagram-link').href = c.instagram; $('facebook-link').href = c.facebook; $('about-social').href = c.instagram;
  $('concept-description').textContent = c.demo.detail;
  for (const [name,key] of [['background','--paper'],['text','--ink'],['accent','--accent']]) {
    if (/^#[0-9a-f]{6}$/i.test(c.colors[name])) document.documentElement.style.setProperty(key,c.colors[name]);
  }

  const dialogIDs = ['booking-dialog','concept-dialog','image-dialog'];
  function openDialog(id) {
    previousFocus = document.activeElement;
    $(id).showModal();
  }
  function closeDialog(dialog) {dialog.close();}
  dialogIDs.forEach(id => {
    const dialog = $(id);
    dialog.addEventListener('close', () => {
      if (id === 'booking-dialog') $('booking-form').reset();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({preventScroll:true});
    });
    dialog.addEventListener('click',event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
    });
  });
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  document.querySelectorAll('[data-open="concept"]').forEach(button => button.addEventListener('click',() => openDialog('concept-dialog')));

  function renderService(id, focusTab = false) {
    selectedService = id;
    const service = c.services.find(s => s.id === id);
    $('service-tabs').innerHTML = c.services.map(s => `<button type="button" role="tab" id="tab-${escape(s.id)}" aria-controls="service-panel" aria-selected="${s.id === id}" tabindex="${s.id === id ? '0' : '-1'}" data-service="${escape(s.id)}">${escape(s.label)}</button>`).join('');
    $('service-panel').setAttribute('aria-labelledby',`tab-${id}`);
    $('service-panel').innerHTML = `<h3>${escape(service.title)}</h3><p>${escape(service.description)}</p><div class="service-rows">${service.items.map((name,i) => `<div class="service-row"><span class="service-number">0${i+1}</span><span class="service-name">${escape(name)}</span><button type="button" data-enquire="${escape(name)}" aria-label="Preview enquiry for ${escape(name)}">Enquire ↗</button></div>`).join('')}</div>`;
    $('service-image').src = service.image; $('service-image').alt = service.alt;
    if (focusTab) $('tab-'+id).focus({preventScroll:true});
  }
  $('service-tabs').addEventListener('click',event => {const b=event.target.closest('[data-service]');if(b)renderService(b.dataset.service,true);});
  $('service-tabs').addEventListener('keydown',event => {
    const keys=['ArrowRight','ArrowLeft','Home','End']; if(!keys.includes(event.key))return;
    event.preventDefault(); const i=c.services.findIndex(s=>s.id===selectedService);
    const next=event.key==='Home'?0:event.key==='End'?c.services.length-1:(i+(event.key==='ArrowRight'?1:-1)+c.services.length)%c.services.length;
    renderService(c.services[next].id,true);
  });
  renderService(selectedService);

  const bookingItems = c.services.flatMap(s => s.items);
  $('booking-service').innerHTML = '<option value="">Select a service</option>' + bookingItems.map(name=>`<option value="${escape(name)}">${escape(name)}</option>`).join('');
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  $('booking-date').min = localDate;
  function openBooking(serviceName = '') {
    $('booking-entry').hidden=false; $('booking-result').hidden=true; $('booking-form').reset(); $('booking-service').value=serviceName;
    openDialog('booking-dialog');
  }
  document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>openBooking()));
  $('service-panel').addEventListener('click',event=>{const b=event.target.closest('[data-enquire]');if(b)openBooking(b.dataset.enquire);});
  $('booking-form').addEventListener('submit',event=>{
    event.preventDefault();
    if(!$('booking-form').reportValidity())return;
    const date = new Date($('booking-date').value+'T12:00:00');
    const entries = [['Service',$('booking-service').value],['Preferred date',date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})],['Time preference',$('booking-time').value]];
    $('booking-summary').innerHTML=entries.map(([label,value])=>`<dt>${escape(label)}</dt><dd>${escape(value)}</dd>`).join('');
    $('booking-entry').hidden=true; $('booking-result').hidden=false; $('booking-dialog').scrollTop=0; $('booking-again').focus();
    $('booking-name').value='';
  });
  $('booking-again').addEventListener('click',()=>{$('booking-result').hidden=true;$('booking-entry').hidden=false;$('booking-form').reset();$('booking-service').focus();});

  function renderGallery(filter = 'all') {
    $('gallery').innerHTML=c.gallery.filter(image=>filter==='all'||image.category===filter).map(image=>`<article class="gallery-card"><button type="button" data-image="${escape(image.id)}" aria-label="Enlarge ${escape(image.title)}"><span class="gallery-picture"><img src="${escape(image.image)}" alt="${escape(image.alt)}" loading="lazy" width="900" height="1200"><span class="expand" aria-hidden="true">↗</span></span><p class="gallery-tag">${escape(image.tag)}</p><h3>${escape(image.title)}</h3></button></article>`).join('');
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  }
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>renderGallery(b.dataset.filter)));
  $('gallery').addEventListener('click',event=>{
    const b=event.target.closest('[data-image]');if(!b)return;const image=c.gallery.find(i=>i.id===b.dataset.image);
    $('lightbox-image').src=image.image;$('lightbox-image').alt=image.alt;$('lightbox-title').textContent=image.title;openDialog('image-dialog');
  });
  renderGallery();

  const menuButton = document.querySelector('.menu-button'), nav = $('navigation');
  function closeMenu(){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');}
  menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menuButton.focus();}});
})();
