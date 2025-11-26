/**
 * KANOA - Script Principal
 * js/script.js
 * 
 * Organizar código em módulos. Cada módulo cuida de uma funcionalidade.
 */

'use strict';

/* ===========================================================================
   Dark Mode - Alternar tema claro/escuro e salvar no localStorage
   =========================================================================== */

const DarkMode = {
  init() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;

    this.loadPreference();
    toggle.addEventListener('click', () => this.toggle());
  },

  // Carregar preferência salva do localStorage
  loadPreference() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
      document.body.classList.add('dark-mode');
    }
  },

  // Alternar classe .dark-mode e salvar preferência
  toggle() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
    } else {
      localStorage.setItem('darkMode', 'disabled');
    }
  }
};

/* ===========================================================================
   Banner Fade - Deixar banner transparente conforme scroll (0px a 420px)
   =========================================================================== */

const BannerFade = {
  init() {
    const banner = document.getElementById('hero-banner');
    if (!banner) return;

    const fadeStart = 0;
    const fadeEnd = 420;

    // Adicionar listener de scroll com passive:true para performance
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;

      if (scrollY <= fadeStart) {
        banner.style.opacity = '1';
      } else if (scrollY >= fadeEnd) {
        banner.style.opacity = '0';
      } else {
        // Calcular opacity proporcional entre 0 e 420px
        const opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
        banner.style.opacity = String(opacity);
      }
    }, { passive: true });
  }
};

/* ===========================================================================
   Mobile Menu - Abrir/fechar menu hambúrguer em mobile
   =========================================================================== */

const MobileMenu = {
  init() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('main-menu');
    
    if (!toggle || !menu) return;

    // Abrir/fechar ao clicar no hambúrguer
    toggle.addEventListener('click', () => this.toggleMenu(toggle, menu));

    // Fechar ao clicar em qualquer link
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu(toggle, menu));
    });

    // Fechar ao clicar fora do menu
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        this.closeMenu(toggle, menu);
      }
    });
  },

  // Alternar estado do menu
  toggleMenu(toggle, menu) {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    toggle.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
    document.body.classList.toggle('menu-open');
  },

  // Fechar menu
  closeMenu(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('active');
    document.body.classList.remove('no-scroll');
    document.body.classList.remove('menu-open');
  }
};

/* ===========================================================================
   Carousel - Carrossel responsivo com navegação por setas, teclado e touch
   =========================================================================== */

class Carousel {
  constructor(container, options = {}) {
    this.container = container;
    this.carousel = container.querySelector('.carousel');
    
    if (!this.carousel) return;

    // Definir configurações
    this.items = Array.from(this.carousel.children);
    this.currentIndex = 0;
    this.itemsToShow = options.itemsToShow || 3;
    this.autoPlay = !!options.autoPlay;
    this.autoPlayInterval = options.autoPlayInterval || 5000;
    this.autoPlayTimer = null;

    this.prevBtn = null;
    this.nextBtn = null;

    this.init();
  }

  init() {
    this.createNavigation();
    this.handleResize();
    this.bindEvents();

    if (this.autoPlay) {
      this.startAutoPlay();
    }

    this.container.setAttribute('tabindex', '0');
  }

