/**
 * C03 推广位管理 — 分组Tab切换 / 分组CRUD / 推广位CRUD
 */
(function () {
  'use strict';

  var PAGE_SIZE = 20;
  var currentPage = 1;
  var filterPromoId = '';
  var filterGroupId = '';
  var filterMiniProgram = '';
  var drawerMode = 'create';       // 'create' | 'edit'
  var drawerPromoId = null;

  // ===== 入口 =====
  window.initPromotionList = function () {
    currentPage = 1;
    filterPromoId = '';
    filterGroupId = '';
    filterMiniProgram = '';
    var fi = document.getElementById('filterPromoId');
    if (fi) fi.value = '';
    var fg = document.getElementById('filterGroupId');
    if (fg) fg.value = '';
    var fm = document.getElementById('filterMiniProgram');
    if (fm) fm.value = '';
    renderFilterGroupSelect();
    renderPromoList();
    bindPromoEvents();
  };

  // ===== 筛选区分组下拉渲染 =====
  function renderFilterGroupSelect() {
    var select = document.getElementById('filterGroupId');
    if (!select) return;

    var groups = window.MockData.promotionGroups || [];
    var optionsHtml = '<option value="">全部分组</option>';
    groups.forEach(function (g) {
      var sel = (filterGroupId === g.id) ? ' selected' : '';
      optionsHtml += '<option value="' + g.id + '"' + sel + '>' + escHtml(g.name) + '</option>';
    });
    // 保留"全部分组"option，追加分组options
    select.innerHTML = optionsHtml;
  }

  // ===== 推广位列表渲染 =====
  function renderPromoList() {
    var list = getFilteredList();
    var totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * PAGE_SIZE;
    var pageItems = list.slice(start, start + PAGE_SIZE);

    var tbody = document.getElementById('promoTableBody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">📌</div><div class="empty-state-text">暂无推广位数据</div></div></td></tr>';
      renderPagination(0, 0);
      return;
    }

    tbody.innerHTML = pageItems.map(function (p) {
      var defaultTag = p.isDefault ? '<span class="tag tag-primary">默认</span>' : '';
      var nameClass = p.isDefault ? 'promo-name-default' : '';
      var groupName = p.groupName || '—';

      // 推广状态 + 缺失活动
      var statusCell, missingCell, h5PathCell, mpCell;
      if (p.benefitPageEnabled) {
        var missingList = getMissingActivities(p.id);
        var missingCount = missingList.length;
        statusCell = missingCount === 0
          ? '<span class="tag tag-success">推广中</span>'
          : '<span class="tag tag-warning">推广中</span>';
        missingCell = missingCount === 0
          ? '<span class="tag tag-success">已配置完毕</span>'
          : '<span class="tag tag-warning">' + missingCount + '项待配置</span>';

        var h5Path = p.h5Path || '';
        h5PathCell =
          '<div class="promo-path-input-row">' +
          '<div class="promo-path-display" title="' + escAttr(h5Path) + '">' + escHtml(h5Path || '—') + '</div>' +
          '<button class="btn-copy-path" data-copy="' + escAttr(h5Path) + '" title="复制H5路径">' + copyIcon() + '</button>' +
          '</div>';

        // 小程序推广路径：输入框风格只读展示 + 复制 + 查看按钮
        var miniPath = p.miniPath || '';
        var mpCount = getMpCount(p.id);
        mpCell =
          '<div class="promo-path-input-row">' +
          '<div class="promo-path-display" title="' + escAttr(miniPath) + '">' + escHtml(miniPath || '—') + '</div>' +
          (mpCount > 0
            ? '<button class="btn btn-sm btn-link btn-mp-list" data-id="' + p.id + '">查看小程序路径</button>'
            : '') +
          '</div>';
      } else {
        statusCell = '<span class="tag tag-default">未开启</span>';
        missingCell = '<span class="text-muted">—</span>';
        h5PathCell = '<span class="text-muted">—</span>';
        mpCell = '<span class="text-muted">—</span>';
      }

      // 取链清单
      var chainCount = getChainCount(p.id);
      var chainBtn = '<button class="btn btn-sm btn-link btn-chain-list" data-id="' + p.id + '">查看(' + chainCount + ')</button>';

      // 操作
      var actions = '<button class="btn btn-sm btn-link btn-edit-promo" data-id="' + p.id + '">编辑</button>';
      if (!p.isDefault) {
        actions += '<button class="btn btn-sm btn-link btn-delete-promo" data-id="' + p.id + '" style="color:var(--color-danger)">删除</button>';
      }

      return '<tr class="' + (p.isDefault ? 'promo-row-default' : '') + '">' +
        '<td><span class="' + nameClass + '">' + escHtml(p.name) + '</span> ' + defaultTag + '</td>' +
        '<td><code style="font-size:12px;background:#f5f5f5;padding:2px 6px;border-radius:3px;">' + escHtml(p.id) + '</code></td>' +
        '<td><span class="group-tag">' + escHtml(groupName) + '</span></td>' +
        '<td style="text-align:center">' + statusCell + '</td>' +
        '<td style="text-align:center">' + missingCell + '</td>' +
        '<td>' + mpCell + '</td>' +
        '<td>' + h5PathCell + '</td>' +
        '<td style="text-align:center">' + chainBtn + '</td>' +
        '<td style="white-space:nowrap">' + actions + '</td>' +
        '</tr>';
    }).join('');

    renderPagination(list.length, totalPages);
  }

  function getFilteredList() {
    var list = window.MockData.getAllPromotions();
    // 按推广位ID过滤
    if (filterPromoId) {
      var kw = filterPromoId.toLowerCase();
      list = list.filter(function (p) {
        return p.id.toLowerCase().indexOf(kw) > -1;
      });
    }
    // 按分组过滤
    if (filterGroupId) {
      list = list.filter(function (p) {
        return p.groupId === filterGroupId;
      });
    }
    // 按是否推广小程序过滤
    if (filterMiniProgram !== '') {
      var wantEnabled = filterMiniProgram === '1';
      list = list.filter(function (p) {
        return !!p.benefitPageEnabled === wantEnabled;
      });
    }
    return list;
  }

  // ===== 分页 =====
  function renderPagination(total, pages) {
    var pg = document.getElementById('promoPagination');
    if (!pg) return;
    if (pages <= 1) {
      pg.innerHTML = '';
      return;
    }
    var html = '<button class="page-btn" data-pg="prev" ' + (currentPage <= 1 ? 'disabled' : '') + '>‹</button>';
    for (var i = 1; i <= pages; i++) {
      html += '<button class="page-btn' + (i === currentPage ? ' active' : '') + '" data-pg="' + i + '">' + i + '</button>';
    }
    html += '<button class="page-btn" data-pg="next" ' + (currentPage >= pages ? 'disabled' : '') + '>›</button>';
    html += '<span class="page-info">共 ' + total + ' 条</span>';
    pg.innerHTML = html;
  }

  // ===== 事件绑定 =====
  function bindPromoEvents() {
    // 筛选：推广位ID
    var fi = document.getElementById('filterPromoId');
    if (fi) {
      fi.oninput = function () {
        filterPromoId = this.value.trim();
        currentPage = 1;
        renderPromoList();
      };
    }

    // 筛选：推广位分组
    var fg = document.getElementById('filterGroupId');
    if (fg) {
      fg.onchange = function () {
        filterGroupId = this.value;
        currentPage = 1;
        renderPromoList();
      };
    }

    // 筛选：是否推广小程序
    var fm = document.getElementById('filterMiniProgram');
    if (fm) {
      fm.onchange = function () {
        filterMiniProgram = this.value;
        currentPage = 1;
        renderPromoList();
      };
    }

    // 新增推广位按钮 → 打开抽屉（创建模式）
    var addBtn = document.getElementById('btnAddPromo');
    if (addBtn) {
      addBtn.onclick = function () { openPromoEditDrawer(null); };
    }

    // 新增分组按钮
    var addGroupBtn = document.getElementById('btnAddGroup');
    if (addGroupBtn) {
      addGroupBtn.onclick = openAddGroupModal;
    }

    // 表格操作按钮（事件委托）
    var tbody = document.getElementById('promoTableBody');
    if (tbody) {
      tbody.onclick = function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;

        // 复制路径按钮
        if (btn.classList.contains('btn-copy-path')) {
          e.preventDefault();
          var copyText = btn.getAttribute('data-copy');
          if (copyText) copyToClipboard(copyText);
          return;
        }

        var id = btn.getAttribute('data-id');

        if (btn.classList.contains('btn-edit-promo')) {
          openPromoEditDrawer(id);
        } else if (btn.classList.contains('btn-delete-promo')) {
          confirmDeletePromo(id);
        } else if (btn.classList.contains('btn-mp-list')) {
          openMpListModal(id);
        } else if (btn.classList.contains('btn-chain-list')) {
          openChainListModal(id);
        }
      };
    }

    // 分页
    var pg = document.getElementById('promoPagination');
    if (pg) {
      pg.onclick = function (e) {
        var btn = e.target.closest('.page-btn');
        if (!btn || btn.disabled) return;
        var p = btn.getAttribute('data-pg');
        if (p === 'prev') { currentPage = Math.max(1, currentPage - 1); }
        else if (p === 'next') { currentPage = currentPage + 1; }
        else { currentPage = parseInt(p, 10); }
        renderPromoList();
      };
    }

    // Modal事件
    bindModalEvents();
  }

  function bindModalEvents() {
    // === 编辑推广位抽屉 ===
    var drawerOverlay = document.getElementById('promoEditDrawerOverlay');
    if (drawerOverlay) {
      drawerOverlay.onclick = function (e) {
        if (e.target === drawerOverlay) closePromoEditDrawer();
      };
    }
    var btnDrawerClose = document.getElementById('btnPromoDrawerClose');
    if (btnDrawerClose) btnDrawerClose.onclick = closePromoEditDrawer;
    var btnDrawerCancel = document.getElementById('btnDrawerCancel');
    if (btnDrawerCancel) btnDrawerCancel.onclick = closePromoEditDrawer;
    var btnDrawerSave = document.getElementById('btnDrawerSave');
    if (btnDrawerSave) btnDrawerSave.onclick = savePromoDrawer;

    // 抽屉内：名称输入框回车/ESC
    var nameInput = document.getElementById('drawerPromoName');
    if (nameInput) {
      nameInput.onkeydown = function (e) {
        if (e.key === 'Enter') savePromoDrawer();
        if (e.key === 'Escape') closePromoEditDrawer();
      };
    }

    // 抽屉内：权益页开关
    var benefitToggle = document.getElementById('drawerBenefitEnabled');
    if (benefitToggle) {
      benefitToggle.onchange = function () {
        toggleBenefitPaths(this.checked);
      };
    }

    // 抽屉内：路径复制按钮
    var btnCopyMini = document.getElementById('btnCopyDrawerMini');
    if (btnCopyMini) {
      btnCopyMini.onclick = function () {
        var val = document.getElementById('drawerMiniPath').value;
        if (val) copyToClipboard(val);
      };
    }
    var btnDrawerMpList = document.getElementById('btnDrawerMpList');
    if (btnDrawerMpList) {
      btnDrawerMpList.onclick = function () {
        if (drawerPromoId) openMpListModal(drawerPromoId);
      };
    }
    var btnCopyH5 = document.getElementById('btnCopyDrawerH5');
    if (btnCopyH5) {
      btnCopyH5.onclick = function () {
        var val = document.getElementById('drawerH5Path').value;
        if (val) copyToClipboard(val);
      };
    }

    // 抽屉内分组选择器 "+ 新建"
    var btnNewGroup = document.getElementById('btnDrawerNewGroup');
    if (btnNewGroup) {
      btnNewGroup.onclick = function () {
        document.getElementById('drawerPromoGroup').parentNode.style.display = 'none';
        document.getElementById('drawerGroupInputRow').style.display = 'flex';
        var input = document.getElementById('drawerNewGroupInput');
        input.value = '';
        input.focus();
      };
    }
    var btnConfirmGroup = document.getElementById('btnDrawerConfirmGroup');
    if (btnConfirmGroup) btnConfirmGroup.onclick = confirmDrawerNewGroup;
    var btnCancelGroup = document.getElementById('btnDrawerCancelGroup');
    if (btnCancelGroup) btnCancelGroup.onclick = cancelDrawerNewGroup;
    var newGroupInput = document.getElementById('drawerNewGroupInput');
    if (newGroupInput) {
      newGroupInput.onkeydown = function (e) {
        if (e.key === 'Enter') confirmDrawerNewGroup();
        if (e.key === 'Escape') cancelDrawerNewGroup();
      };
    }

    // 抽屉内：Tab切换
    var tabButtons = document.querySelectorAll('.drawer-tab');
    tabButtons.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = this.getAttribute('data-tab');
        // 切换tab激活状态
        tabButtons.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        // 切换面板
        document.querySelectorAll('.drawer-tab-panel').forEach(function (p) { p.style.display = 'none'; });
        var panelMap = { alliance: 'tabPanelAlliance', embedH5: 'tabPanelEmbedH5', thirdParty: 'tabPanelThirdParty' };
        var panel = document.getElementById(panelMap[target]);
        if (panel) panel.style.display = '';
      });
    });

    // 抽屉内：第三方活动路径输入框实时更新状态
    var pathTbody = document.getElementById('drawerPathTbody');
    if (pathTbody) {
      pathTbody.addEventListener('input', function (e) {
        if (e.target.classList.contains('path-drawer-input')) {
          updatePathRowStatus(e.target);
        }
      });
    }

    // === 取链清单全屏 ===
    var btnChainClose = document.getElementById('btnChainListClose');
    if (btnChainClose) btnChainClose.onclick = closeChainListModal;

    // 取链清单Tab切换
    document.querySelectorAll('.chain-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.chain-tab').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        chainFilterPlatform = this.getAttribute('data-platform');
        renderChainTable();
      });
    });

    // 取链清单搜索
    var chainSearch = document.getElementById('chainSearchInput');
    if (chainSearch) {
      chainSearch.oninput = function () {
        chainFilterKeyword = this.value.trim();
        renderChainTable();
      };
    }

    // 取链表格事件委托（展开/删除/复制）
    var chainTbody = document.getElementById('chainTableBody');
    if (chainTbody) {
      chainTbody.addEventListener('click', function (e) {
        var expandBtn = e.target.closest('.btn-chain-expand');
        if (expandBtn) {
          var idx = expandBtn.getAttribute('data-idx');
          var detailRow = document.getElementById('chainDetail-' + idx);
          if (detailRow) {
            var isHidden = detailRow.style.display === 'none';
            detailRow.style.display = isHidden ? '' : 'none';
            expandBtn.textContent = isHidden ? '收起详情' : '查看更多';
          }
          return;
        }
        var delBtn = e.target.closest('.btn-chain-delete');
        if (delBtn) {
          var delIdx = parseInt(delBtn.getAttribute('data-idx'), 10);
          deleteChainItem(delIdx);
          return;
        }
        var copyBtn = e.target.closest('.btn-copy-chain');
        if (copyBtn) {
          e.preventDefault();
          var copyText = copyBtn.getAttribute('data-copy');
          if (copyText) copyToClipboard(copyText);
        }
      });
    }

    // 新增链接 → 独立弹窗
    var btnOpenAdd = document.getElementById('btnOpenChainAdd');
    if (btnOpenAdd) btnOpenAdd.onclick = openChainAddModal;
    var btnAddRow = document.getElementById('btnChainAddRow');
    if (btnAddRow) btnAddRow.onclick = addChainRow;
    var btnBatchAdd = document.getElementById('btnChainBatchAdd');
    if (btnBatchAdd) btnBatchAdd.onclick = batchAddChainItems;
    var btnCancelAdd = document.getElementById('btnChainCancelAdd');
    if (btnCancelAdd) btnCancelAdd.onclick = closeChainAddModal;

    // 新增链接弹窗遮罩关闭
    var chainAddOverlay = document.getElementById('chainAddOverlay');
    if (chainAddOverlay) {
      chainAddOverlay.onclick = function (e) {
        if (e.target === chainAddOverlay) closeChainAddModal();
      };
    }
    var btnChainAddClose = document.getElementById('btnChainAddClose');
    if (btnChainAddClose) btnChainAddClose.onclick = closeChainAddModal;

    // === 小程序清单弹窗 ===
    var mpListOverlay = document.getElementById('mpListOverlay');
    if (mpListOverlay) {
      mpListOverlay.onclick = function (e) {
        if (e.target === mpListOverlay) closeMpListModal();
      };
    }
    var btnMpListClose = document.getElementById('btnMpListClose');
    if (btnMpListClose) btnMpListClose.onclick = closeMpListModal;
    var btnMpListCancel = document.getElementById('btnMpListCancel');
    if (btnMpListCancel) btnMpListCancel.onclick = closeMpListModal;

    // 小程序清单卡片内复制按钮（事件委托）
    var mpCardList = document.getElementById('mpCardList');
    if (mpCardList) {
      mpCardList.onclick = function (e) {
        var copyBtn = e.target.closest('.btn-copy-mp');
        if (!copyBtn) return;
        e.preventDefault();
        var text = copyBtn.getAttribute('data-copy');
        if (text) copyToClipboard(text);
      };
    }

    // === 分组表单弹窗 ===
    var groupOverlay = document.getElementById('groupFormOverlay');
    var btnGroupCreate = document.getElementById('btnGroupCreate');
    var groupNameInput = document.getElementById('groupNameInput');
    var groupCancelBtns = document.querySelectorAll('#btnGroupCancel, #btnGroupCancel2');

    groupCancelBtns.forEach(function (btn) {
      btn.onclick = closeGroupForm;
    });
    if (groupOverlay) {
      groupOverlay.onclick = function (e) {
        if (e.target === groupOverlay) closeGroupForm();
      };
    }
    if (btnGroupCreate) {
      btnGroupCreate.onclick = createGroupFromModal;
    }
    if (groupNameInput) {
      groupNameInput.onkeydown = function (e) {
        if (e.key === 'Enter') createGroupFromModal();
        if (e.key === 'Escape') closeGroupForm();
      };
    }
  }

  // ===== 抽屉内嵌新建分组 =====
  function confirmDrawerNewGroup() {
    var input = document.getElementById('drawerNewGroupInput');
    var errorEl = document.getElementById('drawerGroupError');
    if (!input) return;

    var name = input.value.trim();
    if (!name) {
      if (errorEl) { errorEl.textContent = '请输入分组名称'; errorEl.style.display = 'block'; }
      return;
    }

    var groups = window.MockData.promotionGroups;
    var dup = groups.filter(function (g) { return g.name === name; });
    if (dup.length > 0) {
      if (errorEl) { errorEl.textContent = '分组名称已存在，请更换'; errorEl.style.display = 'block'; }
      return;
    }

    var newId = 'GROUP_' + String(Date.now()).slice(-6);
    groups.push({ id: newId, name: name, isDefault: false, promotions: [] });

    cancelDrawerNewGroup();
    renderDrawerGroupSelect(newId);
    renderFilterGroupSelect();

    if (errorEl) errorEl.style.display = 'none';
  }

  function cancelDrawerNewGroup() {
    document.getElementById('drawerPromoGroup').parentNode.style.display = 'flex';
    document.getElementById('drawerGroupInputRow').style.display = 'none';
    document.getElementById('drawerNewGroupInput').value = '';
    var errorEl = document.getElementById('drawerGroupError');
    if (errorEl) errorEl.style.display = 'none';
  }

  function renderDrawerGroupSelect(selectedGroupId) {
    var select = document.getElementById('drawerPromoGroup');
    if (!select) return;

    var groups = window.MockData.promotionGroups || [];
    var sorted = groups.slice().sort(function (a, b) {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });

    select.innerHTML = sorted.map(function (g) {
      var sel = (g.id === selectedGroupId) ? ' selected' : '';
      return '<option value="' + g.id + '"' + sel + '>' + escHtml(g.name) + '</option>';
    }).join('');
  }

  // ===== 权益页开关联动 =====
  function toggleBenefitPaths(enabled) {
    var allDiv = document.getElementById('drawerBenefitAll');
    var hint = document.getElementById('drawerBenefitHint');
    if (allDiv) allDiv.style.display = enabled ? '' : 'none';
    if (hint) hint.textContent = enabled ? '开启后列表中展示路径详情' : '关闭后列表中显示"未开启"';
  }

  // ===== 权益页联盟推广活动表格渲染（小程序跳转类） =====
  function renderDrawerAllianceTable() {
    var tbody = document.getElementById('drawerAllianceTbody');
    if (!tbody) return;

    var activities = (window.MockData && window.MockData.availableActivities) ? window.MockData.availableActivities : [];
    var filtered = activities.filter(function (act) { return act.jumpType === 'miniprogram'; });
    tbody.innerHTML = filtered.map(function (act) {
      var pathText = act.miniPath || act.h5Path || '—';
      return '<tr>' +
        '<td>' + escHtml(act.platformLabel || act.platform) + '</td>' +
        '<td>' + escHtml(act.name) + '</td>' +
        '<td><code style="font-size:11px;background:#f5f5f5;padding:1px 4px;border-radius:2px;">' + escHtml(act.venueId || '—') + '</code></td>' +
        '<td><span class="path-cell has-value" style="font-size:12px;">' + escHtml(truncatePath(pathText, 30)) + '</span></td>' +
        '<td><span class="alliance-status">无需配置</span></td>' +
        '</tr>';
    }).join('');
  }

  // ===== 内嵌H5表格渲染（口令跳转类） =====
  function renderDrawerEmbedH5Table() {
    var tbody = document.getElementById('drawerEmbedH5Tbody');
    if (!tbody) return;

    var activities = (window.MockData && window.MockData.availableActivities) ? window.MockData.availableActivities : [];
    var filtered = activities.filter(function (act) { return act.jumpType === 'password'; });
    tbody.innerHTML = filtered.map(function (act) {
      var pathText = act.h5Path || act.miniPath || '—';
      return '<tr>' +
        '<td>' + escHtml(act.platformLabel || act.platform) + '</td>' +
        '<td>' + escHtml(act.name) + '</td>' +
        '<td><code style="font-size:11px;background:#f5f5f5;padding:1px 4px;border-radius:2px;">' + escHtml(act.password || '—') + '</code></td>' +
        '<td><span class="path-cell has-value" style="font-size:12px;">' + escHtml(truncatePath(pathText, 30)) + '</span></td>' +
        '<td><span class="embed-h5-status">1号和15号自动更新</span></td>' +
        '</tr>';
    }).join('');
  }

  // ===== 第三方活动路径表格渲染 =====
  function renderDrawerPathTable(promoId) {
    var tbody = document.getElementById('drawerPathTbody');
    if (!tbody) return;

    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    tbody.innerHTML = thirdActs.map(function (act) {
      var pathVal;
      var isReadonly = !!(act.useUnifiedPath);
      if (act.useUnifiedPath) {
        pathVal = act.unifiedPath || '';
      } else {
        var paths = act.promoPaths || {};
        pathVal = paths[promoId] || '';
      }
      var isEmpty = !pathVal.trim();
      var clsSuffix = isReadonly ? ' is-unified' : (isEmpty ? ' is-empty' : '');
      var statusHtml = isReadonly ? '<span class="path-drawer-status is-unified">统一</span>'
        : '<span class="path-drawer-status' + (isEmpty ? ' is-missing' : ' is-ok') + '">' + (isEmpty ? '缺失' : '已配置') + '</span>';
      var inputAttrs = isReadonly ? ' disabled title="已开启统一路径配置，请到活动详情页修改"' : '';
      return '<tr>' +
        '<td>' + escHtml(act.platform) + '</td>' +
        '<td>' + escHtml(act.name) + '</td>' +
        '<td><code style="font-size:11px;background:#f5f5f5;padding:1px 4px;border-radius:2px;">' + escHtml(act.appId) + '</code></td>' +
        '<td><input type="text" class="path-drawer-input' + clsSuffix + '" value="' + escAttr(pathVal) + '" placeholder="输入小程序路径" data-act-id="' + act.id + '" data-promo-id="' + promoId + '"' + inputAttrs + '></td>' +
        '<td>' + statusHtml + '</td>' +
        '</tr>';
    }).join('');
    updateThirdPartyBadge();
  }

  function updatePathRowStatus(inputEl) {
    var row = inputEl.closest('tr');
    if (!row) return;
    var statusEl = row.querySelector('.path-drawer-status');
    if (!statusEl) return;
    var isEmpty = !inputEl.value.trim();
    if (isEmpty) {
      inputEl.classList.add('is-empty');
      statusEl.textContent = '缺失';
      statusEl.className = 'path-drawer-status is-missing';
    } else {
      inputEl.classList.remove('is-empty');
      statusEl.textContent = '已配置';
      statusEl.className = 'path-drawer-status is-ok';
    }
    updateThirdPartyBadge();
  }

  function updateThirdPartyBadge() {
    var badge = document.getElementById('thirdPartyBadge');
    if (!badge) return;
    var inputs = document.querySelectorAll('#drawerPathTbody .path-drawer-input');
    var missingCount = 0;
    inputs.forEach(function (inp) { if (!inp.value.trim()) missingCount++; });
    if (missingCount > 0) {
      badge.textContent = missingCount;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ===== 编辑推广位抽屉 =====
  function openPromoEditDrawer(promoId) {
    var promo = promoId ? findPromoById(promoId) : null;
    drawerMode = promo ? 'edit' : 'create';
    drawerPromoId = promoId || null;

    var overlay = document.getElementById('promoEditDrawerOverlay');
    if (!overlay) return;

    // 重置分组选择器
    document.getElementById('drawerPromoGroup').parentNode.style.display = 'flex';
    document.getElementById('drawerGroupInputRow').style.display = 'none';
    var groupError = document.getElementById('drawerGroupError');
    if (groupError) groupError.style.display = 'none';
    var nameError = document.getElementById('drawerPromoNameError');
    if (nameError) nameError.style.display = 'none';

    if (promo) {
      document.getElementById('promoEditDrawerTitle').textContent = '编辑推广位';
      document.getElementById('drawerPromoName').value = promo.name;
      document.getElementById('drawerPromoId').textContent = promo.id;
      document.getElementById('drawerPromoGroup').disabled = true;
      document.getElementById('btnDrawerNewGroup').style.display = 'none';
      renderDrawerGroupSelect(promo.groupId);

      // 权益页
      var enabled = !!promo.benefitPageEnabled;
      document.getElementById('drawerBenefitEnabled').checked = enabled;
      toggleBenefitPaths(enabled);
      document.getElementById('drawerMiniPath').value = promo.miniPath || '';
      document.getElementById('drawerH5Path').value = promo.h5Path || '';

      // 联盟推广活动 + 内嵌H5 + 第三方活动路径
      renderDrawerAllianceTable();
      renderDrawerEmbedH5Table();
      renderDrawerPathTable(promo.id);
    } else {
      document.getElementById('promoEditDrawerTitle').textContent = '新增推广位';
      document.getElementById('drawerPromoName').value = '';
      document.getElementById('drawerPromoId').textContent = '自动生成';
      document.getElementById('drawerPromoGroup').disabled = false;
      document.getElementById('btnDrawerNewGroup').style.display = '';
      renderDrawerGroupSelect('GROUP_DEFAULT');

      document.getElementById('drawerBenefitEnabled').checked = true;
      toggleBenefitPaths(true);
      document.getElementById('drawerMiniPath').value = '';
      document.getElementById('drawerH5Path').value = '';

      // 联盟推广活动 + 内嵌H5 + 第三方路径占位
      renderDrawerAllianceTable();
      renderDrawerEmbedH5Table();
      var pathTbody = document.getElementById('drawerPathTbody');
      if (pathTbody) pathTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-tertiary);padding:20px;">保存后即可配置第三方活动路径</td></tr>';
    }

    overlay.style.display = 'flex';
    overlay.classList.add('modal-animated');
    setTimeout(function () {
      var nameInput = document.getElementById('drawerPromoName');
      if (nameInput) nameInput.focus();
    }, 150);
  }

  function closePromoEditDrawer() {
    var overlay = document.getElementById('promoEditDrawerOverlay');
    if (!overlay) return;
    if (typeof closeModalAnimated === 'function') {
      closeModalAnimated(overlay);
    } else {
      overlay.style.display = 'none';
    }
    drawerMode = 'create';
    drawerPromoId = null;
  }

  function savePromoDrawer() {
    var nameInput = document.getElementById('drawerPromoName');
    var nameError = document.getElementById('drawerPromoNameError');
    var groupError = document.getElementById('drawerGroupError');

    var name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      if (nameError) { nameError.textContent = '请输入推广位名称'; nameError.style.display = 'block'; }
      return;
    }
    if (name.length > 20) {
      if (nameError) { nameError.textContent = '名称不能超过20个字符'; nameError.style.display = 'block'; }
      return;
    }

    // 分组
    var groupId;
    if (drawerMode === 'edit' && drawerPromoId) {
      var existing = findPromoById(drawerPromoId);
      groupId = existing ? existing.groupId : null;
    } else {
      groupId = document.getElementById('drawerPromoGroup').value;
    }

    // 重名检查
    var groups = window.MockData.promotionGroups;
    if (drawerMode === 'create') {
      var dup = false;
      groups.forEach(function (g) {
        (g.promotions || []).forEach(function (p) {
          if (p.name === name && g.id === groupId) dup = true;
        });
      });
      if (dup) {
        if (nameError) { nameError.textContent = '该分组下已有同名推广位，请更换'; nameError.style.display = 'block'; }
        return;
      }
    }

    var benefitEnabled = document.getElementById('drawerBenefitEnabled').checked;
    var miniPath = document.getElementById('drawerMiniPath').value.trim();
    var h5Path = document.getElementById('drawerH5Path').value.trim();

    if (drawerMode === 'edit' && drawerPromoId) {
      // 更新推广位基本信息
      var promo = findPromoById(drawerPromoId);
      if (promo) {
        promo.name = name;
        promo.benefitPageEnabled = benefitEnabled;
        promo.miniPath = miniPath;
        promo.h5Path = h5Path;
      }

      // 保存第三方活动路径
      var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
      var pathInputs = document.querySelectorAll('#drawerPathTbody .path-drawer-input');
      pathInputs.forEach(function (input) {
        var actId = input.getAttribute('data-act-id');
        for (var i = 0; i < thirdActs.length; i++) {
          if (thirdActs[i].id === actId) {
            if (!thirdActs[i].promoPaths) thirdActs[i].promoPaths = {};
            thirdActs[i].promoPaths[drawerPromoId] = input.value.trim();
            break;
          }
        }
      });

      window.showToast('推广位已更新', 'success');
    } else {
      // 创建新推广位
      var newId = 'PROMO_' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 100)).padStart(2, '0');
      var targetGroup = groups.filter(function (g) { return g.id === groupId; })[0];
      if (targetGroup) {
        // 初始化第三方活动路径
        var allThirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
        allThirdActs.forEach(function (act) {
          if (!act.promoPaths) act.promoPaths = {};
          act.promoPaths[newId] = '';
        });

        targetGroup.promotions.push({
          id: newId,
          name: name,
          isDefault: false,
          activityCount: 6,
          createTime: formatNow(),
          miniPath: miniPath,
          h5Path: h5Path,
          benefitPageEnabled: benefitEnabled
        });

        // 自动填充预设活动到取链清单
        autoPopulateChainList(newId);
      }
      window.showToast('推广位已创建', 'success');
    }

    closePromoEditDrawer();
    renderPromoList();
  }

  // ===== 分组管理 =====
  function openAddGroupModal() {
    var overlay = document.getElementById('groupFormOverlay');
    var input = document.getElementById('groupNameInput');
    var error = document.getElementById('groupFormError');
    if (!overlay) return;

    if (input) input.value = '';
    if (error) error.style.display = 'none';

    overlay.style.display = 'flex';
    overlay.classList.add('modal-animated');
    setTimeout(function () {
      if (input) input.focus();
    }, 100);
  }

  function closeGroupForm() {
    var overlay = document.getElementById('groupFormOverlay');
    if (overlay) {
      if (typeof closeModalAnimated === 'function') {
        closeModalAnimated(overlay);
      } else {
        overlay.style.display = 'none';
      }
    }
  }

  function createGroupFromModal() {
    var input = document.getElementById('groupNameInput');
    var error = document.getElementById('groupFormError');
    if (!input) return;

    var name = input.value.trim();
    if (!name) {
      if (error) { error.textContent = '请输入分组名称'; error.style.display = 'block'; }
      return;
    }
    if (name.length > 10) {
      if (error) { error.textContent = '分组名称不超过10个字符'; error.style.display = 'block'; }
      return;
    }

    var groups = window.MockData.promotionGroups;
    var dup = groups.filter(function (g) { return g.name === name; });
    if (dup.length > 0) {
      if (error) { error.textContent = '分组名称已存在，请更换'; error.style.display = 'block'; }
      return;
    }

    var newId = 'GROUP_' + String(Date.now()).slice(-6);
    groups.push({ id: newId, name: name, isDefault: false, promotions: [] });

    closeGroupForm();
    // 刷新筛选下拉并自动选中新分组
    filterGroupId = newId;
    renderFilterGroupSelect();
    currentPage = 1;
    renderPromoList();
    window.showToast('分组「' + name + '」已创建', 'success');
  }

  function confirmDeleteGroup(groupId) {
    var groups = window.MockData.promotionGroups;
    var group = groups.filter(function (g) { return g.id === groupId; })[0];
    if (!group) return;

    if (group.isDefault) {
      window.showToast('默认分组不可删除', 'error');
      return;
    }

    var promoCount = (group.promotions || []).length;
    if (promoCount > 0) {
      window.showToast('该分组下有 ' + promoCount + ' 个推广位，请先移出或删除', 'error');
      return;
    }

    var msg = '确定删除分组「' + group.name + '」吗？删除后不可恢复。';
    showConfirm('删除分组', msg, function () {
      window.MockData.promotionGroups = groups.filter(function (g) { return g.id !== groupId; });
      filterGroupId = '';
      renderFilterGroupSelect();
      currentPage = 1;
      renderPromoList();
      window.showToast('分组已删除', 'success');
    });
  }

  // ===== 删除推广位 =====
  function confirmDeletePromo(promoId) {
    var promo = findPromoById(promoId);
    if (!promo) return;

    if (promo.isDefault) {
      window.showToast('默认推广位不可删除', 'error');
      return;
    }

    var msg = '确定删除推广位「' + promo.name + '」吗？删除后不可恢复。';
    if (promo.activityCount > 0) {
      msg += '\n\n该推广位已绑定 ' + promo.activityCount + ' 个活动，删除后相关链接将失效。';
    }
    showConfirm('删除推广位', msg, function () {
      executeDeletePromo(promoId);
    });
  }

  function executeDeletePromo(promoId) {
    var groups = window.MockData.promotionGroups;
    groups.forEach(function (g) {
      g.promotions = g.promotions.filter(function (p) { return p.id !== promoId; });
    });
    renderPromoList();
    window.showToast('推广位已删除', 'success');
  }

  // ===== 缺失活动计算 =====
  function getMissingActivities(promoId) {
    var thirdActs = (window.MockData && window.MockData.thirdPartyActivities) ? window.MockData.thirdPartyActivities : [];
    return thirdActs.filter(function (act) {
      // 统一路径模式下不视为缺失
      if (act.useUnifiedPath && act.unifiedPath && act.unifiedPath.trim() !== '') return false;
      var paths = act.promoPaths || {};
      return !paths[promoId] || paths[promoId].trim() === '';
    });
  }

  // ===== 获取预设活动列表 =====
  function getPresetActivities() {
    var activities = (window.MockData && window.MockData.availableActivities) ? window.MockData.availableActivities : [];
    return activities.filter(function (a) { return !!a.isPreset; });
  }

  // ===== 为新推广位自动填充预设活动到取链清单 =====
  function autoPopulateChainList(promoId) {
    var presetActs = getPresetActivities();
    if (presetActs.length === 0) return;

    if (!window.MockData.promoChainList) window.MockData.promoChainList = {};
    if (!window.MockData.promoChainList[promoId]) window.MockData.promoChainList[promoId] = [];

    presetActs.forEach(function (act) {
      // 避免重复添加
      var exists = window.MockData.promoChainList[promoId].some(function (item) {
        return item.activityId === act.id;
      });
      if (exists) return;

      var platformLabel = act.supplierLabel || act.platformLabel || act.platform || '';
      var baseUrl = act.h5Path || 'https://tbk.sunnycoffee.com/h5/' + act.id.toLowerCase();
      window.MockData.promoChainList[promoId].push({
        platform: platformLabel,
        activityName: act.name,
        activityId: act.id,
        longUrl: baseUrl + '?promoId=' + promoId.toLowerCase(),
        shortUrl: 'https://t.sun.im/' + randomShortCode(),
        deeplink: (act.platform || '') + '://tbk/benefit?promoId=' + promoId.toLowerCase(),
        miniPath: act.miniPath || '',
        qrcode: '',
        groupToken: act.password ? '￥' + act.password + '￥' : '',
        searchToken: '搜：' + act.name
      });
    });
  }

  function randomShortCode() {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = '';
    for (var i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ===== 取链清单 =====
  function getChainCount(promoId) {
    var list = (window.MockData && window.MockData.promoChainList) ? window.MockData.promoChainList : {};
    return (list[promoId] || []).length;
  }

  // ===== 小程序清单 =====
  function getMpCount(promoId) {
    var map = (window.MockData && window.MockData.promoMiniPrograms) ? window.MockData.promoMiniPrograms : {};
    return (map[promoId] || []).length;
  }

  var mpListCurrentPromo = null;

  function openMpListModal(promoId) {
    var promo = findPromoById(promoId);
    if (!promo) return;

    mpListCurrentPromo = promo;
    document.getElementById('mpListTitle').textContent = '小程序清单 - ' + promo.name;
    renderMpListTable();

    var overlay = document.getElementById('mpListOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.add('modal-animated');
    }
  }

  function renderMpListTable() {
    var promoId = mpListCurrentPromo ? mpListCurrentPromo.id : null;
    var map = (window.MockData && window.MockData.promoMiniPrograms) ? window.MockData.promoMiniPrograms : {};
    var mpList = promoId ? (map[promoId] || []) : [];

    var container = document.getElementById('mpCardList');
    var emptyEl = document.getElementById('mpListEmpty');
    if (!container) return;

    if (mpList.length === 0) {
      container.innerHTML = '';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    container.innerHTML = mpList.map(function (mp) {
      var statusClass = mp.status === 'normal' ? 'tag-success' : (mp.status === 'auditing' ? 'tag-warning' : 'tag-default');
      var statusText = mp.status === 'normal' ? '正常' : (mp.status === 'auditing' ? '审核中' : '已停用');
      var miniPath = mp.miniPath || '—';
      var qrcodeHtml = mp.qrcode
        ? '<div class="mp-card-qrcode"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg><span class="mp-card-qr-hint">扫码预览</span></div>'
        : '<div class="mp-card-qrcode is-empty">暂无</div>';

      return '<div class="mp-card">' +
        '<div class="mp-card-body">' +
          '<div class="mp-card-info">' +
            '<div class="mp-card-row"><span class="mp-card-label">名称</span><span class="mp-card-value mp-card-name">' + escHtml(mp.name) + '</span></div>' +
            '<div class="mp-card-row"><span class="mp-card-label">APPID</span><code class="mp-card-appid">' + escHtml(mp.appId) + '</code><button class="btn-copy-mp" data-copy="' + escAttr(mp.appId) + '" title="复制APPID">' + copyIcon() + '</button></div>' +
            '<div class="mp-card-row"><span class="mp-card-label">路径</span><span class="mp-card-value mp-card-path">' + escHtml(miniPath) + '</span><button class="btn-copy-mp" data-copy="' + escAttr(miniPath) + '" title="复制路径">' + copyIcon() + '</button></div>' +
          '</div>' +
          '<div class="mp-card-right">' +
            '<span class="tag ' + statusClass + ' mp-card-status">' + statusText + '</span>' +
            qrcodeHtml +
          '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  function closeMpListModal() {
    var overlay = document.getElementById('mpListOverlay');
    if (overlay) overlay.style.display = 'none';
    mpListCurrentPromo = null;
  }

  var chainFilterPlatform = 'all';
  var chainFilterKeyword = '';
  var chainAllItems = [];
  var chainCurrentPromo = null;  // { name, id }

  function openChainListModal(promoId) {
    var promo = findPromoById(promoId);
    if (!promo) return;

    // 确保数据结构存在
    if (!window.MockData.promoChainList) window.MockData.promoChainList = {};
    if (!window.MockData.promoChainList[promoId]) window.MockData.promoChainList[promoId] = [];

    // 如果该推广位还没有取链数据，自动填充预设活动
    if (window.MockData.promoChainList[promoId].length === 0) {
      autoPopulateChainList(promoId);
    }

    chainAllItems = window.MockData.promoChainList[promoId];
    chainCurrentPromo = { name: promo.name, id: promoId };
    chainFilterPlatform = 'all';
    chainFilterKeyword = '';
    document.getElementById('chainSearchInput').value = '';

    document.getElementById('chainListTitle').textContent = '取链清单 - ' + promo.name;

    // 重置tab
    document.querySelectorAll('.chain-tab').forEach(function (t) { t.classList.remove('active'); });
    var firstTab = document.querySelector('.chain-tab[data-platform="all"]');
    if (firstTab) firstTab.classList.add('active');

    renderChainTable();

    var overlay = document.getElementById('chainListOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.add('modal-animated');
    }
  }

  function renderChainTable() {
    var filtered = chainAllItems.filter(function (item) {
      if (chainFilterPlatform !== 'all') {
        if (chainFilterPlatform === '其他') {
          if (item.platform === '美团' || item.platform === '饿了么') return false;
        } else {
          if (item.platform !== chainFilterPlatform) return false;
        }
      }
      if (chainFilterKeyword) {
        var kw = chainFilterKeyword.toLowerCase();
        if (item.activityName.toLowerCase().indexOf(kw) === -1 && item.activityId.toLowerCase().indexOf(kw) === -1) return false;
      }
      return true;
    });

    var promoName = chainCurrentPromo ? chainCurrentPromo.name : '';
    var promoId = chainCurrentPromo ? chainCurrentPromo.id : '';
    document.getElementById('chainInfoBar').innerHTML = '<span>推广位：<strong>' + escHtml(promoName) + '</strong></span><span>ID：<code>' + escHtml(promoId) + '</code></span><span>共 <strong>' + filtered.length + '</strong> 个活动</span>';

    var tbody = document.getElementById('chainTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state" style="padding:40px"><div class="empty-state-text">暂无匹配的活动</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (item) {
      var globalIdx = chainAllItems.indexOf(item);
      var shortDisplay = item.shortUrl ? escHtml(truncatePath(item.shortUrl, 32)) : '<span style="color:var(--color-text-tertiary)">—</span>';
      return '<tr class="chain-main-row" data-chain-idx="' + globalIdx + '">' +
        '<td><span class="chain-platform-tag">' + escHtml(item.platform) + '</span></td>' +
        '<td>' + escHtml(item.activityName) + '<br><span style="font-size:11px;color:var(--color-text-tertiary)">ID: ' + escHtml(item.activityId) + '</span></td>' +
        '<td><span class="chain-short-link" title="' + escAttr(item.shortUrl || '') + '">' + shortDisplay + '</span></td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-sm btn-link btn-chain-expand" data-idx="' + globalIdx + '">查看更多</button>' +
          '<button class="btn btn-sm btn-link btn-chain-delete" data-idx="' + globalIdx + '" style="color:var(--color-danger)">删除</button>' +
        '</td>' +
        '</tr>' +
        '<tr class="chain-detail-row" id="chainDetail-' + globalIdx + '" style="display:none">' +
          '<td colspan="4">' +
            '<div class="chain-detail-grid">' +
              chainDetailItem('长链接', item.longUrl) +
              chainDetailItem('短链接', item.shortUrl) +
              chainDetailItem('呼起协议', item.deeplink) +
              chainDetailItem('小程序路径', item.miniPath) +
              chainDetailItem('团口令', item.groupToken) +
              chainDetailItem('搜索密令', item.searchToken) +
              '<div class="chain-detail-item">' +
                '<span class="chain-detail-label">小程序二维码</span>' +
                '<div class="chain-qrcode-placeholder" title="点击放大预览">' +
                  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' +
                  '<span style="font-size:10px;color:#999;">点击放大</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
        '</tr>';
    }).join('');
  }

  function chainDetailItem(label, value) {
    var display = value || '—';
    var copyBtn = value
      ? '<button class="btn-copy-chain" data-copy="' + escAttr(value) + '" title="复制">' + copyIcon() + '</button>'
      : '';
    return '<div class="chain-detail-item">' +
      '<span class="chain-detail-label">' + label + '</span>' +
      '<span class="chain-detail-value">' + escHtml(display) + '</span>' +
      copyBtn +
      '</div>';
  }

  // ===== 新增链接 =====
  function getChainAddActivityOptions() {
    var acts = [];
    // 预设活动
    var presetActs = getPresetActivities();
    presetActs.forEach(function (a) {
      acts.push({ id: a.id, name: a.name, platform: a.supplierLabel || a.platformLabel || a.platform || '', isPreset: true });
    });
    // 已有取链清单中的活动（去重）
    chainAllItems.forEach(function (item) {
      var dup = acts.some(function (a) { return a.name === item.activityName; });
      if (!dup) {
        acts.push({ id: item.activityId, name: item.activityName, platform: item.platform, isPreset: false });
      }
    });
    return acts;
  }

  function openChainAddModal() {
    try {
      var rows = document.getElementById('chainAddRows');
      if (!rows) { window.showToast('chainAddRows not found', 'error'); return; }
      rows.innerHTML = '';
      addChainRow();
      var overlay = document.getElementById('chainAddOverlay');
      if (!overlay) { window.showToast('chainAddOverlay not found', 'error'); return; }
      overlay.style.display = 'flex';
      overlay.classList.add('modal-animated');
    } catch (e) {
      window.showToast('error: ' + e.message, 'error');
    }
  }
  window.__openChainAddModal = openChainAddModal;
  window.__closeChainAddModal = closeChainAddModal;
  window.__addChainRow = addChainRow;
  window.__batchAddChainItems = batchAddChainItems;
  window.__closeChainListModal = closeChainListModal;
  window.__openChainListModal = openChainListModal;

  function closeChainAddModal() {
    var overlay = document.getElementById('chainAddOverlay');
    if (overlay) {
      if (typeof closeModalAnimated === 'function') {
        closeModalAnimated(overlay);
      } else {
        overlay.style.display = 'none';
      }
    }
    var rows = document.getElementById('chainAddRows');
    if (rows) rows.innerHTML = '';
  }

  function addChainRow() {
    var rows = document.getElementById('chainAddRows');
    if (!rows) return;
    var idx = rows.children.length;
    var activityOptions = getChainAddActivityOptions();
    var div = document.createElement('div');
    div.className = 'chain-add-row';
    div.setAttribute('data-idx', idx);
    div.innerHTML =
      '<select class="input chain-add-platform" data-idx="' + idx + '" style="width:120px">' +
        '<option value="">选择平台</option>' +
        '<option value="美团">美团联盟</option>' +
        '<option value="饿了么">饿了么联盟</option>' +
        '<option value="京东">京东</option>' +
        '<option value="打车">打车</option>' +
        '<option value="其他">其他</option>' +
      '</select>' +
      '<select class="input chain-add-activity" data-idx="' + idx + '" style="width:160px">' +
        '<option value="">选择活动</option>' +
        activityOptions.map(function (a) {
          var label = a.name + (a.isPreset ? ' [预设]' : '');
          return '<option value="' + escAttr(a.id) + '" data-name="' + escAttr(a.name) + '" data-platform="' + escAttr(a.platform) + '" data-preset="' + (a.isPreset ? '1' : '0') + '">' + escHtml(label) + '</option>';
        }).join('') +
        '<option value="__new__">+ 新增活动</option>' +
      '</select>' +
      '<span class="chain-add-new-fields" data-idx="' + idx + '" style="display:none">' +
        '<input class="input chain-add-new-name" placeholder="活动名称" style="width:100px" maxlength="10">' +
        '<input class="input chain-add-new-appid" placeholder="APPID" style="width:130px" maxlength="20">' +
      '</span>' +
      '<button class="btn btn-sm btn-link chain-add-remove" data-idx="' + idx + '" style="color:var(--color-danger)">移除</button>';
    rows.appendChild(div);

    // 平台change事件
    var platformSel = div.querySelector('.chain-add-platform');
    platformSel.addEventListener('change', function () {
      onChainAddPlatformChange(idx);
    });

    // 活动change事件
    var activitySel = div.querySelector('.chain-add-activity');
    activitySel.addEventListener('change', function () {
      onChainAddActivityChange(idx);
    });

    // 移除按钮
    div.querySelector('.chain-add-remove').addEventListener('click', function () {
      div.remove();
    });
  }

  function onChainAddPlatformChange(idx) {
    var row = document.querySelector('.chain-add-row[data-idx="' + idx + '"]');
    if (!row) return;
    var platform = row.querySelector('.chain-add-platform').value;
    var activitySel = row.querySelector('.chain-add-activity');
    var currentVal = activitySel.value;

    var activityOptions = getChainAddActivityOptions();
    if (platform) {
      // 映射平台值到数据中的 supplier
      var platformMap = { '美团': 'meituan', '饿了么': 'eleme', '京东': 'jd', '打车': 'taxi' };
      var mappedPlatform = platformMap[platform] || platform;
      activityOptions = activityOptions.filter(function (a) {
        var ap = a.platform || '';
        return ap.indexOf(platform) !== -1 || ap.indexOf(mappedPlatform) !== -1;
      });
    }

    var options = activityOptions.map(function (a) {
      var label = a.name + (a.isPreset ? ' [预设]' : '');
      return '<option value="' + escAttr(a.id) + '" data-name="' + escAttr(a.name) + '" data-platform="' + escAttr(a.platform) + '" data-preset="' + (a.isPreset ? '1' : '0') + '">' + escHtml(label) + '</option>';
    }).join('');

    if (platform === '其他') {
      options += '<option value="__new__">+ 新增活动</option>';
    } else {
      if (currentVal === '__new__') currentVal = '';
    }

    activitySel.innerHTML = '<option value="">选择活动</option>' + options;
    activitySel.value = currentVal;
    onChainAddActivityChange(idx);
  }

  function onChainAddActivityChange(idx) {
    var row = document.querySelector('.chain-add-row[data-idx="' + idx + '"]');
    if (!row) return;
    var platform = row.querySelector('.chain-add-platform').value;
    var activity = row.querySelector('.chain-add-activity').value;
    var newFields = row.querySelector('.chain-add-new-fields');
    if (platform === '其他' && activity === '__new__') {
      newFields.style.display = '';
    } else {
      newFields.style.display = 'none';
    }
  }

  function batchAddChainItems() {
    var rows = document.querySelectorAll('.chain-add-row');
    var added = 0;
    rows.forEach(function (row) {
      var platform = row.querySelector('.chain-add-platform').value;
      var activitySel = row.querySelector('.chain-add-activity');
      var activityVal = activitySel.value;
      if (!platform || !activityVal) return;

      var activityName, activityId;
      if (activityVal === '__new__') {
        var nameInput = row.querySelector('.chain-add-new-name');
        var appidInput = row.querySelector('.chain-add-new-appid');
        activityName = nameInput ? nameInput.value.trim() : '';
        activityId = appidInput ? appidInput.value.trim() : '';
        if (!activityName || !activityId) return;
      } else {
        // 从选中的 option 获取活动信息
        var selectedOption = activitySel.selectedOptions[0];
        activityName = selectedOption ? selectedOption.getAttribute('data-name') : activityVal;
        activityId = activityVal;

        // 查找活动原始数据获取更多信息
        var activities = (window.MockData && window.MockData.availableActivities) ? window.MockData.availableActivities : [];
        var foundAct = activities.find(function (a) { return a.id === activityId; });
        if (foundAct) {
          chainAllItems.push({
            platform: platform,
            activityName: foundAct.name,
            activityId: foundAct.id,
            longUrl: (foundAct.h5Path || 'https://tbk.sunnycoffee.com/h5/' + foundAct.id.toLowerCase()) + '?promoId=' + (chainCurrentPromo ? chainCurrentPromo.id : ''),
            shortUrl: 'https://t.sun.im/' + randomShortCode(),
            deeplink: (foundAct.platform || '') + '://tbk/benefit?promoId=' + (chainCurrentPromo ? chainCurrentPromo.id : ''),
            miniPath: foundAct.miniPath || '',
            groupToken: foundAct.password ? '￥' + foundAct.password + '￥' : '',
            searchToken: '搜：' + foundAct.name
          });
          added++;
          return; // 跳过下面的通用push
        }
      }

      chainAllItems.push({
        platform: platform,
        activityName: activityName,
        activityId: activityId,
        longUrl: '',
        shortUrl: '',
        deeplink: '',
        miniPath: '',
        groupToken: '',
        searchToken: ''
      });
      added++;
    });

    if (added > 0) {
      window.showToast('已添加 ' + added + ' 个链接', 'success');
      closeChainAddModal();
      renderChainTable();
    } else {
      window.showToast('请填写完整的平台和活动信息', 'error');
    }
  }

  function deleteChainItem(idx) {
    if (idx < 0 || idx >= chainAllItems.length) return;
    var item = chainAllItems[idx];
    var msg = '确定删除活动「' + item.activityName + '」（' + item.platform + '）的取链链接吗？删除后不可恢复。';
    showConfirm('删除链接', msg, function () {
      chainAllItems.splice(idx, 1);
      renderChainTable();
      window.showToast('链接已删除', 'success');
    });
  }

  function closeChainListModal() {
    var overlay = document.getElementById('chainListOverlay');
    if (overlay) overlay.style.display = 'none';
  }


  // ===== 工具函数 =====
  function findPromoById(id) {
    var all = window.MockData.getAllPromotions();
    return all.filter(function (p) { return p.id === id; })[0] || null;
  }

  function formatNow() {
    var d = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function copyIcon() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        window.showToast('已复制到剪贴板', 'success');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      window.showToast('已复制到剪贴板', 'success');
    } catch (e) {
      window.showToast('复制失败，请手动复制', 'error');
    }
    document.body.removeChild(ta);
  }

  function truncatePath(path, maxLen) {
    if (!path) return '';
    if (path.length <= maxLen) return path;
    return path.substring(0, maxLen) + '...';
  }

  // ===== 通用确认弹窗 =====
  function showConfirm(title, msg, onConfirm) {
    var overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML =
      '<div class="confirm-box">' +
      '<div class="confirm-header">' + escHtml(title) + '</div>' +
      '<div class="confirm-body" style="white-space:pre-line">' + escHtml(msg) + '</div>' +
      '<div class="confirm-footer">' +
      '<button class="btn btn-cancel-confirm">取消</button>' +
      '<button class="btn btn-primary btn-ok-confirm">确定</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.btn-cancel-confirm').onclick = function () { overlay.remove(); };
    overlay.querySelector('.btn-ok-confirm').onclick = function () { overlay.remove(); if (onConfirm) onConfirm(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
  }


})();
