import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Baby,
  Brain,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Eye,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { AppShell, Button, Brand, DoctorAvatar, DoctorCard, Field, PageHeading, SearchField, SpecialtyIcon } from '../components.jsx';
import { calendarDays, doctors, formatPrice, getDoctor, occupiedSlots, specialties, timeSlots } from '../data.js';
import { displayAvailability, isOpenVisit, isSlotBlocked, sessionDoctorId, useAppState } from '../store.jsx';

const onboardingSlides = [
  { icon: HeartPulse, kicker: 'Grijă, în ritmul tău', title: 'Găsește medicul potrivit', text: 'Caută specialitatea de care ai nevoie și descoperă medici de încredere.' },
  { icon: CalendarCheck, kicker: 'Program simplu', title: 'Alege ora care ți se potrivește', text: 'Vezi intervalele libere și programează-te în doar câțiva pași.' },
  { icon: ShieldCheck, kicker: 'Totul într-un singur loc', title: 'Nu uita de vizita ta', text: 'Primește reamintiri și păstrează programările aproape.' },
];

export function OnboardingPage() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();
  const Icon = onboardingSlides[slide].icon;
  const next = () => slide < onboardingSlides.length - 1 ? setSlide(slide + 1) : navigate('/autentificare');
  return <AppShell bare showNav={false} className="onboarding-page">
    <div className="onboarding-header"><Brand /><Link className="skip-link" to="/autentificare">Omite</Link></div>
    <div className="onboarding-art" aria-hidden="true">
      <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
      <div className="art-card art-card--top"><span className="art-mini-check"><Check size={14} /></span><span>Programare confirmată</span></div>
      <div className="art-main-icon"><Icon size={54} strokeWidth={1.6} /></div>
      <div className="art-card art-card--bottom"><span className="art-pulse"><span /></span><span>Grijă aproape de tine</span></div>
      <span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✦</span>
    </div>
    <div className="onboarding-copy">
      <span className="eyebrow">{onboardingSlides[slide].kicker}</span>
      <h1>{onboardingSlides[slide].title}</h1>
      <p>{onboardingSlides[slide].text}</p>
    </div>
    <div className="onboarding-footer">
      <div className="step-dots" aria-label={`Pasul ${slide + 1} din 3`}>
        {onboardingSlides.map((item, index) => <button key={item.title} className={index === slide ? 'is-active' : ''} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} />)}
      </div>
      <Button onClick={next} icon={ArrowRight}>{slide === 2 ? 'Începe acum' : 'Continuă'}</Button>
    </div>
  </AppShell>;
}

export function AuthPage() {
  const [mode, setMode] = useState('intrare');
  const [method, setMethod] = useState('telefon');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    const normalized = value.replace(/[\s()-]/g, '');
    const validPhone = /^(?:\+373\d{8}|0\d{8})$/.test(normalized);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
    if (method === 'telefon' ? !validPhone : !validEmail) {
      setError(method === 'telefon' ? 'Număr de telefon invalid. Verifică și încearcă din nou.' : 'Adresă de e-mail invalidă. Verifică și încearcă din nou.');
      return;
    }
    setError('');
    navigate('/acasa');
  };
  return <AppShell bare showNav={false} className="auth-page">
    <div className="auth-top"><Link className="back-link" to="/onboarding"><ArrowLeft size={19} /></Link><Brand /></div>
    <div className="auth-intro"><span className="eyebrow">Contul tău MedTime</span><h1>{mode === 'intrare' ? 'Bine ai revenit' : 'Creează un cont'}</h1><p>Programează-ți următoarea vizită fără apeluri și fără așteptare.</p></div>
    <div className="auth-tabs"><button className={mode === 'intrare' ? 'is-active' : ''} onClick={() => { setMode('intrare'); setError(''); }}>Autentificare</button><button className={mode === 'creare' ? 'is-active' : ''} onClick={() => { setMode('creare'); setError(''); }}>Înregistrare</button></div>
    <div className="method-switch"><button className={method === 'telefon' ? 'is-active' : ''} onClick={() => { setMethod('telefon'); setValue(''); setError(''); }}><Phone size={16} /> Telefon</button><button className={method === 'email' ? 'is-active' : ''} onClick={() => { setMethod('email'); setValue(''); setError(''); }}><Mail size={16} /> E-mail</button></div>
    <form className="auth-form" onSubmit={submit} noValidate>
      <Field label={method === 'telefon' ? 'Număr de telefon' : 'Adresă de e-mail'} icon={method === 'telefon' ? Phone : Mail} type={method === 'email' ? 'email' : 'tel'} placeholder={method === 'telefon' ? '+373 60 123 456' : 'nume@email.md'} value={value} onChange={(event) => { setValue(event.target.value); setError(''); }} error={error} />
      <Button type="submit" className="auth-submit">Continuă <ArrowRight size={18} /></Button>
    </form>
    {mode === 'intrare' && <div className="forgot-password"><Link to="/resetare-parola">Ai uitat parola?</Link></div>}
    <div className="privacy-note"><ShieldCheck size={17} /><span>Datele tale personale sunt păstrate în siguranță.</span></div>
    <p className="auth-terms">Continuând, accepți <a href="#termeni">termenii de utilizare</a> și <a href="#confidentialitate">politica de confidențialitate</a>.</p>
  </AppShell>;
}

