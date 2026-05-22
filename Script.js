(() => {
  'use strict';

  const form        = document.getElementById('admissionForm');
  const progressBar = document.getElementById('progressBar');
  const stepNav     = document.getElementById('stepNav');
  const successState = document.getElementById('successState');
  const resetBtn    = document.getElementById('resetBtn');
  const stmtArea    = document.getElementById('statement');
  const stmtCounter = document.getElementById('stmtCounter');

  const totalSteps  = 4;
  let currentStep   = 1;

  function goToStep(n) {
    const from = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const to   = document.querySelector(`.form-step[data-step="${n}"]`);
    if (!from || !to) return;

    from.hidden = true;
    to.hidden = false;
    // re-trigger animation
    to.style.animation = 'none';
    to.offsetHeight; // reflow
    to.style.animation = '';

    currentStep = n;
    updateProgress();
    updateStepNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress() {
    progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
  }

  function updateStepNav() {
    stepNav.querySelectorAll('.step-item').forEach(item => {
      const s = parseInt(item.dataset.step);
      item.classList.toggle('active', s === currentStep);
      item.classList.toggle('done',   s < currentStep);
    });
  }

  function showError(field, msg) {
    const wrap = field.closest('.field-wrap');
    const err  = wrap?.querySelector('.err-msg');
    field.classList.add('invalid');
    field.classList.remove('valid');
    if (err) err.textContent = msg;
    return false;
  }

  function clearError(field) {
    const wrap = field.closest('.field-wrap');
    const err  = wrap?.querySelector('.err-msg');
    field.classList.remove('invalid');
    if (err) err.textContent = '';
  }

  function markValid(field) {
    field.classList.add('valid');
    field.classList.remove('invalid');
    const wrap = field.closest('.field-wrap');
    const err  = wrap?.querySelector('.err-msg');
    if (err) err.textContent = '';
  }

  function validateField(field) {
    const name  = field.name;
    const val   = field.value.trim();
    const type  = field.type;

    if (field.required && !val) {
      return showError(field, 'This field is required.');
    }

    if (type === 'email' && val) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return showError(field, 'Enter a valid email address.');
    }

    if (type === 'tel' && val) {
      if (!/^[\d\s\+\-\(\)]{7,20}$/.test(val))
        return showError(field, 'Enter a valid phone number.');
    }

    if (name === 'gradYear' && val) {
      const y = parseInt(val);
      if (y < 1990 || y > 2030)
        return showError(field, 'Enter a year between 1990 and 2030.');
    }

    if (name === 'zipCode' && val) {
      if (!/^[A-Za-z0-9\s\-]{3,10}$/.test(val))
        return showError(field, 'Enter a valid ZIP / postal code.');
    }

    if (name === 'statement' && val) {
      const words = countWords(val);
      if (words < 50)
        return showError(field, `Please write at least 50 words (current: ${words}).`);
      if (words > 300)
        return showError(field, `Keep your statement under 300 words (current: ${words}).`);
    }

    markValid(field);
    return true;
  }

  function validateStep(stepNum) {
    const section = document.querySelector(`.form-step[data-step="${stepNum}"]`);
    if (!section) return true;

    let valid = true;
    const fields = section.querySelectorAll('input, select, textarea');

    fields.forEach(f => {
      if (f.type === 'radio') return; 
      if (f.type === 'checkbox') {
        if (f.required && !f.checked) {
          document.getElementById('termsErr').textContent = 'You must accept the terms to proceed.';
          f.closest('.checkbox-item')?.classList.add('invalid');
          valid = false;
        }
        return;
      }
      if (!validateField(f)) valid = false;
    });

    return valid;
  }

  form.addEventListener('focusout', e => {
    const f = e.target;
    if (f.matches('input, select, textarea') && f.type !== 'radio' && f.type !== 'checkbox') {
      validateField(f);
    }
  });

  form.addEventListener('input', e => {
    const f = e.target;
    if (f.matches('input, select, textarea') && f.classList.contains('invalid')) {
      clearError(f);
    }
  });

  document.addEventListener('click', e => {
    /* Next buttons */
    const nextBtn = e.target.closest('[data-next]');
    if (nextBtn) {
      const target = parseInt(nextBtn.dataset.next);
      if (validateStep(currentStep)) goToStep(target);
      return;
    }

    const prevBtn = e.target.closest('[data-prev]');
    if (prevBtn) {
      goToStep(parseInt(prevBtn.dataset.prev));
      return;
    }
  });

  function countWords(str) {
    return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
  }

  stmtArea?.addEventListener('input', () => {
    const words = countWords(stmtArea.value);
    stmtCounter.textContent = `${words} / 300 words`;
    stmtCounter.style.color = words > 300 ? 'var(--clr-error)'
                             : words >= 50  ? 'var(--clr-success)'
                             :                'var(--clr-muted)';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(4)) return;
    exportToExcel();
    showSuccess();
  });

  function collectData() {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    data.scholarship = data.scholarship || 'Not specified';

    return {
      'First Name':            data.firstName          || '',
      'Last Name':             data.lastName           || '',
      'Date of Birth':         data.dob                || '',
      'Gender':                data.gender             || '',
      'Nationality':           data.nationality        || '',
      'ID / Passport No.':    data.idNumber           || '',
      'Email':                 data.email              || '',
      'Phone':                 data.phone              || '',
      'Alternate Phone':       data.altPhone           || '',
      'Address':               data.address            || '',
      'City':                  data.city               || '',
      'ZIP Code':              data.zipCode            || '',
      'Country':               data.country            || '',
      'High School':           data.highSchool         || '',
      'Graduation Year':       data.gradYear           || '',
      'GPA / Grade':           data.gpa                || '',
      'Previous Institution':  data.prevInstitution    || '',
      'Application Type':      data.applType           || '',
      'Entry Term':            data.entryTerm          || '',
      'Achievements':          data.achievements       || '',
      'Faculty':               data.faculty            || '',
      'Degree Program':        data.program            || '',
      'Major':                 data.major              || '',
      'Minor':                 data.minor              || '',
      'Study Mode':            data.studyMode          || '',
      'Scholarship Interest':  data.scholarship,
      'Personal Statement':    data.statement          || '',
      'Submission Date':       new Date().toLocaleDateString('en-US', {
                                 year:'numeric', month:'long', day:'numeric'
                               }),
    };
  }

  function exportToExcel() {
    const rowData  = collectData();
    const headers  = Object.keys(rowData);
    const values   = Object.values(rowData);

    const ws = XLSX.utils.aoa_to_sheet([headers, values]);

    ws['!cols'] = headers.map(h => ({
      wch: Math.max(h.length + 4, 20)
    }));

    headers.forEach((_, ci) => {
      const addr = XLSX.utils.encode_cell({ r: 0, c: ci });
      if (!ws[addr]) return;
      ws[addr].s = {
        font:      { bold: true, color: { rgb: '1A1A1A' }, name: 'Arial', sz: 10 },
        fill:      { fgColor: { rgb: 'C9A84C' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          bottom: { style: 'thin', color: { rgb: '8A6C28' } },
          right:  { style: 'thin', color: { rgb: '8A6C28' } },
        }
      };
    });

    values.forEach((_, ci) => {
      const addr = XLSX.utils.encode_cell({ r: 1, c: ci });
      if (!ws[addr]) return;
      ws[addr].s = {
        font:      { name: 'Arial', sz: 10, color: { rgb: '0D0F14' } },
        fill:      { fgColor: { rgb: 'F5F0E8' }, patternType: 'solid' },
        alignment: { vertical: 'center', wrapText: true },
      };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Admission Application');

    const metaWs = XLSX.utils.aoa_to_sheet([
      ['Meridian College — Student Admission Export'],
      ['Generated:', new Date().toLocaleString()],
      ['Total records:', 1],
      [],
      ['Field', 'Value'],
      ...headers.map((h, i) => [h, values[i]])
    ]);
    metaWs['!cols'] = [{ wch: 28 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, metaWs, 'Summary');

    XLSX.writeFile(wb, 'admission_data.xlsx');
  }


  function showSuccess() {
    form.hidden = true;
    successState.hidden = false;
    progressBar.style.width = '100%';
    updateStepNav();
  }

  resetBtn?.addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.classList.remove('valid', 'invalid');
    });
    form.querySelectorAll('.err-msg').forEach(e => e.textContent = '');
    if (stmtCounter) stmtCounter.textContent = '0 / 300 words';

    successState.hidden = true;
    form.hidden = false;
    goToStep(1);
  });

  updateProgress();
  updateStepNav();

})();