/**
 * 侧边栏导航 + 菜单切换
 */
(function () {
  'use strict';

  // 菜单配置（对应 A02b 页面树）
  var menuConfig = [
    {
      id: 'g01', label: '工作台', icon: '🏠',
      children: [
        { id: 'g01-a', label: '首页概览', page: 'dashboard' },
        { id: 'g01-b', label: '新人指引', page: 'onboarding' }
      ]
    },
    {
      id: 'g02', label: '推广管理', icon: '📢',
      children: [
        { id: 'g02-a', label: '活动清单', page: 'activity-list' },
        { id: 'g02-b', label: '推广位管理', page: 'promotion-list' },
        { id: 'g02-d', label: '推广分组', page: 'promotion-group-list' }
      ]
    },
    {
      id: 'g03', label: '小程序', icon: '📱',
      children: [
        { id: 'g03-a', label: '小程序管理（有数据）', page: 'miniprogram-list' },
        { id: 'g03-b', label: '小程序管理（空状态）', page: 'miniprogram-list-empty' },
        { id: 'g03-c', label: '权益页配置', page: 'benefit-config' }
      ]
    },
    {
      id: 'g04', label: '数据报表', icon: '📊',
      children: [
        { id: 'g04-a', label: '效果报表', page: 'reports-list' }
      ]
    },
    {
      id: 'g05', label: '账户设置', icon: '⚙️',
      children: [
        { id: 'g05-a', label: '企业信息', page: 'account-info' },
        { id: 'g05-b', label: '修改密码', page: 'account-pwd' }
      ]
    },
    {
      id: 'g06', label: '演示专用', icon: '🔑',
      children: [
        { id: 'g06-a', label: '登录页', page: 'login' }
      ]
    }
  ];

  var currentPage = 'dashboard';

  // page aliases: multiple menu entries → single file, tab param to pre-select tab
  var pageAliases = {
    'account-info': { page: 'account', tab: 'info' },
    'account-pwd':  { page: 'account', tab: 'pwd' },
    'account-log':  { page: 'account', tab: 'log' }
  };

  function buildMenu() {
    var nav = document.getElementById('sidebarNav');
    if (!nav) return;

    var html = '';
    menuConfig.forEach(function (item) {
      if (item.children) {
        // 分组标题
        html += '<div class="nav-section-title">';
        html += '<span class="nav-item-icon">' + item.icon + '</span>';
        html += '<span class="nav-item-label">' + item.label + '</span>';
        html += '</div>';
        // 子项全平铺
        item.children.forEach(function (child) {
          html += '<div class="nav-item" data-page="' + child.page + '">';
          html += '<span class="nav-item-label" style="padding-left:32px;">' + child.label + '</span>';
          html += '</div>';
        });
      } else {
        html += '<div class="nav-item" data-page="' + item.page + '">';
        html += '<span class="nav-item-icon">' + item.icon + '</span>';
        html += '<span class="nav-item-label">' + item.label + '</span>';
        html += '</div>';
      }
    });
    nav.innerHTML = html;
  }

  function setActiveMenu(page) {
    document.querySelectorAll('.nav-item').forEach(function (el) { el.classList.remove('active'); });
    var target = document.querySelector('[data-page="' + page + '"]');
    if (target) {
      target.classList.add('active');
    }
  }

  function navigateTo(page) {
    currentPage = page;
    setActiveMenu(page);
    loadPage(page);
    updateBreadcrumb(page);
  }

  function loadPage(page) {
    var container = document.getElementById('pageContent');
    if (!container) return;

    // Scroll to top
    container.scrollTop = 0;

    // 显示loading spinner
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;padding:80px 20px;flex-direction:column;gap:16px;"><div class="loading-spinner lg"></div><div style="color:#999;font-size:14px;">加载中...</div></div>';

    // page aliases: account-* → account.html with tab param
    var alias = pageAliases[page];
    var actualPage = alias ? alias.page : page;
    window.__pageTab = alias ? alias.tab : null;

    var pageFile = actualPage + '.html';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'pages/' + pageFile + '?_=' + Date.now(), true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 分离 <script> 标签，先注入HTML再执行脚本
        var html = xhr.responseText;
        var scripts = [];
        html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, function (match, code) {
          // 去掉 src 属性的外部脚本（demo无需外部脚本）
          if (/<script\b[^>]*\bsrc\s*=/i.test(match)) return '';
          scripts.push(code);
          return '';
        });

        // 包裹内容以实现淡入动画
        container.innerHTML = '<div class="page-transition-wrapper">' + html + '</div>';

        // 执行提取的脚本
        scripts.forEach(function (code) {
          try { (new Function(code))(); } catch (e) { console.error('Page script error:', e); }
        });
        // 触发页面加载后回调
        if (typeof window.onPageLoaded === 'function') {
          window.onPageLoaded(page);
        }
      } else {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📄</div><div class="empty-state-text">页面加载失败 (' + pageFile + ')</div></div>';
      }
    };
    xhr.onerror = function () {
      // 页面文件不存在时，显示占位
      container.innerHTML = '<div class="page-container"><div class="empty-state"><div class="empty-state-icon">🚧</div><div class="empty-state-text">「' + page + '」模块将在后续批次中实现</div><div style="margin-top:8px;color:#bfbfbf;font-size:12px;">文件: pages/' + pageFile + '</div></div></div>';
    };
    xhr.send();
  }

  function updateBreadcrumb(page) {
    var bc = document.getElementById('headerBreadcrumb');
    if (!bc) return;

    var label = page;
    menuConfig.forEach(function (item) {
      if (item.page === page) { label = item.label; }
      if (item.children) {
        item.children.forEach(function (child) {
          if (child.page === page) { label = item.label + ' <span class="sep">/</span> ' + child.label; }
        });
      }
    });
    bc.innerHTML = '<span>🏠 首页</span> <span class="sep">/</span> <span>' + label + '</span>';
  }

  function initSidebar() {
    buildMenu();

    // 菜单点击 — 全平铺，直接导航
    document.getElementById('sidebarNav').addEventListener('click', function (e) {
      var navItem = e.target.closest('.nav-item');
      if (navItem) {
        var page = navItem.getAttribute('data-page');
        if (page) navigateTo(page);
      }
    });

    // 默认打开仪表盘
    navigateTo('dashboard');
  }

  // 暴露API到全局
  window.AppNav = {
    navigateTo: navigateTo,
    getCurrentPage: function () { return currentPage; },
    menuConfig: menuConfig
  };

  // DOM准备好后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }

})();
