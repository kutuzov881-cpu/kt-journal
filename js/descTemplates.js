// ============================================================
// БИБЛИОТЕКА ШАБЛОНОВ ОПИСАНИЙ (ДЛЯ ВРАЧА)
// ============================================================

// Отрисовка библиотеки шаблонов описаний (вкладка "Шаблоны")
function renderDescTemplatesList(containerId, showActions = true) {
    const el = document.getElementById(containerId);
    if (!el) return;

    let html = '';

    TEMPLATE_CATEGORIES.forEach(cat => {
        const temps = state.descTemplates.filter(t => t.category === cat.id);
        if (!temps.length) return;

        const uid = containerId + '-' + cat.id;

        html +=
            '<div class="template-group">' +
            '<div class="template-group-header" onclick="document.getElementById(\'' + uid + '-body\').classList.toggle(\'collapsed\');document.getElementById(\'' + uid + '-arrow\').textContent=document.getElementById(\'' + uid + '-body\').classList.contains(\'collapsed\')?\'▶\':\'▼\'">' +
            '<span>' + cat.name + ' <span class="badge">' + temps.length + '</span></span>' +
            '<span id="' + uid + '-arrow">▶</span>' +
            '</div>' +
            '<div class="template-group-body collapsed" id="' + uid + '-body">' +
            temps.map(t => {
                const zoneLabel = t.zone ? ' [' + t.zone + ']' : '';
                return '<div class="template-chip" style="padding-right:' + (showActions ? '24px' : '8px') + '">' +
                    '<div onclick="insertDescTemplate(\'' + t.id + '\')" style="cursor:pointer">' +
                    '<div class="template-chip-title">' + t.name + zoneLabel + '</div>' +
                    '<div class="template-chip-preview">' + t.text.slice(0, 60) + '...</div>' +
                    '</div>' +
                    (showActions ?
                        '<div class="template-chip-actions">' +
                        '<button onclick="editDescTemplate(\'' + t.id + '\')" title="Редактировать">✏️</button>' +
                        '<button onclick="deleteDescTemplate(\'' + t.id + '\')" title="Удалить">🗑️</button>' +
                        '</div>' :
                        '') +
                    '</div>';
            }).join('') +
            '</div>' +
            '</div>';
    });

    el.innerHTML = html ||
        '<div style="font-size:11px;color:var(--text-muted);text-align:center;padding:10px">Нет шаблонов. Нажмите «➕ Создать шаблон»</div>';
}

// Отрисовка шаблонов в правой панели врача (с фильтром по зоне)
// Используется в doctorWorkspace.js при выборе зоны
function renderGroupedTemplates(zoneName) {
    let filtered = state.descTemplates;
    if (zoneName) {
        filtered = state.descTemplates.filter(t => t.zone === zoneName || t.zone === '' || !t.zone);
    }

    const el = document.getElementById('groupedTemplatesPanel');
    if (!el) return;

    let html = '';

    TEMPLATE_CATEGORIES.forEach(cat => {
        const temps = filtered.filter(t => t.category === cat.id);
        if (!temps.length) return;

        const uid = 'grouped-' + cat.id;

        html +=
            '<div class="template-group">' +
            '<div class="template-group-header" onclick="document.getElementById(\'' + uid + '-body\').classList.toggle(\'collapsed\');document.getElementById(\'' + uid + '-arrow\').textContent=document.getElementById(\'' + uid + '-body\').classList.contains(\'collapsed\')?\'▶\':\'▼\'">' +
            '<span>' + cat.name + ' <span class="badge">' + temps.length + '</span></span>' +
            '<span id="' + uid + '-arrow">▶</span>' +
            '</div>' +
            '<div class="template-group-body collapsed" id="' + uid + '-body">' +
            temps.map(t => {
                const zoneLabel = t.zone ? ' [' + t.zone + ']' : '';
                return '<div class="template-chip" style="padding-right:8px">' +
                    '<div onclick="insertDescTemplate(\'' + t.id + '\')" style="cursor:pointer">' +
                    '<div class="template-chip-title">' + t.name + zoneLabel + '</div>' +
                    '<div class="template-chip-preview">' + t.text.slice(0, 60) + '...</div>' +
                    '</div>' +
                    '</div>';
            }).join('') +
            '</div>' +
            '</div>';
    });

    el.innerHTML = html ||
        '<div style="font-size:11px;color:var(--text-muted);text-align:center;padding:10px">Нет шаблонов для выбранной зоны</div>';
}

