import { useId } from 'react';
import {
  BarChart3,
  Bell,
  CalendarDays,
  CalendarOff,
  Check,
  HeartPulse,
  House,
  MapPin,
  MessageSquareText,
  Search,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from './data.js';
import { useAppState } from './store.jsx';

const patientNavigation = [
  { id: 'home', label: 'Acasă', to: '/acasa', icon: House },
  { id: 'appointments', label: 'Programări', to: '/programari', icon: CalendarDays },
  { id: 'profile', label: 'Profil', to: '/profil', icon: UserRound },
];

const doctorNavigation = [
  { id: 'schedule', label: 'Program', to: '/medic', icon: CalendarDays },
  { id: 'blocks', label: 'Blocare ore', to: '/medic/blocare', icon: CalendarOff },
];

const adminNavigation = [
  { id: 'directory', label: 'Medici și clinici', to: '/admin', icon: Users },
  { id: 'reports', label: 'Rapoarte', to: '/admin/rapoarte', icon: BarChart3 },
  { id: 'reviews', label: 'Recenzii', to: '/admin/recenzii', icon: MessageSquareText },
];

function NavigationLinks({ items, activeNav, side = false }) {
  return items.map(({ id, label, to, icon: Icon }) => (
    <Link
      key={id}
      className={`${side ? 'side-nav-link' : 'bottom-nav-item'}${activeNav === id ? ' is-current' : ''}`}
      to={to}
      aria-current={activeNav === id ? 'page' : undefined}
    >
      <Icon size={side ? 19 : 21} />
      <span>{label}</span>
    </Link>
  ));
}

function LocationLabel({ desktop = false }) {
  return <span className={desktop ? 'desktop-city' : 'city-label'}><MapPin size={14} /> Chișinău</span>;
}

export function AppShell({
  children,
  activeNav = 'home',
  bare = false,
  wide = false,
  showNav = true,
  className = '',
}) {
  const { role } = useAppState();
  const staff = role === 'medic' || role === 'administrator';
  const navigation = role === 'medic' ? doctorNavigation : role === 'administrator' ? adminNavigation : patientNavigation;
  const roleLabel = role === 'medic' ? 'Spațiu medic' : 'Administrare';
  const shellClass = [
    'app-shell',
    bare && 'app-shell--bare',
    wide && 'app-shell--wide',
    staff && 'app-shell--staff',
    className,
  ].filter(Boolean).join(' ');

  return <div className={shellClass}>
    {!bare && <>
      {staff ? <header className="staff-topbar"><div className="staff-topbar-inner"><Brand /><span className="staff-role-label">{roleLabel}</span><LocationLabel desktop /></div></header> : <>
        <header className="mobile-topbar">
          <Brand small />
          <div className="mobile-topbar-actions"><LocationLabel /><Link className="icon-button" to="/profil" aria-label="Profil"><UserRound size={18} /></Link></div>
        </header>
        <header className="desktop-topbar">
          <div className="desktop-topbar-inner">
            <Brand />
            <nav className="desktop-links" aria-label="Navigare principală">
              {patientNavigation.map(({ id, label, to }) => <Link key={id} className={activeNav === id ? 'active' : ''} to={to}>{label}</Link>)}
            </nav>
            <LocationLabel desktop />
            <Link className="desktop-profile" to="/profil"><span className="mini-avatar">AS</span> Ana Șerban</Link>
          </div>
        </header>
      </>}
    </>}
    {staff ? <div className="staff-frame">
      {showNav && <nav className="side-nav" aria-label="Navigare administrare"><NavigationLinks items={navigation} activeNav={activeNav} side /></nav>}
      <main className="page-content">{children}</main>
    </div> : <main className="page-content">{children}</main>}
    {!bare && showNav && <nav className="bottom-nav" aria-label="Navigare principală"><NavigationLinks items={navigation} activeNav={activeNav} /></nav>}
  </div>;
}

export function Brand({ small = false }) {
  return <span className={`brand${small ? ' brand--small' : ''}`}>
    <span className="brand-mark"><HeartPulse size={22} strokeWidth={2.2} /><Check className="brand-check" size={12} strokeWidth={3} /></span>
    <span className="brand-word">Med<span>Time</span></span>
  </span>;
}

export function Button({
  children,
  to,
  variant,
  size,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const buttonClass = ['button', variant && `button--${variant}`, size && `button--${size}`, className].filter(Boolean).join(' ');
  const content = <>{children}{Icon && <Icon size={18} aria-hidden="true" />}</>;
  return to
    ? <Link className={buttonClass} to={to} {...props}>{content}</Link>
    : <button className={buttonClass} type={type} {...props}>{content}</button>;
}

export function PageHeading({ eyebrow, title, description, children }) {
  return <div className="page-heading">
    <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
    {children}
  </div>;
}

export function Field({
  label,
  icon: Icon,
  error,
  invalid = false,
  children,
  type = 'text',
  className = '',
  ...props
}) {
  const id = useId();
  const hasError = Boolean(error || invalid);
  return <label className={`field${hasError ? ' field--error' : ''}${className ? ` ${className}` : ''}`}>
    {label && <span className="field-label">{label}</span>}
    <span className="field-control">
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children || <input id={id} type={type} aria-invalid={hasError || undefined} {...props} />}
    </span>
    {error && <span className="field-error" role="alert">{error}</span>}
  </label>;
}

export function SearchField({ value, onChange, onSubmit, placeholder = 'Caută medic sau specialitate' }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };
  return <form className="search-field" role="search" onSubmit={submit}>
    <Search size={19} aria-hidden="true" />
    <input type="search" value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
    <button type="submit" aria-label="Caută"><Search size={18} /></button>
  </form>;
}

export function DoctorAvatar({ doctor, size = 'medium' }) {
  return <span className={`doctor-avatar doctor-avatar--${size} doctor-avatar--${doctor.tone || 'blue'}`} aria-hidden="true">
    {doctor.initials || doctor.name.split(/\s+/).slice(-2).map((part) => part[0]).join('')}
  </span>;
}

export function DoctorCard({ doctor }) {
  return <Link className="doctor-card" to={`/medici/${doctor.id}`}>
    <div className="doctor-card-top">
      <DoctorAvatar doctor={doctor} />
      <div className="doctor-card-name">
        <h3>{doctor.name}</h3>
        <p>{doctor.specialty}</p>
        <span className="doctor-rating"><span aria-hidden="true">★</span><b>{doctor.rating}</b><span>({doctor.reviews} recenzii)</span></span>
      </div>
    </div>
    <p className="doctor-card-location"><MapPin size={15} />{doctor.clinic || doctor.location || 'Chișinău'}</p>
    <div className="doctor-card-bottom">
      <div><small>Consultație</small><strong>{formatPrice(doctor.price)}</strong></div>
      <div className="availability-dot"><i />{doctor.availability || 'Vezi disponibilitatea'}</div>
    </div>
  </Link>;
}

const specialtyIcons = {
  heart: HeartPulse,
  skin: UserRound,
  brain: Stethoscope,
  child: UserRound,
  eye: UserRound,
  medical: Stethoscope,
};

export function SpecialtyIcon({ name }) {
  const Icon = specialtyIcons[name] || Stethoscope;
  return <span className="specialty-icon"><Icon size={21} strokeWidth={1.8} /></span>;
}
