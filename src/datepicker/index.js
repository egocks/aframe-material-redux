const Event = require('../core/event');
const FormControlHelpers = require('../core/form-control-helpers');

(function(){
  if (typeof AFRAME === 'undefined') { return; }

  const SVG_W = 1024;
  const SVG_H = 768;

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function daysInMonth(year, month){
    return new Date(year, month + 1, 0).getDate();
  }

  function firstWeekday(year, month){
    return new Date(year, month, 1).getDay(); // 0..6, Sun=0
  }

  function pad2(n){ return (n < 10 ? '0' : '') + n; }

  function toISO(y, m, d){ return y + '-' + pad2(m+1) + '-' + pad2(d); }

  function parseISO(str){
    if (!str) return null;
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(str);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const d = parseInt(m[3], 10);
    return new Date(y, mo, d);
  }

  function sameDate(a, b){
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function todayDate(){
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }

  function formatMonthYear(locale, year, month){
    try {
      const dtf = new Intl.DateTimeFormat(locale || 'en-US', { month: 'long', year: 'numeric' });
      return dtf.format(new Date(year, month, 1));
    } catch (e) {
      return `${year}-${pad2(month+1)}`;
    }
  }

  function weekdayLabels(locale, weekStart){
    const base = [];
    try {
      const dtf = new Intl.DateTimeFormat(locale || 'en-US', { weekday: 'short' });
      // Build week starting Sunday=0 then rotate by weekStart
      for (let i=0;i<7;i++) base.push(dtf.format(new Date(2021, 7, 1 + i))); // arbitrary week
    } catch(e) {
      base.push('Sun','Mon','Tue','Wed','Thu','Fri','Sat');
    }
    if (!Number.isInteger(weekStart)) weekStart = 0;
    weekStart = ((weekStart % 7) + 7) % 7;
    const rotated = [];
    for (let i=0;i<7;i++) rotated.push(base[(i + weekStart) % 7]);
    return rotated;
  }

  AFRAME.registerComponent('datepicker', {
    schema: {
      // Value & constraints
      value: { type: 'string', default: '' }, // YYYY-MM-DD
      min: { type: 'string', default: '' },
      max: { type: 'string', default: '' },
      disabledDates: { type: 'string', default: '' }, // JSON array of ISO dates
      weekStart: { type: 'int', default: 0 },
      locale: { type: 'string', default: 'en-US' },
      disabled: { type: 'boolean', default: false },

      // Layout
      width: { type: 'number', default: 1.2 },
      paddingX: { type: 'number', default: 24 },
      paddingY: { type: 'number', default: 24 },
      cellGap: { type: 'number', default: 8 },

      // Colors
      bgColor: { type: 'color', default: '#FFFFFF' },
      gridColor: { type: 'color', default: '#E5E7EB' },
      dayTextColor: { type: 'color', default: '#111827' },
      mutedTextColor: { type: 'color', default: '#9CA3AF' },
      disabledTextColor: { type: 'color', default: '#9CA3AF' },
      weekdayTextColor: { type: 'color', default: '#6B7280' },
      monthTextColor: { type: 'color', default: '#111827' },
      selectionFill: { type: 'color', default: '#2563EB' },
      selectionTextColor: { type: 'color', default: '#FFFFFF' },
      todayRingColor: { type: 'color', default: '#2563EB' },

      // Typography
      fontFamily: { type: 'string', default: 'system-ui, -apple-system, Segoe UI, Roboto' },
      fontSizeMonth: { type: 'number', default: 36 },
      fontSizeWeekday: { type: 'number', default: 20 },
      fontSizeDay: { type: 'number', default: 26 },

      // Background panel (outer)
      backgroundColor: { type: 'color', default: '#FFFFFF' },
      backgroundRadius: { type: 'number', default: 0.02 },
      backgroundOpacity: { type: 'number', default: 0.95 },
      backgroundHeight: { type: 'number', default: 0 },

      // Navigation
      navEnabled: { type: 'boolean', default: true }
    },

    init: function(){
      // Helpers
      FormControlHelpers.initFormControl(this);

      // Internal state
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth(); // 0..11
      this._blobUrl = null;
      this._disabledSet = new Set();

      // Children
      this._createChildren();

      // Parse initial value/month if provided
      if (this.data.value) {
        const d = parseISO(this.data.value);
        if (d) { this.currentYear = d.getFullYear(); this.currentMonth = d.getMonth(); }
      }

      // Render initial
      this._renderAndApply();

      // Interaction
      this._bindHandlers();

      // ARIA
      this.el.setAttribute('role', 'grid');
      this.el.setAttribute('aria-label', 'Calendar');
    },

    update: function(old){
      // Recompute on changes to props that affect SVG or layout
      if (!old) return;
      this._renderAndApply();
    },

    pause: function(){
      // no timers used
    },

    remove: function(){
      // Cleanup events
      FormControlHelpers.unbindAllEvents(this);
      // Cleanup children if tracked
      FormControlHelpers.cleanupChildren(this);
      // Revoke blob
      if (this._blobUrl) {
        try { URL.revokeObjectURL(this._blobUrl); } catch(e) {}
        this._blobUrl = null;
      }
    },

    // Public API
    focus: function(){ if (!this._focused){ this._focused = true; Event.emit(this.el, 'focus'); } },
    blur: function(){ if (this._focused){ this._focused = false; Event.emit(this.el, 'blur'); } },
    setValue: function(iso){ this.el.setAttribute('datepicker', 'value', iso || ''); },
    clear: function(){ this.setValue(''); },
    prevMonth: function(){ this._shiftMonth(-1); },
    nextMonth: function(){ this._shiftMonth(1); },
    goTo: function(month, year){ this.currentMonth = clamp(month,0,11); this.currentYear = year; this._renderAndApply(); },

    // Internals
    _createChildren: function(){
      const d = this.data;

      // Outer background
      this.bg = document.createElement('a-rounded');
      this.el.appendChild(this.bg);
      FormControlHelpers.trackChild(this, this.bg);

      // Calendar plane (image)
      this.plane = document.createElement('a-plane');
      this.el.appendChild(this.plane);
      FormControlHelpers.trackChild(this, this.plane);

      // Invisible hitbox (exact size) for UV picking
      this.hitbox = document.createElement('a-plane');
      this.hitbox.setAttribute('opacity', 0);
      this.el.appendChild(this.hitbox);
      FormControlHelpers.trackChild(this, this.hitbox);

      this._updateSizes();
    },

    _updateSizes: function(){
      const d = this.data;
      const planeW = d.width;
      const planeH = d.width * (SVG_H / SVG_W);

      // Place background left-bottom anchored similar to other controls
      this.bg.setAttribute('color', d.backgroundColor);
      this.bg.setAttribute('opacity', d.backgroundOpacity);
      this.bg.setAttribute('radius', d.backgroundRadius);
      this.bg.setAttribute('width', planeW);
      this.bg.setAttribute('height', d.backgroundHeight || planeH);
      this.bg.setAttribute('position', `0 ${-(d.backgroundHeight || planeH)/2} 0.001`);

      // Plane sits slightly above bg
      this.plane.setAttribute('width', planeW);
      this.plane.setAttribute('height', planeH);
      this.plane.setAttribute('position', `${planeW/2} 0 0.002`);

      this.hitbox.setAttribute('width', planeW);
      this.hitbox.setAttribute('height', planeH);
      this.hitbox.setAttribute('position', `${planeW/2} 0 0.003`);
    },

    _bindHandlers: function(){
      const onClick = (evt)=>{
        if (this.data.disabled) return;
        if (!evt || !evt.detail || !evt.detail.intersection || !evt.detail.intersection.uv) return;
        const uv = evt.detail.intersection.uv;
        this._handlePick(uv.x, uv.y);
      };
      FormControlHelpers.bindEvent(this, this.hitbox, 'click', onClick);
    },

    _shiftMonth: function(delta){
      let m = this.currentMonth + delta;
      let y = this.currentYear;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      this.currentMonth = m; this.currentYear = y;
      this._renderAndApply();
    },

    _parseDisabledSet: function(){
      this._disabledSet.clear();
      if (!this.data.disabledDates) return;
      try {
        const arr = JSON.parse(this.data.disabledDates);
        if (Array.isArray(arr)) {
          for (const iso of arr) this._disabledSet.add(String(iso));
        }
      } catch(e) {}
    },

    _buildModel: function(){
      const d = this.data;
      this._parseDisabledSet();
      const year = this.currentYear;
      const month = this.currentMonth;
      const minD = parseISO(d.min);
      const maxD = parseISO(d.max);
      const today = todayDate();

      const dim = daysInMonth(year, month);
      const fwd = firstWeekday(year, month); // 0..6 Sun
      const startOffset = ((fwd - (d.weekStart||0)) % 7 + 7) % 7;
      const prevDim = daysInMonth(year, (month + 11) % 12);
      const rowCount = (startOffset + dim) > 35 ? 6 : 5;

      const valueDate = parseISO(d.value);

      return {
        year, month, dim, prevDim, startOffset, rowCount,
        minD, maxD, today, valueDate,
        weekdays: weekdayLabels(d.locale, d.weekStart)
      };
    },

    _renderAndApply: function(){
      this._updateSizes();
      const model = this._buildModel();
      const svg = this._renderSvg(model);
      this._applyTexture(svg);
    },

    _applyTexture: function(svgString){
      if (this._blobUrl) {
        try { URL.revokeObjectURL(this._blobUrl); } catch(e) {}
        this._blobUrl = null;
      }
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      this._blobUrl = url;
      this.plane.setAttribute('material', { src: url, side: 'double', transparent: false });
    },

    _handlePick: function(u, v){
      // Map uv (0..1, origin bottom-left) to SVG
      const xSvg = u * SVG_W;
      const ySvg = (1 - v) * SVG_H;
      const d = this.data;

      // Layout constants
      const paddingX = d.paddingX;
      const paddingY = d.paddingY;
      const headerH = 120; // fixed per plan
      const weekdayH = 60;
      const navW = this.data.navEnabled ? 100 : 0; // clickable zone width in SVG units

      // Header/nav zones
      if (ySvg >= paddingY && ySvg <= paddingY + headerH) {
        if (this.data.navEnabled) {
          // left nav
          if (xSvg >= paddingX && xSvg <= paddingX + navW) { this.prevMonth(); return; }
          // right nav
          if (xSvg >= (SVG_W - paddingX - navW) && xSvg <= (SVG_W - paddingX)) { this.nextMonth(); return; }
        }
        // Else ignore clicks on header/title
        return;
      }

      // Weekday row ignore
      if (ySvg > paddingY + headerH && ySvg <= paddingY + headerH + weekdayH) {
        return;
      }

      const model = this._buildModel();
      const gridTop = paddingY + headerH + weekdayH;
      const gridH = (SVG_H - paddingY*2 - headerH - weekdayH);
      const rowCount = model.rowCount;
      const cellH = (gridH - d.cellGap * (rowCount - 1)) / rowCount;
      const totalGridW = SVG_W - paddingX*2;
      const cellW = (totalGridW - d.cellGap * 6) / 7;

      // Inside grid?
      if (ySvg < gridTop || ySvg > gridTop + gridH || xSvg < paddingX || xSvg > SVG_W - paddingX) {
        return;
      }

      const localX = xSvg - paddingX;
      const localY = ySvg - gridTop;

      // col with gap compensation
      const colW = cellW + d.cellGap;
      const rowH = cellH + d.cellGap;

      let col = Math.floor(localX / colW);
      let row = Math.floor(localY / rowH);
      col = clamp(col, 0, 6);
      row = clamp(row, 0, rowCount - 1);

      const index = row * 7 + col;
      const startOffset = model.startOffset;
      const dim = model.dim;

      let year = model.year;
      let month = model.month;
      let day;

      if (index < startOffset) {
        // Previous month
        const prevMonth = (month + 11) % 12;
        const prevYear = month === 0 ? (year - 1) : year;
        const prevDim = model.prevDim;
        day = prevDim - (startOffset - index - 1);
        year = prevYear; month = prevMonth;
      } else if (index >= startOffset + dim) {
        // Next month
        const nextMonth = (month + 1) % 12;
        const nextYear = month === 11 ? (year + 1) : year;
        day = (index - (startOffset + dim)) + 1;
        year = nextYear; month = nextMonth;
      } else {
        day = (index - startOffset) + 1;
      }

      const iso = toISO(year, month, day);

      // Validate constraints
      const minD = model.minD; const maxD = model.maxD;
      const pickD = new Date(year, month, day);
      if ((minD && pickD < minD) || (maxD && pickD > maxD) || this._disabledSet.has(iso)) {
        Event.emit(this.el, 'invalid', { value: iso });
        return;
      }

      // Update state: changing month if needed so selected date is visible in its month
      this.currentYear = year; this.currentMonth = month;
      this.el.setAttribute('datepicker', 'value', iso);
      this._renderAndApply();
      Event.emit(this.el, 'change', { value: iso });
    },

    _renderSvg: function(model){
      const d = this.data;
      const paddingX = d.paddingX;
      const paddingY = d.paddingY;
      const headerH = 120;
      const weekdayH = 60;
      const gridH = (SVG_H - paddingY*2 - headerH - weekdayH);
      const rowCount = model.rowCount;
      const cellH = (gridH - d.cellGap * (rowCount - 1)) / rowCount;
      const totalGridW = SVG_W - paddingX*2;
      const cellW = (totalGridW - d.cellGap * 6) / 7;
      const startX = paddingX;
      const startY = paddingY + headerH + weekdayH;

      const monthLabel = formatMonthYear(d.locale, model.year, model.month);
      const weekdays = model.weekdays;

      // Build grid cells and day labels
      let cells = '';

      // Draw background rectangle
      let content = `\n  <rect x="0" y="0" width="${SVG_W}" height="${SVG_H}" fill="${d.bgColor}"/>`;

      // Header month text
      content += `\n  <text x="${SVG_W/2}" y="${paddingY + headerH/2 + d.fontSizeMonth/3}" text-anchor="middle" fill="${d.monthTextColor}" font-family="${d.fontFamily}" font-size="${d.fontSizeMonth}">${monthLabel}</text>`;

      // Nav chevrons as simple text if enabled
      if (d.navEnabled){
        const navY = paddingY + headerH/2 + d.fontSizeMonth/3;
        content += `\n  <text x="${paddingX + 40}" y="${navY}" text-anchor="middle" fill="${d.monthTextColor}" font-family="${d.fontFamily}" font-size="${d.fontSizeMonth}">◀</text>`;
        content += `\n  <text x="${SVG_W - paddingX - 40}" y="${navY}" text-anchor="middle" fill="${d.monthTextColor}" font-family="${d.fontFamily}" font-size="${d.fontSizeMonth}">▶</text>`;
      }

      // Weekday labels
      const weekdayY = paddingY + headerH + weekdayH/2 + d.fontSizeWeekday/3;
      for (let c=0;c<7;c++){
        const x = startX + c*(cellW + d.cellGap) + cellW/2;
        content += `\n  <text x="${x}" y="${weekdayY}" text-anchor="middle" fill="${d.weekdayTextColor}" font-family="${d.fontFamily}" font-size="${d.fontSizeWeekday}">${weekdays[c]}</text>`;
      }

      // Grid lines (vertical)
      for (let c=0;c<=7;c++){
        const gx = startX + c*(cellW + d.cellGap) - (c?d.cellGap:0);
        content += `\n  <line x1="${gx}" y1="${startY}" x2="${gx}" y2="${startY + rowCount*cellH + (rowCount-1)*d.cellGap}" stroke="${d.gridColor}" stroke-width="1"/>`;
      }
      // Grid lines (horizontal)
      for (let r=0;r<=rowCount;r++){
        const gy = startY + r*(cellH + d.cellGap) - (r?d.cellGap:0);
        content += `\n  <line x1="${startX}" y1="${gy}" x2="${startX + 7*cellW + 6*d.cellGap}" y2="${gy}" stroke="${d.gridColor}" stroke-width="1"/>`;
      }

      const startOffset = model.startOffset;
      const dim = model.dim;
      const prevDim = model.prevDim;
      const valueDate = model.valueDate;
      const today = model.today;

      for (let i=0;i<42;i++){
        const row = Math.floor(i/7);
        const col = i % 7;
        if (row >= rowCount) break;
        const x = startX + col*(cellW + d.cellGap);
        const y = startY + row*(cellH + d.cellGap);

        let yyy, mmm, day, cls = 'active';
        if (i < startOffset){
          // prev month
          const pm = (model.month + 11) % 12;
          const py = model.month === 0 ? model.year - 1 : model.year;
          day = prevDim - (startOffset - i - 1);
          yyy = py; mmm = pm; cls = 'other';
        } else if (i >= startOffset + dim){
          // next month
          const nm = (model.month + 1) % 12;
          const ny = model.month === 11 ? model.year + 1 : model.year;
          day = (i - (startOffset + dim)) + 1;
          yyy = ny; mmm = nm; cls = 'other';
        } else {
          day = (i - startOffset) + 1;
          yyy = model.year; mmm = model.month; cls = 'active';
        }

        const iso = toISO(yyy, mmm, day);
        const isSelected = valueDate && (valueDate.getFullYear() === yyy && valueDate.getMonth() === mmm && valueDate.getDate() === day);
        const isToday = sameDate(today, new Date(yyy, mmm, day));

        // Determine text color
        let textColor = (cls === 'active') ? d.dayTextColor : d.mutedTextColor;
        // Disabled state
        const minD = model.minD; const maxD = model.maxD;
        const cd = new Date(yyy, mmm, day);
        const isDisabled = (minD && cd < minD) || (maxD && cd > maxD) || this._disabledSet.has(iso);
        if (isDisabled) textColor = d.disabledTextColor;

        // Selection fill
        if (isSelected) {
          content += `\n  <rect x="${x+2}" y="${y+2}" width="${cellW-4}" height="${cellH-4}" rx="6" ry="6" fill="${d.selectionFill}"/>`;
        }

        // Today ring on top (stroke)
        if (isToday) {
          content += `\n  <rect x="${x+2}" y="${y+2}" width="${cellW-4}" height="${cellH-4}" rx="6" ry="6" fill="none" stroke="${d.todayRingColor}" stroke-width="2"/>`;
        }

        // Day number centered
        const cx = x + cellW/2;
        const cy = y + cellH/2 + d.fontSizeDay/3;
        const dayFill = isSelected ? d.selectionTextColor : textColor;
        content += `\n  <text x="${cx}" y="${cy}" text-anchor="middle" fill="${dayFill}" font-family="${d.fontFamily}" font-size="${d.fontSizeDay}">${day}</text>`;
      }

      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n`+
`<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">\n`+
`${content}\n`+
`\n</svg>`;
      return svg;
    }
  });

  AFRAME.registerPrimitive('a-datepicker', {
    defaultComponents: {
      datepicker: {}
    },
    mappings: {
      // Value & constraints
      value: 'datepicker.value',
      min: 'datepicker.min',
      max: 'datepicker.max',
      'disabled-dates': 'datepicker.disabledDates',
      'week-start': 'datepicker.weekStart',
      locale: 'datepicker.locale',
      disabled: 'datepicker.disabled',

      // Layout
      width: 'datepicker.width',
      'padding-x': 'datepicker.paddingX',
      'padding-y': 'datepicker.paddingY',
      'cell-gap': 'datepicker.cellGap',

      // Colors
      'bg-color': 'datepicker.bgColor',
      'grid-color': 'datepicker.gridColor',
      'day-text-color': 'datepicker.dayTextColor',
      'muted-text-color': 'datepicker.mutedTextColor',
      'disabled-text-color': 'datepicker.disabledTextColor',
      'weekday-text-color': 'datepicker.weekdayTextColor',
      'month-text-color': 'datepicker.monthTextColor',
      'selection-fill': 'datepicker.selectionFill',
      'selection-text-color': 'datepicker.selectionTextColor',
      'today-ring-color': 'datepicker.todayRingColor',

      // Typography
      'font-family': 'datepicker.fontFamily',
      'font-size-month': 'datepicker.fontSizeMonth',
      'font-size-weekday': 'datepicker.fontSizeWeekday',
      'font-size-day': 'datepicker.fontSizeDay',

      // Background panel
      'background-color': 'datepicker.backgroundColor',
      'background-radius': 'datepicker.backgroundRadius',
      'background-opacity': 'datepicker.backgroundOpacity',
      'background-height': 'datepicker.backgroundHeight',

      // Navigation
      'nav-enabled': 'datepicker.navEnabled'
    }
  });
})();
