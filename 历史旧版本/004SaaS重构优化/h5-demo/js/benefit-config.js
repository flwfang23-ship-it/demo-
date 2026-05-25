/**
 * C04 权益页配置 — 可视化编辑器（优化版）
 * 功能：模拟器编辑、推广位列表管理、缺失活动校验、保存
 */
(function () {
  'use strict';

  var globalIndex = 1;
  var currentSlotId = 'slot_default';
  var currentCate = null;
  var currentEditCardId = null;
  var currentEditModuleId = null;
  var currentEditCateNav = null;
  var isDirty = false;
  var toastTimeout;

  // 分类缓存
  var slotCategoryCache = {};
  // slot级推广路径
  var slotPaths = {};
  // 权益页已选推广位列表
  var benefitPagePromos = [];
  // 关闭确认目标推广位ID
  var closeConfirmPromoId = null;
  // 详情弹窗当前推广位ID
  var currentDetailPromoId = null;
  // 推广位选择器暂存勾选状态
  var pickerCheckState = {};

  // ===== 入口 =====
  window.initBenefitConfig = function () {
    globalIndex = 1;
    currentEditCardId = null;
    currentEditModuleId = null;
    currentEditCateNav = null;
    isDirty = false;

    var colLeft = document.getElementById('colLeft');
    var colRight = document.getElementById('colRight');
    var bottom = document.getElementById('bottomFullWidth');
    if (colLeft) colLeft.innerHTML = '';
    if (colRight) colRight.innerHTML = '';
    if (bottom) bottom.innerHTML = '';

    initSlotPaths();
    initSlotCategoryCache();

    currentSlotId = 'slot_default';
    renderNavMenu();

    var firstCate = getFirstCategoryId();
    if (firstCate) switchCategory(firstCate);

    updateSaveButton();
    bindAllEvents();
    initRightPanel();
    refreshAllCardMissingModules();
  };

  // ===== slot级路径初始化 =====
  function initSlotPaths() {
    var slots = (window.MockData && window.MockData.promotionSlots) ? window.MockData.promotionSlots : [];
    slots.forEach(function (s) {
      slotPaths[s.slotId] = { miniPath: s.miniPath || '', h5Path: s.h5Path || '' };
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
            icon: menu.icon, name: menu.name, isDefault: !!menu.isDefault,
            leftHTML: '', rightHTML: '', bottomHTML: ''
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
          '<div class="sim-nav-icon">' + renderIcon(menu.icon) + '</div>' +
          '<div class="sim-nav-text">' + escHtml(menu.name) + '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  function renderIcon(val) {
    if (!val) return '🎁';
    if (val.startsWith('http') || val.startsWith('data:')) {
      return '<img src="' + escAttr(val) + '" width="28" height="28" style="object-fit:cover;">';
    }
    return escHtml(val);
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
    var bottom = document.getElementById('bottomFullWidth');
    if (colLeft) colLeft.innerHTML = cache.leftHTML || '';
    if (colRight) colRight.innerHTML = cache.rightHTML || '';
    if (bottom) bottom.innerHTML = cache.bottomHTML || '';

    var isEmpty = (!cache.leftHTML && !cache.rightHTML && !cache.bottomHTML);
    if (isEmpty && nextCate === getFirstCategoryId() && currentSlotId === 'slot_default') {
      renderInitialLayout();
    }
    refreshAllCardMissingModules();
  }

  function getCategoryCache(slotId, cateId) {
    if (!slotCategoryCache[slotId]) slotCategoryCache[slotId] = {};
    if (!slotCategoryCache[slotId][cateId]) {
      slotCategoryCache[slotId][cateId] = { icon: '🎁', name: '新分类', isDefault: false, leftHTML: '', rightHTML: '', bottomHTML: '' };
    }
    return slotCategoryCache[slotId][cateId];
  }

  function saveCurrentCanvas() {
    if (!currentCate) return;
    var cache = getCategoryCache(currentSlotId, currentCate);
    var colLeft = document.getElementById('colLeft');
    var colRight = document.getElementById('colRight');
    var bottom = document.getElementById('bottomFullWidth');
    if (colLeft) cache.leftHTML = colLeft.innerHTML;
    if (colRight) cache.rightHTML = colRight.innerHTML;
    if (bottom) cache.bottomHTML = bottom.innerHTML;
  }

  // ===== 分类增删改 =====
  function addNewCategory() {
    var uniqueId = 'cate_' + Date.now();
    if (!slotCategoryCache[currentSlotId]) slotCategoryCache[currentSlotId] = {};
    slotCategoryCache[currentSlotId][uniqueId] = { icon: '🎁', name: '新分类', isDefault: false, leftHTML: '', rightHTML: '', bottomHTML: '' };
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
      currentEditCateNav.querySelector('.sim-nav-icon').innerHTML = renderIcon(iconVal);
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
    logo = logo || '';
    var id = 'mod-' + (globalIndex++);
    var logoHtml = logo
      ? (logo.startsWith('http') || logo.startsWith('data:')
          ? '<img src="' + escAttr(logo) + '" class="module-logo" onerror="this.style.display=\'none\'">'
          : '<span class="module-logo">' + escHtml(logo) + '</span>')
      : '<span class="module-logo" style="background:transparent;box-shadow:none;"></span>';
    return (
      '<div class="module-title-bar" id="' + id + '" data-edit-module="' + id + '">' +
        logoHtml +
        '<span class="module-title-text">' + escHtml(title) + '</span>' +
      '</div>'
    );
  }

  function generateCardHtml(mainTitle, subTitle, platform, activity, color, isMini) {
    mainTitle = mainTitle || '主标题占位';
    subTitle = subTitle || '副标题占位';
    platform = platform || '未配置';
    activity = activity || '未配置';
    color = color || '#ebebeb';
    var id = 'card-' + (globalIndex++);
    var extraClass = isMini ? ' mini-card' : '';
    return (
      '<div class="card' + extraClass + '" id="' + id + '" data-platform="' + escAttr(platform) + '" data-activity="' + escAttr(activity) + '">' +
        '<div class="card-preview">' +
          '<div class="card-img-box" style="background:' + escAttr(color) + '">' +
            '<span class="img-text">配置图片</span>' +
            '<img src="" alt="" style="display:none">' +
          '</div>' +
          '<div class="c-main">' + escHtml(mainTitle) + '</div>' +
          '<div class="c-sub">' + escHtml(subTitle) + '</div>' +
        '</div>' +
        '<div class="card-config-info">' +
          '<div class="info-detail">平台：<span class="plat-text">' + escHtml(platform) + '</span></div>' +
          '<div class="info-detail">活动：<span class="act-text">' + escHtml(activity) + '</span></div>' +
        '</div>' +
        '<div class="card-config-btns">' +
          '<button class="btn-action" data-edit-style="' + id + '">🎨 样式</button>' +
          '<button class="btn-action" data-edit-activity="' + id + '">🔗 活动</button>' +
        '</div>' +
        '<div class="card-missing-module" data-card-tpa-module style="display:none;">' +
          '<div class="card-missing-trigger" data-card-tpa-trigger="' + id + '">' +
            '<span class="card-missing-text" data-card-tpa-text></span>' +
            '<span class="card-missing-arrow">›</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function generateMiniCardRow(card1, card2) {
    return '<div class="mini-card-row">' + card1 + card2 + '</div>';
  }

  // ===== 初始布局 =====
  function renderInitialLayout() {
    var colLeft = document.getElementById('colLeft');
    var colRight = document.getElementById('colRight');
    var bottom = document.getElementById('bottomFullWidth');
    if (!colLeft || !colRight) return;

    colLeft.innerHTML =
      generateModuleHtml('淘宝红包', '🔥') +
      generateCardHtml('10-18元百亿补贴', '疯抢大额补贴', '淘宝联盟', '百亿补贴', '#ff4d4f') +
      generateCardHtml('叠加红包', '同时使用更优惠', '淘宝联盟', '叠红包', '#fa8c16') +
      '<div style="height:10px;"></div>' +
      generateModuleHtml('淘宝闪购红包', 'https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbXepXa-50-50.png') +
      generateMiniCardRow(
        generateCardHtml('天天领红包', '天天必领', '淘宝联盟', '淘宝闪购', '#69b1ff', true),
        generateCardHtml('单单立减', '惊喜红包', '淘宝联盟', '叠红包', '#69b1ff', true)
      ) +
      generateCardHtml('叠加红包', '同时使用更优惠', '淘宝联盟', '叠红包', '#69b1ff');

    colRight.innerHTML =
      generateModuleHtml('美团红包', '🐰') +
      generateCardHtml('美团9元红包', '天天都能领', '美团联盟', '叠红包', '#ffc53d') +
      generateCardHtml('叠加红包', '同时使用更优惠', '美团联盟', '叠红包', '#ffc53d') +
      '<div style="height:10px;"></div>' +
      generateCardHtml('美团试吃官', '最低1元', '美团联盟', '外卖节', '#ff4d4f') +
      '<div style="height:10px;"></div>' +
      generateModuleHtml('京东红包', '🐶') +
      generateMiniCardRow(
        generateCardHtml('先领券', '外卖新势力', '京东联盟', '百亿补贴', '#cf1322', true),
        generateCardHtml('再下单', '享优惠', '京东联盟', '品牌日', '#cf1322', true)
      );

    bottom.innerHTML =
      '<div class="section-divider">打车红包</div>' +
      generateCardHtml('大额打车神券', '抢滴滴出行神券，低至5折', '滴滴出行', '外卖节', '#ffe4e1');

    saveCurrentCanvas();
    refreshAllCardMissingModules();
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
    if (logo) {
      if (logo.tagName === 'IMG') {
        document.getElementById('moduleLogoInput').value = logo.src || '';
      } else {
        document.getElementById('moduleLogoInput').value = logo.innerText || '';
      }
    } else {
      document.getElementById('moduleLogoInput').value = '';
    }
    openModalBase('moduleTitleModalOverlay', 'moduleTitleModal');
  }

  function saveModuleTitle() {
    var t = document.getElementById('moduleTitleInput').value;
    var l = document.getElementById('moduleLogoInput').value;
    var dom = document.getElementById(currentEditModuleId);
    if (!dom) return;
    if (t) { var te = dom.querySelector('.module-title-text'); if (te) te.innerText = t; }
    if (l) {
      var oldLogo = dom.querySelector('.module-logo');
      if (oldLogo) oldLogo.remove();
      var isUrl = l.startsWith('http') || l.startsWith('data:');
      var newLogo = document.createElement(isUrl ? 'img' : 'span');
      newLogo.className = 'module-logo';
      if (isUrl) { newLogo.src = l; } else { newLogo.innerText = l; }
      dom.insertBefore(newLogo, dom.firstChild);
    }
    closeBenefitModal('moduleTitleModalOverlay');
    markDirty();
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
        if (img.startsWith('http') || img.startsWith('data:')) {
          var txt = box.querySelector('.img-text'); if (txt) txt.style.display = 'none';
          var im = box.querySelector('img');
          if (!im) { im = document.createElement('img'); box.appendChild(im); }
          im.src = img; im.style.display = 'block';
        } else {
          box.style.background = img;
          var im2 = box.querySelector('img'); if (im2) im2.style.display = 'none';
          var txt2 = box.querySelector('.img-text'); if (txt2) txt2.style.display = 'block';
        }
      }
    }
    closeBenefitModal('styleModalOverlay');
    markDirty();
  }

  // ---- 活动选择 ----
  function openActivityModal(cardId) {
    currentEditCardId = cardId;
    var card = document.getElementById(cardId);
    if (!card) return;
    document.getElementById('actPlatform').value = card.getAttribute('data-platform') || '美团联盟';
    document.getElementById('actSelect').value = card.getAttribute('data-activity') || '外卖节';
    // 重置新增第三方活动折叠区
    document.getElementById('newTPForm').style.display = 'none';
    document.getElementById('btnToggleNewTP').textContent = '▶ 新增第三方活动';
    document.getElementById('newTpName').value = '';
    document.getElementById('newTpAppId').value = '';
    openModalBase('activityModalOverlay', 'activityModal');
  }

  function saveActivity() {
    var platform = document.getElementById('actPlatform').value;
    var activity = document.getElementById('actSelect').value;
    var card = document.getElementById(currentEditCardId);
    if (!card) return;
    card.setAttribute('data-platform', platform);
    card.setAttribute('data-activity', activity);
    var platEl = card.querySelector('.plat-text'); if (platEl) platEl.innerText = platform;
    var actEl = card.querySelector('.act-text'); if (actEl) actEl.innerText = activity;
    closeBenefitModal('activityModalOverlay');
    // 刷新该卡片的缺失模块
    var card = document.getElementById(currentEditCardId);
    if (card) refreshCardMissingModule(card);
    markDirty();
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
    if (!isDirty) { showFloatingToast('当前没有需要保存的修改'); return; }
    saveCurrentCanvas();
    try {
      var all = {};
      Object.keys(slotCategoryCache).forEach(function (sid) { all[sid] = slotCategoryCache[sid]; });
      localStorage.setItem('benefit_config_cache', JSON.stringify(all));
      localStorage.setItem('benefit_slot_paths', JSON.stringify(slotPaths));
      localStorage.setItem('benefit_page_promos', JSON.stringify(benefitPagePromos));
    } catch (e) {}
    isDirty = false;
    updateSaveButton();
    showFloatingToast('页面配置已成功保存！');
  }

  // ===== 悬浮Toast =====
  function showFloatingToast(msg) {
    var toast = document.getElementById('globalToast');
    if (!toast) return;
    toast.textContent = '✅ ' + msg;
    toast.classList.remove('show');
    clearTimeout(toastTimeout);
    setTimeout(function () {
      toast.classList.add('show');
      toastTimeout = setTimeout(function () { toast.classList.remove('show'); }, 2500);
    }, 50);
  }

  // ===== 右侧面板：推广位列表管理 =====
  function initRightPanel() {
    // 加载已有数据
    try {
      var saved = localStorage.getItem('benefit_page_promos');
      if (saved) benefitPagePromos = JSON.parse(saved);
    } catch (e) { benefitPagePromos = []; }

    // 首次使用时，塞入 demo 推广位（方便展示缺失/已配两种态）
    if (benefitPagePromos.length === 0) {
      benefitPagePromos = ['PROMO_001', 'PROMO_002', 'PROMO_003', 'PROMO_004', 'PROMO_005'];
    }

    // 确保默认推广位始终在列表中
    if (benefitPagePromos.indexOf('PROMO_001') === -1) {
      benefitPagePromos.unshift('PROMO_001');
    }

    renderPromoTable();
  }

  function getAllPromos() {
    return (window.MockData && window.MockData.getAllPromotions) ? window.MockData.getAllPromotions() : [];
  }

  function getPromoById(id) {
    var all = getAllPromos();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function getMissingActivities(promoId) {
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    return thirdActs.filter(function (act) {
      var paths = act.promoPaths || {};
      return !paths[promoId] || paths[promoId].trim() === '';
    });
  }

  function renderPromoTable() {
    var tbody = document.getElementById('promoTableBody');
    var emptyRow = document.getElementById('promoEmptyRow');
    if (!tbody) return;

    // 清理空态行（重建tbody内容）
    var rows = tbody.querySelectorAll('tr:not(#promoEmptyRow)');
    rows.forEach(function (r) { r.remove(); });

    if (benefitPagePromos.length === 0) {
      if (emptyRow) emptyRow.style.display = '';
      return;
    }
    if (emptyRow) emptyRow.style.display = 'none';

    benefitPagePromos.forEach(function (promoId) {
      var promo = getPromoById(promoId);
      if (!promo) return;
      var isDefault = promo.isDefault;
      var missing = getMissingActivities(promoId);
      var missingCount = missing.length;

      var miniPath = promo.miniPath || '';
      var h5Path = promo.h5Path || '';

      var nameHtml = '<span class="promo-name-cell">' + escHtml(promo.name) + '</span>';
      if (isDefault) nameHtml += '<span class="tag-default-sm">默认</span>';

      var missingHtml = '';
      if (missingCount === 0) {
        missingHtml = '<span class="missing-none">✅ 全部已配置</span>';
      } else {
        missingHtml = '<span class="missing-badge">⚠ ' + missingCount + '个活动未配置</span>';
      }

      var actionsHtml = '';
      actionsHtml += '<button class="btn-table-action btn-view-detail" data-detail-promo="' + promoId + '">📋 查看详情</button>';
      if (isDefault) {
        actionsHtml += '<span class="close-disabled-text">不可关闭</span>';
      } else {
        actionsHtml += '<button class="btn-table-action btn-close-row" data-close-promo="' + promoId + '">✕ 关闭</button>';
      }

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + nameHtml + '</td>' +
        '<td>' + escHtml(promo.groupName || '-') + '</td>' +
        '<td><span class="path-text' + (miniPath ? ' has-value' : '') + '" title="' + escAttr(miniPath || '未配置') + '">' + escHtml(miniPath || '未配置') + '</span></td>' +
        '<td><span class="path-text' + (h5Path ? ' has-value' : '') + '" title="' + escAttr(h5Path || '未配置') + '">' + escHtml(h5Path || '未配置') + '</span></td>' +
        '<td>' + missingHtml + '</td>' +
        '<td>' + actionsHtml + '</td>';
      tbody.appendChild(tr);
    });
  }

  // ===== 选择推广位弹窗 =====
  function openPromoPicker() {
    var list = document.getElementById('promoPickerList');
    if (!list) return;

    var groups = (window.MockData && window.MockData.promotionGroups) ? window.MockData.promotionGroups : [];

    // 构建暂存勾选状态
    pickerCheckState = {};
    var allIds = [];
    groups.forEach(function (g) {
      (g.promotions || []).forEach(function (p) { allIds.push(p.id); });
    });
    allIds.forEach(function (id) {
      pickerCheckState[id] = benefitPagePromos.indexOf(id) !== -1;
    });
    // 默认推广位始终勾选
    pickerCheckState['PROMO_001'] = true;

    var html = '';
    groups.forEach(function (g) {
      html += '<div class="promo-picker-group-label">' + escHtml(g.name) + '</div>';
      (g.promotions || []).forEach(function (p) {
        var checked = pickerCheckState[p.id] ? ' checked' : '';
        var disabled = p.isDefault ? ' disabled' : (benefitPagePromos.indexOf(p.id) !== -1 && !p.isDefault ? '' : '');
        var rowClass = pickerCheckState[p.id] ? ' is-checked' : '';
        if (disabled) rowClass += ' is-disabled';
        html += '<label class="promo-picker-item' + rowClass + '">';
        html += '<input type="checkbox" class="picker-cb" data-promo-id="' + p.id + '"' + checked + disabled + '>';
        html += '<span class="ppi-name">' + escHtml(p.name);
        if (p.isDefault) html += '<span class="ppi-tag">默认</span>';
        html += '</span>';
        html += '<span class="ppi-group">' + escHtml(g.name) + '</span>';
        html += '</label>';
      });
    });
    list.innerHTML = html;

    // 重置内联新建表单
    document.getElementById('inlineCreateForm').style.display = 'none';
    document.getElementById('btnToggleInlineCreate').textContent = '＋ 新建推广位';
    document.getElementById('inlineCreateName').value = '';
    buildInlineGroupSelect();

    openModalBase('promoPickerModalOverlay', 'promoPickerModal');
  }

  function buildInlineGroupSelect() {
    var sel = document.getElementById('inlineCreateGroup');
    if (!sel) return;
    var groups = (window.MockData && window.MockData.promotionGroups) ? window.MockData.promotionGroups : [];
    var html = '<option value="">-- 选择分组 --</option>';
    groups.forEach(function (g) {
      html += '<option value="' + g.id + '">' + escHtml(g.name) + '</option>';
    });
    sel.innerHTML = html;
  }

  function confirmPromoPicker() {
    var cbs = document.querySelectorAll('#promoPickerList .picker-cb');
    var newList = [];
    cbs.forEach(function (cb) {
      if (cb.checked) newList.push(cb.getAttribute('data-promo-id'));
    });
    // 确保默认推广位始终在第一位
    if (newList.indexOf('PROMO_001') === -1) newList.unshift('PROMO_001');
    benefitPagePromos = newList;
    renderPromoTable();
    refreshAllCardMissingModules();
    closeBenefitModal('promoPickerModalOverlay');
    markDirty();
    showFloatingToast('推广位列表已更新');
  }

  function inlineCreatePromo() {
    var groupId = document.getElementById('inlineCreateGroup').value;
    var name = document.getElementById('inlineCreateName').value.trim();
    if (!groupId) { showFloatingToast('请选择分组'); return; }
    if (!name) { showFloatingToast('请输入推广位名称'); return; }

    var newId = 'PROMO_NEW_' + Date.now();
    var groups = (window.MockData && window.MockData.promotionGroups) ? window.MockData.promotionGroups : [];
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].id === groupId) {
        if (!groups[i].promotions) groups[i].promotions = [];
        groups[i].promotions.push({
          id: newId, name: name, isDefault: false, activityCount: 0,
          createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          miniPath: '', h5Path: ''
        });
        break;
      }
    }

    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    thirdActs.forEach(function (act) {
      if (act.promoPaths) act.promoPaths[newId] = '';
    });

    // 勾选新推广位
    pickerCheckState[newId] = true;

    // 重新渲染弹窗列表
    openPromoPicker();
    showFloatingToast('推广位「' + name + '」已创建');
  }

  // ===== 推广位详情弹窗 =====
  function openPromoDetail(promoId) {
    currentDetailPromoId = promoId;
    var promo = getPromoById(promoId);
    if (!promo) return;

    // 推广位基本信息
    var infoGrid = document.getElementById('promoDetailInfo');
    if (infoGrid) {
      infoGrid.innerHTML =
        '<div class="detail-info-item"><span class="detail-info-label">推广位名称</span><span class="detail-info-value">' + escHtml(promo.name) + '</span></div>' +
        '<div class="detail-info-item"><span class="detail-info-label">推广位分组</span><span class="detail-info-value">' + escHtml(promo.groupName || '-') + '</span></div>' +
        '<div class="detail-info-item"><span class="detail-info-label">小程序推广路径</span><span class="detail-info-value">' + escHtml(promo.miniPath || '未配置') + '</span></div>' +
        '<div class="detail-info-item"><span class="detail-info-label">H5推广路径</span><span class="detail-info-value">' + escHtml(promo.h5Path || '未配置') + '</span></div>';
    }

    // 第三方活动列表，路径默认只读，每行"编辑"按钮
    var tbody = document.getElementById('promoDetailTpaBody');
    if (tbody) {
      var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
      var html = '';
      thirdActs.forEach(function (act) {
        var paths = act.promoPaths || {};
        var miniPath = paths[promoId] || '';
        var isEmpty = !miniPath.trim();
        html += '<tr data-detail-row="' + act.id + '">';
        html += '<td>' + escHtml(act.platform) + '</td>';
        html += '<td>' + escHtml(act.name) + '</td>';
        html += '<td>' + escHtml(act.appId) + '</td>';
        html += '<td class="detail-path-cell">';
        html += '<span class="detail-path-text' + (miniPath ? ' has-value' : '') + '">' + escHtml(miniPath || '未配置') + '</span>';
        html += '<input type="text" class="input detail-path-input" data-detail-act-id="' + act.id + '" value="' + escAttr(miniPath) + '" placeholder="输入小程序路径" style="display:none;">';
        html += '<span class="detail-path-status' + (isEmpty ? ' is-missing' : ' is-ok') + '">' + (isEmpty ? '⚠ 缺失' : '✅ 已配置') + '</span>';
        html += '</td>';
        html += '<td class="detail-action-cell"><button class="btn-table-action btn-edit-detail-row" data-edit-row="' + act.id + '">✏️ 编辑</button></td>';
        html += '</tr>';
      });
      tbody.innerHTML = html;
    }

    openModalBase('promoDetailModalOverlay', 'promoDetailModal');
  }

  function toggleDetailRowEdit(actId) {
    var row = document.querySelector('#promoDetailTpaBody tr[data-detail-row="' + actId + '"]');
    if (!row) return;
    var textEl = row.querySelector('.detail-path-text');
    var inputEl = row.querySelector('.detail-path-input');
    var statusEl = row.querySelector('.detail-path-status');
    var btn = row.querySelector('.btn-edit-detail-row');
    if (!textEl || !inputEl || !btn) return;

    if (inputEl.style.display === 'none') {
      // 进入编辑模式
      textEl.style.display = 'none';
      inputEl.style.display = '';
      inputEl.focus();
      btn.textContent = '💾 保存';
      btn.classList.add('is-saving');
    } else {
      // 保存当前行
      var val = inputEl.value.trim();
      saveSingleDetailPath(actId, val);
      // 更新展示
      textEl.textContent = val || '未配置';
      textEl.className = 'detail-path-text' + (val ? ' has-value' : '');
      inputEl.style.display = 'none';
      textEl.style.display = '';
      if (statusEl) {
        statusEl.textContent = val ? '✅ 已配置' : '⚠ 缺失';
        statusEl.className = 'detail-path-status' + (val ? ' is-ok' : ' is-missing');
      }
      btn.textContent = '✏️ 编辑';
      btn.classList.remove('is-saving');
    }
  }

  function saveSingleDetailPath(actId, val) {
    if (!currentDetailPromoId) return;
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    for (var i = 0; i < thirdActs.length; i++) {
      if (thirdActs[i].id === actId) {
        if (!thirdActs[i].promoPaths) thirdActs[i].promoPaths = {};
        thirdActs[i].promoPaths[currentDetailPromoId] = val;
        break;
      }
    }
    renderPromoTable();
    refreshAllCardMissingModules();
    markDirty();
  }

  function savePromoDetailPaths() {
    if (!currentDetailPromoId) return;
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    var inputs = document.querySelectorAll('#promoDetailTpaBody .detail-path-input');
    inputs.forEach(function (input) {
      var actId = input.getAttribute('data-detail-act-id');
      var val = input.value.trim();
      for (var i = 0; i < thirdActs.length; i++) {
        if (thirdActs[i].id === actId) {
          if (!thirdActs[i].promoPaths) thirdActs[i].promoPaths = {};
          thirdActs[i].promoPaths[currentDetailPromoId] = val;
          break;
        }
      }
    });
    closeBenefitModal('promoDetailModalOverlay');
    renderPromoTable();
    markDirty();
    showFloatingToast('第三方活动路径已保存');
  }

  // ===== 小程序APPID清单弹窗 =====
  function openMpAppIdList() {
    var tbody = document.getElementById('mpAppIdTbody');
    if (!tbody) return;
    var mps = (window.MockData && window.MockData.miniPrograms) ? window.MockData.miniPrograms : [];
    var statusMap = { normal: '正常', auditing: '审核中', stopped: '已停用' };
    var html = '';
    mps.forEach(function (mp) {
      var statusText = statusMap[mp.status] || mp.status;
      html += '<tr>';
      html += '<td>' + escHtml(mp.name) + '</td>';
      html += '<td>' + escHtml(mp.type) + '</td>';
      html += '<td><code class="appid-code">' + escHtml(mp.appId) + '</code></td>';
      html += '<td><span class="tag tag-' + (mp.status === 'normal' ? 'success' : mp.status === 'auditing' ? 'warning' : 'default') + '">' + escHtml(statusText) + '</span></td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;
    openModalBase('mpAppIdListModalOverlay', 'mpAppIdListModal');
  }

  // ===== 关闭确认弹窗 =====
  function openCloseConfirm(promoId) {
    closeConfirmPromoId = promoId;
    var promo = getPromoById(promoId);
    var promoName = promo ? promo.name : promoId;
    document.getElementById('closeConfirmMsg').innerHTML = '确定要将「<b>' + escHtml(promoName) + '</b>」从权益页列表中移除吗？';
    openModalBase('closeConfirmModalOverlay', 'closeConfirmModal');
  }

  function confirmClosePromo() {
    if (!closeConfirmPromoId) return;
    benefitPagePromos = benefitPagePromos.filter(function (id) { return id !== closeConfirmPromoId; });
    closeConfirmPromoId = null;
    renderPromoTable();
    refreshAllCardMissingModules();
    closeBenefitModal('closeConfirmModalOverlay');
    markDirty();
    showFloatingToast('已从列表移除');
  }

  // ===== 新增第三方活动 =====
  function toggleNewTPForm() {
    var form = document.getElementById('newTPForm');
    var toggle = document.getElementById('btnToggleNewTP');
    if (!form || !toggle) return;
    if (form.style.display === 'none') {
      form.style.display = 'block';
      toggle.textContent = '▼ 新增第三方活动';
    } else {
      form.style.display = 'none';
      toggle.textContent = '▶ 新增第三方活动';
    }
  }

  function saveNewThirdParty() {
    var name = document.getElementById('newTpName').value.trim();
    var appId = document.getElementById('newTpAppId').value.trim();
    if (!name) { showFloatingToast('请输入活动名称'); return; }
    if (!appId) { showFloatingToast('请输入APPID'); return; }

    var newId = 'TPA_NEW_' + Date.now();
    var allPromos = getAllPromos();
    var promoPaths = {};
    allPromos.forEach(function (p) { promoPaths[p.id] = ''; });

    var thirdActs = window.MockData.thirdPartyActivities;
    thirdActs.push({
      id: newId, platform: '其他', name: name, appId: appId,
      isPreset: false, promoPaths: promoPaths
    });

    // 回填到活动选择弹窗
    var actSelect = document.getElementById('actSelect');
    var opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    opt.selected = true;
    actSelect.appendChild(opt);

    document.getElementById('actPlatform').value = '其他';

    // 折叠并清空表单
    document.getElementById('newTPForm').style.display = 'none';
    document.getElementById('btnToggleNewTP').textContent = '▶ 新增第三方活动';
    document.getElementById('newTpName').value = '';
    document.getElementById('newTpAppId').value = '';

    showFloatingToast('第三方活动「' + name + '」已新增，已自动选中');
  }

  // ===== 收入流转图灯箱 =====
  function openChartLightbox() {
    var lightbox = document.getElementById('chartLightbox');
    if (!lightbox) return;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeChartLightbox() {
    var lightbox = document.getElementById('chartLightbox');
    if (!lightbox) return;
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  // ===== 全局事件绑定 =====
  function bindAllEvents() {
    // 模拟器点击事件
    var sim = document.getElementById('mobileSimulator');
    if (sim) {
      sim.addEventListener('click', function (e) {
        var tb = e.target.closest('[data-edit-module]');
        if (tb) { openModuleTitleModal(tb.getAttribute('data-edit-module')); return; }
        var sb = e.target.closest('[data-edit-style]');
        if (sb) { openStyleModal(sb.getAttribute('data-edit-style')); return; }
        var ab = e.target.closest('[data-edit-activity]');
        if (ab) { openActivityModal(ab.getAttribute('data-edit-activity')); return; }
        var tpaTrigger = e.target.closest('[data-card-tpa-trigger]');
        if (tpaTrigger && !tpaTrigger.classList.contains('is-native')) { openPathConfigModal(tpaTrigger.getAttribute('data-card-tpa-trigger')); return; }
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

    // 添加分类按钮
    var addBtn = document.getElementById('btnAddCate');
    if (addBtn) addBtn.addEventListener('click', addNewCategory);

    // 保存按钮
    var saveBtn = document.getElementById('btnSaveConfig');
    if (saveBtn) saveBtn.addEventListener('click', saveAllConfig);

    // 引导卡片按钮 — 添加推广位
    var guideAddBtn = document.getElementById('btnGuideAddPromo');
    if (guideAddBtn) guideAddBtn.addEventListener('click', openPromoPicker);

    // 引导卡片按钮 — 小程序APPID清单
    var guideMpBtn = document.getElementById('btnGuideMpAppIdList');
    if (guideMpBtn) guideMpBtn.addEventListener('click', openMpAppIdList);

    // 引导卡片按钮 — 收入流转图
    var guideChartBtn = document.getElementById('btnGuideViewChart');
    if (guideChartBtn) guideChartBtn.addEventListener('click', openChartLightbox);

    // 表格操作事件委托
    var tbody = document.getElementById('promoTableBody');
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var detailBtn = e.target.closest('[data-detail-promo]');
        if (detailBtn) { openPromoDetail(detailBtn.getAttribute('data-detail-promo')); return; }
        var closeBtn = e.target.closest('[data-close-promo]');
        if (closeBtn) { openCloseConfirm(closeBtn.getAttribute('data-close-promo')); return; }
      });
    }

    // 弹窗事件绑定
    bindModal('cateModalOverlay', 'btnCloseCate', 'btnCancelCate', 'btnSaveCate', saveCateConfig);
    bindModal('moduleTitleModalOverlay', 'btnCloseModuleTitle', 'btnCancelModuleTitle', 'btnSaveModuleTitle', saveModuleTitle);
    bindModal('styleModalOverlay', 'btnCloseStyle', 'btnCancelStyle', 'btnSaveStyle', saveStyle);
    bindModal('activityModalOverlay', 'btnCloseActivity', 'btnCancelActivity', 'btnSaveActivity', saveActivity);

    // 活动选择弹窗 — 新增第三方活动
    var btnToggleTP = document.getElementById('btnToggleNewTP');
    if (btnToggleTP) btnToggleTP.addEventListener('click', toggleNewTPForm);
    var btnCancelTP = document.getElementById('btnCancelNewTP');
    if (btnCancelTP) btnCancelTP.addEventListener('click', function () {
      document.getElementById('newTPForm').style.display = 'none';
      document.getElementById('btnToggleNewTP').textContent = '▶ 新增第三方活动';
      document.getElementById('newTpName').value = '';
      document.getElementById('newTpAppId').value = '';
    });
    var btnSaveTP = document.getElementById('btnSaveNewTP');
    if (btnSaveTP) btnSaveTP.addEventListener('click', saveNewThirdParty);

    // 推广位选择弹窗
    bindModal('promoPickerModalOverlay', 'btnClosePromoPicker', 'btnCancelPromoPicker', 'btnConfirmPromoPicker', confirmPromoPicker);
    // 内联新建
    var btnToggleInline = document.getElementById('btnToggleInlineCreate');
    if (btnToggleInline) {
      btnToggleInline.addEventListener('click', function () {
        var form = document.getElementById('inlineCreateForm');
        if (!form) return;
        if (form.style.display === 'none') {
          form.style.display = 'flex';
          btnToggleInline.textContent = '－ 收起';
          buildInlineGroupSelect();
        } else {
          form.style.display = 'none';
          btnToggleInline.textContent = '＋ 新建推广位';
        }
      });
    }
    var btnInlineCreate = document.getElementById('btnInlineCreate');
    if (btnInlineCreate) btnInlineCreate.addEventListener('click', inlineCreatePromo);

    // 关闭确认弹窗
    bindModal('closeConfirmModalOverlay', 'btnCloseConfirm', 'btnCancelCloseConfirm', 'btnConfirmClose', confirmClosePromo);

    // 推广位详情弹窗 — 关闭
    bindModal('promoDetailModalOverlay', 'btnClosePromoDetail', 'btnCloseDetailFooter', null, null);

    // 推广位详情弹窗 — 行内编辑按钮事件委托
    var detailTbody = document.getElementById('promoDetailTpaBody');
    if (detailTbody) {
      detailTbody.addEventListener('click', function (e) {
        var editBtn = e.target.closest('.btn-edit-detail-row');
        if (editBtn) { toggleDetailRowEdit(editBtn.getAttribute('data-edit-row')); return; }
      });
    }

    // 推广位路径配置弹窗 — 关闭
    bindModal('pathConfigModalOverlay', 'btnClosePathConfig', 'btnCancelPathConfig', null, null);

    // 推广位路径配置弹窗 — 行编辑按钮事件委托
    var pathCfgTbody = document.getElementById('pathCfgTbody');
    if (pathCfgTbody) {
      pathCfgTbody.addEventListener('click', function (e) {
        var editBtn = e.target.closest('.btn-edit-path-row');
        if (editBtn) { togglePathEditRow(editBtn.getAttribute('data-edit-path')); return; }
      });
    }

    // 小程序APPID清单弹窗
    bindModal('mpAppIdListModalOverlay', 'btnCloseMpAppIdList', 'btnCloseMpAppIdFooter', null, null);

    // 收入流转图灯箱
    var chartLightbox = document.getElementById('chartLightbox');
    var btnCloseLightbox = document.getElementById('btnCloseLightbox');
    var lightboxBackdrop = chartLightbox ? chartLightbox.querySelector('.lightbox-backdrop') : null;
    if (btnCloseLightbox) btnCloseLightbox.addEventListener('click', closeChartLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeChartLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && chartLightbox && chartLightbox.style.display === 'flex') {
        closeChartLightbox();
      }
    });
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

  // ===== 卡片缺失推广位模块 =====

  function matchThirdPartyActivity(platform, activity) {
    var tpas = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    var searchStr = (platform + ' ' + activity).toLowerCase();
    for (var i = 0; i < tpas.length; i++) {
      var tpa = tpas[i];
      var tpaStr = (tpa.platform + ' ' + tpa.name).toLowerCase();
      if (hasKeywordOverlap(searchStr, tpaStr)) return tpa;
    }
    return null;
  }

  function hasKeywordOverlap(a, b) {
    // 按空格/横线拆词
    var wordsA = a.split(/[\s\-]+/).filter(function (w) { return w.length >= 2; });
    var wordsB = b.split(/[\s\-]+/).filter(function (w) { return w.length >= 2; });

    // 直接整词包含
    for (var i = 0; i < wordsA.length; i++) {
      if (b.indexOf(wordsA[i]) !== -1) return true;
    }
    for (var i = 0; i < wordsB.length; i++) {
      if (a.indexOf(wordsB[i]) !== -1) return true;
    }

    // 中文复合词：拆成2字子串再匹配（解决"美团联盟" vs "美团外卖"）
    for (var i = 0; i < wordsA.length; i++) {
      var w = wordsA[i];
      for (var j = 0; j <= w.length - 2; j++) {
        if (b.indexOf(w.substring(j, j + 2)) !== -1) return true;
      }
    }
    for (var i = 0; i < wordsB.length; i++) {
      var w = wordsB[i];
      for (var j = 0; j <= w.length - 2; j++) {
        if (a.indexOf(w.substring(j, j + 2)) !== -1) return true;
      }
    }

    return false;
  }

  function refreshCardMissingModule(cardEl) {
    var module = cardEl.querySelector('[data-card-tpa-module]');
    if (!module) return;
    var platform = cardEl.getAttribute('data-platform') || '';
    var activity = cardEl.getAttribute('data-activity') || '';
    var tpa = matchThirdPartyActivity(platform, activity);

    module.style.display = '';
    var textEl = module.querySelector('[data-card-tpa-text]');
    var trigger = module.querySelector('[data-card-tpa-trigger]');

    if (!tpa) {
      // 非第三方活动 → 推精灵
      textEl.textContent = '推精灵活动，无需配置外部链接';
      textEl.className = 'card-missing-text is-native';
      if (trigger) { trigger.style.cursor = 'default'; trigger.classList.add('is-native'); }
      module.querySelector('.card-missing-arrow').style.display = 'none';
      return;
    }

    // 第三方活动
    if (trigger) { trigger.style.cursor = ''; trigger.classList.remove('is-native'); }
    module.querySelector('.card-missing-arrow').style.display = '';
    var missingPromos = getMissingPromosForTpa(tpa);
    if (missingPromos.length === 0) {
      textEl.textContent = '✅ 全部推广位已配置';
      textEl.className = 'card-missing-text is-all-ok';
    } else {
      textEl.textContent = '⚠ ' + missingPromos.length + '个推广位未配置路径';
      textEl.className = 'card-missing-text is-has-missing';
    }
  }

  function refreshAllCardMissingModules() {
    var cards = document.querySelectorAll('.sim-content .card');
    cards.forEach(function (card) { refreshCardMissingModule(card); });
  }

  function getMissingPromosForTpa(tpa) {
    var paths = tpa.promoPaths || {};
    var missing = [];
    benefitPagePromos.forEach(function (promoId) {
      if (!paths[promoId] || paths[promoId].trim() === '') missing.push(promoId);
    });
    return missing;
  }

  // 当前路径配置弹窗的TPA引用
  var currentPathTpa = null;
  var currentPathCardId = null;

  function openPathConfigModal(cardId) {
    currentPathCardId = cardId;
    var card = document.getElementById(cardId);
    if (!card) return;
    var platform = card.getAttribute('data-platform') || '';
    var activity = card.getAttribute('data-activity') || '';
    currentPathTpa = matchThirdPartyActivity(platform, activity);
    if (!currentPathTpa) { showFloatingToast('该活动非第三方活动，无需配置推广位路径'); return; }

    renderPathConfigModal(currentPathTpa);
    openModalBase('pathConfigModalOverlay', 'pathConfigModal');
  }

  function renderPathConfigModal(tpa) {
    // 头部活动信息
    var tpaPlatform = document.getElementById('pathCfgPlatform');
    var tpaName = document.getElementById('pathCfgName');
    var tpaAppId = document.getElementById('pathCfgAppId');
    if (tpaPlatform) tpaPlatform.textContent = tpa.platform;
    if (tpaName) tpaName.textContent = tpa.name;
    if (tpaAppId) tpaAppId.textContent = tpa.appId;

    // 推广位路径列表
    var tbody = document.getElementById('pathCfgTbody');
    if (!tbody) return;
    var html = '';
    benefitPagePromos.forEach(function (promoId) {
      var promo = getPromoById(promoId);
      if (!promo) return;
      var paths = tpa.promoPaths || {};
      var currentPath = paths[promoId] || '';
      var isEmpty = !currentPath.trim();
      html += '<tr data-path-row="' + promoId + '">';
      html += '<td class="path-cfg-promo-name">' + escHtml(promo.name) + '</td>';
      html += '<td class="path-cfg-value-cell">';
      html += '<span class="path-cfg-view-text' + (currentPath ? ' has-value' : '') + '" data-path-view="' + promoId + '">' + escHtml(currentPath || '（未配置）') + '</span>';
      html += '<input type="text" class="input path-cfg-input" data-path-input="' + promoId + '" value="' + escAttr(currentPath) + '" placeholder="请输入小程序路径" style="display:none;">';
      html += '</td>';
      html += '<td class="path-cfg-status-cell">';
      html += '<span class="path-cfg-status' + (isEmpty ? ' is-missing' : ' is-ok') + '" data-path-status="' + promoId + '">' + (isEmpty ? '⚠ 未配置' : '✅ 已配置') + '</span>';
      html += '</td>';
      html += '<td class="path-cfg-action-cell">';
      html += '<button class="btn-table-action btn-edit-path-row" data-edit-path="' + promoId + '">✏️ 编辑</button>';
      html += '</td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;
  }

  function togglePathEditRow(promoId) {
    var row = document.querySelector('#pathCfgTbody tr[data-path-row="' + promoId + '"]');
    if (!row) return;
    var viewEl = row.querySelector('[data-path-view="' + promoId + '"]');
    var inputEl = row.querySelector('[data-path-input="' + promoId + '"]');
    var statusEl = row.querySelector('[data-path-status="' + promoId + '"]');
    var btn = row.querySelector('[data-edit-path="' + promoId + '"]');
    if (!viewEl || !inputEl || !btn) return;

    if (inputEl.style.display === 'none') {
      // 进入编辑模式
      viewEl.style.display = 'none';
      inputEl.style.display = '';
      inputEl.focus();
      btn.textContent = '💾 保存';
      btn.classList.add('is-saving');
    } else {
      // 保存
      var val = inputEl.value.trim();
      if (!currentPathTpa) return;
      if (!currentPathTpa.promoPaths) currentPathTpa.promoPaths = {};
      currentPathTpa.promoPaths[promoId] = val;
      // 更新展示
      viewEl.textContent = val || '（未配置）';
      viewEl.className = 'path-cfg-view-text' + (val ? ' has-value' : '');
      inputEl.style.display = 'none';
      viewEl.style.display = '';
      if (statusEl) {
        statusEl.textContent = val ? '✅ 已配置' : '⚠ 未配置';
        statusEl.className = 'path-cfg-status' + (val ? ' is-ok' : ' is-missing');
      }
      btn.textContent = '✏️ 编辑';
      btn.classList.remove('is-saving');
      // 刷新卡片的缺失模块
      if (currentPathCardId) {
        var card = document.getElementById(currentPathCardId);
        if (card) refreshCardMissingModule(card);
      }
      renderPromoTable();
      markDirty();
    }
  }

  // ===== 工具函数 =====
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { showFloatingToast('路径已复制'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); showFloatingToast('路径已复制'); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

})();
