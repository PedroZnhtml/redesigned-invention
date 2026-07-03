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
      // Cria um iframe oculto temporário para impressão
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow.document;
      
      const resumeHTML = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Curriculo - Pedro Silva Manso</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Arial:wght@400;700&display=swap');
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #333333;
              line-height: 1.5;
              margin: 40px;
              font-size: 11pt;
            }
            .header {
              border-bottom: 2px solid #0078D4;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .name {
              font-size: 24pt;
              font-weight: bold;
              color: #0078D4;
              margin: 0;
            }
            .role {
              font-size: 14pt;
              color: #555555;
              margin: 5px 0 10px 0;
              font-weight: bold;
            }
            .contact-info {
              font-size: 10pt;
              color: #666666;
            }
            .section {
              margin-bottom: 22px;
            }
            .section-title {
              font-size: 12pt;
              font-weight: bold;
              color: #0078D4;
              border-bottom: 1px solid #dddddd;
              padding-bottom: 3px;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .summary {
              text-align: justify;
            }
            .skills-list {
              margin: 5px 0;
              padding-left: 20px;
            }
            .skills-list li {
              margin-bottom: 4px;
            }
            .job {
              margin-bottom: 15px;
            }
            .job-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              color: #333333;
            }
            .job-title {
              color: #444444;
            }
            .job-date {
              color: #777777;
              font-weight: normal;
            }
            .job-bullets {
              margin: 5px 0;
              padding-left: 20px;
            }
            .job-bullets li {
              margin-bottom: 4px;
            }
            @media print {
              body {
                margin: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="name">Pedro Silva Manso</h1>
            <div class="role">Desenvolvedor Power Apps & Power Platform</div>
            <div class="contact-info">
              Brasília, DF | (61) 99634-2098 | mansopedro94@gmail.com<br>
              LinkedIn: linkedin.com/in/pedro-e-silva-manso-659a76249/
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Resumo Profissional</div>
            <p class="summary">
              Desenvolvedor focado em Power Apps e Power Platform, com experiência prática na criação de soluções de automação e digitalização de processos corporativos. Especialista em integrar o ecossistema Microsoft (Power Automate, SharePoint, Power BI, Dataverse, M365) para otimizar fluxos de trabalho e gerar indicadores estratégicos. Habilidade em unir lógica de programação (JavaScript, HTML, CSS, SQL) a interfaces modernas e intuitivas, com foco na eficiência operacional e experiência do usuário.
            </p>
          </div>
          
          <div class="section">
            <div class="section-title">Habilidades Técnicas</div>
            <ul class="skills-list">
              <li><strong>Power Platform:</strong> Power Apps (Canvas e Model-driven), Power Automate (Fluxos de automação e aprovações), Power BI (Dashboards e relatórios analíticos), Dataverse (Modelagem de dados segura).</li>
              <li><strong>Ecossistema Microsoft:</strong> SharePoint Online (Listas, portais, bibliotecas de documentos), Teams, Outlook, Microsoft 365.</li>
              <li><strong>Desenvolvimento & Banco de Dados:</strong> JavaScript, HTML5, CSS3, SQL Server, versionamento Git.</li>
            </ul>
          </div>
          
          <div class="section">
            <div class="section-title">Experiência Profissional</div>
            <div class="job">
              <div class="job-header">
                <span class="job-title">Desenvolvedor Power Platform / Power Apps</span>
                <span class="job-date">2025 - Presente</span>
              </div>
              <ul class="job-bullets">
                <li>Desenvolvimento e implantação de aplicações Canvas sob medida, integradas ao SharePoint, facilitando a digitalização de formulários internos.</li>
                <li>Modelagem de dados relacionais e segurança da informação utilizando SharePoint Lists e Dataverse.</li>
                <li>Automatização de fluxos de trabalho complexos e aprovações de chamados de TI com Power Automate, enviando notificações automáticas para Teams e Outlook.</li>
                <li>Criação de dashboards gerenciais e relatórios interativos com Power BI para monitoramento de SLA e indicadores operacionais.</li>
              </ul>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Projetos em Destaque</div>
            <div class="job" style="margin-bottom: 10px;">
              <div class="job-header">
                <span class="job-title">Banco de Horas — Controle de Saldo</span>
              </div>
              <ul class="job-bullets">
                <li>Sistema em Power Apps Canvas e SharePoint para controle de horas positivas e negativas de colaboradores, com histórico por motivos e status visual de aprovação.</li>
              </ul>
            </div>
            <div class="job">
              <div class="job-header">
                <span class="job-title">Sistema de Chamados de TI</span>
              </div>
              <ul class="job-bullets">
                <li>Aplicação integrada com listas de SharePoint para gerenciar a abertura, atribuição de responsáveis, status e acompanhamento de tempos de resposta (SLA) de chamados técnicos.</li>
              </ul>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Formação</div>
            <div class="job">
              <div class="job-header">
                <span class="job-title">Desenvolvimento de Sistemas & Engenharia de Software</span>
                <span class="job-date">Estudos Dirigidos / Especialização Microsoft</span>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      doc.open();
      doc.write(resumeHTML);
      doc.close();
      
      // Impõe foco e executa janela de impressão
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Remove o iframe após o comando de impressão
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
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
  const csThumbs = document.querySelectorAll('.cs-thumb');
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

});
