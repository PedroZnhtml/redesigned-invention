/* ============================================================
   PORTFÓLIO — Pedro Silva Manso
   JavaScript puro: canvas de nós, scroll reveal, navbar,
   indicador de seção ativa, timeline animada e voltar ao topo.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. NAVBAR: fundo ao rolar + menu mobile
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function handleNavbarScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 30);
  }
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-open');
    navMenu.classList.toggle('is-open');
  });

  // Fecha o menu mobile ao clicar em um link
  document.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-open');
      navMenu.classList.remove('is-open');
    });
  });

  /* ----------------------------------------------------------
     2. BARRA DE PROGRESSO DE SCROLL
  ---------------------------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ----------------------------------------------------------
     3. BOTÃO VOLTAR AO TOPO
  ---------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
  }
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ----------------------------------------------------------
     4. SCROLL REVEAL (IntersectionObserver)
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  revealEls.forEach((el) => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------
     5. INDICADOR DE SEÇÃO ATIVA NA NAVBAR
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4, rootMargin: '-90px 0px -40% 0px' }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ----------------------------------------------------------
     6. CONTADORES ANIMADOS (estatísticas em "Sobre mim")
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    let current = 0;
    const duration = 1200;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, stepTime);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  /* ----------------------------------------------------------
     7. TIMELINE: linha preenche conforme o scroll
  ---------------------------------------------------------- */
  const timeline = document.querySelector('.timeline');
  const timelineFill = document.getElementById('timelineFill');

  function updateTimelineFill() {
    if (!timeline || !timelineFill) return;
    const rect = timeline.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Calcula o quanto da timeline já passou pela metade da tela
    const start = windowH * 0.85;
    const total = rect.height + windowH * 0.3;
    const progressed = start - rect.top;
    const percent = Math.min(Math.max((progressed / total) * 100, 0), 100);

    timelineFill.style.height = percent + '%';
  }
  updateTimelineFill();
  window.addEventListener('scroll', updateTimelineFill, { passive: true });
  window.addEventListener('resize', updateTimelineFill);

  /* ----------------------------------------------------------
     8. EFEITO DE BRILHO NOS CARDS DE HABILIDADES (segue o mouse)
  ---------------------------------------------------------- */
  document.querySelectorAll('.skill-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ----------------------------------------------------------
     9. CANVAS — REDE DE NÓS / CONECTORES (elemento de assinatura)
     Representa visualmente os "flows" do Power Automate / Dataverse.
  ---------------------------------------------------------- */
  const canvas = document.getElementById('nodeCanvas');

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('home');
    let width, height, nodes;
    const NODE_COUNT_BASE = 70; // densidade por área de referência

    function resizeCanvas() {
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
      const area = width * height;
      const count = Math.min(90, Math.max(35, Math.floor(area / 22000)));
      nodes = Array.from({ length: count }, () => createNode());
    }

    function createNode() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 1,
      };
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // Atualiza posições
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // Desenha conexões entre nós próximos
      const maxDist = Math.min(150, width / 6);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.4;
            ctx.strokeStyle = `rgba(0, 120, 212, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Desenha os nós
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 190, 255, 0.85)';
        ctx.fill();
      });

      requestAnimationFrame(step);
    }

    resizeCanvas();
    requestAnimationFrame(step);

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 200);
    });
  }

  /* ----------------------------------------------------------
     10. ANO DO RODAPÉ (mantém sempre atualizado)
  ---------------------------------------------------------- */
  const footerYear = document.querySelector('.footer__inner p');
  // Mantido estático conforme solicitado (© 2026), mas pronto para
  // ser dinamizado caso deseje: new Date().getFullYear()




  /* ----------------------------------------------------------
     12. GERADOR DE CURRÍCULO OTINIZADO PARA ATS
  ---------------------------------------------------------- */
  const downloadATSBtn = document.getElementById('downloadATSResume');
  
  if (downloadATSBtn) {
    downloadATSBtn.addEventListener('click', () => {
      // Cria elemento temporário para o conteúdo do currículo
      const element = document.createElement('div');
      element.style.position = 'fixed';
      element.style.left = '0';
      element.style.top = '0';
      element.style.width = '794px'; // Largura de página A4 a 96 DPI
      element.style.zIndex = '-9999';
      element.style.opacity = '0.001';
      element.style.pointerEvents = 'none';
      
      element.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap');
          .cv-body {
            font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
            color: #1e293b;
            padding: 30px 40px;
            background: #ffffff;
            box-sizing: border-box;
          }
          .cv-header {
            border-bottom: 2px solid #0078D4;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .cv-name {
            font-size: 24pt;
            font-weight: 700;
            color: #0078D4;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: -0.5px;
          }
          .cv-role {
            font-size: 13pt;
            font-weight: 600;
            color: #334155;
            margin: 4px 0 10px 0;
          }
          .cv-contact {
            font-size: 9.5pt;
            color: #64748b;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          .cv-section {
            margin-bottom: 16px;
          }
          .cv-section-title {
            font-size: 11pt;
            font-weight: 700;
            color: #0078D4;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cv-text {
            margin: 0;
            text-align: justify;
            color: #334155;
            font-size: 9.5pt;
          }
          .cv-list {
            margin: 0;
            padding-left: 20px;
            color: #334155;
            font-size: 9.5pt;
          }
          .cv-list li {
            margin-bottom: 4px;
          }
          .cv-project-header {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            color: #334155;
            margin-bottom: 4px;
            font-size: 9.5pt;
          }
          .cv-highlight-title {
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 2px;
            font-size: 9.5pt;
          }
          .cv-highlight-tech {
            font-size: 8.5pt;
            font-family: 'JetBrains Mono', monospace;
            color: #0078D4;
            margin-bottom: 4px;
          }
          .cv-highlight-desc {
            margin: 0;
            padding-left: 12px;
            color: #334155;
            font-size: 9.5pt;
          }
        </style>
        
        <div class="cv-body">
          <!-- CABEÇALHO -->
          <div class="cv-header">
            <h1 class="cv-name">Pedro Silva Manso</h1>
            <div class="cv-role">Desenvolvedor Power Apps & Power Platform</div>
            <div class="cv-contact">
              <span><strong>Localização:</strong> Brasília, DF</span>
              <span>|</span>
              <span><strong>Contato:</strong> (61) 99634-2098</span>
              <span>|</span>
              <span><strong>Email:</strong> mansopedro94@gmail.com</span>
              <span>|</span>
              <span><strong>LinkedIn:</strong> linkedin.com/in/pedro-e-silva-manso-659a76249/</span>
            </div>
          </div>

          <!-- RESUMO PROFISSIONAL -->
          <div class="cv-section">
            <h2 class="cv-section-title">Resumo Profissional</h2>
            <p class="cv-text">
              Desenvolvedor Power Apps e Power Platform, com foco em transformar processos manuais e repetitivos em soluções digitais simples e eficientes. Atualmente cursando Análise e Desenvolvimento de Sistemas. Curioso, dedicado e autodidata, já construiu aplicações Canvas integradas ao SharePoint e automações com Power Automate, utilizadas na prática por equipes reais.
            </p>
          </div>

          <!-- HABILIDADES TÉCNICAS -->
          <div class="cv-section">
            <h2 class="cv-section-title">Habilidades Técnicas</h2>
            <ul class="cv-list">
              <li><strong>Power Platform:</strong> Power Apps (Canvas e Model-driven), Power Automate (fluxos de automação e aprovações), Power BI (dashboards e relatórios analíticos), Dataverse (modelagem de dados segura).</li>
              <li><strong>Ecossistema Microsoft:</strong> SharePoint Online (listas, portais, bibliotecas de documentos), Teams, Outlook, Microsoft 365.</li>
              <li><strong>Desenvolvimento & Banco de Dados:</strong> JavaScript, HTML5, CSS3, SQL Server, versionamento Git.</li>
            </ul>
          </div>

          <!-- PROJETOS PRÁTICOS -->
          <div class="cv-section">
            <h2 class="cv-section-title">Projetos Práticos</h2>
            <div>
              <div class="cv-project-header">
                <span style="color: #0f172a;">Desenvolvedor Power Platform (Projetos Dirigidos)</span>
                <span style="font-weight: 500; color: #64748b;">2025 – Atual</span>
              </div>
              <ul class="cv-list">
                <li>Desenvolvimento de aplicações Power Apps Canvas 100% responsivas, integradas a listas do SharePoint, substituindo processos manuais por fluxos digitais estruturados.</li>
                <li>Modelagem de dados em SharePoint Lists para controle de solicitações, aprovações e histórico de status.</li>
                <li>Automatização de fluxos de aprovação com Power Automate, incluindo notificações automáticas via Microsoft Teams.</li>
                <li>Construção de telas de gestão com filtros dinâmicos (data, usuário, status) para tomada de decisão rápida por parte do gestor.</li>
              </ul>
            </div>
          </div>

          <!-- PROJETOS EM DESTAQUE -->
          <div class="cv-section">
            <h2 class="cv-section-title">Projetos em Destaque</h2>
            
            <!-- Projeto 1 -->
            <div style="margin-bottom: 12px;">
              <div class="cv-highlight-title">1. Sistema de Solicitação de Banco de Horas</div>
              <div class="cv-highlight-tech">Power Apps Canvas · Power Automate · SharePoint</div>
              <p class="cv-highlight-desc">Substituiu o controle manual em planilha Excel por um app com fluxo completo de solicitação, aprovação e notificações automáticas no Microsoft Teams.</p>
            </div>

            <!-- Projeto 2 -->
            <div>
              <div class="cv-highlight-title">2. Banco de Horas — Controle de Saldo</div>
              <div class="cv-highlight-tech">Power Apps Canvas · SharePoint</div>
              <p class="cv-highlight-desc">Primeiro projeto desenvolvido: controle de saldo de horas positivas e negativas, com histórico por motivo e status visual de aprovação.</p>
            </div>
          </div>

          <!-- FORMAÇÃO -->
          <div class="cv-section" style="margin-bottom: 0;">
            <h2 class="cv-section-title">Formação</h2>
            <ul class="cv-list">
              <li><strong>Análise e Desenvolvimento de Sistemas</strong> — Gran Faculdade (em andamento)</li>
              <li><strong>Formação complementar em Power Platform:</strong> estudos autodidatas via Microsoft Learn e cursos gratuitos.</li>
            </ul>
          </div>
        </div>
      `;
      
      document.body.appendChild(element);

      // Configurações do html2pdf
      const opt = {
        margin:       10,
        filename:     'Pedro_Silva_Manso_CV.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2.5, useCORS: true, letterRendering: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Gerar e baixar o PDF, depois remover o elemento temporário
      html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(element);
      }).catch(err => {
        console.error('Erro ao gerar o PDF:', err);
        document.body.removeChild(element);
      });
    });
  }
  /* ----------------------------------------------------------
     13. CASE STUDY MODAL (BANCO DE HORAS)
  ---------------------------------------------------------- */
  const caseStudyBtn = document.getElementById('openCaseStudyBtn');
  const caseStudyModal = document.getElementById('caseStudyModal');
  const caseStudyClose = document.getElementById('caseStudyClose');
  const caseStudyOverlay = document.getElementById('caseStudyOverlay');

  const csMainImg = document.getElementById('csMainImg');
  const csCaption = document.getElementById('csCaption');
  const csThumbs = caseStudyModal ? caseStudyModal.querySelectorAll('.cs-thumb') : [];
  const csPrev = document.getElementById('csPrev');
  const csNext = document.getElementById('csNext');

  let csCurrentIndex = 0;
  const csImagesData = Array.from(csThumbs).map(thumb => ({
    src: thumb.querySelector('img').getAttribute('src'),
    caption: thumb.getAttribute('data-caption')
  }));

  function updateCaseStudySlide(index) {
    if (index < 0) index = csImagesData.length - 1;
    if (index >= csImagesData.length) index = 0;
    csCurrentIndex = index;

    csMainImg.style.opacity = 0;
    
    setTimeout(() => {
      csMainImg.src = csImagesData[csCurrentIndex].src;
      csCaption.textContent = csImagesData[csCurrentIndex].caption;
      
      csThumbs.forEach(t => t.classList.remove('active'));
      csThumbs[csCurrentIndex].classList.add('active');
      
      csThumbs[csCurrentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      
      csMainImg.style.opacity = 1;
    }, 150);
  }

  function openCaseStudy() {
    if (!caseStudyModal) return;
    caseStudyModal.classList.add('is-open');
    caseStudyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateCaseStudySlide(0);
    caseStudyModal.focus();
  }

  function closeCaseStudy() {
    if (!caseStudyModal) return;
    caseStudyModal.classList.remove('is-open');
    caseStudyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (caseStudyBtn) caseStudyBtn.focus();
  }

  if (caseStudyBtn && caseStudyModal) {
    caseStudyBtn.addEventListener('click', openCaseStudy);
    caseStudyClose.addEventListener('click', closeCaseStudy);
    caseStudyOverlay.addEventListener('click', closeCaseStudy);

    csPrev.addEventListener('click', () => updateCaseStudySlide(csCurrentIndex - 1));
    csNext.addEventListener('click', () => updateCaseStudySlide(csCurrentIndex + 1));

    csThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        updateCaseStudySlide(parseInt(thumb.getAttribute('data-index'), 10));
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!caseStudyModal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeCaseStudy();
      if (e.key === 'ArrowLeft') updateCaseStudySlide(csCurrentIndex - 1);
      if (e.key === 'ArrowRight') updateCaseStudySlide(csCurrentIndex + 1);
    });
  }

  /* ----------------------------------------------------------
     14. CASE STUDY MODAL 2 (BANCO DE HORAS — CONTROLE DE SALDO)
  ---------------------------------------------------------- */
  const caseStudyBtn2 = document.getElementById('openCaseStudyBtn2');
  const caseStudyModal2 = document.getElementById('caseStudyModal2');
  const caseStudyClose2 = document.getElementById('caseStudyClose2');
  const caseStudyOverlay2 = document.getElementById('caseStudyOverlay2');

  const csMainImg2 = document.getElementById('csMainImg2');
  const csCaption2 = document.getElementById('csCaption2');
  const csThumbs2 = caseStudyModal2 ? caseStudyModal2.querySelectorAll('.cs-thumb') : [];
  const csPrev2 = document.getElementById('csPrev2');
  const csNext2 = document.getElementById('csNext2');

  let csCurrentIndex2 = 0;
  let csImagesData2 = [];
  if (csThumbs2.length > 0) {
    csImagesData2 = Array.from(csThumbs2).map(thumb => ({
      src: thumb.querySelector('img').getAttribute('src'),
      caption: thumb.getAttribute('data-caption')
    }));
  }

  function updateCaseStudySlide2(index) {
    if (csImagesData2.length === 0) return;
    if (index < 0) index = csImagesData2.length - 1;
    if (index >= csImagesData2.length) index = 0;
    csCurrentIndex2 = index;

    csMainImg2.style.opacity = 0;
    
    setTimeout(() => {
      csMainImg2.src = csImagesData2[csCurrentIndex2].src;
      csCaption2.textContent = csImagesData2[csCurrentIndex2].caption;
      
      csThumbs2.forEach(t => t.classList.remove('active'));
      csThumbs2[csCurrentIndex2].classList.add('active');
      
      csThumbs2[csCurrentIndex2].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      
      csMainImg2.style.opacity = 1;
    }, 150);
  }

  function openCaseStudy2() {
    if (!caseStudyModal2) return;
    caseStudyModal2.classList.add('is-open');
    caseStudyModal2.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateCaseStudySlide2(0);
    caseStudyModal2.focus();
  }

  function closeCaseStudy2() {
    if (!caseStudyModal2) return;
    caseStudyModal2.classList.remove('is-open');
    caseStudyModal2.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (caseStudyBtn2) caseStudyBtn2.focus();
  }

  if (caseStudyBtn2 && caseStudyModal2) {
    caseStudyBtn2.addEventListener('click', openCaseStudy2);
    caseStudyClose2.addEventListener('click', closeCaseStudy2);
    caseStudyOverlay2.addEventListener('click', closeCaseStudy2);

    csPrev2.addEventListener('click', () => updateCaseStudySlide2(csCurrentIndex2 - 1));
    csNext2.addEventListener('click', () => updateCaseStudySlide2(csCurrentIndex2 + 1));

    csThumbs2.forEach(thumb => {
      thumb.addEventListener('click', () => {
        updateCaseStudySlide2(parseInt(thumb.getAttribute('data-index'), 10));
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!caseStudyModal2.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeCaseStudy2();
      if (e.key === 'ArrowLeft') updateCaseStudySlide2(csCurrentIndex2 - 1);
      if (e.key === 'ArrowRight') updateCaseStudySlide2(csCurrentIndex2 + 1);
    });
  }

});
