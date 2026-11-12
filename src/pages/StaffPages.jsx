import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AppShell, Button, Field, PageHeading } from '../components.jsx';
import { specialties } from '../data.js';
import {
  activeVisitCount,
  doctorCountLabel,
  firstVisitTime,
  formatDemoDate,
  freeSlotCount,
  scheduleDays,
  sessionDoctorId,
  useAppState,
  visitsOverlapping,
} from '../store.jsx';

const hours = Array.from({ length: 21 }, (_, index) => {
  const hour = 8 + Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minutes}`;
});

const statusClass = {
  Confirmată: 'confirmed',
  'În așteptare': 'pending',
  Anulată: 'cancelled',
  'Anulată de medic': 'cancelled-by-doctor',
  Nouă: 'new',
  Aprobată: 'approved',
  Ascunsă: 'hidden',
  Nepotrivită: 'flagged',
  Activ: 'approved',
  Inactiv: 'cancelled',
};

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${statusClass[status] || 'pending'}`}>{status}</span>;
}

function DaySelector({ dayIndex, onChange }) {
  const day = scheduleDays[dayIndex];
  return <div className="day-selector">
    <div className="month-heading day-heading">
      <button type="button" className="icon-button" aria-label="Ziua anterioară" disabled={dayIndex === 0} onClick={() => onChange(dayIndex - 1)}><ChevronLeft size={18} /></button>
      <h2>{day.label}</h2>
      <button type="button" className="icon-button" aria-label="Ziua următoare" disabled={dayIndex === scheduleDays.length - 1} onClick={() => onChange(dayIndex + 1)}><ChevronRight size={18} /></button>
    </div>
    <div className="day-strip" role="group" aria-label="Zilele săptămânii">
      {scheduleDays.map((item, index) => <button type="button" key={item.key} className={`date-option ${dayIndex === index ? 'is-selected' : ''}`} aria-pressed={dayIndex === index} onClick={() => onChange(index)}>
        <span>{item.short}</span><b>{item.date}</b><i />
      </button>)}
    </div>
  </div>;
}

export function SchedulePage() {
  const { doctors, schedule, blocks, cancelVisit } = useAppState();
  const doctor = doctors.find((item) => item.id === sessionDoctorId) || doctors[0];
  const [dayIndex, setDayIndex] = useState(0);
  const day = scheduleDays[dayIndex];
  const visits = schedule.filter((visit) => visit.date === day.key).slice().sort((a, b) => a.time.localeCompare(b.time));
  return <AppShell activeNav="schedule" className="schedule-page">
    <PageHeading eyebrow="Cabinetul tău" title="Programul meu" />
    <p className="doctor-identity"><b>{doctor.name}</b> · {doctor.specialty}</p>
    <DaySelector dayIndex={dayIndex} onChange={setDayIndex} />
    <section className="schedule-summary" aria-label="Rezumatul zilei">
      <article><small>Programări</small><b>{activeVisitCount(schedule, day.key)}</b></article>
      <article><small>Prima oră</small><b>{firstVisitTime(schedule, day.key)}</b></article>
      <article><small>Ore libere</small><b>{freeSlotCount(schedule, blocks, day.key)}</b></article>
    </section>
    {visits.length ? <div className="visit-list">{visits.map((visit) => <article className="visit-card" key={visit.id}>
      <div className="visit-time">{visit.time}</div>
      <div className="visit-body">
        <div className="visit-top"><h3>{visit.patient}</h3><StatusBadge status={visit.status} /></div>
        <p>{visit.reason}</p>
        {visit.status === 'Anulată de medic' && <p className="visit-notice" role="status">Pacientul a fost notificat și i s-a oferit reprogramare.</p>}
        {(visit.status === 'Confirmată' || visit.status === 'În așteptare') && <button type="button" className="visit-cancel" onClick={() => cancelVisit(visit.id)}>Anulează</button>}
      </div>
    </article>)}</div> : <div className="empty-state"><b>Nu ai programări în această zi</b></div>}
  </AppShell>;
}

