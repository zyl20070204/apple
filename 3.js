/**
 * Apple (中国大陆) — 交互 & 动画脚本
 * 严格参照 apple.com.cn 交互模式
 */
(function () {
  'use strict';

  // ============================================
  // 1. 导航栏滚动效果
  // ============================================
  var nav = document.getElementById('globalnav');
  var subnav = document.getElementById('subnav');
  var lastScrollY = 0;
  var ticking = false;

  function updateNavScroll() {
    var scrollY = window.pageYOffset;

    // 主导航背景加深
    if (nav) {
      if (scrollY > 44) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    // 次级导航背景加深 (iPhone 页)
    if (subnav) {
      if (scrollY > 96) {
        subnav.classList.add('scrolled');
      } else {
        subnav.classList.remove('scrolled');
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    lastScrollY = window.pageYOffset;
    if (!ticking) {
      window.requestAnimationFrame(updateNavScroll);
      ticking = true;
    }
  }, { passive: true });

  // ============================================
  // 2. Hero 视差效果
  // ============================================
  var heroParallax = document.querySelector('.hero-parallax');

  function updateParallax() {
    if (!heroParallax) return;
    var scrollY = window.pageYOffset;
    var heroTop = heroParallax.offsetTop;
    var heroHeight = heroParallax.offsetHeight;
    var relativeScroll = scrollY - heroTop;

    if (relativeScroll > -heroHeight && relativeScroll < heroHeight) {
      var offset = relativeScroll * 0.15;
      heroParallax.style.backgroundPositionY = offset + 'px';
    }
  }

  window.addEventListener('scroll', function () {
    window.requestAnimationFrame(updateParallax);
  }, { passive: true });

  // ============================================
  // 3. Stagger 动画 (进入视口时触发)
  // ============================================
  var staggerElements = document.querySelectorAll('.stagger');
  var fadeElements = document.querySelectorAll(
    '.promo-card, .feature-card, .why-card, .intel-card, .compare-item'
  );

  function isInViewport(el, offset) {
    var rect = el.getBoundingClientRect();
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight - (offset || 80);
  }

  function checkAnimations() {
    // Stagger groups
    staggerElements.forEach(function (el) {
      if (isInViewport(el, 100)) {
        el.classList.add('visible');
      }
    });

    // Individual cards — staggered by their natural position
    fadeElements.forEach(function (el, i) {
      if (isInViewport(el, 80)) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }

  // Init: set initial state for fade elements
  fadeElements.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.25,0.1,0.25,1), transform 0.6s cubic-bezier(0.25,0.1,0.25,1)';
    // Stagger delay based on index within parent
    var siblings = el.parentElement ? el.parentElement.children : [];
    var idx = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = (idx * 0.06) + 's';
  });

  // Hero content: immediate fade-in
  var heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '1';
    heroContent.style.transform = 'translateY(0)';
  }

  var animScrollTimeout;
  window.addEventListener('scroll', function () {
    if (animScrollTimeout) {
      window.cancelAnimationFrame(animScrollTimeout);
    }
    animScrollTimeout = window.requestAnimationFrame(checkAnimations);
  }, { passive: true });

  // Initial check (after a small delay for layout)
  setTimeout(checkAnimations, 150);

  // ============================================
  // 4. 次级导航平滑滚动
  // ============================================
  if (subnav) {
    var subnavLinks = subnav.querySelectorAll('a[href^="#"]');
    subnavLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = this.getAttribute('href').substring(1);
        var target = document.getElementById(targetId);
        if (target) {
          var offset = 44 + 52; // nav + subnav
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================
  // 5. 图片加载失败回退
  // ============================================
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      this.style.display = 'none';
    });
    // If already failed before script ran
    if (img.complete && img.naturalWidth === 0) {
      img.style.display = 'none';
    }
  });

  // ============================================
  // 6. 页面跳转（主页"进一步了解" → iPhone 页）
  // ============================================
  // 登录页面的 <a href="iphone.html"> 已原生支持跳转，无需额外处理。
  // iPhone 页面的"进一步了解"按钮滚动到对应区块。

  var furtherBtns = document.querySelectorAll('[data-scroll-to]');
  furtherBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('data-scroll-to');
      var target = document.getElementById(targetId);
      if (target) {
        var offset = 96; // nav + subnav
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // 7. 产品卡片悬停微交互
  // ============================================
  var promoCards = document.querySelectorAll('.promo-card');
  promoCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      var img = this.querySelector('.promo-bg-img');
      if (img) {
        img.style.transform = 'scale(1.03)';
      }
    });
    card.addEventListener('mouseleave', function () {
      var img = this.querySelector('.promo-bg-img');
      if (img) {
        img.style.transform = 'scale(1)';
      }
    });
  });

  // ============================================
  // 8. 回到顶部 (Logo 点击)
  // ============================================
  var logoLink = document.querySelector('.nav-logo[href="1.html"]');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      // 如果已经在主页，则回到顶部
      if (window.location.pathname.endsWith('1.html') || window.location.pathname.endsWith('/')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ============================================
  // 9. 初始化：确保首屏可见元素立即显示
  // ============================================
  // Hero content
  if (heroContent) {
    heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    setTimeout(function () {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 50);
  }

  // ============================================
  // 10. 统计特性数字滚动动画 (Specs)
  // ============================================
  var specsValues = document.querySelectorAll('.specs-item-value');
  var specsAnimated = false;

  function animateSpecs() {
    if (specsAnimated || specsValues.length === 0) return;
    var firstSpec = specsValues[0];
    if (!isInViewport(firstSpec, 50)) return;
    specsAnimated = true;

    specsValues.forEach(function (el) {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    });
  }

  // Init specs state
  specsValues.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'scale(0.8)';
  });

  window.addEventListener('scroll', function () {
    window.requestAnimationFrame(animateSpecs);
  }, { passive: true });

})();