export function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const nextVisit = { doctor: doctors[0], date: 'Marți, 27 octombrie', time: '10:30' };
  return <AppShell wide activeNav="home" className="home-page">
    <section className="home-hero">
      <div className="hero-copy"><span className="eyebrow">Clinica Modus Vivendi · Chișinău</span><h1>Grija pentru sănătatea ta, <em>mai simplă.</em></h1><p>Găsește medicul potrivit și programează-te când îți este comod.</p></div>
      <div className="hero-illustration" aria-hidden="true"><div className="hero-glow" /><div className="hero-heart"><HeartPulse size={70} strokeWidth={1.55} /></div><span className="hero-sticker sticker--one"><Check size={15} /> Confirmat</span><span className="hero-sticker sticker--two"><CalendarDays size={16} /> Ore disponibile</span><span className="hero-orb orb--one" /><span className="hero-orb orb--two" /></div>
      <div className="home-search-wrap"><SearchField value={query} onChange={setQuery} onSubmit={() => navigate(`/medici${query ? `?q=${encodeURIComponent(query)}` : ''}`)} /><span className="search-hint"><MapPin size={14} /> Chișinău</span></div>
    </section>

    <section className="home-section specialties-section"><div className="section-title-row"><div><span className="eyebrow">Servicii medicale</span><h2>Specialități populare</h2></div><Link className="text-link" to="/medici">Toate specialitățile <ChevronRight size={16} /></Link></div>
      <div className="specialty-grid">{specialties.map((specialty) => <Link className="specialty-tile" to={`/medici?q=${encodeURIComponent(specialty.name)}`} key={specialty.name}><SpecialtyIcon name={specialty.icon} /><span>{specialty.name}</span><ChevronRight className="tile-arrow" size={16} /></Link>)}</div>
    </section>

    <section className="home-section next-appointment-section"><div className="section-title-row"><div><span className="eyebrow">Următoarea programare</span><h2>Vizita ta, la îndemână</h2></div><Link className="text-link" to="/programari">Vezi toate <ChevronRight size={16} /></Link></div>
      <article className="next-appointment-card"><div className="next-appointment-main"><DoctorAvatar doctor={nextVisit.doctor} size="large" /><div><span className="appointment-kind">Consultație · {nextVisit.doctor.specialty}</span><h3>{nextVisit.doctor.name}</h3><p><CalendarDays size={15} /> {nextVisit.date} <span className="meta-divider">·</span> <Clock3 size={15} /> {nextVisit.time}</p></div></div><div className="appointment-location"><MapPin size={16} /><span>Clinica Modus Vivendi, Chișinău</span><Button to="/programari" variant="white" size="small">Detalii</Button></div></article>
    </section>

    <section className="home-section novelties-section"><div className="section-title-row"><div><span className="eyebrow">MedTime pentru tine</span><h2>Mai multă grijă, mai puțin stres</h2></div></div><div className="novelty-grid"><article><span className="novelty-icon"><Clock3 size={20} /></span><div><b>Ore libere actualizate</b><p>Vezi rapid când poți veni la medic.</p></div></article><article><span className="novelty-icon"><CalendarCheck size={20} /></span><div><b>Reamintiri utile</b><p>Notificări sau SMS înainte de vizită.</p></div></article><article><span className="novelty-icon"><Stethoscope size={20} /></span><div><b>În limba ta</b><p>Română, rusă sau engleză.</p></div></article></div></section>
  </AppShell>;
}

