// banner.js - controla fade do banner + carrossel com setas + dark mode

/* Dark Mode Toggle */
function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (!darkModeToggle) return;

  // Verifica preferência salva
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  // Toggle ao clicar
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Salva preferência
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
    } else {
      localStorage.setItem('darkMode', 'disabled');
    }
  });
}

/* Banner fade effect */
function initBannerFade() {
  const banner = document.getElementById('imagem-banner');
  if (!banner) return;

  const header = document.querySelector('.site-nav');
  const headerHeight = header ? header.offsetHeight : 56;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const fadeOutStart = 0;
    const fadeOutEnd = 420;

    if (scrollY <= fadeOutStart) {
      banner.style.opacity = '1';
    } else if (scrollY >= fadeOutEnd) {
      banner.style.opacity = '0';
    } else {
      const opacity = 1 - (scrollY - fadeOutStart) / (fadeOutEnd - fadeOutStart);
      banner.style.opacity = String(opacity);
    }
  });
}

/* Carousel class (com setas) */
class Carousel {
  constructor(container, options = {}) {
    this.container = container;
    this.carousel = container.querySelector('.carousel');
    if (!this.carousel) return;

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

    if (this.autoPlay) this.startAutoPlay();

    this.container.setAttribute('tabindex', '0');
  }

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
    prevBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.42z"/>
    </svg>`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'carousel-btn next-btn';
    nextBtn.setAttribute('aria-label', 'Próximo item');
    nextBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.42z"/>
    </svg>`;

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);
    this.container.appendChild(navContainer);

    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
  }

  bindEvents() {
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

    // keyboard navigation
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

    // touch/swipe
    let startX = 0, startY = 0, dragging = false;
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
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) this.next();
        else this.prev();
      }
      if (this.autoPlay) this.startAutoPlay();
    }, { passive: true });

    // pause autoplay on hover
    if (this.autoPlay) {
      this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // window resize
    window.addEventListener('resize', () => this.handleResize());
  }

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
    if (this.currentIndex > totalPages - 1) this.currentIndex = totalPages - 1;

    this.updateCarousel();
  }

  getTotalPages() {
    return Math.max(1, Math.ceil(this.items.length / this.itemsToShow));
  }

  updateCarousel() {
    if (!this.items.length) return;
    
    const itemRect = this.items[0].getBoundingClientRect();
    const computed = getComputedStyle(this.carousel);
    const gap = parseFloat(computed.gap || computed.columnGap) || 20;
    const itemWidth = itemRect.width + gap;

    const translateX = -(this.currentIndex * this.itemsToShow * itemWidth);
    const maxTranslate = Math.max(0, (this.items.length * itemWidth) - (this.itemsToShow * itemWidth));
    const safeTranslate = Math.max(-maxTranslate, translateX);
    
    this.carousel.style.transform = `translateX(${safeTranslate}px)`;

    const maxIndex = this.getTotalPages() - 1;
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex <= 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= maxIndex;
  }

  next() {
    const max = this.getTotalPages() - 1;
    this.currentIndex = (this.currentIndex >= max) ? 0 : (this.currentIndex + 1);
    this.updateCarousel();
  }

  prev() {
    const max = this.getTotalPages() - 1;
    this.currentIndex = (this.currentIndex <= 0) ? max : (this.currentIndex - 1);
    this.updateCarousel();
  }

  goToPage(idx) {
    const max = this.getTotalPages() - 1;
    this.currentIndex = Math.max(0, Math.min(idx, max));
    this.updateCarousel();
  }

  startAutoPlay() {
    if (!this.autoPlay) return;
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
}

/* image loading helper */
function handleImageLoad() {
  const images = document.querySelectorAll('.carousel-item img, .team-carousel-item img, .ong-image, .imagem-banner, .left-img');
  images.forEach(img => {
    if (!img) return;
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() { 
        this.classList.add('loaded'); 
      });
      img.addEventListener('error', function() {
        console.warn('Falha ao carregar imagem:', this.src);
        this.style.background = 'linear-gradient(45deg,#f0f0f0,#e0e0e0)';
        this.classList.add('loaded');
      });
    }
  });
}

/* Smooth scrolling for anchor links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector('.site-nav');
      const headerHeight = header ? header.offsetHeight : 56;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
}

/* IntersectionObserver entry animations */
function initObservers() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.secao, .carousel-container, .ong-highlight, .lgpd-content, .ong-stats, .call-to-action').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

/* Init on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  initBannerFade();
  handleImageLoad();
  initSmoothScroll();
  initObservers();

  // init carousels
  const experiences = document.querySelector('.experiences-carousel');
  if (experiences) new Carousel(experiences, { itemsToShow: 3, autoPlay: true, autoPlayInterval: 6000 });

  const team = document.querySelector('.team-carousel');
  if (team) new Carousel(team, { itemsToShow: 3, autoPlay: false });
});

/* mark loaded on window.load */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  handleImageLoad();
});