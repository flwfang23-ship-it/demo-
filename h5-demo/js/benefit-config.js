/**
 * C04 权益页配置 — 拖拽式可视化编辑器（增强版）
 * 功能：导航菜单管理、组件库拖拽、卡片平台/活动展示、保存动作
 */
(function () {
  'use strict';

  var globalIndex = 1;
  var draggedElement = null;
  var draggedSourceType = null;
  var currentEditModuleId = null;
  var currentEditCateNav = null;

  var currentSlotId = 'slot_default';
  var currentCate = null;
  var isDirty = false;

  // 分类缓存: { slotId: { cateId: { icon, name, isDefault, leftHTML, rightHTML } } }
  var slotCategoryCache = {};

  // slot级推广路径: { slotId: { miniPath, h5Path } }
  var slotPaths = {};

  // ===== 入口 =====
  window.initBenefitConfig = function () {
    globalIndex = 1;
    draggedElement = null;
    draggedSourceType = null;
    isDirty = false;

    var colLeft = document.getElementById('colLeft');
    var colRight = document.getElementById('colRight');
    if (colLeft) colLeft.innerHTML = '';
    if (colRight) colRight.innerHTML = '';

    initSlotPaths();
    initSlotCategoryCache();

    currentSlotId = 'slot_default';
    renderNavMenu();
    renderCompLibrary();

    var firstCate = getFirstCategoryId();
    if (firstCate) switchCategory(firstCate);

    updateSaveButton();
    bindAllEvents();
  };

  // ===== slot级路径初始化 =====
  function initSlotPaths() {
    var slots = (window.MockData && window.MockData.promotionSlots) ? window.MockData.promotionSlots : [];
    slots.forEach(function (s) {
      slotPaths[s.slotId] = {
        miniPath: s.miniPath || '',
        h5Path: s.h5Path || ''
      };
    });
    if (!slotPaths['slot_default']) slotPaths['slot_default'] = { miniPath: '', h5Path: '' };
    if (!slotPaths['slot_001']) slotPaths['slot_001'] = { miniPath: '', h5Path: '' };
    if (!slotPaths['slot_002']) slotPaths['slot_002'] = { miniPath: '', h5Path: '' };
    if (!slotPaths['slot_003']) slotPaths['slot_003'] = { miniPath: '', h5Path: '' };
  }

  // ===== 分类缓存初始化 =====
  function initSlotCategoryCache() {
    var navData = (window.MockData && window.MockData.slotNavMenus) ? window.MockData.slotNavMenus : {};
    var slotIds = ['slot_default', 'slot_001', 'slot_002', 'slot_003'];
    slotIds.forEach(function (slotId) {
      if (!slotCategoryCache[slotId]) slotCategoryCache[slotId] = {};
      var menus = navData[slotId] || [];
      menus.forEach(function (menu) {
        if (!slotCategoryCache[slotId][menu.id]) {
          slotCategoryCache[slotId][menu.id] = {
            icon: menu.icon, name: menu.name, isDefault: !!menu.isDefault, leftHTML: '', rightHTML: ''
          };
        }
      });
    });
  }

  function getNavDataForSlot(slotId) {
    var caches = slotCategoryCache[slotId] || {};
    return Object.keys(caches).map(function (k) {
      return { id: k, icon: caches[k].icon, name: caches[k].name, isDefault: caches[k].isDefault };
    });
  }

  function getFirstCategoryId() {
    var caches = slotCategoryCache[currentSlotId] || {};
    var keys = Object.keys(caches);
    return keys.length > 0 ? keys[0] : null;
  }

  // ===== 导航菜单渲染 =====
  function renderNavMenu() {
    var container = document.getElementById('simNavContainer');
    if (!container) return;
    var menus = getNavDataForSlot(currentSlotId);
    var html = '';
    menus.forEach(function (menu) {
      var activeClass = (menu.id === currentCate) ? ' active' : '';
      var defaultAttr = menu.isDefault ? ' data-default="true"' : '';
      html +=
        '<div class="sim-nav-item' + activeClass + '" data-cate="' + menu.id + '"' + defaultAttr + '>' +
          '<div class="nav-edit-btn">✏️</div>' +
          '<div class="nav-del-btn">✕</div>' +
          '<div class="sim-nav-icon">' + escHtml(menu.icon) + '</div>' +
          '<div class="sim-nav-text">' + escHtml(menu.name) + '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  // ===== 分类切换 =====
  function switchCategory(nextCate) {
    if (!nextCate || nextCate === currentCate) return;
    saveCurrentCanvas();
    currentCate = nextCate;
    document.querySelectorAll('.sim-nav-item').forEach(function (n) { n.classList.remove('active'); });
    var target = document.querySelector('.sim-nav-item[data-cate="' + nextCate + '"]');
    if (target) target.classList.add('active');

    var cache = getCategoryCache(currentSlotId, nextCate);
    var colLeft = document.getElementById('colLeft');
    var colRight = document.getElementById('colRight');
    if (colLeft) colLeft.innerHTML = cache.leftHTML || '';
    if (colRight) colRight.innerHTML = cache.rightHTML || '';

    var isEmpty = (!cache.leftHTML && !cache.rightHTML) || (colLeft && colLeft.children.length === 0 && colRight && colRight.children.length === 0);
    if (isEmpty) {
      renderInitialLayout();
    }
    rebindSimulatorDnD();
    updateCardBadges();
  }

  function getCategoryCache(slotId, cateId) {
    if (!slotCategoryCache[slotId]) slotCategoryCache[slotId] = {};
    if (!slotCategoryCache[slotId][cateId]) {
      slotCategoryCache[slotId][cateId] = { icon: '🎁', name: '新分类', isDefault: false, leftHTML: '', rightHTML: '' };
    }
    return slotCategoryCache[slotId][cateId];
  }

  function saveCurrentCanvas() {
    if (!currentCate) return;
    var cache = getCategoryCache(currentSlotId, currentCate);
    var colLeft = document.getElementById('colLeft');
    var colRight = document.getElementById('colRight');
    if (colLeft) cache.leftHTML = colLeft.innerHTML;
    if (colRight) cache.rightHTML = colRight.innerHTML;
  }

  // ===== 添加/编辑/删除分类 =====
  function addNewCategory() {
    var uniqueId = 'cate_' + Date.now();
    if (!slotCategoryCache[currentSlotId]) slotCategoryCache[currentSlotId] = {};
    slotCategoryCache[currentSlotId][uniqueId] = { icon: '🎁', name: '新分类', isDefault: false, leftHTML: '', rightHTML: '' };
    saveCurrentCanvas();
    renderNavMenu();
    switchCategory(uniqueId);
    markDirty();
  }

  function openCateModal(navItem) {
    currentEditCateNav = navItem;
    var cate = navItem.getAttribute('data-cate');
    var cache = getCategoryCache(currentSlotId, cate);
    document.getElementById('cateIconInput').value = cache.icon || '🎁';
    document.getElementById('cateNameInput').value = cache.name || '';
    openModalBase('cateModalOverlay', 'cateModal');
  }

  function saveCateConfig() {
    var iconVal = document.getElementById('cateIconInput').value || '🎁';
    var nameVal = document.getElementById('cateNameInput').value || '未命名';
    if (currentEditCateNav) {
      var cate = currentEditCateNav.getAttribute('data-cate');
      var cache = getCategoryCache(currentSlotId, cate);
      cache.icon = iconVal;
      cache.name = nameVal;
      currentEditCateNav.querySelector('.sim-nav-icon').innerText = iconVal;
      currentEditCateNav.querySelector('.sim-nav-text').innerText = nameVal;
    }
    closeBenefitModal('cateModalOverlay');
    markDirty();
  }

  function deleteCategory(cateId) {
    if (!cateId) return;
    var cache = getCategoryCache(currentSlotId, cateId);
    if (cache.isDefault) return;
    if (!confirm('确定要删除该导航分类及其画布内容吗？')) return;
    saveCurrentCanvas();
    delete slotCategoryCache[currentSlotId][cateId];
    if (currentCate === cateId) {
      currentCate = null;
      var fc = getFirstCategoryId();
      if (fc) switchCategory(fc);
    }
    renderNavMenu();
    markDirty();
  }

  // ===== HTML生成 =====
  function generateModuleHtml(title, logo) {
    title = title || '点击配置标题';
    logo = logo || 'https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbXepXa-50-50.png';
    var id = 'mod-' + (globalIndex++);
    return (
      '<div class="module-group" id="' + id + '" draggable="true">' +
        '<div class="del-btn" data-delete="' + id + '">✕</div>' +
        '<div class="module-title-bar" data-edit-module="' + id + '">' +
          '<img src="' + escAttr(logo) + '" class="module-logo" onerror="this.style.display=\'none\'">' +
          '<span class="module-title-text">' + escHtml(title) + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function generateCardHtml(isInner, platform, activity) {
    var id = 'card-' + (globalIndex++);
    var dragAttr = isInner ? '' : ' draggable="true"';
    var delBtn = isInner ? '' : '<div class="del-btn" data-delete="' + id + '">✕</div>';
    var extraClass = isInner ? ' inner-card' : '';
    platform = platform || '--';
    activity = activity || '--';

    return (
      '<div class="card' + extraClass + '" id="' + id + '"' + dragAttr + '>' +
        delBtn +
	'<span class="card-missing-badge" style="display:none"></span>' +
        '<div class="card-img-box">' +
          '<span class="img-text">配置图片</span>' +
          '<img src="" alt="" style="display:none">' +
        '</div>' +
        '<div class="card-info">' +
          '<div class="c-main">主标题占位</div>' +
          '<div class="c-sub">副标题占位</div>' +
        '</div>' +
        '<div class="card-meta">' +
          '<div class="meta-row"><span class="meta-label">平台</span><span class="meta-value platform-val">' + escHtml(platform) + '</span></div>' +
          '<div class="meta-row"><span class="meta-label">活动</span><span class="meta-value activity-val">' + escHtml(activity) + '</span></div>' +
        '</div>' +
      '</div>'
    );
  }

  function generateRow2Html() {
    var id = 'row2-' + (globalIndex++);
    return (
      '<div class="row-2" id="' + id + '" draggable="true">' +
        '<div class="del-btn" data-delete="' + id + '">✕</div>' +
        generateCardHtml(true) +
        generateCardHtml(true) +
      '</div>'
    );
  }

  // ===== 初始布局 =====
  function renderInitialLayout() {
    var colLeft = document.getElementById('colLeft');
    var colRight = document.getElementById('colRight');
    if (!colLeft || !colRight) return;
    colLeft.innerHTML =
      generateModuleHtml('淘宝红包', 'https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbXepXa-50-50.png') +
      generateCardHtml(false, '美团', '闪购') + generateCardHtml(false, '饿了么', '外卖节') +
      generateModuleHtml('美团红包', 'https://p0.meituan.net/travelcube/162815f917c385b01889dc801db87bf431186.png') +
      generateCardHtml(false, '饿了么', '品牌日');
    colRight.innerHTML =
      generateModuleHtml('限时优惠', '🔥') +
      generateCardHtml(false, '美团', '外卖节') + generateCardHtml(false, '饿了么', '口令');
    rebindSimulatorDnD();
    saveCurrentCanvas();
  }

  // ===== 拖拽 =====
  function getDragAfterElement(container, y) {
    var draggable = [];
    var children = container.children;
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c.classList.contains('placeholder') || c.classList.contains('dragging') || c.classList.contains('inner-card')) continue;
      if (c.classList.contains('module-group') || c.classList.contains('card') || c.classList.contains('row-2')) draggable.push(c);
    }
    return draggable.reduce(function (closest, child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      return (offset < 0 && offset > closest.offset) ? { offset: offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function bindSimulatorElementDnD(el) {
    if (!el) return;
    el.addEventListener('dragstart', function (e) {
      if (e.target.classList.contains('del-btn')) {
        e.preventDefault(); return;
      }
      draggedSourceType = 'simulator';
      draggedElement = el;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', el.id); } catch (ex) {}
    });
    el.addEventListener('dragend', function () {
      el.classList.remove('dragging');
      draggedElement = null;
      draggedSourceType = null;
      document.querySelectorAll('.placeholder').forEach(function (p) { p.remove(); });
      markDirty();
    });
  }

  function rebindSimulatorDnD() {
    document.querySelectorAll('.sim-content .module-group, .sim-content .card:not(.inner-card), .sim-content .row-2').forEach(function (el) {
      bindSimulatorElementDnD(el);
    });
  }

  function deleteElement(id) {
    var el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0'; el.style.transform = 'scale(0.8)';
      setTimeout(function () { el.remove(); markDirty(); }, 200);
    }
  }

  // ===== 弹窗基础 =====
  function openModalBase(overlayId, modalId) {
    var overlay = document.getElementById(overlayId);
    var modal = document.getElementById(modalId);
    if (!overlay) return;
    overlay.style.display = 'flex';
    setTimeout(function () { overlay.style.opacity = '1'; if (modal) modal.style.transform = 'translateY(0)'; }, 10);
  }

  function closeBenefitModal(overlayId) {
    var overlay = document.getElementById(overlayId);
    if (!overlay) return;
    var modal = overlay.querySelector('.benefit-modal');
    overlay.style.opacity = '0';
    if (modal) modal.style.transform = 'translateY(-20px)';
    setTimeout(function () { overlay.style.display = 'none'; }, 300);
  }

  // ---- 模块标题编辑 ----
  function openModuleTitleModal(modId) {
    currentEditModuleId = modId;
    var dom = document.getElementById(modId);
    if (!dom) return;
    document.getElementById('moduleTitleInput').value = (dom.querySelector('.module-title-text') || {}).innerText || '';
    var logo = dom.querySelector('.module-logo');
    document.getElementById('moduleLogoInput').value = logo ? (logo.src.indexOf('data:image') !== -1 ? '' : logo.src) : '';
    openModalBase('moduleTitleModalOverlay', 'moduleTitleModal');
  }

  function saveModuleTitle() {
    var t = document.getElementById('moduleTitleInput').value;
    var l = document.getElementById('moduleLogoInput').value;
    var dom = document.getElementById(currentEditModuleId);
    if (!dom) return;
    if (t) { var te = dom.querySelector('.module-title-text'); if (te) te.innerText = t; }
    if (l) { var le = dom.querySelector('.module-logo'); if (le) le.src = l; }
    closeBenefitModal('moduleTitleModalOverlay');
    markDirty();
    showBenefitToast('模块标题已更新（未保存）', 'info');
  }

  // ===== 保存逻辑 =====
  function markDirty() { isDirty = true; updateSaveButton(); updateCardBadges(); }

  function updateSaveButton() {
    var btn = document.getElementById('btnSaveConfig');
    var hint = document.getElementById('saveHint');
    if (btn) {
      btn.disabled = !isDirty;
      if (isDirty) { btn.classList.add('is-dirty'); btn.textContent = '💾 保存配置（有未保存修改）'; }
      else { btn.classList.remove('is-dirty'); btn.textContent = '💾 保存配置'; }
    }
    if (hint) {
      hint.textContent = isDirty ? '⚠ 有未保存的修改' : '✅ 所有修改已保存';
      hint.className = 'save-hint' + (isDirty ? ' is-dirty' : '');
    }
  }

  // ===== 卡片角标：推广位缺失数量 =====
  function countMissingPromosForPlatform(platformLabel) {
    var allPromos = (window.MockData && window.MockData.getAllPromotions) ? window.MockData.getAllPromotions() : [];
    var enabledPromos = allPromos.filter(function (p) { return p.benefitPageEnabled; });
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    var groupMap = {};
    (window.MockData && window.MockData.thirdPartyGroups || []).forEach(function (g) { groupMap[g.id] = g.name; });

    // 找到平台对应的第三方活动分组
    var targetGroupIds = [];
    Object.keys(groupMap).forEach(function (gid) {
      if (groupMap[gid] === platformLabel) targetGroupIds.push(gid);
    });
    // "其他"映射：美团/饿了么不直接对应京东/打车，归入"其他"
    if (targetGroupIds.length === 0) {
      Object.keys(groupMap).forEach(function (gid) {
        if (groupMap[gid] === '其他') targetGroupIds.push(gid);
      });
    }

    var count = 0;
    enabledPromos.forEach(function (promo) {
      var hasMissing = false;
      thirdActs.forEach(function (act) {
        if (targetGroupIds.indexOf(act.groupId) === -1) return;
        if (act.useUnifiedPath && act.unifiedPath && act.unifiedPath.trim() !== '') return;
        var paths = act.promoPaths || {};
        if (!paths[promo.id] || !paths[promo.id].trim()) hasMissing = true;
      });
      if (hasMissing) count++;
    });
    return count;
  }

  function updateCardBadges() {
    var skipPlatforms = ['美团', '饿了么'];
    var cards = document.querySelectorAll('.sim-content .card:not(.inner-card)');
    cards.forEach(function (card) {
      var badge = card.querySelector('.card-missing-badge');
      if (!badge) return;
      var platformEl = card.querySelector('.platform-val');
      var platform = platformEl ? platformEl.textContent.trim() : '';
      if (!platform || platform === '--' || skipPlatforms.indexOf(platform) !== -1) {
        badge.style.display = 'none';
        card.style.borderColor = '';
        return;
      }
      var count = countMissingPromosForPlatform(platform);
      if (count > 0) {
        badge.textContent = count + '个推广位待配置';
        badge.className = 'card-missing-badge badge-warn';
        badge.style.display = '';
        card.style.borderColor = '#ff4d4f';
      } else {
        badge.textContent = '已全部配置';
        badge.className = 'card-missing-badge badge-ok';
        badge.style.display = '';
        card.style.borderColor = '#52c41a';
      }
    });
  }

  // ===== 缺失第三方活动路径检查 =====
  function getMissingActivitiesForSave() {
    var allPromos = (window.MockData && window.MockData.getAllPromotions) ? window.MockData.getAllPromotions() : [];
    var enabledPromos = allPromos.filter(function (p) { return p.benefitPageEnabled; });
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];

    var result = [];
    enabledPromos.forEach(function (promo) {
      var missingActs = [];
      thirdActs.forEach(function (act) {
        if (act.useUnifiedPath && act.unifiedPath && act.unifiedPath.trim() !== '') return;
        var paths = act.promoPaths || {};
        var val = paths[promo.id] || '';
        if (!val.trim()) {
          missingActs.push({
            id: act.id,
            name: act.name,
            appId: act.appId,
            platform: act.platform || '',
            groupId: act.groupId,
            currentPath: '',
            isPreset: !!act.isPreset
          });
        }
      });
      if (missingActs.length > 0) {
        result.push({
          promoId: promo.id,
          promoName: promo.name,
          groupName: promo.groupName || '',
          missingActs: missingActs
        });
      }
    });
    return result;
  }

  function openMissingCheckModal(missingData) {
    var overlay = document.getElementById('missingCheckOverlay');
    if (!overlay) return;
    renderMissingCheckBody(missingData);
    overlay.style.display = 'flex';
    setTimeout(function () { overlay.style.opacity = '1'; }, 10);
  }

  function closeMissingCheckModal() {
    var overlay = document.getElementById('missingCheckOverlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(function () { overlay.style.display = 'none'; }, 300);
  }

  function renderMissingCheckBody(missingData) {
    var body = document.getElementById('missingCheckBody');
    var hint = document.getElementById('missingCheckHint');
    if (!body) return;

    if (!missingData || missingData.length === 0) {
      body.innerHTML = '<div class="mc-empty-hint"><span class="mc-empty-icon">✅</span>所有推广位活动路径已配置完毕</div>';
      if (hint) hint.textContent = '';
      return;
    }

    if (hint) hint.textContent = '共 ' + missingData.length + ' 个推广位存在缺失路径，请补全或关闭推广';

    var groupMap = {};
    (window.MockData && window.MockData.thirdPartyGroups || []).forEach(function (g) {
      groupMap[g.id] = g.name;
    });

    var html = '';
    missingData.forEach(function (promo) {
      html += '<div class="mc-promo-group" data-promo-id="' + escAttr(promo.promoId) + '">';
      html += '<div class="mc-promo-header">';
      html += '<div><span class="mc-promo-name">推广位名称：' + escHtml(promo.promoName) + '</span><span class="mc-promo-id">' + escHtml(promo.promoId) + '</span><span class="mc-badge">' + promo.missingActs.length + '</span></div>';
      html += '<div class="mc-promo-actions">';
      html += '<button class="mc-btn-close-promo" data-close-promo="' + escAttr(promo.promoId) + '">关闭该推广位推广</button>';
      html += '</div></div>';

      html += '<table class="mc-path-table"><thead><tr><th style="width:28%">第三方活动</th><th style="width:20%">APPID</th><th style="width:12%">分组</th><th style="width:30%">小程序路径</th><th style="width:10%">状态</th></tr></thead><tbody>';

      promo.missingActs.forEach(function (act) {
        var isEmpty = !act.currentPath.trim();
        var groupName = groupMap[act.groupId] || act.groupId || '—';
        html += '<tr data-act-id="' + escAttr(act.id) + '">';
        html += '<td><span class="mc-act-name">' + escHtml(act.name) + '</span></td>';
        html += '<td><code class="mc-act-appid">' + escHtml(act.appId) + '</code></td>';
        html += '<td><span class="mc-act-platform">' + escHtml(groupName) + '</span></td>';
        html += '<td><input type="text" class="mc-path-input' + (isEmpty ? ' is-empty' : ' is-filled') + '" value="' + escAttr(act.currentPath) + '" placeholder="输入小程序路径" data-act-id="' + escAttr(act.id) + '" data-promo-id="' + escAttr(promo.promoId) + '"></td>';
        html += '<td><span class="mc-status-tag is-missing">缺失</span></td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';
    });

    body.innerHTML = html;

    body.querySelectorAll('.mc-path-input').forEach(function (input) {
      input.addEventListener('input', function () {
        var row = input.closest('tr');
        var statusEl = row.querySelector('.mc-status-tag');
        var isEmpty = !input.value.trim();
        input.classList.toggle('is-empty', isEmpty);
        input.classList.toggle('is-filled', !isEmpty);
        if (statusEl) {
          statusEl.textContent = isEmpty ? '缺失' : '已配置';
          statusEl.className = 'mc-status-tag ' + (isEmpty ? 'is-missing' : 'is-ok');
        }
        updateMissingCheckHint();
      });
    });

    body.querySelectorAll('.mc-btn-close-promo').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var promoId = btn.getAttribute('data-close-promo');
        handleClosePromoInCheck(promoId, btn);
      });
    });
  }

  function updateMissingCheckHint() {
    var body = document.getElementById('missingCheckBody');
    var hint = document.getElementById('missingCheckHint');
    if (!body || !hint) return;
    var inputs = body.querySelectorAll('.mc-path-input.is-empty:not([disabled])');
    var groups = body.querySelectorAll('.mc-promo-group');
    var activeGroups = 0;
    groups.forEach(function (g) {
      var btn = g.querySelector('.mc-btn-close-promo');
      if (btn && !btn.classList.contains('disabled-promo')) activeGroups++;
    });
    if (activeGroups === 0) {
      hint.textContent = '所有推广位已关闭推广，可直接保存';
      hint.style.color = '#52c41a';
    } else if (inputs.length === 0) {
      hint.textContent = '所有缺失路径已补全，可以保存';
      hint.style.color = '#52c41a';
    } else {
      hint.textContent = '共 ' + inputs.length + ' 项缺失路径待配置';
      hint.style.color = '#ff4d4f';
    }
  }

  function handleClosePromoInCheck(promoId, btn) {
    if (btn.classList.contains('disabled-promo')) return;

    var allPromos = window.MockData.getAllPromotions();
    var promo = null;
    for (var i = 0; i < allPromos.length; i++) {
      if (allPromos[i].id === promoId) { promo = allPromos[i]; break; }
    }
    if (promo) {
      promo.benefitPageEnabled = false;
      var groups = window.MockData.promotionGroups;
      groups.forEach(function (g) {
        (g.promotions || []).forEach(function (p) {
          if (p.id === promoId) p.benefitPageEnabled = false;
        });
      });
    }

    btn.textContent = '已关闭推广';
    btn.classList.add('disabled-promo');
    var group = btn.closest('.mc-promo-group');
    if (group) {
      group.style.opacity = '0.5';
      var inputs = group.querySelectorAll('.mc-path-input');
      inputs.forEach(function (inp) { inp.disabled = true; });
    }
    updateMissingCheckHint();
  }

  function handleCancelMissingCheck() {
    closeMissingCheckModal();
  }

  function handleSkipMissingCheck() {
    closeMissingCheckModal();
    doSaveConfig();
  }

  function handleSaveMissingCheck() {
    var body = document.getElementById('missingCheckBody');
    if (!body) return;

    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    var inputs = body.querySelectorAll('.mc-path-input:not([disabled])');
    inputs.forEach(function (input) {
      var actId = input.getAttribute('data-act-id');
      var promoId = input.getAttribute('data-promo-id');
      var val = input.value.trim();
      if (!val) return;
      for (var i = 0; i < thirdActs.length; i++) {
        if (thirdActs[i].id === actId) {
          if (!thirdActs[i].promoPaths) thirdActs[i].promoPaths = {};
          thirdActs[i].promoPaths[promoId] = val;
          break;
        }
      }
    });

    closeMissingCheckModal();
    doSaveConfig();
  }

  function doSaveConfig() {
    if (!isDirty) return;
    saveCurrentCanvas();
    try {
      var all = {};
      Object.keys(slotCategoryCache).forEach(function (sid) { all[sid] = slotCategoryCache[sid]; });
      localStorage.setItem('benefit_config_cache', JSON.stringify(all));
      localStorage.setItem('benefit_slot_paths', JSON.stringify(slotPaths));
    } catch (e) {}
    isDirty = false;
    updateSaveButton();
    showBenefitToast('配置保存成功！', 'success');
    updateCardBadges();
  }

  function saveAllConfig() {
    if (!isDirty) return;

    var missingData = getMissingActivitiesForSave();
    if (missingData.length > 0) {
      openMissingCheckModal(missingData);
    } else {
      doSaveConfig();
    }
  }

  // ===== 平台推广位路径配置抽屉 =====
  var ppdPlatform = '';

  function getThirdPartyGroupForPlatform(platformLabel) {
    var groups = (window.MockData && window.MockData.thirdPartyGroups) ? window.MockData.thirdPartyGroups : [];
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].name === platformLabel) return groups[i];
    }
    return null;
  }

  function openPlatformPathDrawer(platform) {
    ppdPlatform = platform;
    renderPlatformPathDrawer();
    openModalAnimated(document.getElementById('platformPathDrawerOverlay'));
  }

  function closePlatformPathDrawer() {
    closeModalAnimated(document.getElementById('platformPathDrawerOverlay'));
  }

  function renderPlatformPathDrawer() {
    var body = document.getElementById('ppdBody');
    if (!body) return;

    var group = getThirdPartyGroupForPlatform(ppdPlatform);
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    var groupActs = thirdActs.filter(function (act) {
      return group && act.groupId === group.id;
    });

    var allPromos = (window.MockData && window.MockData.getAllPromotions) ? window.MockData.getAllPromotions() : [];

    if (groupActs.length === 0 || allPromos.length === 0) {
      body.innerHTML = '<div style="text-align:center;color:#999;padding:60px 20px;font-size:14px;">暂无数据</div>';
      return;
    }

    var html = '';
    groupActs.forEach(function (act) {
      var useUnified = !!(act.useUnifiedPath);
      var unifiedPath = act.unifiedPath || '';

      html += '<div class="tpa-drawer-card" style="margin-bottom:20px;">';
      // 活动信息
      html += '<div class="drawer-activity-info" style="margin-bottom:12px;">';
      html += '<div class="drawer-activity-tags">';
      html += '<span class="tpa-platform-tag">' + escHtml(ppdPlatform) + '</span>';
      html += '<span class="drawer-activity-name">' + escHtml(act.name) + '</span>';
      html += '</div></div>';
      html += '<div class="tpa-drawer-appid" style="margin-bottom:12px;">';
      html += '<span>AppID：</span><code>' + escHtml(act.appId) + '</code>';
      html += '</div>';

      // 路径配置卡片
      html += '<div style="border:1px solid #e8e8e8;border-radius:6px;overflow:hidden;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#fafafa;border-bottom:1px solid #f0f0f0;">';
      html += '<span style="font-weight:500;font-size:13px;">推广路径配置</span>';
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<span style="font-size:11px;color:#999;">统一路径</span>';
      html += '<label class="switch"><input type="checkbox" class="ppd-unified-toggle" data-act-id="' + escAttr(act.id) + '"' + (useUnified ? ' checked' : '') + '><span class="switch-slider"></span></label>';
      html += '</div></div>';

      html += '<div style="padding:12px 14px;">';
      html += '<div class="tpa-drawer-hint" style="font-size:11px;color:#999;margin-bottom:10px;">开启后所有推广位使用同一个小程序路径，无需逐个配置</div>';

      // 统一路径输入
      html += '<div class="ppd-unified-box" data-act-id="' + escAttr(act.id) + '" style="' + (useUnified ? '' : 'display:none') + ';margin-bottom:10px;">';
      html += '<div style="display:flex;gap:8px;">';
      html += '<input type="text" class="input ppd-unified-input" value="' + escAttr(unifiedPath) + '" placeholder="请输入统一的小程序路径" style="flex:1;" data-act-id="' + escAttr(act.id) + '">';
      html += '<button class="btn btn-primary btn-sm ppd-save-unified" data-act-id="' + escAttr(act.id) + '">保存路径</button>';
      html += '</div></div>';

      // 推广位表格
      html += '<div class="ppd-table-box" data-act-id="' + escAttr(act.id) + '" style="' + (useUnified ? 'display:none' : '') + ';">';
      html += '<div class="path-drawer-table-wrap">';
      html += '<table class="path-drawer-table"><thead><tr>';
      html += '<th style="width:25%;">推广位名称</th><th style="width:60%;">小程序路径</th><th style="width:15%;">操作</th>';
      html += '</tr></thead><tbody>';

      allPromos.forEach(function (promo) {
        var paths = act.promoPaths || {};
        var pathVal = paths[promo.id] || '';
        var isEmpty = !pathVal.trim();
        html += '<tr>';
        html += '<td style="font-size:13px;">' + escHtml(promo.name) + '</td>';
        html += '<td><input type="text" class="path-drawer-input' + (isEmpty ? ' is-empty' : '') + '" value="' + escAttr(pathVal) + '" placeholder="请输入小程序路径" data-act-id="' + escAttr(act.id) + '" data-promo-id="' + escAttr(promo.id) + '"></td>';
        html += '<td><button class="btn btn-primary btn-sm ppd-save-row" data-act-id="' + escAttr(act.id) + '" data-promo-id="' + escAttr(promo.id) + '">保存</button></td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';
      html += '<div style="margin-top:10px;text-align:right;">';
      html += '<button class="btn btn-primary ppd-save-all" data-act-id="' + escAttr(act.id) + '">一键保存全部</button>';
      html += '</div></div>'; // ppd-table-box

      html += '</div></div>'; // card body + card
      html += '</div>'; // tpa-drawer-card
    });

    body.innerHTML = html;

    // 统一路径开关
    body.querySelectorAll('.ppd-unified-toggle').forEach(function (toggle) {
      toggle.addEventListener('change', function () {
        var actId = this.getAttribute('data-act-id');
        var act = findThirdPartyAct(actId);
        if (!act) return;
        var willUnified = this.checked;
        if (!willUnified && act.useUnifiedPath) {
          // 关闭统一路径时，把统一路径填到各行
          var unified = body.querySelector('.ppd-unified-input[data-act-id="' + actId + '"]');
          var unifiedVal = unified ? unified.value.trim() : act.unifiedPath;
          if (unifiedVal) {
            body.querySelectorAll('.path-drawer-input[data-act-id="' + actId + '"]').forEach(function (inp) {
              inp.value = unifiedVal;
              inp.classList.remove('is-empty');
            });
          }
        }
        act.useUnifiedPath = willUnified;
        body.querySelector('.ppd-unified-box[data-act-id="' + actId + '"]').style.display = willUnified ? '' : 'none';
        body.querySelector('.ppd-table-box[data-act-id="' + actId + '"]').style.display = willUnified ? 'none' : '';
      });
    });

    // 统一路径保存
    body.querySelectorAll('.ppd-save-unified').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var actId = this.getAttribute('data-act-id');
        var act = findThirdPartyAct(actId);
        if (!act) return;
        var input = body.querySelector('.ppd-unified-input[data-act-id="' + actId + '"]');
        act.unifiedPath = input ? input.value.trim() : '';
        window.showToast('统一路径保存成功', 'success');
      });
    });

    // 行级保存
    body.querySelectorAll('.ppd-save-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var actId = this.getAttribute('data-act-id');
        var promoId = this.getAttribute('data-promo-id');
        var act = findThirdPartyAct(actId);
        if (!act) return;
        var input = body.querySelector('.path-drawer-input[data-act-id="' + actId + '"][data-promo-id="' + promoId + '"]');
        if (!input) return;
        if (!act.promoPaths) act.promoPaths = {};
        act.promoPaths[promoId] = input.value.trim();
        input.classList.toggle('is-empty', !input.value.trim());
        window.showToast('保存成功', 'success');
        updateCardBadges();
      });
    });

    // 一键保存全部
    body.querySelectorAll('.ppd-save-all').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var actId = this.getAttribute('data-act-id');
        var act = findThirdPartyAct(actId);
        if (!act) return;
        if (!act.promoPaths) act.promoPaths = {};
        var inputs = body.querySelectorAll('.path-drawer-input[data-act-id="' + actId + '"]');
        var savedCount = 0;
        inputs.forEach(function (inp) {
          act.promoPaths[inp.getAttribute('data-promo-id')] = inp.value.trim();
          inp.classList.remove('is-empty');
          savedCount++;
        });
        window.showToast('已保存 ' + savedCount + ' 条推广位路径', 'success');
        updateCardBadges();
      });
    });
  }

  function findThirdPartyAct(actId) {
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    for (var i = 0; i < thirdActs.length; i++) {
      if (thirdActs[i].id === actId) return thirdActs[i];
    }
    return null;
  }

  // ===== Toast =====
  function showBenefitToast(msg, type) {
    var toast = document.getElementById('benefitToast');
    if (!toast) return;
    toast.textContent = (type === 'success' ? '✅ ' : 'ℹ️ ') + msg;
    toast.className = 'toast-msg show';
    toast.style.borderLeftColor = type === 'success' ? '#52c41a' : '#1677ff';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function () { toast.className = 'toast-msg'; }, 2500);
  }

  // ===== 组件库动态渲染 =====
  function renderCompLibrary() {
    var activities = (window.MockData && window.MockData.availableActivities) ? window.MockData.availableActivities : [];
    var platforms = [];
    var seen = {};
    activities.forEach(function (act) {
      var key = act.platform;
      if (!seen[key]) {
        seen[key] = true;
        platforms.push({ key: key, label: act.platformLabel || key });
      }
    });

    var tabsHtml = '<span class="comp-tab active" data-platform="all">全部</span>';
    platforms.forEach(function (p) {
      tabsHtml += '<span class="comp-tab" data-platform="' + escAttr(p.key) + '">' + escHtml(p.label) + '</span>';
    });
    var tabsEl = document.getElementById('compTabs');
    if (tabsEl) tabsEl.innerHTML = tabsHtml;

    renderCompItems(activities);

    if (tabsEl) {
      tabsEl.querySelectorAll('.comp-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabsEl.querySelectorAll('.comp-tab').forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          filterCompLibrary(tab.getAttribute('data-platform'), activities);
        });
      });
    }
  }

  function renderCompItems(activities) {
    var listEl = document.getElementById('compLibList');
    if (!listEl) return;
    var html = '';
    activities.forEach(function (act) {
      html +=
        '<div class="comp-item" draggable="true" data-type="card" data-platform="' + escAttr(act.platformLabel || act.platform) + '" data-activity="' + escAttr(act.name) + '">' +
          '<span class="comp-icon">📦</span>' +
          '<div class="comp-info">' +
            '<span class="comp-platform">' + escHtml(act.platformLabel || act.platform) + '</span>' +
            '<span class="comp-activity">' + escHtml(act.name) + '</span>' +
          '</div>' +
        '</div>';
    });
    listEl.innerHTML = html;
    bindCompLibDragEvents();
  }

  function filterCompLibrary(platform, activities) {
    if (platform === 'all') {
      renderCompItems(activities);
    } else {
      var filtered = activities.filter(function (act) { return act.platform === platform; });
      renderCompItems(filtered);
    }
  }

  function bindCompLibDragEvents() {
    document.querySelectorAll('.comp-item').forEach(function (item) {
      item.addEventListener('dragstart', function (e) {
        draggedSourceType = 'library';
        var compItem = e.target.closest('.comp-item');
        e.dataTransfer.setData('component-type', compItem.getAttribute('data-type'));
        e.dataTransfer.setData('platform', compItem.getAttribute('data-platform') || '');
        e.dataTransfer.setData('activity', compItem.getAttribute('data-activity') || '');
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
  }

  // ===== 全局事件绑定 =====
  function bindAllEvents() {
    // 放置区
    document.querySelectorAll('.drop-zone').forEach(function (zone) {
      zone.addEventListener('dragover', function (e) {
        e.preventDefault(); zone.classList.add('drag-over');
        var after = getDragAfterElement(zone, e.clientY);
        var ph = zone.querySelector('.placeholder');
        if (!ph && draggedSourceType === 'library') {
          var d = document.createElement('div'); d.className = 'placeholder';
          if (after == null) zone.appendChild(d); else zone.insertBefore(d, after);
        } else if (draggedSourceType === 'simulator' && draggedElement) {
          if (after == null) zone.appendChild(draggedElement); else zone.insertBefore(draggedElement, after);
        }
      });
      zone.addEventListener('dragleave', function (e) {
        zone.classList.remove('drag-over');
        var ph = zone.querySelector('.placeholder');
        if (ph && !zone.contains(e.relatedTarget)) ph.remove();
      });
      zone.addEventListener('drop', function (e) {
        e.preventDefault(); zone.classList.remove('drag-over');
        var ph = zone.querySelector('.placeholder');
        if (draggedSourceType === 'library') {
          var type = e.dataTransfer.getData('component-type');
          var html = '';
          if (type === 'module') {
            html = generateModuleHtml();
          } else if (type === 'card') {
            var platform = e.dataTransfer.getData('platform') || '';
            var activity = e.dataTransfer.getData('activity') || '';
            html = generateCardHtml(false, platform, activity);
          } else if (type === 'row2') {
            html = generateRow2Html();
          }
          if (html) {
            var t = document.createElement('div'); t.innerHTML = html.trim();
            var el = t.firstChild; bindSimulatorElementDnD(el);
            if (ph) { zone.insertBefore(el, ph); ph.remove(); } else zone.appendChild(el);
          }
        }
        draggedSourceType = null; draggedElement = null;
        markDirty();
      });
    });

    // 模拟器点击事件
    var sim = document.getElementById('mobileSimulator');
    if (sim) {
      sim.addEventListener('click', function (e) {
        var del = e.target.closest('.del-btn');
        if (del) { e.stopPropagation(); var did = del.getAttribute('data-delete'); if (did) deleteElement(did); return; }
        var tb = e.target.closest('[data-edit-module]');
        if (tb) { openModuleTitleModal(tb.getAttribute('data-edit-module')); return; }
        // 点击卡片 → 打开平台路径配置抽屉
        var card = e.target.closest('.card:not(.inner-card)');
        if (card) {
          e.stopPropagation();
          var platformEl = card.querySelector('.platform-val');
          var platform = platformEl ? platformEl.textContent.trim() : '';
          if (platform && platform !== '--' && ['美团', '饿了么'].indexOf(platform) === -1) {
            openPlatformPathDrawer(platform);
          }
          return;
        }
      });
    }

    // 导航菜单事件
    var nc = document.getElementById('simNavContainer');
    if (nc) {
      nc.addEventListener('click', function (e) {
        var del = e.target.closest('.nav-del-btn');
        if (del) { e.stopPropagation(); var ni = del.closest('.sim-nav-item'); if (ni) deleteCategory(ni.getAttribute('data-cate')); return; }
        var ed = e.target.closest('.nav-edit-btn');
        if (ed) { e.stopPropagation(); var ni = ed.closest('.sim-nav-item'); if (ni) openCateModal(ni); return; }
        var ni = e.target.closest('.sim-nav-item');
        if (ni) switchCategory(ni.getAttribute('data-cate'));
      });
    }

    var btnAddCate = document.getElementById('btnAddCate');
    if (btnAddCate) btnAddCate.addEventListener('click', addNewCategory);

    // 保存按钮
    var btnSave = document.getElementById('btnSaveConfig');
    if (btnSave) btnSave.addEventListener('click', saveAllConfig);

    // 弹窗绑定
    bindModal('moduleTitleModalOverlay', 'btnCloseModuleTitle', 'btnCancelModuleTitle', 'btnSaveModuleTitle', saveModuleTitle);
    bindModal('cateModalOverlay', 'btnCloseCate', 'btnCancelCate', 'btnSaveCate', saveCateConfig);
    bindModal('manageModalOverlay', 'btnCloseManage', null, 'btnFinishManage', function () { closeBenefitModal('manageModalOverlay'); });

    // ---- 缺失活动检查弹窗 ----
    bindModal('missingCheckOverlay', 'btnCloseMissingCheck', null, null, null);

    var btnCancelMissing = document.getElementById('btnCancelMissing');
    if (btnCancelMissing) btnCancelMissing.addEventListener('click', handleCancelMissingCheck);

    var btnSkipMissing = document.getElementById('btnSkipMissing');
    if (btnSkipMissing) btnSkipMissing.addEventListener('click', handleSkipMissingCheck);

    var btnSaveMissing = document.getElementById('btnSaveMissing');
    if (btnSaveMissing) btnSaveMissing.addEventListener('click', handleSaveMissingCheck);

    // ---- 平台路径配置抽屉 ----
    var btnPpdClose = document.getElementById('btnPpdClose');
    if (btnPpdClose) btnPpdClose.addEventListener('click', closePlatformPathDrawer);

    // ---- 收入流转图放大灯箱 ----
    var chartThumbBox = document.getElementById('chartThumbBox');
    var chartLightbox = document.getElementById('chartLightbox');
    var btnCloseLightbox = document.getElementById('btnCloseLightbox');
    var lightboxBackdrop = chartLightbox ? chartLightbox.querySelector('.lightbox-backdrop') : null;

    if (chartThumbBox && chartLightbox) {
      chartThumbBox.addEventListener('click', function () {
        chartLightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });

      function closeLightbox() {
        chartLightbox.style.display = 'none';
        document.body.style.overflow = '';
      }

      if (btnCloseLightbox) btnCloseLightbox.addEventListener('click', closeLightbox);
      if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && chartLightbox.style.display === 'flex') {
          closeLightbox();
        }
      });
    }
  }

  function bindModal(olId, cbId, cnId, svId, fn) {
    var ol = document.getElementById(olId);
    if (ol) ol.addEventListener('click', function (e) { if (e.target === ol) closeBenefitModal(olId); });
    var cb = document.getElementById(cbId);
    if (cb) cb.addEventListener('click', function () { closeBenefitModal(olId); });
    if (cnId) { var cn = document.getElementById(cnId); if (cn) cn.addEventListener('click', function () { closeBenefitModal(olId); }); }
    var sv = document.getElementById(svId);
    if (sv && fn) sv.addEventListener('click', fn);
  }

  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

})();
