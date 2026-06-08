'use client';

import { useEffect } from 'react';

export function HomeClient() {
  // Scroll reveal
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Nav scroll state + hero parallax
  useEffect(() => {
    const nav = document.getElementById('ow-nav');
    const heroBg = document.getElementById('heroBg');
    function onScroll() {
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 40);
      }
      if (heroBg && window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.32}px)`;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu
  useEffect(() => {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    const nav = document.getElementById('ow-nav');
    if (!toggle || !menu || !nav) return;
    const closeMenu = () => { menu.classList.remove('open'); nav.classList.remove('menu-open'); };
    const toggleMenu = () => { menu.classList.toggle('open'); nav.classList.toggle('menu-open'); };
    toggle.addEventListener('click', toggleMenu);
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    return () => toggle.removeEventListener('click', toggleMenu);
  }, []);

  // FAQ accordion
  useEffect(() => {
    const items = Array.from(document.querySelectorAll('.faq-item'));
    const cleanups: Array<() => void> = [];
    items.forEach((item) => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector<HTMLElement>('.faq-a');
      if (!q || !a) return;
      const handler = () => {
        const isOpen = item.classList.contains('open');
        items.forEach((other) => {
          if (other !== item) {
            other.classList.remove('open');
            const otherA = other.querySelector<HTMLElement>('.faq-a');
            if (otherA) otherA.style.maxHeight = '';
          }
        });
        if (isOpen) { item.classList.remove('open'); a.style.maxHeight = ''; }
        else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      };
      q.addEventListener('click', handler);
      cleanups.push(() => q.removeEventListener('click', handler));
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Smooth scroll with nav offset
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const handlers = new Map<HTMLAnchorElement, (e: Event) => void>();
    links.forEach((a) => {
      const handler = (e: Event) => {
        const id = a.getAttribute('href');
        if (!id || id === '#' || id === '#top') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
      };
      a.addEventListener('click', handler);
      handlers.set(a, handler);
    });
    return () => handlers.forEach((handler, a) => a.removeEventListener('click', handler));
  }, []);

  return null;
}
