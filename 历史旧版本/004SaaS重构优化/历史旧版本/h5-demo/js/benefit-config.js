/**
 * C04 权益页配置 — 拖拽式可视化编辑器（增强版）
 * 功能：导航菜单管理、slot级推广路径、保存动作
 */
(function () {
  'use strict';

  var globalIndex = 1;
  var draggedElement = null;
  var draggedSourceType = null;
  var currentEditCardId = null;
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
    updateTabActive();
    renderNavMenu();
    renderSlotPaths();

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
    // 确保默认slot存在
    if (!slotPaths['slot_default']) slotPaths['slot_default'] = { miniPath: '', h5Path: '' };
    if (!slotPaths['slot_001']) slotPaths['slot_001'] = { miniPath: '', h5Path: '' };
    if (!slotPaths['slot_002']) slotPaths['slot_002'] = { miniPath: '', h5Path: '' };
    if (!slotPaths['slot_003']) slotPaths['slot_003'] = { miniPath: '', h5Path: '' };
  }

  function renderSlotPaths() {
    var paths = slotPaths[currentSlotId] || { miniPath: '', h5Path: '' };
    var miniText = document.getElementById('slotMiniPathText');
    var h5Text = document.getElementById('slotH5PathText');
    if (miniText) {
      miniText.textContent = paths.miniPath || '暂未配置';
      miniText.className = 'slot-path-text' + (paths.miniPath ? ' has-value' : '');
    }
    if (h5Text) {
      h5Text.textContent = paths.h5Path || '暂未配置';
      h5Text.className = 'slot-path-text' + (paths.h5Path ? ' has-value' : '');
    }
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
    if (isEmpty && nextCate === getFirstCategoryId() && currentSlotId === 'slot_default') {
      renderInitialLayout();
    }
    rebindSimulatorDnD();
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

  function generateCardHtml(isInner) {
    var id = 'card-' + (globalIndex++);
    var dragAttr = isInner ? '' : ' draggable="true"';
    var delBtn = isInner ? '' : '<div class="del-btn" data-delete="' + id + '">✕</div>';
    var extraClass = isInner ? ' inner-card' : '';
    var actionsHtml = isInner ? '' :
      '<div class="card-actions">' +
        '<div class="btn-act style" data-edit-style="' + id + '">🎨 样式</div>' +
        '<div class="btn-act link" data-edit-activity="' + id + '">🔗 活动</div>' +
      '</div>';

    return (
      '<div class="card' + extraClass + '" id="' + id + '"' + dragAttr + '>' +
        delBtn +
        '<div class="card-img-box">' +
          '<span class="img-text">配置图片</span>' +
          '<img src="" alt="" style="display:none">' +
        '</div>' +
        '<div class="card-info">' +
          '<div class="c-main">主标题占位</div>' +
          '<div class="c-sub">副标题占位</div>' +
        '</div>' +
        actionsHtml +
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
      generateCardHtml(false) + generateCardHtml(false) +
      generateModuleHtml('淘宝闪购红包', 'https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbXepXa-50-50.png') +
      generateRow2Html();
    colRight.innerHTML =
      generateModuleHtml('美团红包', 'https://p0.meituan.net/travelcube/162815f917c385b01889dc801db87bf431186.png') +
      generateCardHtml(false) + generateCardHtml(false);
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
      if (e.target.classList.contains('btn-act') || e.target.classList.contains('del-btn') || e.target.closest('.card-actions')) {
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

  // ===== 弹窗 =====
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

  // ---- 模块标题 ----
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
    if (window.showToast) window.showToast('模块标题已更新（未保存）', 'info');
  }

  // ---- 卡片样式 ----
  function openStyleModal(cardId) {
    currentEditCardId = cardId;
    var card = document.getElementById(cardId);
    if (!card) return;
    document.getElementById('styleMainTitle').value = (card.querySelector('.c-main') || {}).innerText || '';
    document.getElementById('styleSubTitle').value = (card.querySelector('.c-sub') || {}).innerText || '';
    document.getElementById('styleImg').value = '';
    openModalBase('styleModalOverlay', 'styleModal');
  }

  function saveStyle() {
    var mt = document.getElementById('styleMainTitle').value;
    var st = document.getElementById('styleSubTitle').value;
    var img = document.getElementById('styleImg').value;
    var card = document.getElementById(currentEditCardId);
    if (!card) return;
    if (mt) { var m = card.querySelector('.c-main'); if (m) m.innerText = mt; }
    if (st) { var s = card.querySelector('.c-sub'); if (s) s.innerText = st; }
    if (img) {
      var box = card.querySelector('.card-img-box');
      if (box) {
        var txt = box.querySelector('.img-text'); if (txt) txt.style.display = 'none';
        var im = box.querySelector('img'); if (im) { im.src = img; im.style.display = 'block'; }
      }
    }
    closeBenefitModal('styleModalOverlay');
    markDirty();
    if (window.showToast) window.showToast('卡片样式已更新（未保存）', 'info');
  }

  // ---- 活动选择 ----
  function openActivityModal(cardId) {
    currentEditCardId = cardId;
    var actSelect = document.getElementById('actSelect');
    if (actSelect) {
      var activities = (window.MockData && window.MockData.availableActivities) ? window.MockData.availableActivities : [];
      actSelect.innerHTML = activities.length === 0
        ? '<option value="">暂无可选活动</option>'
        : activities.map(function (a) { return '<option value="' + a.id + '">' + escHtml(a.name) + '（' + escHtml(a.supplierLabel || '') + '）</option>'; }).join('');
    }
    openModalBase('activityModalOverlay', 'activityModal');
  }

  function saveActivity() {
    var actSelect = document.getElementById('actSelect');
    var actId = actSelect ? actSelect.value : '';
    var actName = '';
    if (actSelect && actSelect.options[actSelect.selectedIndex]) actName = actSelect.options[actSelect.selectedIndex].text;
    if (!actId) { if (window.showToast) window.showToast('请选择一个活动', 'error'); return; }
    var card = document.getElementById(currentEditCardId);
    if (card) {
      var m = card.querySelector('.c-main'); if (m) m.innerText = actName;
      card.setAttribute('data-activity-id', actId);
    }
    closeBenefitModal('activityModalOverlay');
    markDirty();
    if (window.showToast) window.showToast('关联活动配置成功（未保存）', 'info');
  }

  // ===== 推广位管理 =====
  function openManageModal() {
    var tabs = document.querySelectorAll('#tabContainer .benefit-tab-item');
    var manageList = document.getElementById('manageList');
    if (!manageList) return;
    manageList.innerHTML = '';
    tabs.forEach(function (tab) {
      var isDefault = tab.querySelector('.tag-default') !== null;
      var isHidden = tab.style.display === 'none';
      var tabName = (tab.innerText || '').replace('默认', '').trim();
      var tabId = tab.getAttribute('data-id');
      var checked = isHidden ? '' : ' checked';
      var disabled = isDefault ? ' disabled' : '';
      manageList.innerHTML +=
        '<li class="manage-item"><label>' +
          '<input type="checkbox" class="checkbox slot-toggle"' + checked + disabled + ' data-tab-id="' + tabId + '">' +
          '<span>' + escHtml(tabName) + (isDefault ? ' <span class="tag-default">默认不可关</span>' : '') + '</span>' +
        '</label></li>';
    });
    openModalBase('manageModalOverlay', 'manageModal');
  }

  function toggleTabVisible(tabId, vis) {
    var tab = document.querySelector('#tabContainer .benefit-tab-item[data-id="' + tabId + '"]');
    if (!tab) return;
    tab.style.display = vis ? 'flex' : 'none';
    if (!vis && tab.classList.contains('active')) {
      var dt = document.querySelector('#tabContainer .benefit-tab-item[data-id="tab-1"]');
      if (dt) dt.classList.add('active');
    }
  }

  // ===== 保存 =====
  function markDirty() { isDirty = true; updateSaveButton(); }

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

  function saveAllConfig() {
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
    if (window.showToast) window.showToast('配置保存成功！', 'success');
  }

  // ===== Tab切换 =====
  function switchSlot(slotId) {
    if (!slotId || slotId === currentSlotId) return;
    saveCurrentCanvas();
    currentSlotId = slotId;
    currentCate = null;
    updateTabActive();
    renderNavMenu();
    renderSlotPaths();
    var fc = getFirstCategoryId();
    if (fc) switchCategory(fc);
    updateSaveButton();
  }

  function updateTabActive() {
    var map = { 'tab-1': 'slot_default', 'tab-2': 'slot_001', 'tab-3': 'slot_002', 'tab-4': 'slot_003' };
    var targetTab = null;
    Object.keys(map).forEach(function (k) { if (map[k] === currentSlotId) targetTab = k; });
    document.querySelectorAll('#tabContainer .benefit-tab-item').forEach(function (el) {
      el.classList.remove('active');
      if (el.getAttribute('data-id') === targetTab) el.classList.add('active');
    });
  }

  // ===== 全局事件 =====
  function bindAllEvents() {
    // 组件库拖拽
    document.querySelectorAll('.comp-item').forEach(function (item) {
      item.addEventListener('dragstart', function (e) {
        draggedSourceType = 'library';
        e.dataTransfer.setData('component-type', e.target.closest('.comp-item').getAttribute('data-type'));
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

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
          if (type === 'module') html = generateModuleHtml();
          else if (type === 'card') html = generateCardHtml(false);
          else if (type === 'row2') html = generateRow2Html();
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

    // 模拟器点击
    var sim = document.getElementById('mobileSimulator');
    if (sim) {
      sim.addEventListener('click', function (e) {
        var del = e.target.closest('.del-btn');
        if (del) { e.stopPropagation(); var did = del.getAttribute('data-delete'); if (did) deleteElement(did); return; }
        var tb = e.target.closest('[data-edit-module]');
        if (tb) { openModuleTitleModal(tb.getAttribute('data-edit-module')); return; }
        var sb = e.target.closest('[data-edit-style]');
        if (sb) { openStyleModal(sb.getAttribute('data-edit-style')); return; }
        var ab = e.target.closest('[data-edit-activity]');
        if (ab) { openActivityModal(ab.getAttribute('data-edit-activity')); return; }
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

    document.getElementById('btnAddCate').addEventListener('click', addNewCategory);

    // Tab切换
    document.getElementById('tabContainer').addEventListener('click', function (e) {
      var item = e.target.closest('.benefit-tab-item');
      if (!item) return;
      var map = { 'tab-1': 'slot_default', 'tab-2': 'slot_001', 'tab-3': 'slot_002', 'tab-4': 'slot_003' };
      var sid = map[item.getAttribute('data-id')];
      if (sid) switchSlot(sid);
    });

    // 保存
    document.getElementById('btnSaveConfig').addEventListener('click', saveAllConfig);
    document.getElementById('btnManageSlots').addEventListener('click', openManageModal);

    // Slot路径复制
    document.getElementById('btnCopyMiniPath').addEventListener('click', function () {
      var p = (slotPaths[currentSlotId] || {}).miniPath || '';
      if (!p) { if (window.showToast) window.showToast('小程序路径暂未配置', 'error'); return; }
      navigator.clipboard.writeText(p).then(function () { if (window.showToast) window.showToast('小程序路径已复制', 'success'); });
    });
    document.getElementById('btnCopyH5Path').addEventListener('click', function () {
      var p = (slotPaths[currentSlotId] || {}).h5Path || '';
      if (!p) { if (window.showToast) window.showToast('H5路径暂未配置', 'error'); return; }
      navigator.clipboard.writeText(p).then(function () { if (window.showToast) window.showToast('H5路径已复制', 'success'); });
    });

    // 弹窗
    bindModal('moduleTitleModalOverlay', 'btnCloseModuleTitle', 'btnCancelModuleTitle', 'btnSaveModuleTitle', saveModuleTitle);
    bindModal('styleModalOverlay', 'btnCloseStyle', 'btnCancelStyle', 'btnSaveStyle', saveStyle);
    bindModal('activityModalOverlay', 'btnCloseActivity', 'btnCancelActivity', 'btnSaveActivity', saveActivity);
    bindModal('cateModalOverlay', 'btnCloseCate', 'btnCancelCate', 'btnSaveCate', saveCateConfig);
    bindModal('manageModalOverlay', 'btnCloseManage', null, 'btnFinishManage', function () { closeBenefitModal('manageModalOverlay'); });

    // 推广位checkbox
    var ml = document.getElementById('manageList');
    if (ml) {
      ml.addEventListener('change', function (e) {
        if (e.target.classList.contains('slot-toggle')) toggleTabVisible(e.target.getAttribute('data-tab-id'), e.target.checked);
      });
    }

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

      // ESC 关闭
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && chartLightbox.style.display === 'flex') {
          closeLightbox();
        }
      });
    }

    // 平台切换联动
    var ap = document.getElementById('actPlatform');
    if (ap) {
      ap.addEventListener('change', function () {
        var platform = this.value;
        var as = document.getElementById('actSelect');
        if (!as) return;
        var acts = (window.MockData && window.MockData.availableActivities) ? window.MockData.availableActivities : [];
        var sm = { taobao: 'eleme', meituan: 'meituan', jd: 'jd' };
        var target = sm[platform] || '';
        var filtered = target ? acts.filter(function (a) { return a.supplier === target; }) : acts;
        as.innerHTML = filtered.length === 0
          ? '<option value="">该平台暂无可选活动</option>'
          : filtered.map(function (a) { return '<option value="' + a.id + '">' + escHtml(a.name) + '（' + escHtml(a.supplierLabel || '') + '）</option>'; }).join('');
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