export function DoctorsPage() {
  const location = useLocation();
  const { doctors: availableDoctors, clinics, blocks, schedule } = useAppState();
  const [filter, setFilter] = useState('Toți medicii');
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [priceLimit, setPriceLimit] = useState('');
  const [ratingFloor, setRatingFloor] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const filters = ['Toți medicii', 'Disponibili azi', 'Rating 4.8+', 'Preț sub 600 lei'];
  const clinicOptions = [...new Set([...clinics.map((clinic) => clinic.name), ...availableDoctors.map((doctor) => doctor.clinic)])];
  const filtered = availableDoctors.filter((doctor) => {
    if (!doctor.active) return false;
    const matchesQuery = `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(query.toLowerCase());
    const matchesQuickFilter = filter === 'Toți medicii'
      || (filter === 'Disponibili azi' && doctor.availability.startsWith('Azi'))
      || (filter === 'Rating 4.8+' && Number(doctor.rating) >= 4.8)
      || (filter === 'Preț sub 600 lei' && doctor.price < 600);
    const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
    const matchesPrice = !priceLimit || doctor.price <= Number(priceLimit);
    const matchesRating = !ratingFloor || Number(doctor.rating) >= Number(ratingFloor);
    const matchesClinic = !clinicFilter || doctor.clinic === clinicFilter;
    const display = displayAvailability(doctor, blocks, schedule);
    const matchesQuickAvailability = filter !== 'Disponibili azi' || display.startsWith('Azi');
    return matchesQuery && matchesQuickFilter && matchesQuickAvailability && matchesSpecialty && matchesPrice && matchesRating && matchesClinic;
  });
  return <AppShell wide activeNav="home" className="doctors-page">
    <section className="doctors-intro"><div><span className="eyebrow">Modus Vivendi · Chișinău</span><h1>Găsește medicul potrivit</h1><p>Alege un specialist și găsește un moment potrivit pentru tine.</p></div><div className="doctors-count"><b>{filtered.length}</b><span>specialiști disponibili</span></div></section>
    <div className="doctor-search-row"><SearchField value={query} onChange={setQuery} placeholder="Caută medic" /><button className="filter-button" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}><span className="filter-symbol">☷</span> Filtre <span className="filter-count">{Number(Boolean(specialtyFilter)) + Number(Boolean(clinicFilter)) + Number(Boolean(priceLimit)) + Number(Boolean(ratingFloor))}</span></button></div>
    {showFilters && <div className="advanced-filter-panel">
      <label><span>Specialitate</span><select value={specialtyFilter} onChange={(event) => setSpecialtyFilter(event.target.value)}><option value="">Toate specialitățile</option>{specialties.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
      <label><span>Clinică</span><select value={clinicFilter} onChange={(event) => setClinicFilter(event.target.value)}><option value="">Toate clinicile</option>{clinicOptions.map((clinic) => <option key={clinic} value={clinic}>{clinic}</option>)}</select></label>
      <label><span>Preț maxim</span><select value={priceLimit} onChange={(event) => setPriceLimit(event.target.value)}><option value="">Orice preț</option><option value="550">550 lei</option><option value="650">650 lei</option><option value="700">700 lei</option></select></label>
      <label><span>Rating minim</span><select value={ratingFloor} onChange={(event) => setRatingFloor(event.target.value)}><option value="">Orice rating</option><option value="4.8">4.8+</option><option value="4.9">4.9+</option><option value="5">5.0</option></select></label>
    </div>}
    <div className="filter-chips" role="group" aria-label="Filtre rapide">{filters.map((item) => <button key={item} className={`filter-chip ${filter === item ? 'is-active' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="results-caption"><span>Medici recomandați</span><button>Sortare: <b>Recomandați</b><ChevronRight size={15} /></button></div>
    <div className="doctor-list">{filtered.length ? filtered.map((doctor) => <DoctorCard key={doctor.id} doctor={{ ...doctor, availability: displayAvailability(doctor, blocks, schedule) }} />) : <div className="empty-state"><Search size={24} /><b>Nu am găsit medici</b><span>Încearcă altă căutare sau alt filtru.</span><button onClick={() => { setFilter('Toți medicii'); setQuery(''); setSpecialtyFilter(''); setPriceLimit(''); setRatingFloor(''); setClinicFilter(''); }}>Resetează filtrele</button></div>}</div>
  </AppShell>;
}

export function DoctorProfilePage() {
  const { id } = useParams();
  const { doctors: availableDoctors, reviews } = useAppState();
  const doctor = availableDoctors.find((item) => item.id === id) || getDoctor(id);
  const doctorReviews = reviews.filter((review) => review.doctorId === doctor.id && review.status === 'Aprobată');
  const navigate = useNavigate();
  return <AppShell activeNav="home" className="doctor-profile-page">
    <div className="profile-back-row"><Link className="back-link" to="/medici"><ArrowLeft size={18} /><span>Înapoi la medici</span></Link><button className="icon-button" aria-label="Salvează medicul"><Star size={19} /></button></div>
    <section className="doctor-profile-card"><DoctorAvatar doctor={doctor} size="hero" /><div className="verified-label"><BadgeCheck size={15} /> Medic verificat</div><h1>{doctor.name}</h1><p className="profile-specialty">{doctor.specialty}</p><div className="profile-rating-row"><span><Star size={16} fill="currentColor" /><b>{doctor.rating}</b> ({doctor.reviews} recenzii)</span><i /><span>{doctor.experience}</span></div><div className="profile-location"><MapPin size={16} /> {doctor.clinic || 'Modus Vivendi'} · Chișinău</div></section>
    <section className="profile-content-section"><h2>Despre medic</h2><p>{doctor.description}</p><div className="profile-facts"><div><span>Experiență</span><b>{doctor.experience}</b></div><div><span>Limbi vorbite</span><b>{doctor.languages.join(', ')}</b></div></div></section>
    <section className="profile-content-section"><div className="section-title-row"><h2>Recenzii</h2><span className="review-average"><Star size={15} fill="currentColor" /> {doctor.rating}</span></div>{doctorReviews.length ? doctorReviews.map((review) => <article className="review-card" key={review.id}><div className="review-top"><span className="review-avatar">{review.author.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><b>{review.author}</b><span>Pacient · {review.date}</span></div><span className="review-stars">{'★'.repeat(review.stars)}</span></div><p>„{review.text}”</p></article>) : <div className="empty-state"><b>Nu există recenzii aprobate pentru acest medic.</b></div>}</section>
    <div className="sticky-action"><div><small>Consultație</small><strong>{formatPrice(doctor.price)}</strong></div><Button onClick={() => navigate(doctor.active === false ? '/eroare/medic-indisponibil' : '/calendar', { state: { doctorId: doctor.id } })}>Programează <ArrowRight size={18} /></Button></div>
  </AppShell>;
}

export function CalendarPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctors: availableDoctors, blocks, schedule } = useAppState();
  const doctor = availableDoctors.find((item) => item.id === location.state?.doctorId) || getDoctor(location.state?.doctorId);
  const [selectedDay, setSelectedDay] = useState(() => Math.max(0, calendarDays.findIndex((item) => !item.past)));
  const date = calendarDays[selectedDay];
  const isPast = date.past;
  const slotUnavailableOn = (dateKey, time) => occupiedSlots.includes(time)
    || (doctor.id === sessionDoctorId && schedule.some((visit) => visit.date === dateKey && visit.time === time && isOpenVisit(visit)))
    || isSlotBlocked(blocks, doctor.id, dateKey, time);
  const [selectedTime, setSelectedTime] = useState(() => (slotUnavailableOn(date.key, '10:00') ? timeSlots.find((time) => !slotUnavailableOn(date.key, time)) || '' : '10:00'));
  const slotUnavailable = (time) => slotUnavailableOn(date.key, time);
  const selectedUnavailable = isPast || slotUnavailable(selectedTime);
  return <AppShell wide activeNav="home" className="calendar-page">
    <div className="booking-progress"><span className="progress-step is-done"><i>1</i><b>Medic</b></span><span className="progress-line is-done" /><span className="progress-step is-current"><i>2</i><b>Data și ora</b></span><span className="progress-line" /><span className="progress-step"><i>3</i><b>Confirmare</b></span></div>
    <section className="calendar-heading"><div><span className="eyebrow">Alege un interval</span><h1>Când îți este comod?</h1><p>Orele disponibile pentru <b>{doctor.name}</b></p></div><div className="selected-doctor-mini"><DoctorAvatar doctor={doctor} size="small" /><div><b>{doctor.name}</b><span>{doctor.specialty}</span></div></div></section>
    <div className="calendar-layout"><section className="calendar-card"><div className="month-heading"><button className="icon-button" aria-label="Luna anterioară" disabled><ArrowLeft size={18} /></button><h2>Noiembrie 2026</h2><button className="icon-button" aria-label="Luna următoare" disabled><ArrowRight size={18} /></button></div><div className="date-strip">{calendarDays.map((item, index) => <button type="button" className={`date-option ${selectedDay === index ? 'is-selected' : ''}`} key={item.key} disabled={item.past} aria-label={`${item.label}${item.past ? ', dată trecută' : ''}`} onClick={() => { setSelectedDay(index); const available = timeSlots.find((time) => !slotUnavailableOn(item.key, time)); if (!selectedTime || slotUnavailableOn(item.key, selectedTime)) setSelectedTime(available || ''); }}><span>{item.day}</span><b>{item.date}</b><i /></button>)}</div><div className="availability-caption"><span><i className="legend-dot legend-dot--free" />Disponibil</span><span><i className="legend-dot legend-dot--busy" />Ocupat</span></div><h3 className="time-heading">Ore disponibile <span>{date.label}</span></h3><div className="time-grid">{timeSlots.map((time) => {
      const occupied = isPast || slotUnavailable(time);
      return <button type="button" key={time} disabled={occupied} className={`time-slot ${occupied ? 'is-occupied' : ''} ${selectedTime === time ? 'is-selected' : ''}`} onClick={() => setSelectedTime(time)}>{time}</button>;
    })}</div><p className="calendar-note"><Clock3 size={15} /> Orele sunt afișate în fusul orar local al clinicii.</p></section>
      <aside className="booking-summary-card"><span className="eyebrow">Rezumatul programării</span><h2>Consultație medicală</h2><div className="summary-doctor"><DoctorAvatar doctor={doctor} /><div><b>{doctor.name}</b><span>{doctor.specialty}</span></div></div><div className="summary-line"><span><CalendarDays size={17} /> Data</span><b>{date.label}</b></div><div className="summary-line"><span><Clock3 size={17} /> Ora</span><b>{selectedTime || 'Alege o oră'}</b></div><div className="summary-line"><span><MapPin size={17} /> Clinica</span><b>{doctor.clinic || 'Modus Vivendi'}</b></div><div className="summary-price"><span>Preț consultație</span><b>{formatPrice(doctor.price)}</b></div><Button disabled={selectedUnavailable || !selectedTime} onClick={() => navigate('/confirmare', { state: { doctorId: doctor.id, date: date.label, time: selectedTime } })}>Continuă <ArrowRight size={18} /></Button><p className="secure-note"><ShieldCheck size={15} /> Confirmarea nu implică plată online.</p></aside>
    </div>
  </AppShell>;
}

export function ConfirmPage({ booking: presetBooking, overlay = null } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctors: availableDoctors } = useAppState();
  const booking = location.state || presetBooking || {};
  const doctor = availableDoctors.find((item) => item.id === booking.doctorId) || getDoctor(booking.doctorId);
  const date = booking.date || 'Marți, 27 octombrie';
  const time = booking.time || '10:30';
  return <AppShell activeNav="home" showNav={false} className="confirm-page">
    <div className="flow-topbar"><Link className="back-link" to="/calendar" state={{ doctorId: doctor.id }}><ArrowLeft size={18} /> Înapoi</Link><Brand small /><span className="secure-indicator"><ShieldCheck size={15} /> Securizat</span></div>
    <div className="booking-progress booking-progress--compact"><span className="progress-step is-done"><i><Check size={13} /></i><b>Medic</b></span><span className="progress-line is-done" /><span className="progress-step is-done"><i><Check size={13} /></i><b>Data și ora</b></span><span className="progress-line is-done" /><span className="progress-step is-current"><i>3</i><b>Confirmare</b></span></div>
    <PageHeading eyebrow="Ultimul pas" title="Confirmă programarea" description="Verifică detaliile înainte de confirmare." />
    <section className="confirmation-card"><div className="confirmation-doctor"><DoctorAvatar doctor={doctor} size="large" /><div><span className="appointment-kind">Consultație · {doctor.specialty}</span><h2>{doctor.name}</h2><span className="confirmed-rating"><Star size={14} fill="currentColor" /> {doctor.rating} · {doctor.experience}</span></div></div><div className="confirmation-divider" /><div className="confirmation-details"><div><CalendarDays size={18} /><span>Data</span><b>{date}</b></div><div><Clock3 size={18} /><span>Ora</span><b>{time}</b></div><div><MapPin size={18} /><span>Clinica</span><b>{doctor.clinic || 'Modus Vivendi'}, Chișinău</b></div></div><div className="confirmation-price"><span>Prețul consultației</span><b>{formatPrice(doctor.price)}</b></div></section>
    <div className="confirmation-reminder"><Bell size={18} /><p>Îți vom trimite o reamintire înainte de vizită, prin notificare sau SMS.</p><Check size={18} /></div>
    <Button className="confirm-button" onClick={() => navigate('/succes', { state: { doctorId: doctor.id, date, time } })}>Confirmă programarea <ArrowRight size={18} /></Button>
    <p className="cancel-note">Poți anula sau reprograma vizita din secțiunea „Programările mele”.</p>
    {overlay}
  </AppShell>;
}

export function SuccessPage() {
  const location = useLocation();
  const [added, setAdded] = useState(false);
  const { doctors: availableDoctors } = useAppState();
  const booking = location.state || {};
  const doctor = availableDoctors.find((item) => item.id === booking.doctorId) || getDoctor(booking.doctorId);
  const date = booking.date || 'Marți, 27 octombrie';
  const time = booking.time || '10:30';
  return <AppShell showNav={false} className="success-page">
    <div className="success-brand"><Brand /></div>
    <div className="success-art"><span className="success-circle"><Check size={43} strokeWidth={2.7} /></span><span className="success-star star-a">✦</span><span className="success-star star-b">✧</span><span className="success-star star-c">✦</span></div>
    <div className="success-copy"><span className="eyebrow">Totul este pregătit</span><h1>Programarea a fost confirmată</h1><p>Am rezervat intervalul pentru tine. Detaliile sunt mai jos.</p></div>
    <section className="success-booking-card"><div className="success-doctor"><DoctorAvatar doctor={doctor} /><div><b>{doctor.name}</b><span>{doctor.specialty}</span></div></div><div className="success-details"><span><CalendarDays size={16} /> {date}</span><span><Clock3 size={16} /> {time}</span><span><MapPin size={16} /> {doctor.clinic || 'Modus Vivendi'}, Chișinău</span></div><div className="success-price"><span>De achitat la clinică</span><b>{formatPrice(doctor.price)}</b></div></section>
    <Button variant={added ? 'success' : 'outline'} onClick={() => setAdded(true)} icon={added ? Check : CalendarDays}>{added ? 'Adăugat în calendar' : 'Adaugă în calendar'}</Button>
    <Button to="/programari" variant="text" className="success-secondary">Vezi programările mele <ArrowRight size={17} /></Button>
  </AppShell>;
}
