// ============================================================
// ЗАГРУЗКА И СОХРАНЕНИЕ ДАННЫХ
// ============================================================

function loadState() {
    try {
        const s = localStorage.getItem(STORAGE_KEY);

        if (s) {
            const p = JSON.parse(s);

            state.studies = (p.studies || []).map(migrateStudy);
            state.templates = p.templates || [];
            state.drugs = p.drugs || DEFAULT_DRUGS;
            state.consumables = p.consumables || DEFAULT_CONSUMABLES;

            state.descTemplates = (p.descTemplates || DEFAULT_DESC_TEMPLATES).map(t => {
                if (!t.zone) t.zone = '';
                return t;
            });

            state.operations = p.operations || [];
            state.requests = p.requests || [];
        }

        const st = localStorage.getItem(SETTINGS_KEY);
        if (st) {
            const saved = JSON.parse(st);
            const defaultPasswords = state.settings.passwords;
            state.settings = { ...state.settings, ...saved };

            // Пароли — все 4 ключа
            state.settings.passwords = {
                lab:    (saved.passwords && saved.passwords.lab)    || defaultPasswords.lab    || 'lab',
                doctor: (saved.passwords && saved.passwords.doctor) || defaultPasswords.doctor || 'doctor',
                admin:  (saved.passwords && saved.passwords.admin)  || defaultPasswords.admin  || 'admin',
                dept:   (saved.passwords && saved.passwords.dept)   || defaultPasswords.dept   || 'dept'
            };

            // ✅ МИГРАЦИЯ: если referringDoctors нет — добавить пустой массив
            if (!Array.isArray(state.settings.referringDoctors)) {
                state.settings.referringDoctors = [];
            }
        }

    } catch (e) {
        console.warn('Ошибка загрузки', e);
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            studies: state.studies,
            templates: state.templates,
            drugs: state.drugs,
            consumables: state.consumables,
            descTemplates: state.descTemplates,
            operations: state.operations,
            requests: state.requests
        }));
    } catch (e) {
        toast('Ошибка сохранения', 'error');
    }
}

function saveSettingsToStorage() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (e) {}
}

// ============================================================
// ЭКСПОРТ/ИМПОРТ JSON
// ============================================================

function exportJSON() {
    const d = {
        version: 24,
        exportedAt: new Date().toISOString(),
        studies: state.studies,
        templates: state.templates,
        drugs: state.drugs,
        consumables: state.consumables,
        descTemplates: state.descTemplates,
        operations: state.operations,
        requests: state.requests,
        settings: state.settings
    };

    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(b);

    const a = document.createElement('a');
    a.href = u;
    a.download = 'ct-journal-' + todayISO() + '.json';
    a.click();

    URL.revokeObjectURL(u);

    toast('JSON сохранён', 'success');
}

function importJSON(event) {
    const f = event.target.files[0];
    if (!f) return;

    const r = new FileReader();
    r.onload = e => {
        try {
            const d = JSON.parse(e.target.result);

            if (!confirm('Импортировать?\n• Исследований: ' + (d.studies?.length || 0) + '\n• Заявок: ' + (d.requests?.length || 0))) return;

            state.studies = (d.studies || []).map(migrateStudy);
            state.templates = d.templates || [];
            state.drugs = d.drugs || DEFAULT_DRUGS;
            state.consumables = d.consumables || DEFAULT_CONSUMABLES;
            state.descTemplates = (d.descTemplates || DEFAULT_DESC_TEMPLATES).map(t => {
                if (!t.zone) t.zone = '';
                return t;
            });
            state.operations = d.operations || [];
            state.requests = d.requests || [];

            if (d.settings) {
                state.settings = { ...state.settings, ...d.settings };
                if (!Array.isArray(state.settings.referringDoctors)) {
                    state.settings.referringDoctors = [];
                }
            }

            saveState();
            saveSettingsToStorage();
            initApp();

            toast('Импорт выполнен', 'success');

        } catch (err) {
            toast('Ошибка', 'error');
        }
    };
    r.readAsText(f);

    event.target.value = '';
}

// ============================================================
// ЭКСПОРТ CSV (журнал исследований)
// ============================================================

function exportCSV() {
    const headers = [
        '№', '№ смена', 'Статус', 'Дата', 'Время', 'ФИО',
        'Д.р.', 'Возраст', '№ истории', 'Отделение', 'Шаблон',
        'МКБ-10', 'Поступил', 'Зоны', 'Общая доза', 'Контраст',
        'Врач', 'Лаборант', 'Подписан', 'Дата подписи'
    ];

    const numMap = calculateNumbers();
    const statusNames = { pending: 'Ожидает', described: 'Описано', signed: 'Подписано' };

    const rows = state.studies.map(s => {
        const n = numMap[s.id] || { global: '-', shift: '-' };
        const zonesStr = (s.zones || []).map(z => z.name + ' (' + z.type + ')').join('; ');

        return [
            n.global, n.shift, statusNames[s.status || 'pending'],
            s.studyDate, s.studyTime, s.fio, s.birthDate, s.age,
            s.historyNum, s.dept, s.templateName, s.icdDisplay,
            (s.admitDate || '') + ' ' + (s.admitTime || ''),
            zonesStr, s.totalDose, s.contrast, s.doctor, s.lab,
            s.signedBy || '', s.signedAt || ''
        ];
    });

    const csv = [headers, ...rows].map(r =>
        r.map(c => '"' + (c || '').toString().replace(/"/g, '""') + '"').join(';')
    ).join('\n');

    const b = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const u = URL.createObjectURL(b);

    const a = document.createElement('a');
    a.href = u;
    a.download = 'ct-journal-' + todayISO() + '.csv';
    a.click();

    URL.revokeObjectURL(u);

    toast('CSV сохранён', 'success');
}