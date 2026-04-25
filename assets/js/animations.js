/**
 * FFArena — Scroll Animation Engine
 * Uses IntersectionObserver to trigger .reveal elements as they enter the viewport.
 * Add class "reveal" (optionally with "delay-1" … "delay-6") to any element
 * you want to animate on scroll.
 */
(function () {
    'use strict';

    function initScrollAnimations() {
        const elements = document.querySelectorAll('.reveal');
        if (!elements.length) return;

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // Once visible, no need to keep observing
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            }
        );

        elements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }
})();
