import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarX2,
  Clock3,
  KeyRound,
  Mail,
  MailCheck,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Star,
  UserX,
  Users,
  WifiOff,
} from 'lucide-react';
import { Button, DoctorAvatar, DoctorCard, Field } from '../components.jsx';
import { formatPrice, getDoctor } from '../data.js';
import { useAppState } from '../store.jsx';
import { ErrorLayout } from './ErrorPages.jsx';
import { ConfirmPage } from './FlowPages.jsx';

/** Programarea de exemplu folosită în stările de eroare (după data demo, 8 noiembrie 2026). */
const sampleBooking = { doctorId: 'ana-popescu', date: 'Marți, 10 noiembrie', time: '10:30' };

const phonePattern = /^(?:\+373\d{8}|0\d{8})$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function useBookingDoctor(doctorId) {
  const { doctors } = useAppState();
  return doctors.find((doctor) => doctor.id === doctorId) || getDoctor(doctorId);
}

function BookingSummary({ doctor, date, time }) {
  return <section className="confirmation-card state-summary-card">
    <div className="confirmation-doctor"><DoctorAvatar doctor={doctor} size="large" /><div><span className="appointment-kind">Consultație · {doctor.specialty}</span><h2>{doctor.name}</h2><span className="confirmed-rating"><Star size={14} fill="currentColor" /> {doctor.rating} · {doctor.experience}</span></div></div>
    <div className="confirmation-divider" />
    <div className="confirmation-details">
      <div><CalendarDays size={18} /><span>Data</span><b>{date}</b></div>
      <div><Clock3 size={18} /><span>Ora</span><b>{time}</b></div>
      <div><MapPin size={18} /><span>Clinica</span><b>{doctor.clinic || 'Modus Vivendi'}, Chișinău</b></div>
    </div>
    <div className="confirmation-price"><span>Prețul consultației</span><b>{formatPrice(doctor.price)}</b></div>
  </section>;
}

/* 1. Programarea nu a fost salvată */
export function BookingNotSavedPage() {
  const navigate = useNavigate();
  const booking = { ...sampleBooking, ...(useLocation().state || {}) };
  const doctor = useBookingDoctor(booking.doctorId);
  return <ErrorLayout icon={WifiOff} eyebrow="Conexiune întreruptă la confirmare" title="Programarea nu a fost salvată" description="Internetul s-a întrerupt înainte să salvăm programarea. Datele tale au fost păstrate." className="state-page">
    <div className="error-related"><BookingSummary doctor={doctor} date={booking.date} time={booking.time} /></div>
    <Button onClick={() => navigate('/succes', { state: { doctorId: doctor.id, date: booking.date, time: booking.time } })} icon={RefreshCw}>Reîncearcă confirmarea</Button>
    <button className="error-text-link" onClick={() => navigate('/calendar', { state: { doctorId: doctor.id } })}><ArrowLeft size={15} /> Modifică data sau ora</button>
  </ErrorLayout>;
}

/* 2. Medicul este indisponibil */
export function DoctorUnavailablePage() {
  const navigate = useNavigate();
  const { doctors } = useAppState();
  const doctorId = useLocation().state?.doctorId || 'ana-popescu';
  const doctor = useBookingDoctor(doctorId);
  const alternatives = doctors.filter((item) => item.active && item.id !== doctor.id && item.specialty === doctor.specialty).slice(0, 2);
  const specialtyLabel = doctor.specialty === 'Cardiologie' ? 'cardiologii' : `medicii de ${doctor.specialty.toLowerCase()}`;
  return <ErrorLayout icon={UserX} eyebrow="Medic indisponibil" title="Medicul este indisponibil" description={`${doctor.name} nu primește pacienți în perioada aleasă. Îți propunem alți medici cu aceeași specialitate.`} className="state-page">
    <div className="error-related state-doctor-list">
      {alternatives.length ? alternatives.map((item) => <DoctorCard key={item.id} doctor={item} />) : <div className="error-info-card"><span>Nu am găsit alți medici cu această specialitate.</span></div>}
    </div>
    <Button onClick={() => navigate(`/medici?q=${encodeURIComponent(doctor.specialty)}`)} icon={Users}>Vezi toți {specialtyLabel}</Button>
    <button className="error-text-link" onClick={() => navigate(`/medici/${doctor.id}`)}><ArrowLeft size={15} /> Înapoi la profil</button>
  </ErrorLayout>;
}