  // Criar botões prev/next se não existirem
  createNavigation() {
    if (this.container.querySelector('.carousel-nav')) {
      this.prevBtn = this.container.querySelector('.prev-btn');
      this.nextBtn = this.container.querySelector('.next-btn');
      return;
    }

    const navContainer = document.createElement('div');
    navContainer.className = 'carousel-nav';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'carousel-btn prev-btn';
    prevBtn.setAttribute('aria-label', 'Item anterior');
    prevBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.42z"/>
      </svg>
    `;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'carousel-btn next-btn';
    nextBtn.setAttribute('aria-label', 'Próximo item');
    nextBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.42z"/>
      </svg>
    `;

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);
    this.container.appendChild(navContainer);

    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
  }

  // Vincular eventos aos botões e teclado
  bindEvents() {
    // Eventos dos botões de navegação
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.prev();
        if (this.autoPlay) this.startAutoPlay();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.next();
        if (this.autoPlay) this.startAutoPlay();
      });
    }

    // Permitir navegação por teclado
    this.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.next();
          break;
        case 'Home':
          e.preventDefault();
          this.goToPage(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToPage(this.getTotalPages() - 1);
          break;
      }
    });

    // Adicionar suporte para touch/swipe em mobile
    let startX = 0;
    let startY = 0;
    let dragging = false;

    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
      this.stopAutoPlay();
    }, { passive: true });

    this.carousel.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;

      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      const diffY = Math.abs(e.changedTouches[0].clientY - startY);

      // Navegar apenas se swipe foi horizontal (não vertical)
      if (Math.abs(diffX) > 50 && diffY < 30) {
        if (diffX > 0) {
          this.next();
        } else {
          this.prev();
        }
      }

      if (this.autoPlay) this.startAutoPlay();
    }, { passive: true });

    // Pausar autoplay ao passar mouse
    if (this.autoPlay) {
      this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // Ajustar ao redimensionar janela
    window.addEventListener('resize', () => this.handleResize());
  }

  // Ajustar itens visíveis baseado na largura da tela
  handleResize() {
    const containerWidth = this.container.offsetWidth;

    if (containerWidth < 480) {
      this.itemsToShow = 1;
    } else if (containerWidth < 768) {
      this.itemsToShow = 1;
    } else if (containerWidth < 1024) {
      this.itemsToShow = 2;
    } else {
      this.itemsToShow = 3;
    }

    const totalPages = this.getTotalPages();
    if (this.currentIndex > totalPages - 1) {
      this.currentIndex = totalPages - 1;
    }

    this.updateCarousel();
  }

  // Retornar número total de páginas
  getTotalPages() {
    return Math.max(1, Math.ceil(this.items.length / this.itemsToShow));
  }

  // Atualizar posição visual usando transform: translateX()
  updateCarousel() {
    if (!this.items.length) return;

    // Calcular largura de item + gap
    const itemRect = this.items[0].getBoundingClientRect();
    const computed = getComputedStyle(this.carousel);
    const gap = parseFloat(computed.gap || computed.columnGap) || 20;
    const itemWidth = itemRect.width + gap;

    // Calcular translação
    const translateX = -(this.currentIndex * this.itemsToShow * itemWidth);
    const maxTranslate = Math.max(0, (this.items.length * itemWidth) - (this.itemsToShow * itemWidth));
    const safeTranslate = Math.max(-maxTranslate, translateX);

    this.carousel.style.transform = `translateX(${safeTranslate}px)`;

    // Atualizar estado dos botões
    const maxIndex = this.getTotalPages() - 1;
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex <= 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= maxIndex;
  }

  // Ir para próximo item
  next() {
    const max = this.getTotalPages() - 1;
    this.currentIndex = (this.currentIndex >= max) ? 0 : (this.currentIndex + 1);
    this.updateCarousel();
  }

  // Ir para item anterior
  prev() {
    const max = this.getTotalPages() - 1;
    this.currentIndex = (this.currentIndex <= 0) ? max : (this.currentIndex - 1);
    this.updateCarousel();
  }

  // Ir para página específica
  goToPage(idx) {
    const max = this.getTotalPages() - 1;
    this.currentIndex = Math.max(0, Math.min(idx, max));
    this.updateCarousel();
  }

  // Iniciar autoplay
  startAutoPlay() {
    if (!this.autoPlay) return;
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
  }

  // Parar autoplay
  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
}

/* ===========================================================================
   Experiences Loader - Carregar experiências da API
   
   Por enquanto usar HTML estático. Quando API estiver pronta:
   1. Descomentar linhas do fetch
   2. Atualizar API_URL
   =========================================================================== */

