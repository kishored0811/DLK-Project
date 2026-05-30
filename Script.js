const PROGRAMS = {
  'School of Engineering & Technology': [
    'B.Sc. Computer Science','B.Sc. Software Engineering',
    'B.Sc. Electrical Engineering','B.Sc. Mechanical Engineering',
    'B.Sc. Data Science & AI','M.Sc. Cybersecurity'
  ],
  'School of Business & Management': [
    'BBA Business Administration','B.Sc. Finance & Accounting',
    'B.Sc. Marketing','MBA General Management',
    'B.Sc. Entrepreneurship'
  ],
  'School of Arts & Humanities': [
    'BA English Literature','BA Fine Arts',
    'BA History','BA Philosophy',
    'BA Media & Communications'
  ],
  'School of Medicine & Health Sciences': [
    'MBBS Medicine','B.Sc. Nursing',
    'B.Sc. Pharmacy','B.Sc. Biomedical Science',
    'MSc Public Health'
  ],
  'School of Law & Political Science': [
    'LLB Law','BA Political Science',
    'BA International Relations','LLM Corporate Law'
  ],
  'School of Natural Sciences': [
    'B.Sc. Biology','B.Sc. Chemistry',
    'B.Sc. Physics','B.Sc. Environmental Science',
    'B.Sc. Mathematics'
  ],
};

function updateCourses() {
  const fac = document.getElementById('faculty').value;
  const prog = document.getElementById('program');
  prog.innerHTML = '<option value="">— Select Program —</option>';
  if (fac && PROGRAMS[fac]) {
    PROGRAMS[fac].forEach(p => {
      const o = document.createElement('option');
      o.value = o.textContent = p;
      prog.appendChild(o);
    });
  }
}

let currentStep = 1;

function goNext(step) {
  if (!validateStep(step)) return;
  if (step === 3) buildReview();
  setStep(step + 1);
}

function goBack(step) { setStep(step - 1); }