/* 3. Sesiune expirată */
export function SessionExpiredPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    if (!phonePattern.test(value.replace(/[\s()-]/g, ''))) {
      setError('Număr de telefon invalid. Verifică și încearcă din nou.');
      return;
    }
    navigate('/confirmare', { state: { doctorId: sampleBooking.doctorId, date: sampleBooking.date, time: sampleBooking.time } });
  };
  return <ErrorLayout icon={ShieldAlert} eyebrow="Securitate" title="Sesiune expirată" description="Din motive de siguranță te-am deconectat. Autentifică-te din nou; programarea începută rămâne salvată." className="state-page">
    <form id="session-form" className="error-related state-form" onSubmit={submit} noValidate>
      <Field label="Număr de telefon" icon={Phone} type="tel" placeholder="+373 60 123 456" value={value} onChange={(event) => { setValue(event.target.value); setError(''); }} error={error} />
    </form>
    <Button type="submit" form="session-form" icon={ArrowRight}>Autentifică-te din nou</Button>
    <button className="error-text-link" onClick={() => navigate('/autentificare')}><ArrowLeft size={15} /> Altă metodă de autentificare</button>
  </ErrorLayout>;
}

/* 4. Aplicația a fost repornită */
export function AppRestartedPage() {
  const navigate = useNavigate();
  const doctor = useBookingDoctor(sampleBooking.doctorId);
  return <ErrorLayout icon={RotateCcw} eyebrow="Am păstrat progresul" title="Aplicația a fost repornită" description="Aplicația s-a închis neașteptat. Poți continua programarea de unde ai rămas." className="state-page">
    <section className="error-related state-progress-card">
      <div className="state-progress-head"><DoctorAvatar doctor={doctor} size="small" /><div><small>Programare începută</small><b>{doctor.name} · {sampleBooking.date} · {sampleBooking.time}</b></div></div>
      <div className="booking-progress booking-progress--compact" aria-label="Pasul 2 din 3: Data și ora">
        <span className="progress-step is-done"><i>1</i><b>Medic</b></span><span className="progress-line is-done" />
        <span className="progress-step is-current"><i>2</i><b>Data și ora</b></span><span className="progress-line" />
        <span className="progress-step"><i>3</i><b>Confirmare</b></span>
      </div>
    </section>
    <Button onClick={() => navigate('/calendar', { state: { doctorId: doctor.id } })} icon={ArrowRight}>Continuă programarea</Button>
    <button className="error-text-link" onClick={() => navigate('/acasa')}><ArrowLeft size={15} /> Renunță și mergi la Acasă</button>
  </ErrorLayout>;
}

/* 5. Programare dublă: fereastră peste ecranul Confirmare */
export function DoubleBookingPage() {
  const navigate = useNavigate();
  const sheet = <div className="sheet-backdrop">
    <section className="bottom-sheet" role="alertdialog" aria-modal="true" aria-labelledby="double-booking-title" aria-describedby="double-booking-text">
      <span className="sheet-handle" aria-hidden="true" />
      <span className="sheet-warning-icon"><AlertTriangle size={30} strokeWidth={1.9} /></span>
      <span className="eyebrow">Programare dublă</span>
      <h2 id="double-booking-title">Ai deja o programare la această oră</h2>
      <p id="double-booking-text">Marți, 10 noiembrie, 10:30 – Dr. Mihai Rusu, Medicină internă. Nu poți fi la două consultații în același timp.</p>
      <div className="sheet-actions">
        <Button onClick={() => navigate('/calendar', { state: { doctorId: sampleBooking.doctorId } })} icon={CalendarDays}>Alege altă oră</Button>
        <Button to="/programari" variant="outline">Vezi programările mele</Button>
      </div>
    </section>
  </div>;
  return <ConfirmPage booking={{ doctorId: sampleBooking.doctorId, date: sampleBooking.date, time: sampleBooking.time }} overlay={sheet} />;
}

