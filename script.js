/**
 * NexFlora — script.js
 * JS mínimo e utilitário. Sem dependências externas.
 * Funcionalidades: parallax, header scroll, menu mobile, FAQ accordion, sticky CTA, scroll suave, validação de formulário.
 */

(function () {
  'use strict';

  /* ============================================
     UTILITÁRIOS
  ============================================ */

  /** Debounce simples para eventos de scroll/resize */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ============================================
     0. PARALLAX BANNER
     Move o background-image do banner no scroll
     usando transform para performance GPU.
  ============================================ */
  const parallaxImg = document.querySelector('.parallax-banner__img');

  if (parallaxImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Usa rAF para máxima suavidade
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const banner  = parallaxImg.closest('.parallax-banner');
      if (!banner) return;

      const bannerH = banner.offsetHeight;
      // Só anima enquanto o banner está visível
      if (scrollY < bannerH * 2) {
        // Fator 0.35: movimento sutil — não exagerado
        const offset = Math.round(scrollY * 0.35);
        parallaxImg.style.transform = `translateY(${offset}px)`;
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Estado inicial
    updateParallax();
  }

  /* ============================================
     1. HEADER — sombra ao rolar
  ============================================ */
  const header = document.querySelector('.header');

  if (header) {
    const parallaxBanner = document.getElementById('parallax-banner');
    const parallaxThreshold = parallaxBanner ? parallaxBanner.offsetHeight - 10 : 20;

    const onScroll = debounce(function () {
      if (window.scrollY > parallaxThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 10);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
  }

  /* ============================================
     2. MENU MOBILE — toggle
  ============================================ */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', String(!isOpen));
      this.classList.toggle('active', !isOpen);
      mobileMenu.hidden = isOpen;

      // Previne scroll do body quando menu está aberto
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Fecha ao clicar em qualquer link do menu mobile
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        mobileMenu.hidden = true;
        document.body.style.overflow = '';
      });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target) && !mobileMenu.hidden) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        mobileMenu.hidden = true;
        document.body.style.overflow = '';
      }
    });

    // Fecha ao pressionar ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileMenu.hidden) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        mobileMenu.hidden = true;
        document.body.style.overflow = '';
        menuToggle.focus();
      }
    });
  }

  /* ============================================
     3. FAQ — ACCORDION
  ============================================ */
  const faqButtons = document.querySelectorAll('.faq-item__question');

  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isOpen     = this.getAttribute('aria-expanded') === 'true';
      const answerId   = this.getAttribute('aria-controls');
      const answer     = document.getElementById(answerId);

      // Fecha todos os outros
      faqButtons.forEach(function (other) {
        if (other !== btn) {
          const otherId  = other.getAttribute('aria-controls');
          const otherAns = document.getElementById(otherId);
          other.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.hidden = true;
        }
      });

      // Toggle o atual
      this.setAttribute('aria-expanded', String(!isOpen));
      if (answer) answer.hidden = isOpen;
    });
  });

  /* ============================================
     4. STICKY CTA MOBILE — exibe após scroll
  ============================================ */
  const stickyCta = document.getElementById('sticky-cta');
  const heroSection = document.getElementById('hero');

  if (stickyCta && heroSection) {
    const onStickyCta = debounce(function () {
      // Mostra sticky CTA depois de rolar além da hero
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        stickyCta.hidden = false;
      } else {
        stickyCta.hidden = true;
      }
    }, 50);

    window.addEventListener('scroll', onStickyCta, { passive: true });
  }

  /* ============================================
     5. ANIMAÇÕES DE ENTRADA — Intersection Observer
     Adiciona classe 'visible' em elementos ao entrar na viewport.
     Use .anim-fade-up no HTML para ativar (já incluído via JS sem alterar HTML).
  ============================================ */

  // Verifica suporte e preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const animTargets = document.querySelectorAll(
      '.benefit-card, .segment-card, .service-card, .testimonial-card, .process-step, .diff-item'
    );

    // Injeta estilo base de animação
    const style = document.createElement('style');
    style.textContent = `
      .benefit-card,
      .segment-card,
      .service-card,
      .testimonial-card,
      .process-step,
      .diff-item {
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.45s ease, transform 0.45s ease;
      }
      .benefit-card.visible,
      .segment-card.visible,
      .service-card.visible,
      .testimonial-card.visible,
      .process-step.visible,
      .diff-item.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // Escalonamento por índice dentro do pai
            const siblings = Array.from(entry.target.parentElement.children);
            const index    = siblings.indexOf(entry.target);
            const delay    = Math.min(index * 60, 300); // máx 300ms

            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    animTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Sem animações: garante que tudo é visível
    document.querySelectorAll(
      '.benefit-card, .segment-card, .service-card, .testimonial-card, .process-step, .diff-item'
    ).forEach(function (el) {
      el.style.opacity = '1';
    });
  }

  /* ============================================
     6. FORMULÁRIO — validação e feedback
  ============================================ */
  const form          = document.getElementById('contact-form');
  const formSuccess   = document.getElementById('form-success');

  if (form) {
    // Validação de campo individual
    function validateField(field) {
      const group   = field.closest('.form-group');
      const errorEl = group ? group.querySelector('.form-error') : null;
      let   message = '';

      if (field.required && !field.value.trim()) {
        message = 'Este campo é obrigatório.';
      } else if (field.type === 'email' && field.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value.trim())) {
          message = 'Insira um e-mail válido.';
        }
      } else if (field.type === 'tel' && field.value.trim()) {
        const telClean = field.value.replace(/\D/g, '');
        if (telClean.length < 10) {
          message = 'Insira um telefone válido com DDD.';
        }
      } else if (field.tagName === 'SELECT' && field.required && !field.value) {
        message = 'Selecione uma opção.';
      }

      if (errorEl) {
        errorEl.textContent = message;
      }

      field.classList.toggle('error', Boolean(message));
      return !message;
    }

    // Validação em tempo real (ao sair do campo)
    form.querySelectorAll('.form-input').forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(this);
      });

      // Remove erro ao digitar
      field.addEventListener('input', function () {
        if (this.classList.contains('error')) {
          validateField(this);
        }
      });
    });

    // Submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Verifica honeypot
      const honeypot = form.querySelector('[name="_honeypot"]');
      if (honeypot && honeypot.value) {
        // Bot detectado — silenciosamente ignora
        return;
      }

      // Valida todos os campos
      const requiredFields = form.querySelectorAll('.form-input[required]');
      let isValid = true;

      requiredFields.forEach(function (field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        // Foca no primeiro campo com erro
        const firstError = form.querySelector('.form-input.error');
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = form.querySelector('.form-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      const data = new FormData(form);

      fetch('send.php', { method: 'POST', body: data })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.ok) {
            showSuccess();
          } else {
            alert(res.error || 'Erro ao enviar. Tente novamente.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Solicitar Orçamento Rápido';
          }
        })
        .catch(function () {
          alert('Erro de conexão. Verifique sua internet e tente novamente.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Solicitar Orçamento Rápido';
        });
    });

    function showSuccess() {
      if (formSuccess) {
        formSuccess.removeAttribute('hidden');
        formSuccess.classList.add('is-visible');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  /* ============================================
     7. SCROLL SUAVE — para browsers sem suporte nativo
  ============================================ */
  // Apenas para links âncora internos
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });

        // Atualiza foco para acessibilidade
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', function () {
          target.removeAttribute('tabindex');
        }, { once: true });
      }
    });
  });

  /* ============================================
     8. MÁSCARA DE TELEFONE (simples)
  ============================================ */
  const telefoneInput = document.getElementById('telefone');

  if (telefoneInput) {
    telefoneInput.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, '');

      if (value.length > 11) value = value.slice(0, 11);

      if (value.length <= 2) {
        this.value = value.length ? '(' + value : '';
      } else if (value.length <= 6) {
        this.value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
      } else if (value.length <= 10) {
        this.value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 6) + '-' + value.slice(6);
      } else {
        this.value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7);
      }
    });
  }

})();
