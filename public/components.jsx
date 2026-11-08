import { Link, NavLink } from 'react-router-dom';
import {
  Activity,
  Baby,
  BarChart3,
  Bell,
  Brain,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  HeartPulse,
  House,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Star,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { formatPrice } from './data.js';
import { displayAvailability, useAppState } from './store.jsx';

export function Brand({ small = false, to = '/acasa' }) {
  return (
    <Link className={`brand ${small ? 'brand--small' : ''}`} to={to} aria-label="MedTime — Acasă">
      <span className="brand-mark" aria-hidden="true"><Plus size={20} strokeWidth={3} /><Check className="brand-check" size={10} strokeWidth={3.2} /></span>
      <span className="brand-word">Med<span>Time</span></span>
    </Link>
  );
}

export function Button({ to, variant = 'primary', size = 'normal', icon: Icon, children, className = '', ...props }) {
  const classes = `button button--${variant} button--${size} ${className}`.trim();
  const content = <>{children}{Icon && <Icon size={18} strokeWidth={2.2} />}</>;
  return to
    ? <Link className={classes} to={to} {...props}>{content}</Link>
    : <button type="button" className={classes} {...props}>{content}</button>;
}

const roleNames = { pacient: 'Pacient', medic: 'Medic', administrator: 'Administrator' };

export function navigationFor(role) {
  if (role === 'medic') return [
    { id: 'schedule', label: 'Programul meu', to: '/medic', icon: CalendarDays, end: true },
    { id: 'blocks', label: 'Blocare ore', to: '/medic/blocare', icon: Lock, end: true },
    { id: 'profile', label: 'Profil', to: '/profil', icon: UserRound, end: true },
  ];
  if (role === 'administrator') return [
    { id: 'directory', label: 'Medici și clinici', to: '/admin', icon: Building2, end: true },
    { id: 'reports', label: 'Rapoarte', to: '/admin/rapoarte', icon: BarChart3, end: true },
    { id: 'reviews', label: 'Recenzii', to: '/admin/recenzii', icon: MessageSquare, end: true },
  ];
  return [
    { id: 'home', label: 'Acasă', to: '/acasa', icon: House, end: true },
    { id: 'appointments', label: 'Programări', to: '/programari', icon: CalendarDays, end: true },
    { id: 'profile', label: 'Profil', to: '/profil', icon: UserRound, end: true },
  ];
}

export function AppShell({ children, wide = false, activeNav = 'home', showNav = true, bare = false, className = '' }) {
  const { role } = useAppState();
  const staff = showNav && role !== 'pacient';
  const home = role === 'medic' ? '/medic' : role === 'administrator' ? '/admin' : '/acasa';
  const items = navigationFor(role);
  return (
    <div className={`app-shell ${wide ? 'app-shell--wide' : ''} ${bare ? 'app-shell--bare' : ''} ${staff ? 'app-shell--staff' : ''} ${className}`.trim()}>
      {!bare && <div className="mobile-topbar">
        <Brand small to={home} />
        <div className="mobile-topbar-actions">{role === 'pacient' ? <span className="city-label"><MapPin size={14} /> Chișinău</span> : <span className="city-label">Rol: {roleNames[role]}</span>}<button className="icon-button" aria-label="Notificări" type="button"><Bell size={19} /></button></div>
      </div>}
      {!staff && <header className="desktop-topbar">
        <div className="desktop-topbar-inner">
          <Brand />
          <nav className="desktop-links" aria-label="Navigare principală">
            <NavLink to="/acasa">Acasă</NavLink>
            <NavLink to="/medici">Medici</NavLink>
            <NavLink to="/programari">Programările mele</NavLink>
          </nav>
          <span className="desktop-city"><MapPin size={16} /> Chișinău</span>
          <Link className="desktop-profile" to="/profil"><span className="mini-avatar">AS</span><span>Ana</span></Link>
        </div>
      </header>}
      {staff && <header className="staff-topbar">
        <div className="staff-topbar-inner">
          <Brand to={home} />
          <span className="staff-role-label">Vizualizare: {roleNames[role]}</span>
          <span className="desktop-city"><MapPin size={16} /> Chișinău</span>
          <Link className="desktop-profile" to="/profil"><span className="mini-avatar">AS</span><span>Ana</span></Link>
        </div>
      </header>}
      {staff ? <div className="staff-frame">
        <aside className="side-nav" aria-label="Navigare principală">
          {items.map(({ id, label, to, icon: Icon, end }) => <NavLink key={id} to={to} end={end} className={({ isActive }) => `side-nav-link ${activeNav === id || isActive ? 'is-current' : ''}`}><Icon size={20} /><span>{label}</span></NavLink>)}
        </aside>
        <main className="page-content">{children}</main>
      </div> : <main className="page-content">{children}</main>}
      {showNav && <BottomNav active={activeNav} />}
    </div>
  );
}

export function BottomNav({ active = 'home' }) {
  const { role } = useAppState();
  const items = navigationFor(role);
  return <nav className="bottom-nav" aria-label="Navigare mobilă">
    {items.map(({ id, label, to, icon: Icon, end }) => <NavLink key={id} to={to} end={end} className={({ isActive }) => `bottom-nav-item ${active === id || isActive ? 'is-current' : ''}`}>
      {({ isActive }) => <><Icon size={21} strokeWidth={active === id || isActive ? 2.4 : 1.8} /><span>{label}</span></>}
    </NavLink>)}
  </nav>;
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action}
  </div>;
}