/* 6. Medicul a anulat ora */
export function DoctorCancelledPage() {
  const navigate = useNavigate();
  const doctor = useBookingDoctor(sampleBooking.doctorId);
  const [selected, setSelected] = useState('11:00');
  return <ErrorLayout icon={CalendarX2} eyebrow="Programare anulată de medic" title="Medicul a anulat ora" description="Dr. Ana Popescu a anulat programarea din 10 noiembrie, ora 10:30, din cauza unei urgențe. Ne pare rău!" className="state-page">
    <div className="error-related state-stack">
      <section className="cancelled-visit-card">
        <DoctorAvatar doctor={doctor} size="small" />
        <div><b>{doctor.name}</b><span>{doctor.specialty} · {doctor.clinic || 'Modus Vivendi'}</span><s>{sampleBooking.date}, {sampleBooking.time}</s></div>
        <span className="status-badge status-badge--cancelled-by-doctor">Anulată de medic</span>
      </section>
      <section className="alternative-card"><div className="alternative-title"><span><CalendarDays size={17} /> Miercuri, 11 noiembrie</span><span className="availability-label"><i /> Ore libere propuse</span></div><div className="alternative-slots">{['09:00', '11:00', '13:00'].map((time) => <button key={time} className={selected === time ? 'is-selected' : ''} aria-pressed={selected === time} onClick={() => setSelected(time)}>{time}</button>)}</div></section>
    </div>
    <Button onClick={() => navigate('/calendar', { state: { doctorId: doctor.id } })} icon={CalendarDays}>Reprogramează</Button>
    <button className="error-text-link" onClick={() => navigate(`/medici?q=${encodeURIComponent(doctor.specialty)}`)}><ArrowLeft size={15} /> Alege alt medic</button>
  </ErrorLayout>;
}

/* 7a. Resetare parolă: formular */
export function PasswordResetPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('telefon');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const valid = method === 'telefon' ? phonePattern.test(value.replace(/[\s()-]/g, '')) : emailPattern.test(value.trim());
    if (!valid) {
      setError(method === 'telefon' ? 'Număr de telefon invalid. Verifică și încearcă din nou.' : 'Adresă de e-mail invalidă. Verifică și încearcă din nou.');
      return;
    }
    navigate('/resetare-parola/trimis', { state: { method, value: value.trim() } });
  };
  const switchMethod = (next) => { setMethod(next); setValue(''); setError(''); };
  return <ErrorLayout icon={KeyRound} eyebrow="Resetare parolă" title="Ai uitat parola?" description="Introdu telefonul sau e-mailul și îți trimitem un link de resetare." className="state-page">
    <form id="reset-form" className="error-related state-form" onSubmit={submit} noValidate>
      <div className="method-switch"><button type="button" className={method === 'telefon' ? 'is-active' : ''} aria-pressed={method === 'telefon'} onClick={() => switchMethod('telefon')}><Phone size={16} /> Telefon</button><button type="button" className={method === 'email' ? 'is-active' : ''} aria-pressed={method === 'email'} onClick={() => switchMethod('email')}><Mail size={16} /> E-mail</button></div>
      <Field label={method === 'telefon' ? 'Număr de telefon' : 'Adresă de e-mail'} icon={method === 'telefon' ? Phone : Mail} type={method === 'telefon' ? 'tel' : 'email'} placeholder={method === 'telefon' ? '+373 60 123 456' : 'nume@email.md'} value={value} onChange={(event) => { setValue(event.target.value); setError(''); }} error={error} />
    </form>
    <Button type="submit" form="reset-form" icon={ArrowRight}>Trimite link</Button>
    <Link className="error-text-link" to="/autentificare"><ArrowLeft size={15} /> Înapoi la autentificare</Link>
  </ErrorLayout>;
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  return `${name[0] || ''}***@${domain}`;
}

function maskPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return `+373 ${digits.slice(-8, -7)}** *** ${digits.slice(-3)}`;
}

/* 7b. Resetare parolă: link trimis */
export function PasswordResetSentPage() {
  const { state } = useLocation();
  const byPhone = state?.method === 'telefon';
  const target = byPhone ? maskPhone(state.value) : state?.value ? maskEmail(state.value) : 'a***@gmail.com';
  return <ErrorLayout icon={MailCheck} eyebrow="Link trimis" title={byPhone ? 'Verifică mesajele' : 'Verifică e-mailul'} description={`Am trimis linkul ${byPhone ? 'prin SMS ' : ''}la ${target}. Expiră în 15 minute.`} className="state-page">
    <Button to="/autentificare" icon={byPhone ? Phone : Mail}>{byPhone ? 'Deschide mesajele' : 'Deschide e-mailul'}</Button>
    <span className="error-text-link error-text-link--waiting" aria-disabled="true"><RefreshCw size={15} /> Retrimite linkul (00:45)</span>
  </ErrorLayout>;
}
