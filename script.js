/*
  Small scroll-reveal animation controller.
  It keeps the motion logic in JavaScript and lets CSS handle the visual style.
*/
(function () {
  const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
  const navCat = document.querySelector('.nav-cat');
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showElement(element) {
    element.classList.add('is-visible');
  }

  revealElements.forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index * 90, 360)}ms`);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        window.requestAnimationFrame(() => {
          showElement(entry.target);
        });

        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    });

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach(showElement);
  }

  if (navCat) {
    const wanderTargets = [
      document.querySelector('.nav-area'),
      document.querySelector('.hero'),
      document.querySelector('#bio'),
      document.querySelector('#skills'),
      document.querySelector('#projects'),
      document.querySelector('.contact-band'),
      document.querySelector('.site-footer')
    ].filter(Boolean);
    const navTargets = [
      document.querySelector('#bio'),
      document.querySelector('#skills'),
      document.querySelector('#projects'),
      document.querySelector('.contact-band')
    ].filter(Boolean);

    let currentIndex = 0;
    let wanderTimer = null;
    let resizeRaf = null;
    let reactionTimer = null;
    let catX = 0;
    let catY = 0;
    let catLift = 0;
    let catShift = 0;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function setWalkingSprite() {
      navCat.textContent = '=^.^=';
    }

    function setReactionSprite() {
      navCat.textContent = '=^ω^=';
    }

    function restoreSprite() {
      navCat.textContent = '=^.^=';
      navCat.classList.remove('is-reacting');
    }

    function renderCat() {
      navCat.style.transform = `translate(${Math.round(catX + catShift)}px, ${Math.round(catY + catLift)}px)`;
    }

    function placeCatOnTarget(target) {
      const targetRect = target.getBoundingClientRect();
      const catRect = navCat.getBoundingClientRect();
      const margin = 16;
      catX = clamp(targetRect.left + (targetRect.width * 0.5) - (catRect.width * 0.5), margin, window.innerWidth - catRect.width - margin);
      catY = clamp(targetRect.top + (targetRect.height * 0.35) - (catRect.height * 0.5), margin, window.innerHeight - catRect.height - margin);
      catLift = 0;
      catShift = 0;

      renderCat();
    }

    function syncCurrentTarget() {
      const target = wanderTargets[currentIndex];

      if (target) {
        placeCatOnTarget(target);
      }
    }

    function clearTimers() {
      if (wanderTimer !== null) {
        window.clearTimeout(wanderTimer);
      }

      if (reactionTimer !== null) {
        window.clearTimeout(reactionTimer);
      }

      if (resizeRaf !== null) {
        window.cancelAnimationFrame(resizeRaf);
      }
    }

    function scheduleWander() {
      if (wanderTimer !== null) {
        window.clearTimeout(wanderTimer);
      }

      wanderTimer = window.setTimeout(advanceCat, 5200);
    }

    function reactToClick() {
      if (reactionTimer !== null) {
        window.clearTimeout(reactionTimer);
      }

      if (wanderTimer !== null) {
        window.clearTimeout(wanderTimer);
      }

      navCat.classList.add('is-reacting');
      setReactionSprite();
      catLift = -18;
      catShift = (currentIndex % 2 === 0) ? 8 : -8;
      renderCat();

      reactionTimer = window.setTimeout(() => {
        catLift = 0;
        catShift = 0;
        restoreSprite();
        renderCat();
        scheduleWander();
      }, 360);
    }

    function moveCatToTarget(target) {
      const targetIndex = wanderTargets.indexOf(target);

      if (targetIndex === -1) {
        return;
      }

      currentIndex = targetIndex;
      setWalkingSprite();
      syncCurrentTarget();
      scheduleWander();
    }

    function advanceCat() {
      currentIndex = (currentIndex + 1) % wanderTargets.length;
      setWalkingSprite();
      syncCurrentTarget();
      scheduleWander();
    }

    function handleViewportChange() {
      if (resizeRaf !== null) {
        return;
      }

      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        syncCurrentTarget();
      });
    }

    syncCurrentTarget();

    if (prefersReducedMotion) {
      navCat.textContent = '=^.^=';
      return;
    }

    navCat.addEventListener('click', reactToClick);

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('load', handleViewportChange);

    navLinks.forEach((link, index) => {
      const target = navTargets[index];

      if (!target) {
        return;
      }

      link.addEventListener('mouseenter', () => {
        moveCatToTarget(target);
      });

      link.addEventListener('focus', () => {
        moveCatToTarget(target);
      });
    });

    wanderTimer = window.setTimeout(advanceCat, 2400);

    window.addEventListener('beforeunload', clearTimers);
  }
})();