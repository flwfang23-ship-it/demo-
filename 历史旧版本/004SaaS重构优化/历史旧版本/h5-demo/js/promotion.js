/**
 * C03 推广位管理 — 列表/新增/编辑/删除/设为默认
 */
(function () {
  'use strict';

  var PAGE_SIZE = 20;
  var currentPage = 1;
  var searchKeyword = '';
  var editMode = 'create';   // 'create' | 'edit'
  var editingPromoId = null;

  // ===== 入口 =====
  window.initPromotionList = function () {
    currentPage = 1;
    searchKeyword = '';
    var si = document.getElementById('promoSearchInput');
    if (si) si.value = '';
    renderPromoList();
    bindPromoEvents();
  };

  // ===== 渲染列表 =====
  function renderPromoList() {
    var list = getFilteredList();
    var totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * PAGE_SIZE;
    var pageItems = list.slice(start, start + PAGE_SIZE);

    var tbody = document.getElementById('promoTableBody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">📌</div><div class="empty-state-text">暂无推广位数据</div></div></td></tr>';
      renderPagination(0, 0);
      return;
    }

    tbody.innerHTML = pageItems.map(function (p) {
      var defaultTag = p.isDefault ? '<span class="tag tag-primary">默认</span>' : '';
      var nameClass = p.isDefault ? 'promo-name-default' : '';
      var actions = p.isDefault
        ? '<button class="btn btn-sm btn-link btn-edit-promo" data-id="' + p.id + '">编辑</button>'
        : '<button class="btn btn-sm btn-link btn-set-default" data-id="' + p.id + '">设为默认</button>' +
          '<button class="btn btn-sm btn-link btn-edit-promo" data-id="' + p.id + '">编辑</button>' +
          '<button class="btn btn-sm btn-link btn-delete-promo" data-id="' + p.id + '" style="color:var(--color-danger)">删除</button>';
      return '<tr class="' + (p.isDefault ? 'promo-row-default' : '') + '">' +
        '<td><span class="' + nameClass + '">' + escHtml(p.name) + '</span> ' + defaultTag + '</td>' +
        '<td><code style="font-size:12px;background:#f5f5f5;padding:2px 6px;border-radius:3px;">' + escHtml(p.id) + '</code></td>' +
        '<td>' + (p.isDefault ? '✅' : '—') + '</td>' +
        '<td>' + p.activityCount + '</td>' +
        '<td>' + p.createTime + '</td>' +
        '<td style="white-space:nowrap">' + actions + '</td>' +
        '</tr>';
    }).join('');

    renderPagination(list.length, totalPages);
  }

  function getFilteredList() {
    var list = window.MockData.promotions;
    if (!searchKeyword) return list;
    var kw = searchKeyword.toLowerCase();
    return list.filter(function (p) {
      return p.name.toLowerCase().indexOf(kw) > -1 || p.id.toLowerCase().indexOf(kw) > -1;
    });
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

    // 新增按钮
    var addBtn = document.getElementById('btnAddPromo');
    if (addBtn) {
      addBtn.onclick = function () { openPromoForm('create'); };
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
        } else if (btn.classList.contains('btn-set-default')) {
          setDefaultPromo(id);
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

    // Modal 事件
    bindModalEvents();
  }

  function bindModalEvents() {
    var overlay = document.getElementById('promoFormOverlay');
    var cancelBtn = document.getElementById('btnPromoCancel');
    var saveBtn = document.getElementById('btnPromoSave');
    var nameInput = document.getElementById('promoNameInput');

    if (cancelBtn) {
      cancelBtn.onclick = closePromoForm;
    }
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
  }

  // ===== 新增/编辑弹窗 =====
  function openPromoForm(mode, promoId) {
    editMode = mode;
    editingPromoId = promoId || null;

    var overlay = document.getElementById('promoFormOverlay');
    var title = document.getElementById('promoFormTitle');
    var input = document.getElementById('promoNameInput');
    var hint = document.getElementById('promoFormHint');

    if (!overlay) return;

    if (mode === 'edit') {
      var promo = findPromoById(promoId);
      if (!promo) return;
      if (title) title.textContent = '编辑推广位';
      if (input) { input.value = promo.name; input.removeAttribute('readonly'); }
      if (hint) hint.textContent = '推广位ID：' + promo.id + '（不可修改）';
    } else {
      if (title) title.textContent = '新增推广位';
      if (input) input.value = '';
      if (hint) hint.textContent = '推广位名称不超过20个字符';
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

    // 重名检查
    var dup = window.MockData.promotions.filter(function (p) {
      return p.name === name && p.id !== editingPromoId;
    });
    if (dup.length > 0) {
      if (error) { error.textContent = '推广位名称已存在，请更换'; error.style.display = 'block'; }
      return;
    }

    if (editMode === 'edit' && editingPromoId) {
      var promo = findPromoById(editingPromoId);
      if (promo) promo.name = name;
      window.showToast('推广位已更新', 'success');
    } else {
      var newId = 'PROMO_' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 100)).padStart(2, '0');
      window.MockData.promotions.push({
        id: newId,
        name: name,
        isDefault: false,
        activityCount: 6,
        createTime: formatNow()
      });
      window.showToast('推广位已创建', 'success');
    }

    closePromoForm();
    renderPromoList();
  }

  // ===== 设为默认 =====
  function setDefaultPromo(promoId) {
    window.MockData.promotions.forEach(function (p) {
      p.isDefault = (p.id === promoId);
    });
    renderPromoList();
    window.showToast('已设为默认推广位', 'success');
  }

  // ===== 删除 =====
  function confirmDeletePromo(promoId) {
    var promo = findPromoById(promoId);
    if (!promo) return;

    if (promo.isDefault) {
      window.showToast('默认推广位不可删除', 'error');
      return;
    }

    var msg = '确定删除推广位「' + promo.name + '」吗？删除后不可恢复。';
    if (promo.activityCount > 0) {
      msg += '\n\n⚠ 该推广位已绑定 ' + promo.activityCount + ' 个活动，删除后相关链接将失效。';
    }
    showConfirm('删除推广位', msg, function () {
      executeDeletePromo(promoId);
    });
  }

  function executeDeletePromo(promoId) {
    window.MockData.promotions = window.MockData.promotions.filter(function (p) {
      return p.id !== promoId;
    });
    renderPromoList();
    window.showToast('推广位已删除', 'success');
  }

  // ===== 工具函数 =====
  function findPromoById(id) {
    return window.MockData.promotions.filter(function (p) { return p.id === id; })[0] || null;
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
