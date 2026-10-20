/**
 * MAESTRO SOLUCIONES - JAVASCRIPT PRINCIPAL
 * Taller de Herrería, Estructuras Metálicas y Remodelaciones
 * Teléfono / WhatsApp: 0424-1878706 | Instagram: @maestro_soluciones
 * Guarenas · Guatire · Caracas · Estado Miranda
 */

(function () {
  'use strict';

  // CONFIGURACIÓN CENTRALIZADA
  const PHONE_NUMBER = "584241878706";
  const DEFAULT_WA_MSG = "Hola Maestro Soluciones, vi su página y quiero solicitar un presupuesto para un trabajo.";

  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initCategoryFilters();
    initGalleryLightbox();
    syncWhatsAppLinks();
  });

  /**
   * 1. REVELADO AL HACER SCROLL ("ROLLING SHOWCASE")
   * Las imágenes van apareciendo dinámicamente conforme la gente hace scroll en la página.
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach(el => el.classList.add('aparecido'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '140px 0px 60px 0px',
      threshold: 0.05
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aparecido');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /**
   * 2. FILTRADO POR TIPO DE TRABAJO (CATEGORÍAS)
   * Filtra las 50 obras en tiempo real sin recargar la página.
   */
  function initCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filtro-btn');
    const galleryCards = document.querySelectorAll('.galeria-card');
    if (filterButtons.length === 0 || galleryCards.length === 0) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Actualizar botón activo
        filterButtons.forEach(b => {
          b.classList.remove('activo');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('activo');
        btn.setAttribute('aria-selected', 'true');

        const filterCategory = btn.getAttribute('data-filtro');

        // Mostrar / ocultar tarjetas
        galleryCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (filterCategory === 'todos' || cardCategory === filterCategory) {
            card.classList.remove('oculto');
            card.classList.add('aparecido');
          } else {
            card.classList.add('oculto');
          }
        });
      });
    });
  }

  /**
   * 3. VISOR LIGHTBOX PARA LAS FOTOS DE LA GALERÍA
   * Funciona con el conjunto de fotos actualmente visibles y permite navegación táctil y por teclado.
   */
  function initGalleryLightbox() {
    const galleryStream = document.getElementById('galeria-stream');
    if (!galleryStream) return;

    // Crear elementos del modal si no existen
    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lightbox-modal';
      modal.className = 'lightbox-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Visor de foto');

      modal.innerHTML = `
        <div class="lightbox-content">
          <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Cerrar visor">&times;</button>
          <button type="button" class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Foto anterior">&#10094;</button>
          <button type="button" class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Foto siguiente">&#10095;</button>
          
          <div class="lightbox-img-box">
            <img id="lightbox-img" src="" alt="">
          </div>
          
          <div class="lightbox-footer">
            <div class="lightbox-info">
              <h3 id="lightbox-title"></h3>
              <p id="lightbox-desc"></p>
            </div>
            <div class="lightbox-counter" id="lightbox-counter">1 / 50</div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const imgElem = document.getElementById('lightbox-img');
    const titleElem = document.getElementById('lightbox-title');
    const descElem = document.getElementById('lightbox-desc');
    const counterElem = document.getElementById('lightbox-counter');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let currentIndex = 0;
    let visibleCardsList = [];
    let lastFocusedElement = null;

    function getVisibleCards() {
      return Array.from(document.querySelectorAll('.galeria-card:not(.oculto)'));
    }

    function openLightbox(index) {
      visibleCardsList = getVisibleCards();
      if (visibleCardsList.length === 0) return;

      lastFocusedElement = document.activeElement;
      currentIndex = Math.max(0, Math.min(index, visibleCardsList.length - 1));
      updateLightboxContent();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    function updateLightboxContent() {
      if (visibleCardsList.length === 0) return;
      const card = visibleCardsList[currentIndex];
      const src = card.getAttribute('data-src') || card.querySelector('img')?.getAttribute('src') || '';
      const title = card.getAttribute('data-title') || card.querySelector('h3')?.textContent || 'Proyecto';
      const desc = card.querySelector('p')?.textContent || '';
      const tag = card.getAttribute('data-tag') || '';

      imgElem.src = src;
      imgElem.alt = title;
      titleElem.textContent = title;
      descElem.textContent = tag ? `${tag} · ${desc}` : desc;
      counterElem.textContent = `${currentIndex + 1} / ${visibleCardsList.length}`;
    }

    function showNext() {
      if (visibleCardsList.length === 0) return;
      currentIndex = (currentIndex + 1) % visibleCardsList.length;
      updateLightboxContent();
    }

    function showPrev() {
      if (visibleCardsList.length === 0) return;
      currentIndex = (currentIndex - 1 + visibleCardsList.length) % visibleCardsList.length;
      updateLightboxContent();
    }

    // Delegación de clic sobre las tarjetas
    galleryStream.addEventListener('click', (e) => {
      const card = e.target.closest('.galeria-card');
      if (!card || card.classList.contains('oculto')) return;

      const visible = getVisibleCards();
      const idx = visible.indexOf(card);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });

    // Accesibilidad teclado en tarjetas
    galleryStream.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.galeria-card');
        if (!card || card.classList.contains('oculto')) return;
        e.preventDefault();
        const visible = getVisibleCards();
        const idx = visible.indexOf(card);
        if (idx !== -1) {
          openLightbox(idx);
        }
      }
    });

    // Añadir atributos de accesibilidad a cada tarjeta
    document.querySelectorAll('.galeria-card').forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showNext();
      else if (e.key === 'ArrowLeft') showPrev();
    });
  }

  /**
   * 4. SINCRONIZACIÓN DE ENLACES DE WHATSAPP CON NÚMERO Y MENSAJE PREDEFINIDO
   */
  function syncWhatsAppLinks() {
    const waLinks = document.querySelectorAll('a[href*="wa.me"]');
    waLinks.forEach(link => {
      try {
        const url = new URL(link.href);
        const currentText = url.searchParams.get('text') || DEFAULT_WA_MSG;
        link.href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(currentText)}`;
      } catch (err) {
        link.href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_WA_MSG)}`;
      }
    });
  }

})();