// ============================================================
// МОДАЛКА СО СПИСКОМ ВСЕХ ШАБЛОНОВ (открывается по кнопке 📚 Шаблоны)
// ============================================================
function openTemplatesListModal() {
    const searchInput = document.getElementById('templatesSearchInput');
    if (searchInput) searchInput.value = '';

    renderTemplatesListModal();
    openModal('templatesListModal');
}

function renderTemplatesListModal() {
    const el = document.getElementById('templatesListModalBody');
    if (!el) return;

    // Получаем поисковый запрос
    const searchInput = document.getElementById('templatesSearchInput');
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Фильтруем шаблоны по поиску
    let filteredTemplates = state.descTemplates;
    if (searchText) {
        filteredTemplates = state.descTemplates.filter(t =>
            t.name.toLowerCase().includes(searchText) ||
            t.text.toLowerCase().includes(searchText)
        );
    }

    let html = '';

    TEMPLATE_CATEGORIES.forEach(cat => {
        const temps = filteredTemplates.filter(t => t.category === cat.id);
        if (!temps.length) return;

        const uid = 'modal-' + cat.id;

        html +=
            '<div class="template-group">' +
            '<div class="template-group-header" onclick="document.getElementById(\'' + uid + '-body\').classList.toggle(\'collapsed\');document.getElementById(\'' + uid + '-arrow\').textContent=document.getElementById(\'' + uid + '-body\').classList.contains(\'collapsed\')?\'▶\':\'▼\'">' +
            '<span>' + cat.name + ' <span class="badge">' + temps.length + '</span></span>' +
            '<span id="' + uid + '-arrow">▶</span>' +
            '</div>' +
            '<div class="template-group-body collapsed" id="' + uid + '-body">' +
            temps.map(t => {
                const zoneLabel = t.zone ? ' [' + t.zone + ']' : '';
                return '<div class="template-chip" style="padding-right:80px;position:relative">' +
                    '<div onclick="insertDescTemplateAndClose(\'' + t.id + '\')" style="cursor:pointer">' +
                    '<div class="template-chip-title">' + t.name + zoneLabel + '</div>' +
                    '<div class="template-chip-preview">' + t.text.slice(0, 80) + '...</div>' +
                    '</div>' +
                    '<div class="template-chip-actions" style="top:8px;right:8px">' +
                    '<button onclick="event.stopPropagation();editFromTemplatesList(\'' + t.id + '\')" title="Редактировать" style="font-size:14px;padding:4px">✏️</button>' +
                    '<button onclick="event.stopPropagation();deleteFromTemplatesList(\'' + t.id + '\')" title="Удалить" style="font-size:14px;padding:4px">🗑️</button>' +
                    '</div>' +
                    '</div>';
            }).join('') +
            '</div>' +
            '</div>';
    });

    // Если ничего не найдено
    if (!html) {
        if (searchText) {
            el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">' +
                '<div style="font-size:48px;margin-bottom:12px;opacity:.4">🔍</div>' +
                '<div>Ничего не найдено по запросу «' + searchText + '»</div>' +
                '</div>';
        } else {
            el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">' +
                '<div style="font-size:48px;margin-bottom:12px;opacity:.4">📭</div>' +
                '<div>Нет шаблонов. Нажмите «➕ Новый шаблон»</div>' +
                '</div>';
        }
        return;
    }

    el.innerHTML = html;
}

// Вставка шаблона + автозакрытие модалки списка
function insertDescTemplateAndClose(id) {
    insertDescTemplate(id);
    closeModal('templatesListModal');
}

// Редактирование шаблона из модалки списка
function editFromTemplatesList(id) {
    closeModal('templatesListModal');
    editDescTemplate(id);
}

// Удаление шаблона из модалки списка
function deleteFromTemplatesList(id) {
    if (!confirm('Удалить шаблон описания?')) return;

    state.descTemplates = state.descTemplates.filter(t => t.id !== id);
    saveState();

    // Обновляем оба списка
    renderDescTemplatesList('descTemplatesList', true);
    renderGroupedTemplates(null);
    renderTemplatesListModal();

    toast('Шаблон удалён', 'success');
}

// ============================================================
// СОЗДАНИЕ / РЕДАКТИРОВАНИЕ / УДАЛЕНИЕ ШАБЛОНА ОПИСАНИЯ
// ============================================================

