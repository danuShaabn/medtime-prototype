import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarClock, Clock3, RefreshCw, WifiOff } from 'lucide-react';
import { AppShell, Brand, Button } from '../components.jsx';

export function ErrorLayout({ icon: Icon, eyebrow, title, description, children, className = '' }) {
  return <AppShell bare showNav={false} className={`error-page ${className}`}>
    <div className="error-brand"><Brand /></div>
    <div className="error-visual"><span className="error-orbit" /><span className="error-icon"><Icon size={42} strokeWidth={1.7} /></span><i className="error-spark error-spark--one" /><i className="error-spark error-spark--two" /></div>
    <div className="error-copy"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
    {children}
  </AppShell>;
}

export function OfflinePage() {
  const navigate = useNavigate();
  return <ErrorLayout icon={WifiOff} eyebrow="Conexiune întreruptă" title="Fără conexiune la internet" description="Verifică conexiunea și încearcă din nou. Informațiile introduse rămân aici în această demonstrație.">
    <div className="error-info-card"><span className="error-status-dot" /><span>Conexiunea nu este disponibilă</span></div>
    <Button onClick={() => navigate('/acasa')} icon={RefreshCw}>Reîncearcă</Button>
    <button className="error-text-link" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Înapoi</button>
  </ErrorLayout>;
}

export function SlotUnavailablePage() {
  const [selected, setSelected] = useState('12:00');
  const navigate = useNavigate();
  const alternatives = ['12:00', '13:00', '14:30'];
  return <ErrorLayout icon={CalendarClock} eyebrow="Interval ocupat" title="Ora nu mai este disponibilă" description="Un alt pacient a rezervat ora 10:30. Alege una dintre orele libere de mai jos.">
    <section className="alternative-card"><div className="alternative-title"><span><CalendarClock size={17} /> Marți, 10 noiembrie</span><span className="availability-label"><i /> Ore libere</span></div><div className="alternative-slots">{alternatives.map((time) => <button key={time} className={selected === time ? 'is-selected' : ''} onClick={() => setSelected(time)}>{time}</button>)}</div></section>
    <Button onClick={() => navigate('/confirmare', { state: { doctorId: 'ana-popescu', date: 'Marți, 10 noiembrie', time: selected } })}>Alege ora {selected} <ArrowRight size={18} /></Button>
    <button className="error-text-link" onClick={() => navigate('/calendar')}><ArrowLeft size={15} /> Vezi calendarul complet</button>
  </ErrorLayout>;
}

export function ServiceUnavailablePage() {
  const navigate = useNavigate();
  return <ErrorLayout icon={RefreshCw} eyebrow="Încearcă din nou" title="Serviciu indisponibil" description="Nu am putut încărca această pagină acum. Încearcă din nou peste câteva momente.">
    <div className="error-info-card"><span className="service-pulse"><i /></span><span>Verificăm serviciul</span></div>
    <Button onClick={() => navigate('/acasa')} icon={RefreshCw}>Reîncearcă</Button>
    <button className="error-text-link" onClick={() => navigate('/acasa')}><ArrowLeft size={15} /> Înapoi la Acasă</button>
  </ErrorLayout>;
}