function setStep(n) {
  currentStep = n;
  document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('step' + n);
  if (el) el.classList.add('active');
  updateProgress(n);
  document.getElementById('formPanel').scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(n) {
  document.querySelectorAll('.prog-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active','done');
    if (s === n) el.classList.add('active');
    else if (s < n) el.classList.add('done');
    // update inner circle
    const c = el.querySelector('.prog-circle');
    if (s < n) {
      c.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>`;
    } else {
      c.textContent = s;
    }
  });
}

function required(id) {
  const el = document.getElementById(id);
  const val = el.value.trim();
  const err = document.getElementById('err-' + id);
  const empty = !val;
  el.classList.toggle('error', empty);
  if (err) err.classList.toggle('show', empty);
  return !empty;
}

function validateStep(step) {
  let ok = true;

  if (step === 1) {
    ok = ['firstName','lastName','dob','gender','nationality','email','phone','address']
      .map(id => {
        if (id === 'email') return validateEmail();
        return required(id);
      }).every(Boolean);
  }

  if (step === 2) {
    ok = ['prevSchool','qualification','gradYear'].map(required).every(Boolean);
  }

  if (step === 3) {
    const modeOk = !!document.querySelector('input[name="mode"]:checked');
    document.getElementById('err-mode').classList.toggle('show', !modeOk);
    ok = ['faculty','program','semester'].map(required).every(Boolean) && modeOk;
  }

  return ok;
}

function validateEmail() {
  const el = document.getElementById('email');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
  el.classList.toggle('error', !valid);
  document.getElementById('err-email').classList.toggle('show', !valid);
  return valid;
}

function previewPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const preview = document.getElementById('photoPreview');
  preview.innerHTML = `<img src="${url}" alt="Profile">`;
}

const uploadedDocs = [];

function handleDocs(input) {
  Array.from(input.files).forEach(f => {
    if (uploadedDocs.find(d => d.name === f.name)) return;
    uploadedDocs.push(f);
    renderDocList();
  });
  input.value = '';
}

function renderDocList() {
  const list = document.getElementById('docList');
  list.innerHTML = '';
  uploadedDocs.forEach((f, i) => {
    const size = (f.size / 1024).toFixed(0) + ' KB';
    const div = document.createElement('div');
    div.className = 'doc-item';
    div.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="15" y2="17"/>
      </svg>
      <span class="doc-item-name">${f.name}</span>
      <span class="doc-item-size">${size}</span>
      <button class="doc-remove" onclick="removeDoc(${i})">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    list.appendChild(div);
  });
}

function removeDoc(i) {
  uploadedDocs.splice(i, 1);
  renderDocList();
}

const docZone = document.getElementById('docZone');
docZone.addEventListener('dragover', e => { e.preventDefault(); docZone.classList.add('drag'); });
docZone.addEventListener('dragleave', () => docZone.classList.remove('drag'));
docZone.addEventListener('drop', e => {
  e.preventDefault();
  docZone.classList.remove('drag');
  const files = Array.from(e.dataTransfer.files);
  files.forEach(f => { if (!uploadedDocs.find(d => d.name === f.name)) uploadedDocs.push(f); });
  renderDocList();
});


function rv(label, val) {
  if (!val) return '';
  return `<div class="review-item"><div class="review-key">${label}</div><div class="review-val">${val || '—'}</div></div>`;
}

function buildReview() {
  const mode = document.querySelector('input[name="mode"]:checked');
  const accom = document.querySelector('input[name="accom"]:checked');

  document.getElementById('rev-personal').innerHTML =
    rv('First Name', document.getElementById('firstName').value) +
    rv('Last Name',  document.getElementById('lastName').value)  +
    rv('Date of Birth', document.getElementById('dob').value)    +
    rv('Gender',     document.getElementById('gender').value)    +
    rv('Nationality',document.getElementById('nationality').value)+
    rv('Email',      document.getElementById('email').value)     +
    rv('Phone',      document.getElementById('phone').value)     +
    rv('Address',    document.getElementById('address').value);

  document.getElementById('rev-academic').innerHTML =
    rv('Previous School',  document.getElementById('prevSchool').value)   +
    rv('Qualification',    document.getElementById('qualification').value) +
    rv('Year of Graduation', document.getElementById('gradYear').value)   +
    rv('GPA / Grade',      document.getElementById('gpa').value)          +
    rv('Country of Study', document.getElementById('studyCountry').value);

  document.getElementById('rev-course').innerHTML =
    rv('Faculty',    document.getElementById('faculty').value)   +
    rv('Program',    document.getElementById('program').value)   +
    rv('Study Mode', mode ? mode.value : '—')                    +
    rv('Semester',   document.getElementById('semester').value)  +
    rv('Accommodation', accom ? accom.value : '—')               +
    rv('Heard from', document.getElementById('source').value);
}

function submitForm() {
  const t1 = document.getElementById('agreeTerms').checked;
  const t2 = document.getElementById('agreeAge').checked;
  const err = document.getElementById('err-terms');
  if (!t1 || !t2) { err.classList.add('show'); return; }
  err.classList.remove('show');

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  setTimeout(() => {
    const ref = 'EDU-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('refNumber').textContent = ref;
    document.getElementById('progressBar').style.display = 'none';
    document.querySelectorAll('.step-section').forEach(s => s.style.display = 'none');
    const sc = document.getElementById('successScreen');
    sc.classList.add('show');
    sc.style.display = 'flex';
  }, 1800);
}

function restartForm() {
  document.getElementById('progressBar').style.display = '';
  document.getElementById('successScreen').style.display = 'none';
  document.getElementById('successScreen').classList.remove('show');
  document.querySelectorAll('.step-section').forEach(s => { s.style.display = ''; s.classList.remove('active'); });
  document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(el => el.value = '');
  document.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(el => el.checked = false);
  document.getElementById('photoPreview').innerHTML = `<svg class="ph-icon" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  document.getElementById('docList').innerHTML = '';
  uploadedDocs.length = 0;
  document.getElementById('submitBtn').disabled = false;
  document.getElementById('submitBtn').innerHTML = `Submit Application <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`;
  currentStep = 1;
  setStep(1);
}

  const btn = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  const nlBtn = document.querySelector('.nl-form button');
  const nlInput = document.querySelector('.nl-form input');
  nlBtn.addEventListener('click', () => {
    if (!nlInput.value || !nlInput.value.includes('@')) {
      nlInput.style.outline = '1px solid #c0392b';
      setTimeout(() => nlInput.style.outline = '', 1200);
      return;
    }
    nlBtn.textContent = '✓ Subscribed!';
    nlBtn.style.background = 'linear-gradient(135deg,#4caf50,#66bb6a)';
    nlInput.value = '';
    setTimeout(() => {
      nlBtn.textContent = 'Subscribe';
      nlBtn.style.background = '';
    }, 3000);
  });