function openDescTemplateModal() {
    state.editingDescTemplateId = null;

    const titleEl = document.getElementById('descTemplateModalTitle');
    if (titleEl) titleEl.textContent = '📝 Новый шаблон описания';

    const nameEl = document.getElementById('descTemplateName');
    if (nameEl) nameEl.value = '';

    const catEl = document.getElementById('descTemplateCategory');
    if (catEl) catEl.value = 'ogk';

    const textEl = document.getElementById('descTemplateText');
    if (textEl) textEl.value = '';

    openModal('descTemplateModal');
}

function editDescTemplate(id) {
    const t = state.descTemplates.find(x => x.id === id);
    if (!t) return;

    state.editingDescTemplateId = id;

    const titleEl = document.getElementById('descTemplateModalTitle');
    if (titleEl) titleEl.textContent = '✏️ Редактирование шаблона';

    const nameEl = document.getElementById('descTemplateName');
    if (nameEl) nameEl.value = t.name;

    const catEl = document.getElementById('descTemplateCategory');
    if (catEl) catEl.value = t.category;

    const textEl = document.getElementById('descTemplateText');
    if (textEl) textEl.value = t.text;

    openModal('descTemplateModal');
}

function saveDescTemplate() {
    const nameEl = document.getElementById('descTemplateName');
    const catEl = document.getElementById('descTemplateCategory');
    const textEl = document.getElementById('descTemplateText');

    const n = nameEl ? nameEl.value.trim() : '';
    const c = catEl ? catEl.value : 'other';
    const t = textEl ? textEl.value.trim() : '';

    if (!n || !t) {
        toast('Заполните название и текст', 'error');
        return;
    }

    if (state.editingDescTemplateId) {
        const idx = state.descTemplates.findIndex(x => x.id === state.editingDescTemplateId);
        if (idx >= 0) {
            state.descTemplates[idx] = {
                ...state.descTemplates[idx],
                name: n,
                category: c,
                text: t
            };
        }
        toast('Шаблон обновлён', 'success');
    } else {
        state.descTemplates.push({
            id: uid(),
            name: n,
            category: c,
            zone: '',
            text: t
        });
        toast('Шаблон добавлен', 'success');
    }

    saveState();
    closeModal('descTemplateModal');

    renderDescTemplatesList('descTemplatesList', true);
    renderGroupedTemplates(null);
}

function deleteDescTemplate(id) {
    if (!confirm('Удалить шаблон описания?')) return;

    state.descTemplates = state.descTemplates.filter(t => t.id !== id);
    saveState();

    renderDescTemplatesList('descTemplatesList', true);
    renderGroupedTemplates(null);

    toast('Удалён', 'success');
}

// Вставка шаблона в поле описания
function insertDescTemplate(id) {
    const t = state.descTemplates.find(x => x.id === id);
    if (!t) return;

    const ta = document.getElementById('doctorDescription');
    if (!ta) return;

    const cur = ta.value.trim();
    const separator = cur ? '\n' : '';

    ta.value = cur + separator + t.text;
    ta.scrollTop = ta.scrollHeight;

    toast('Шаблон добавлен в описание зоны', 'success');
}

// Экспорт шаблонов описаний в JSON
function exportDescTemplates() {
    const data = JSON.stringify(state.descTemplates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'desc-templates-' + todayISO() + '.json';
    a.click();

    URL.revokeObjectURL(url);

    toast('Шаблоны описаний экспортированы', 'success');
}

// Импорт шаблонов описаний из JSON
function importDescTemplates(event) {
    const f = event.target.files[0];
    if (!f) return;

    const r = new FileReader();
    r.onload = e => {
        try {
            const imported = JSON.parse(e.target.result);

            if (Array.isArray(imported)) {
                const existingIds = new Set(state.descTemplates.map(t => t.id));
                const newTemplates = imported.filter(t => !existingIds.has(t.id));

                state.descTemplates = [...state.descTemplates, ...newTemplates];
                saveState();

                renderDescTemplatesList('descTemplatesList', true);
                renderGroupedTemplates(null);
                if (typeof renderTemplatesListModal === 'function') {
                    renderTemplatesListModal();
                }

                toast('Импортировано шаблонов: ' + newTemplates.length, 'success');
            }
        } catch (err) {
            toast('Ошибка чтения файла', 'error');
        }
    };
    r.readAsText(f);

    event.target.value = '';
}