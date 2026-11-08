import { useState } from 'react';
import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, Clock3, Languages, LogOut, MapPin, MessageCircle, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell, Button, DoctorAvatar, PageHeading } from '../components.jsx';
import { appointments, doctors, formatPrice } from '../data.js';
import { useAppState } from '../store.jsx';

export function AppointmentsPage() {
  const [tab, setTab] = useState('Viitoare');
  const tabs = ['Viitoare', 'Trecute', 'Anulate'];
  const entries = appointments[tab];
  return <AppShell activeNav="appointments" className="appointments-page">
    <PageHeading eyebrow="Programările tale" title="Programările mele" description="Toate vizitele tale medicale, într-un singur loc." />
    <div className="appointment-tabs" role="tablist" aria-label="Tip programare">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}<span>{appointments[item].length}</span></button>)}</div>
    {entries.length ? <div className="appointment-list">{entries.map((entry) => {
      const doctor = doctors.find((item) => item.id === entry.doctorId) || doctors[0];
      return <article className={`appointment-card appointment-card--${tab.toLowerCase()}`} key={`${entry.doctorId}-${entry.date}`}>
        <div className="appointment-card-date"><span>{entry.date.split(',')[0]}</span><b>{entry.date.match(/\d+/)?.[0] || '27'}</b><span>oct.</span></div>
        <div className="appointment-card-body"><div className="appointment-card-head"><DoctorAvatar doctor={doctor} size="small" /><div><h3>{doctor.name}</h3><p>{entry.type}</p></div></div><div className="appointment-card-meta"><span><Clock3 size={15} /> {entry.time}</span><span><MapPin size={15} /> Modus Vivendi</span></div><div className="appointment-card-bottom"><span className={`appointment-status appointment-status--${tab.toLowerCase()}`}><i />{tab === 'Viitoare' ? 'Confirmată' : tab === 'Trecute' ? 'Finalizată' : 'Anulată'}</span><span className="appointment-price">{formatPrice(doctor.price)}</span></div><div className="appointment-actions">{tab === 'Viitoare' ? <><Link to="/calendar">Reprogramează</Link><Link to="/eroare/serviciu-indisponibil">Anulează</Link></> : <Link to={`/medici/${doctor.id}`}>Vezi medicul <ArrowRight size={14} /></Link>}</div></div>
      </article>;
    })}</div> : <div className="empty-state"><CalendarDays size={28} /><b>Nu ai programări {tab.toLowerCase()}.</b><span>Găsește un medic și alege un interval potrivit.</span><Button to="/medici" variant="outline" size="small">Caută medici</Button></div>}
    {tab === 'Viitoare' && <div className="appointment-help"><ShieldCheck size={17} /><span>Ai nevoie de ajutor? Echipa clinicii îți stă la dispoziție.</span><ChevronRight size={16} /></div>}
  </AppShell>;
}

function Toggle({ checked, onChange, label }) {
  return <button type="button" className={`toggle ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>;
}

export function ProfilePage() {
  const { role, setRole } = useAppState();
  const [language, setLanguage] = useState('RO');
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const languages = ['RO', 'RU', 'EN'];
  return <AppShell activeNav="profile" className="profile-page">
    <PageHeading eyebrow="Contul tău" title="Profil" description="Gestionează datele și preferințele tale." />
    <section className="profile-user-card"><span className="user-initials">AS</span><div><h2>Ana Șerban</h2><p>Pacient MedTime</p><button className="text-button">Editează profilul <ArrowRight size={15} /></button></div><button className="profile-edit-icon" aria-label="Editează profilul"><UserRound size={18} /></button></section>
    <section className="profile-group role-selector"><h3>Vezi aplicația ca</h3><div className="role-options" role="group" aria-label="Alege rolul aplicației">{[['pacient', 'Pacient'], ['medic', 'Medic'], ['administrator', 'Administrator']].map(([value, label]) => <button type="button" key={value} className={role === value ? 'is-selected' : ''} aria-pressed={role === value} onClick={() => setRole(value)}>{label}</button>)}</div><p>Schimbarea rolului actualizează navigarea și datele demonstrative.</p></section>
    <section className="profile-group"><h3>Date personale</h3><div className="profile-row"><span className="profile-row-icon"><UserRound size={18} /></span><div><small>Nume complet</small><b>Ana Șerban</b></div><ChevronRight size={17} /></div><div className="profile-row"><span className="profile-row-icon"><MessageCircle size={18} /></span><div><small>Telefon</small><b>+373 60 123 456</b></div><ChevronRight size={17} /></div><div className="profile-row"><span className="profile-row-icon"><Languages size={18} /></span><div><small>Limba interfeței</small><div className="language-pills">{languages.map((code) => <button key={code} className={language === code ? 'is-active' : ''} onClick={() => setLanguage(code)}>{code}</button>)}</div></div></div></section>
    <section className="profile-group"><h3>Notificări</h3><div className="profile-row"><span className="profile-row-icon"><Bell size={18} /></span><div><small>Reamintiri prin notificări</small><b>{push ? 'Active' : 'Dezactivate'}</b></div><Toggle checked={push} onChange={() => setPush(!push)} label="Reamintiri prin notificări" /></div><div className="profile-row"><span className="profile-row-icon"><MessageCircle size={18} /></span><div><small>Reamintiri prin SMS</small><b>{sms ? 'Active' : 'Dezactivate'}</b></div><Toggle checked={sms} onChange={() => setSms(!sms)} label="Reamintiri prin SMS" /></div></section>
    <section className="profile-group profile-links"><Link className="profile-row" to="/eroare/serviciu-indisponibil"><span className="profile-row-icon"><ShieldCheck size={18} /></span><div><b>Date și confidențialitate</b></div><ChevronRight size={17} /></Link><Link className="profile-row" to="/eroare/serviciu-indisponibil"><span className="profile-row-icon"><Settings size={18} /></span><div><b>Setări cont</b></div><ChevronRight size={17} /></Link></section>
    <section className="demo-state-links"><h3>Stări demonstrative</h3><p>Accesează ecranele de eroare pentru prezentarea prototipului.</p><div><Link to="/eroare/fara-conexiune">Fără conexiune</Link><Link to="/eroare/ora-indisponibila">Ora indisponibilă</Link><Link to="/eroare/serviciu-indisponibil">Serviciu indisponibil</Link></div></section>
    <button className="logout-button"><LogOut size={18} /> Deconectare</button>
    <p className="profile-version">MedTime · versiune demo 1.0</p>
  </AppShell>;
}