export function DoctorAvatar({ doctor, size = 'normal' }) {
  return <div className={`doctor-avatar doctor-avatar--${doctor.tone || 'blue'} doctor-avatar--${size}`} aria-label={`Inițialele ${doctor.initials}`}>
    <span>{doctor.initials}</span><span className="avatar-dot" aria-hidden="true" />
  </div>;
}

export function DoctorCard({ doctor }) {
  const { blocks, schedule } = useAppState();
  return <article className="doctor-card">
    <div className="doctor-card-top">
      <DoctorAvatar doctor={doctor} />
      <div className="doctor-card-name"><h3>{doctor.name}</h3><p>{doctor.specialty}</p><div className="doctor-rating"><Star size={14} fill="currentColor" /><b>{doctor.rating}</b><span>({doctor.reviews} recenzii)</span></div></div>
    </div>
    <div className="doctor-card-location"><MapPin size={15} /><span>{doctor.location}</span></div>
    <div className="doctor-card-bottom"><div><small>Consultație de la</small><strong>{formatPrice(doctor.price)}</strong><span className="availability-dot"><i />{displayAvailability(doctor, blocks, schedule)}</span></div><Button to={`/medici/${doctor.id}`} variant="outline" size="small">Programează</Button></div>
  </article>;
}

export function SpecialtyIcon({ name }) {
  const icons = { heart: HeartPulse, skin: Activity, brain: Brain, child: Baby, eye: Eye, medical: Stethoscope };
  const Icon = icons[name] || Stethoscope;
  return <span className="specialty-icon"><Icon size={21} strokeWidth={1.8} /></span>;
}

export function Field({ label, icon: Icon, error, invalid = false, type = 'text', children, ...props }) {
  return <label className={`field ${error ? 'field--error' : ''}`}>
    <span className="field-label">{label}</span>
    <span className={`field-control ${invalid ? 'field-control--invalid' : ''}`}>{Icon && <Icon size={18} />}{children || <input type={type} {...props} />}</span>
    {error && <span className="field-error">{error}</span>}
  </label>;
}

export function SearchField({ value, onChange, placeholder = 'Medic, specialitate sau clinică', onSubmit }) {
  return <form className="search-field" onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }}>
    <Search size={19} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label="Caută medic sau specialitate" /><button type="submit" aria-label="Caută"><ChevronRight size={19} /></button>
  </form>;
}

export function Rating({ value, reviews }) {
  return <span className="doctor-rating"><Star size={14} fill="currentColor" /><b>{value}</b>{reviews && <span>({reviews})</span>}</span>;
}