export function BlockHoursPage() {
  const { blocks, schedule, addBlock, removeBlock, cancelVisit } = useAppState();
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('Concediu');
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(null);
  const mine = blocks.filter((block) => block.doctorId === sessionDoctorId).slice().sort((a, b) => `${a.date}${a.from}`.localeCompare(`${b.date}${b.from}`));

  const saveBlock = (block, overlaps = []) => {
    overlaps.forEach((visit) => cancelVisit(visit.id));
    addBlock(block);
    setPending(null);
    setDate('');
    setFrom('');
    setTo('');
    setErrors({});
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!date) nextErrors.date = 'Alege data intervalului.';
    if (!from) nextErrors.from = 'Alege ora de început.';
    if (!to) nextErrors.to = 'Alege ora de final.';
    if (from && to && to < from) nextErrors.range = 'Ora de final este înainte de ora de început.';
    else if (from && to && to === from) nextErrors.range = 'Ora de final trebuie să fie după ora de început.';
    if (!reason) nextErrors.reason = 'Alege motivul blocării.';
    if (!nextErrors.range && date && from && to && blocks.some((block) => block.doctorId === sessionDoctorId && block.date === date && from < block.to && block.from < to)) {
      nextErrors.range = 'Intervalul se suprapune cu unul deja blocat.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setPending(null);
      return;
    }
    const block = { doctorId: sessionDoctorId, date, from, to, reason };
    const overlaps = visitsOverlapping(schedule, block);
    if (overlaps.length) {
      setPending({ block, overlaps });
      return;
    }
    saveBlock(block);
  };

  return <AppShell activeNav="blocks" className="block-page">
    <PageHeading eyebrow="Disponibilitate" title="Blocare ore" description="Orele blocate nu mai sunt oferite pacienților la programare." />
    <form className="block-form" onSubmit={submit} noValidate>
      <Field label="Data" error={errors.date}>
        <select value={date} onChange={(event) => { setDate(event.target.value); setErrors((current) => ({ ...current, date: undefined })); setPending(null); }} aria-label="Data" aria-invalid={Boolean(errors.date) || undefined}>
          <option value="">Alege data</option>
          {scheduleDays.map((day) => <option key={day.key} value={day.key}>{day.label}</option>)}
        </select>
      </Field>
      <div className="block-form-times">
        <Field label="De la ora" error={errors.from} invalid={Boolean(errors.range)}>
          <select value={from} onChange={(event) => { setFrom(event.target.value); setErrors((current) => ({ ...current, from: undefined, range: undefined })); setPending(null); }} aria-label="De la ora" aria-invalid={Boolean(errors.from || errors.range) || undefined}>
            <option value="">Alege ora</option>
            {hours.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </Field>
        <Field label="Până la ora" error={errors.to} invalid={Boolean(errors.range)}>
          <select value={to} onChange={(event) => { setTo(event.target.value); setErrors((current) => ({ ...current, to: undefined, range: undefined })); setPending(null); }} aria-label="Până la ora" aria-invalid={Boolean(errors.to || errors.range) || undefined}>
            <option value="">Alege ora</option>
            {hours.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </Field>
        {errors.range && <p className="field-error block-range-error" role="alert">{errors.range}</p>}
      </div>
      <Field label="Motiv" error={errors.reason}>
        <select value={reason} onChange={(event) => setReason(event.target.value)} aria-label="Motiv">
          <option value="Concediu">Concediu</option>
          <option value="Urgență">Urgență</option>
          <option value="Altul">Altul</option>
        </select>
      </Field>
      <p className="form-hint">Exemplu: 8 noiembrie are programări (vei vedea avertismentul), iar 10 noiembrie este o zi fără vizite.</p>
      {pending && <div className="warning-panel" role="alert">
        <b>{pending.overlaps.length === 1 ? 'Există deja o programare în acest interval.' : `Există deja ${pending.overlaps.length} programări în acest interval.`}</b>
        <p>{pending.overlaps.map((visit) => `${visit.patient} la ${visit.time}`).join(', ')}. Dacă blochezi intervalul, programarea devine „Anulată de medic”, iar pacientul este notificat și i se oferă reprogramare.</p>
        <div className="row-actions">
          <Button type="button" onClick={() => saveBlock(pending.block, pending.overlaps)}>Blochează și anulează</Button>
          <Button type="button" variant="outline" onClick={() => setPending(null)}>Renunță</Button>
        </div>
      </div>}
      {!pending && <Button type="submit">Blochează intervalul</Button>}
    </form>
    <section className="blocked-section">
      <h2>Intervale blocate</h2>
      {mine.length ? <div className="visit-list">{mine.map((block) => <article className="blocked-card" key={block.id}>
        <div><b>{scheduleDays.find((day) => day.key === block.date)?.label || formatDemoDate(block.date)}</b><span>{block.from}–{block.to} · {block.reason}</span></div>
        <Button type="button" variant="outline" size="small" onClick={() => removeBlock(block.id)}>Deblochează</Button>
      </article>)}</div> : <div className="empty-state"><b>Nu ai intervale blocate.</b><span>Intervalele blocate dispar din orele libere ale pacientului.</span></div>}
    </section>
  </AppShell>;
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
      <div className="modal-head"><h2 id="modal-title">{title}</h2><button type="button" className="icon-button" aria-label="Închide" onClick={onClose}><X size={18} /></button></div>
      {children}
    </div>
  </div>;
}

const emptyDoctor = { name: '', specialty: '', clinic: '', price: '' };

export function AdminDirectoryPage() {
  const { doctors, clinics, addDoctor, updateDoctor, setDoctorActive, addClinic } = useAppState();
  const [tab, setTab] = useState('Medici');
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [clinicForm, setClinicForm] = useState({ name: '', city: 'Chișinău' });
  const [errors, setErrors] = useState({});

  const closeModal = () => { setModal(null); setErrors({}); setEditingId(null); };
  const specialtyOptions = useMemo(() => {
    const names = specialties.map((item) => item.name);
    if (doctorForm.specialty && !names.includes(doctorForm.specialty)) names.push(doctorForm.specialty);
    return names;
  }, [doctorForm.specialty]);

  const openCreateDoctor = () => {
    setEditingId(null);
    setDoctorForm(emptyDoctor);
    setErrors({});
    setModal('doctor');
  };
  const openEditDoctor = (doctor) => {
    setEditingId(doctor.id);
    setDoctorForm({ name: doctor.name, specialty: doctor.specialty, clinic: doctor.clinic, price: String(doctor.price) });
    setErrors({});
    setModal('doctor');
  };
  const openCreateClinic = () => {
    setClinicForm({ name: '', city: 'Chișinău' });
    setErrors({});
    setModal('clinic');
  };

  const submitDoctor = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (doctorForm.name.trim().length < 3) nextErrors.name = 'Introdu numele medicului.';
    if (!doctorForm.specialty) nextErrors.specialty = 'Alege specialitatea.';
    if (!doctorForm.clinic) nextErrors.clinic = 'Alege clinica.';
    if (!doctorForm.price || Number(doctorForm.price) <= 0) nextErrors.price = 'Introdu un preț valid, în lei.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editingId) updateDoctor(editingId, doctorForm);
    else addDoctor(doctorForm);
    closeModal();
  };

  const submitClinic = (event) => {
    event.preventDefault();
    const nextErrors = {};
    const name = clinicForm.name.trim();
    if (name.length < 3) nextErrors.name = 'Introdu numele clinicii.';
    if (!clinicForm.city.trim()) nextErrors.city = 'Introdu orașul.';
    if (name && clinics.some((clinic) => clinic.name.toLowerCase() === name.toLowerCase())) nextErrors.name = 'Există deja o clinică cu acest nume.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    addClinic(clinicForm);
    closeModal();
  };

  const doctorRows = doctors.map((doctor) => ({ ...doctor, activeLabel: doctor.active ? 'Activ' : 'Inactiv' }));

  return <AppShell activeNav="directory" className="admin-page">
    <PageHeading eyebrow="Administrare" title="Medici și clinici" description="Adaugă, editează sau dezactivează datele demonstrative ale clinicii." />
    <div className="appointment-tabs appointment-tabs--two" role="tablist" aria-label="Medici și clinici">
      {['Medici', 'Clinici'].map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}
    </div>
    <div className="admin-toolbar">
      {tab === 'Medici' ? <Button type="button" onClick={openCreateDoctor}>Adaugă medic</Button> : <Button type="button" onClick={openCreateClinic}>Adaugă clinică</Button>}
    </div>
    {tab === 'Medici' ? <>
      <div className="admin-cards">{doctorRows.map((doctor) => <article className="admin-record" key={doctor.id}>
        <div className="visit-top"><h3>{doctor.name}</h3><StatusBadge status={doctor.activeLabel} /></div>
        <p>{doctor.specialty}</p>
        <p>{doctor.clinic} · {doctor.reviews > 0 ? `Rating ${doctor.rating}` : 'Profil nou'}</p>
        <div className="row-actions">
          <Button type="button" variant="outline" size="small" onClick={() => openEditDoctor(doctor)}>Editează</Button>
          <Button type="button" variant="outline" size="small" onClick={() => setDoctorActive(doctor.id, !doctor.active)}>{doctor.active ? 'Dezactivează' : 'Activează'}</Button>
        </div>
      </article>)}</div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Nume</th><th>Specialitate</th><th>Clinică</th><th>Rating</th><th>Stare</th><th>Acțiuni</th></tr></thead>
        <tbody>{doctorRows.map((doctor) => <tr key={doctor.id}>
          <td>{doctor.name}</td>
          <td>{doctor.specialty}</td>
          <td>{doctor.clinic}</td>
          <td>{doctor.reviews > 0 ? doctor.rating : 'Nou'}</td>
          <td><StatusBadge status={doctor.activeLabel} /></td>
          <td><div className="row-actions">
            <Button type="button" variant="outline" size="small" onClick={() => openEditDoctor(doctor)}>Editează</Button>
            <Button type="button" variant="outline" size="small" onClick={() => setDoctorActive(doctor.id, !doctor.active)}>{doctor.active ? 'Dezactivează' : 'Activează'}</Button>
          </div></td>
        </tr>)}</tbody>
      </table></div>
    </> : <div className="clinic-list">{clinics.map((clinic) => {
      const count = doctors.filter((doctor) => doctor.clinic === clinic.name && doctor.active).length;
      return <article className="clinic-card" key={clinic.id}><div><h3>{clinic.name}</h3><p>{clinic.city}</p></div><b>{doctorCountLabel(count)}</b></article>;
    })}</div>}
    {modal === 'doctor' && <Modal title={editingId ? 'Editează medicul' : 'Adaugă medic'} onClose={closeModal}>
      <form className="modal-form" onSubmit={submitDoctor} noValidate>
        <Field label="Nume" value={doctorForm.name} onChange={(event) => setDoctorForm({ ...doctorForm, name: event.target.value })} error={errors.name} placeholder="Ana Popescu" autoFocus />
        <Field label="Specialitate" error={errors.specialty}>
          <select value={doctorForm.specialty} onChange={(event) => setDoctorForm({ ...doctorForm, specialty: event.target.value })}>
            <option value="">Alege specialitatea</option>
            {specialtyOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </Field>
        <Field label="Clinică" error={errors.clinic}>
          <select value={doctorForm.clinic} onChange={(event) => setDoctorForm({ ...doctorForm, clinic: event.target.value })}>
            <option value="">Alege clinica</option>
            {clinics.map((clinic) => <option key={clinic.id} value={clinic.name}>{clinic.name}</option>)}
          </select>
        </Field>
        <Field label="Preț consultație" type="number" min="1" value={doctorForm.price} onChange={(event) => setDoctorForm({ ...doctorForm, price: event.target.value })} error={errors.price} placeholder="500" />
        <Button type="submit">{editingId ? 'Salvează' : 'Adaugă medic'}</Button>
      </form>
    </Modal>}
    {modal === 'clinic' && <Modal title="Adaugă clinică" onClose={closeModal}>
      <form className="modal-form" onSubmit={submitClinic} noValidate>
        <Field label="Nume" value={clinicForm.name} onChange={(event) => setClinicForm({ ...clinicForm, name: event.target.value })} error={errors.name} placeholder="Clinica nouă" autoFocus />
        <Field label="Oraș" value={clinicForm.city} onChange={(event) => setClinicForm({ ...clinicForm, city: event.target.value })} error={errors.city} />
        <Button type="submit">Adaugă clinică</Button>
      </form>
    </Modal>}
  </AppShell>;
}

const weekBars = [
  { label: 'Lun', value: 14 },
  { label: 'Mar', value: 16 },
  { label: 'Mie', value: 12 },
  { label: 'Joi', value: 18 },
  { label: 'Vin', value: 15 },
  { label: 'Sâm', value: 6 },
  { label: 'Dum', value: 5 },
];

const specialtyBars = [
  { label: 'Cardiologie', value: 24 },
  { label: 'Medicină internă', value: 18 },
  { label: 'Dermatologie', value: 14 },
  { label: 'Neurologie', value: 12 },
  { label: 'Pediatrie', value: 10 },
  { label: 'Oftalmologie', value: 8 },
];

function ColumnChart({ items, caption }) {
  const width = 330;
  const height = 150;
  const max = Math.max(...items.map((item) => item.value));
  const gap = 12;
  const barWidth = (width - gap * (items.length + 1)) / items.length;
  return <svg className="chart" viewBox={`0 0 ${width} ${height + 32}`} role="img" aria-label={caption}>
    <title>{caption}</title>
    {items.map((item, index) => {
      const barHeight = Math.max(6, (item.value / max) * (height - 28));
      const x = gap + index * (barWidth + gap);
      const y = height - barHeight;
      return <g key={item.label}>
        <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Inter, Arial, sans-serif" fill="#153b56">{item.value}</text>
        <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill="#14808d" />
        <text x={x + barWidth / 2} y={height + 18} textAnchor="middle" fontSize="14" fontFamily="Inter, Arial, sans-serif" fill="#557181">{item.label}</text>
      </g>;
    })}
  </svg>;
}

function HorizontalChart({ items, caption }) {
  const max = Math.max(...items.map((item) => item.value));
  return <div className="bar-list" role="img" aria-label={caption}>
    {items.map((item) => <div className="bar-row" key={item.label}>
      <span className="bar-label">{item.label}</span>
      <span className="bar-track"><span className="bar-fill" style={{ width: `${(item.value / max) * 100}%` }} /></span>
      <b className="bar-value">{item.value}</b>
    </div>)}
  </div>;
}

export function ReportsPage() {
  return <AppShell activeNav="reports" className="reports-page">
    <PageHeading eyebrow="Ultimele 7 zile" title="Rapoarte" description="Indicatori fictivi pentru clinica Modus Vivendi, 2–8 noiembrie 2026." />
    <section className="kpi-grid">
      <article className="kpi-card"><span>Programări în ultimele 7 zile</span><b>86</b><small>cu 9 mai multe decât săptămâna anterioară</small></article>
      <article className="kpi-card"><span>Rata de anulare</span><b>12%</b><small>10 programări anulate din 86</small></article>
      <article className="kpi-card"><span>Medicul cu cele mai multe programări</span><b className="kpi-text">Dr. Ana Popescu</b><small>24 de programări</small></article>
      <article className="kpi-card"><span>Ora medie de așteptare</span><b>14 min</b><small>calculată pentru vizitele finalizate</small></article>
    </section>
    <section className="chart-grid">
      <article className="chart-card"><h2>Programări pe zile</h2><ColumnChart items={weekBars} caption="Programări pe zile: luni 14, marți 16, miercuri 12, joi 18, vineri 15, sâmbătă 6, duminică 5" /></article>
      <article className="chart-card"><h2>Programări pe specialități</h2><HorizontalChart items={specialtyBars} caption="Programări pe specialități, din 2 până în 8 noiembrie 2026" /></article>
    </section>
    <p className="report-note">Datele din rapoarte sunt fictive și nu se schimbă când anulezi o programare în demonstrație.</p>
  </AppShell>;
}

const reviewFilters = ['Toate', 'Nouă', 'Aprobată', 'Ascunsă', 'Nepotrivită'];

export function ReviewsPage() {
  const { reviews, doctors, setReviewStatus } = useAppState();
  const [filter, setFilter] = useState('Toate');
  const visible = reviews.filter((review) => filter === 'Toate' || review.status === filter);
  return <AppShell activeNav="reviews" className="reviews-page">
    <PageHeading eyebrow="Moderare" title="Recenzii" description="Recenziile ascunse sau marcate ca nepotrivite nu mai apar în profilul medicului." />
    <div className="filter-chips review-filters" role="group" aria-label="Filtru după stare">
      {reviewFilters.map((item) => <button type="button" key={item} className={`filter-chip ${filter === item ? 'is-active' : ''}`} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    {visible.length ? <div className="review-admin-list">{visible.map((review) => {
      const doctor = doctors.find((item) => item.id === review.doctorId);
      return <article className="review-admin-card" key={review.id}>
        <div className="visit-top"><h3>{review.author}</h3><StatusBadge status={review.status} /></div>
        <p className="review-admin-meta">{doctor?.name || 'Medic'} · {review.date}</p>
        <p className="review-stars" aria-label={`${review.stars} din 5 stele`}>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</p>
        <p>{review.text}</p>
        <div className="row-actions">
          <Button type="button" size="small" onClick={() => setReviewStatus(review.id, 'Aprobată')} disabled={review.status === 'Aprobată'}>Aprobă</Button>
          <Button type="button" variant="outline" size="small" onClick={() => setReviewStatus(review.id, 'Ascunsă')} disabled={review.status === 'Ascunsă'}>Ascunde</Button>
          <Button type="button" variant="outline" size="small" onClick={() => setReviewStatus(review.id, 'Nepotrivită')} disabled={review.status === 'Nepotrivită'}>Marchează ca nepotrivită</Button>
        </div>
      </article>;
    })}</div> : <div className="empty-state"><b>Nu există recenzii cu această stare.</b></div>}
  </AppShell>;
}
