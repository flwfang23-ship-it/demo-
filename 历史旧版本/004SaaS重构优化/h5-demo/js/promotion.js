/**
 * C03 推广位管理 — 分组Tab切换 / 分组CRUD / 推广位CRUD
 */
(function () {
  'use strict';

  var PAGE_SIZE = 20;
  var currentPage = 1;
  var searchKeyword = '';
  var activeGroupId = 'all';   // 'all' | groupId
  var editMode = 'create';     // 'create' | 'edit'
  var editingPromoId = null;

  // ===== 入口 =====
  window.initPromotionList = function () {
    currentPage = 1;
    searchKeyword = '';
    activeGroupId = 'all';
    var si = document.getElementById('promoSearchInput');
    if (si) si.value = '';
    renderGroupTabs();
    renderPromoList();
    bindPromoEvents();
  };

  // ===== 分组Tab栏渲染 =====
  function renderGroupTabs() {
    var tabsContainer = document.getElementById('promoGroupTabs');
    if (!tabsContainer) return;

    var groups = window.MockData.promotionGroups || [];

    var html = '<div class="promo-group-tab-item' + (activeGroupId === 'all' ? ' active' : '') + '" data-group-id="all">全部</div>';
    groups.forEach(function (g) {
      var isActive = activeGroupId === g.id;
      var showClose = !g.isDefault;
      html += '<div class="promo-group-tab-item' + (isActive ? ' active' : '') + '" data-group-id="' + g.id + '">';
      html += '<span class="promo-group-tab-label">' + escHtml(g.name) + '</span>';
      if (showClose) {
        html += '<span class="promo-group-tab-close" data-group-id="' + g.id + '" title="删除分组">&times;</span>';
      }
      html += '</div>';
    });
    tabsContainer.innerHTML = html;

    // 绑定Tab点击
    tabsContainer.querySelectorAll('.promo-group-tab-item').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        if (e.target.classList.contains('promo-group-tab-close')) return; // 不触发Tab切换
        var gid = this.getAttribute('data-group-id');
        switchGroupTab(gid);
      });
    });

    // 绑定关闭按钮（删除分组）
    tabsContainer.querySelectorAll('.promo-group-tab-close').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var gid = this.getAttribute('data-group-id');
        confirmDeleteGroup(gid);
      });
    });
  }

  function switchGroupTab(groupId) {
    activeGroupId = groupId;
    currentPage = 1;
    renderGroupTabs();
    renderPromoList();
  }

  function getActiveGroupId() {
    return activeGroupId;
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

    // 控制"所属分组"列表头显示
    var groupColHead = document.querySelector('.promo-group-col-head');
    if (groupColHead) {
      groupColHead.style.display = (activeGroupId !== 'all') ? 'none' : '';
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">📌</div><div class="empty-state-text">暂无推广位数据</div></div></td></tr>';
      renderPagination(0, 0);
      return;
    }

    tbody.innerHTML = pageItems.map(function (p) {
      var defaultTag = p.isDefault ? '<span class="tag tag-primary">默认</span>' : '';
      var nameClass = p.isDefault ? 'promo-name-default' : '';
      var groupName = p.groupName || '—';
      var actions;
      if (p.isDefault) {
        actions = '<button class="btn btn-sm btn-link btn-edit-promo" data-id="' + p.id + '">编辑</button>';
      } else {
        actions = '<button class="btn btn-sm btn-link btn-edit-promo" data-id="' + p.id + '">编辑</button>' +
          '<button class="btn btn-sm btn-link btn-delete-promo" data-id="' + p.id + '" style="color:var(--color-danger)">删除</button>';
      }

      var groupColHtml = '<td class="promo-group-col-cell"' + (activeGroupId !== 'all' ? ' style="display:none"' : '') + '><span class="group-tag">' + escHtml(groupName) + '</span></td>';

      return '<tr class="' + (p.isDefault ? 'promo-row-default' : '') + '">' +
        '<td><span class="' + nameClass + '">' + escHtml(p.name) + '</span> ' + defaultTag + '</td>' +
        '<td><code style="font-size:12px;background:#f5f5f5;padding:2px 6px;border-radius:3px;">' + escHtml(p.id) + '</code></td>' +
        groupColHtml +
        '<td>' + p.activityCount + '</td>' +
        '<td>' + p.createTime + '</td>' +
        '<td style="white-space:nowrap">' + actions + '</td>' +
        '</tr>';
    }).join('');

    renderPagination(list.length, totalPages);
  }

  function getFilteredList() {
    var list = window.MockData.getAllPromotions();
    // 按分组过滤
    if (activeGroupId !== 'all') {
      list = list.filter(function (p) {
        return p.groupId === activeGroupId;
      });
    }
    // 按搜索词过滤
    if (searchKeyword) {
      var kw = searchKeyword.toLowerCase();
      list = list.filter(function (p) {
        return p.name.toLowerCase().indexOf(kw) > -1 || p.id.toLowerCase().indexOf(kw) > -1;
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
    // 搜索
    var si = document.getElementById('promoSearchInput');
    if (si) {
      si.oninput = function () {
        searchKeyword = this.value.trim();
        currentPage = 1;
        renderPromoList();
      };
    }

    // 新增推广位按钮
    var addBtn = document.getElementById('btnAddPromo');
    if (addBtn) {
      addBtn.onclick = function () { openPromoForm('create'); };
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
        var id = btn.getAttribute('data-id');

        if (btn.classList.contains('btn-edit-promo')) {
          openPromoForm('edit', id);
        } else if (btn.classList.contains('btn-delete-promo')) {
          confirmDeletePromo(id);
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
    // === 推广位表单弹窗 ===
    var overlay = document.getElementById('promoFormOverlay');
    var saveBtn = document.getElementById('btnPromoSave');
    var nameInput = document.getElementById('promoNameInput');
    var cancelBtns = document.querySelectorAll('#btnPromoCancel, #btnPromoCancel2');

    cancelBtns.forEach(function (btn) {
      btn.onclick = closePromoForm;
    });
    if (overlay) {
      overlay.onclick = function (e) {
        if (e.target === overlay) closePromoForm();
      };
    }
    if (saveBtn) {
      saveBtn.onclick = savePromoForm;
    }
    if (nameInput) {
      nameInput.onkeydown = function (e) {
        if (e.key === 'Enter') savePromoForm();
        if (e.key === 'Escape') closePromoForm();
      };
    }

    // 分组选择器 "+ 新建" 按钮
    var btnNewGroup = document.getElementById('btnPromoNewGroup');
    if (btnNewGroup) {
      btnNewGroup.onclick = function () {
        document.getElementById('promoGroupSelect').parentNode.style.display = 'none';
        document.getElementById('promoGroupInputRow').style.display = 'flex';
        var input = document.getElementById('promoNewGroupInput');
        input.value = '';
        input.focus();
      };
    }

    // 分组选择器 "确认"
    var btnConfirmGroup = document.getElementById('btnPromoConfirmGroup');
    if (btnConfirmGroup) {
      btnConfirmGroup.onclick = confirmNewGroupInline;
    }

    // 分组选择器 "取消"
    var btnCancelGroup = document.getElementById('btnPromoCancelGroup');
    if (btnCancelGroup) {
      btnCancelGroup.onclick = cancelNewGroupInline;
    }

    // 新分组输入框回车
    var newGroupInput = document.getElementById('promoNewGroupInput');
    if (newGroupInput) {
      newGroupInput.onkeydown = function (e) {
        if (e.key === 'Enter') confirmNewGroupInline();
        if (e.key === 'Escape') cancelNewGroupInline();
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

  // ===== 分组内嵌新建（推广位弹窗中的"+ 新建"） =====
  function confirmNewGroupInline() {
    var input = document.getElementById('promoNewGroupInput');
    var errorEl = document.getElementById('promoGroupError');
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

    // 创建新分组
    var newId = 'GROUP_' + String(Date.now()).slice(-6);
    groups.push({ id: newId, name: name, isDefault: false, promotions: [] });

    // 恢复选择器状态并选中新分组
    cancelNewGroupInline();
    renderGroupSelect(newId);
    renderGroupTabs();

    if (errorEl) errorEl.style.display = 'none';
  }

  function cancelNewGroupInline() {
    document.getElementById('promoGroupSelect').parentNode.style.display = 'flex';
    document.getElementById('promoGroupInputRow').style.display = 'none';
    document.getElementById('promoNewGroupInput').value = '';
    var errorEl = document.getElementById('promoGroupError');
    if (errorEl) errorEl.style.display = 'none';
  }

  function renderGroupSelect(selectedGroupId) {
    var select = document.getElementById('promoGroupSelect');
    if (!select) return;

    var groups = window.MockData.promotionGroups || [];
    // 默认分组置顶
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

  // ===== 新增/编辑推广位弹窗 =====
  function openPromoForm(mode, promoId) {
    editMode = mode;
    editingPromoId = promoId || null;

    var overlay = document.getElementById('promoFormOverlay');
    var title = document.getElementById('promoFormTitle');
    var input = document.getElementById('promoNameInput');
    var hint = document.getElementById('promoFormHint');
    var error = document.getElementById('promoFormError');
    var groupError = document.getElementById('promoGroupError');

    if (!overlay) return;

    if (error) error.style.display = 'none';
    if (groupError) groupError.style.display = 'none';

    // 重置分组选择器状态
    document.getElementById('promoGroupSelect').parentNode.style.display = 'flex';
    document.getElementById('promoGroupInputRow').style.display = 'none';

    if (mode === 'edit') {
      var promo = findPromoById(promoId);
      if (!promo) return;
      if (title) title.textContent = '编辑推广位';
      if (input) { input.value = promo.name; input.removeAttribute('readonly'); }
      if (hint) hint.textContent = '推广位ID：' + promo.id + '（不可修改）';
      // 编辑时不可修改分组
      renderGroupSelect(promo.groupId);
      document.getElementById('promoGroupSelect').disabled = true;
      var btnNew = document.getElementById('btnPromoNewGroup');
      if (btnNew) btnNew.style.display = 'none';
    } else {
      if (title) title.textContent = '新增推广位';
      if (input) input.value = '';
      if (hint) hint.textContent = '推广位名称不超过20个字符';
      // 默认选中默认分组
      renderGroupSelect('GROUP_DEFAULT');
      document.getElementById('promoGroupSelect').disabled = false;
      var btnNew2 = document.getElementById('btnPromoNewGroup');
      if (btnNew2) btnNew2.style.display = '';
    }

    overlay.style.display = 'flex';
    overlay.classList.add('modal-animated');
    setTimeout(function () {
      if (input) input.focus();
    }, 100);
  }

  function closePromoForm() {
    var overlay = document.getElementById('promoFormOverlay');
    if (overlay) {
      if (typeof closeModalAnimated === 'function') {
        closeModalAnimated(overlay);
      } else {
        overlay.style.display = 'none';
      }
    }
    editMode = 'create';
    editingPromoId = null;
  }

  function savePromoForm() {
    var input = document.getElementById('promoNameInput');
    var error = document.getElementById('promoFormError');
    var groupError = document.getElementById('promoGroupError');
    if (!input) return;

    var name = input.value.trim();
    if (!name) {
      if (error) { error.textContent = '请输入推广位名称'; error.style.display = 'block'; }
      return;
    }
    if (name.length > 20) {
      if (error) { error.textContent = '名称不能超过20个字符'; error.style.display = 'block'; }
      return;
    }

    // 获取目标分组
    var groupId;
    if (editMode === 'edit' && editingPromoId) {
      var existing = findPromoById(editingPromoId);
      groupId = existing ? existing.groupId : null;
    } else {
      groupId = document.getElementById('promoGroupSelect').value;
    }

    // 重名检查（同一分组内）
    var groups = window.MockData.promotionGroups;
    var dup = false;
    groups.forEach(function (g) {
      (g.promotions || []).forEach(function (p) {
        if (p.name === name && p.id !== editingPromoId && g.id === groupId) {
          dup = true;
        }
      });
    });
    if (dup) {
      if (error) { error.textContent = '该分组下已有同名推广位，请更换'; error.style.display = 'block'; }
      return;
    }

    if (editMode === 'edit' && editingPromoId) {
      var promo = findPromoById(editingPromoId);
      if (promo) {
        promo.name = name;
      }
      window.showToast('推广位已更新', 'success');
    } else {
      var newId = 'PROMO_' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 100)).padStart(2, '0');
      var targetGroup = groups.filter(function (g) { return g.id === groupId; })[0];
      if (targetGroup) {
        targetGroup.promotions.push({
          id: newId,
          name: name,
          isDefault: false,
          activityCount: 6,
          createTime: formatNow()
        });
      }
      window.showToast('推广位已创建', 'success');
    }

    closePromoForm();
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
    // 自动选中新分组
    switchGroupTab(newId);
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
      switchGroupTab('all');
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