const ExperiencesLoader = {
  API_URL: '/api/experiencias',

  async loadExperiences() {
    try {
      // Descomentar quando API estiver pronta:
      // const response = await fetch(this.API_URL);
      // if (!response.ok) throw new Error('Erro ao carregar experiências');
      // const data = await response.json();
      // this.renderExperiences(data.experiencias);

      console.log('API não implementada. Usar dados estáticos do HTML.');
      
    } catch (error) {
      console.error('Erro ao carregar experiências:', error);
    }
  },

  // Renderizar cards dinamicamente
  renderExperiences(experiencias) {
    const container = document.getElementById('experiences-list');
    if (!container) return;

    container.innerHTML = '';

    experiencias.forEach(exp => {
      const card = this.createExperienceCard(exp);
      container.appendChild(card);
    });

    // Reinicializar carrossel com novos dados
    const carouselContainer = document.querySelector('.experiences-carousel');
    if (carouselContainer) {
      new Carousel(carouselContainer, { 
        itemsToShow: 3, 
        autoPlay: true, 
        autoPlayInterval: 6000 
      });
    }
  },

  // Criar elemento <article> do card
  createExperienceCard(exp) {
    const article = document.createElement('article');
    article.className = 'carousel-card';
    article.setAttribute('role', 'listitem');
    article.setAttribute('data-experience-id', exp.id);

    article.innerHTML = `
      <img src="${exp.imagem}" 
           alt="${exp.titulo}"
           loading="lazy"
           width="300"
           height="200">
      <div class="card-content">
        <h3 class="card-title">${exp.titulo}</h3>
        <p class="card-description">${exp.descricao}</p>
        <span class="card-price" aria-label="Preço: ${exp.preco}">
          R$ ${exp.preco.toFixed(2).replace('.', ',')}
        </span>
      </div>
    `;

    return article;
  }
};

/* ===========================================================================
   Image Loader - Carregar imagens com lazy loading
   =========================================================================== */

const ImageLoader = {
  init() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Verificar se já carregou (cache)
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
      } else {
        // Adicionar listener de load
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });

        // Adicionar listener de erro
        img.addEventListener('error', function() {
          console.warn('Falha ao carregar imagem:', this.src);
          this.style.background = 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
          this.classList.add('loaded');
        });
      }
    });
  }
};

/* ===========================================================================
   Smooth Scroll - Scroll suave para links âncora (#sobre, #experiencias, etc)
   =========================================================================== */

const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        // Calcular offset do header fixo
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 56;
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      });
    });
  }
};

/* ===========================================================================
   Animations Observer - Animar elementos ao entrar na viewport
   =========================================================================== */

const AnimationsObserver = {
  init() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Selecionar elementos que terão animação
    const elements = document.querySelectorAll(`
      .section,
      .carousel-container,
      .stats-grid,
      .cta-section,
      .highlight-box,
      .lgpd-content,
      .ong-gallery,
      .values-grid
    `);

    elements.forEach(el => {
      observer.observe(el);
    });
  }
};

/* ===========================================================================
   Inicialização - Executar quando DOM estiver pronto
   =========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar módulos
  DarkMode.init();
  BannerFade.init();
  MobileMenu.init();
  ImageLoader.init();
  SmoothScroll.init();
  AnimationsObserver.init();

  // Inicializar carrosséis
  const experiencesCarousel = document.querySelector('.experiences-carousel');
  if (experiencesCarousel) {
    new Carousel(experiencesCarousel, { 
      itemsToShow: 3, 
      autoPlay: true, 
      autoPlayInterval: 6000 
    });
  }

  const teamCarousel = document.querySelector('.team-carousel');
  if (teamCarousel) {
    new Carousel(teamCarousel, { 
      itemsToShow: 3, 
      autoPlay: false 
    });
  }

  // Descomentar quando API estiver pronta:
  // ExperiencesLoader.loadExperiences();
});

// Executar quando página carregar completamente (incluindo imagens)
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  ImageLoader.init();
});