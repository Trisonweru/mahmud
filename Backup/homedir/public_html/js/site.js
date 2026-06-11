// Shared header / footer / disclaimer + helpers
(function(){
  const NAV = [
    {href:'index.html',label:'Home'},
    {href:'about.html',label:'About'},
    {href:'index.html',label:'Apply'},
    {href:'status.html',label:'Status'},
    {href:'documents.html',label:'Documents'},
    {href:'faqs.html',label:'FAQs'},
  ];

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // Lucide icons (lightweight inline SVG resolver)
  const ICONS = {
    globe2:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    menu:'<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
    x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    arrow:'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    arrowLeft:'<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    check:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    headphones:'<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3z"/><path d="M3 19a2 2 0 0 0 2 2h1v-7H3z"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    map:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    plane:'<path d="M17.8 19.2 16 11l3.5-3.5a2.121 2.121 0 0 0-3-3L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    badge:'<path d="m9 12 2 2 4-4"/><path d="M12 3a8 8 0 0 0 8 8 8 8 0 0 0-8 8 8 8 0 0 0-8-8 8 8 0 0 0 8-8z"/>',
    sparkles:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
    pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    cloud:'<path d="M16 16.5a4.5 4.5 0 1 0-9 0"/><path d="M12 12v9"/><polyline points="8 17 12 13 16 17"/>',
    fileCheck:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>',
    search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    cc:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    award:'<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  };
  function svg(name, cls){
    const body = ICONS[name] || '';
    cls = cls || 'svg-icon';
    return '<svg class="'+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
  }
  window.icon = svg;

  // disclaimer + header
  const headerHTML = `
    <div class="disclaimer">
      <span class="em">Disclaimer / Ogeysiis:</span>
      Not affiliated with the Government of Somalia.
      Official site: <a href="https://etas.gov.so" target="_blank" rel="noreferrer">etas.gov.so</a>
    </div>
    <header class="site-header">
      <div class="container inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">${svg('globe2','svg-icon text-accent')}</span>
          <span>
            <div class="brand-name">Somalia eVisa</div>
            <div class="brand-sub">Application Service</div>
          </span>
        </a>
        <nav class="nav" id="navDesktop">
          ${NAV.map(n=>`<a href="${n.href}" class="${here===n.href?'active':''}">${n.label}</a>`).join('')}
        </nav>
        <a href="index.html" class="btn btn-navy nav-cta">Apply Now</a>
        <button class="menu-btn" id="menuBtn" aria-label="Toggle menu">${svg('menu','svg-icon lg')}</button>
      </div>
      <div class="mobile-nav" id="mobileNav">
        <div class="container">
          ${NAV.map(n=>`<a href="${n.href}" class="${here===n.href?'active':''}">${n.label}</a>`).join('')}
          <a href="index.html" class="btn btn-navy" style="margin-top:.5rem;justify-content:center">Apply Now</a>
        </div>
      </div>
    </header>`;

  const footerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="grid-cols">
          <div style="grid-column:span 2;max-width:24rem">
            <div class="brand">
              <span class="brand-mark" style="border:1px solid hsl(var(--accent)/.3);background:transparent">${svg('globe2','svg-icon text-accent')}</span>
              <span><div class="brand-name" style="color:hsl(var(--primary-foreground))">Somalia eVisa</div><div class="brand-sub" style="color:hsl(var(--primary-foreground)/.6)">Application Service</div></span>
            </div>
            <p style="margin-top:1.5rem;font-size:.875rem;line-height:1.625;color:hsl(var(--primary-foreground)/.7)">An independent service helping travellers — and especially the Somali diaspora — prepare and submit Somalia eVisa applications with clarity and care.</p>
            <div style="margin-top:1.5rem;display:flex;align-items:center;gap:.5rem;font-size:.75rem;color:hsl(var(--primary-foreground)/.6)">${svg('shield','svg-icon text-accent')} Not affiliated with the Government of Somalia</div>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><a href="index.html">Apply for eVisa</a></li>
              <li><a href="status.html">Application Status</a></li>
              <li><a href="documents.html">Required Documents</a></li>
              <li><a href="faqs.html">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>${svg('mail','svg-icon text-accent')} support@evisasomali.com</li>
              <li>${svg('map','svg-icon text-accent')} <span>Yare Tower, 3rd Floor<br>First Avenue<br>Nairobi, Kenya</span></li>
            </ul>
            <p style="margin-top:1.5rem;font-size:.75rem;color:hsl(var(--primary-foreground)/.5)">Official portal: <a href="https://etas.gov.so" target="_blank" rel="noreferrer" class="underline" style="color:hsl(var(--accent))">etas.gov.so</a></p>
          </div>
          <div>
            <h4>Customer Support</h4>
            <div style="display:flex;gap:.5rem;align-items:flex-start;font-size:.875rem;color:hsl(var(--primary-foreground)/.8)">
              ${svg('headphones','svg-icon text-accent')}
              <p style="line-height:1.625">We are committed to excellent customer service. All support requests and inquiries will be attended to within 2 working days.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bar">
        <div class="container inner">
          <div>© ${new Date().getFullYear()} Somalia eVisa. All rights reserved.</div>
          <div class="links">
            <a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="refund.html">Refund</a>
          </div>
        </div>
      </div>
    </footer>`;

  document.addEventListener('DOMContentLoaded', function(){
    const headerSlot = document.getElementById('siteHeader');
    const footerSlot = document.getElementById('siteFooter');
    if(headerSlot) headerSlot.innerHTML = headerHTML;
    if(footerSlot) footerSlot.innerHTML = footerHTML;

    const menuBtn = document.getElementById('menuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if(menuBtn && mobileNav){
      menuBtn.addEventListener('click', function(){
        mobileNav.classList.toggle('open');
        menuBtn.innerHTML = mobileNav.classList.contains('open') ? svg('x','svg-icon lg') : svg('menu','svg-icon lg');
      });
    }

    // hydrate any data-icon placeholders after DOM ready
    document.querySelectorAll('[data-icon]').forEach(el=>{
      const cls = el.getAttribute('data-icon-class') || 'svg-icon';
      el.innerHTML = svg(el.getAttribute('data-icon'), cls);
    });
  });

  // toast helper
  let toastTimer;
  window.toast = function(msg, type){
    let t = document.getElementById('toast');
    if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'toast show ' + (type||'success');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ t.className = 'toast'; }, 3500);
  };

  // tiny query param helper
  window.qp = function(k){ return new URLSearchParams(location.search).get(k); };
})();
