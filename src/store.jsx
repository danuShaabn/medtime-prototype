import { createContext, useContext, useEffect, useState } from 'react';
import { demoToday, doctors as seedDoctors, occupiedSlots, timeSlots } from './data.js';

const STORAGE_KEY = 'medtime-demo-state-v1';
const tones = ['lavender', 'mint', 'peach', 'blue', 'teal'];

export const sessionDoctorId = 'ana-popescu';

export const scheduleDays = [
  { key: '2026-11-08', short: 'Dum', date: '8', label: 'Duminică, 8 noiembrie 2026' },
  { key: '2026-11-09', short: 'Lun', date: '9', label: 'Luni, 9 noiembrie 2026' },
  { key: '2026-11-10', short: 'Mar', date: '10', label: 'Marți, 10 noiembrie 2026', empty: true },
  { key: '2026-11-11', short: 'Mie', date: '11', label: 'Miercuri, 11 noiembrie 2026' },
  { key: '2026-11-12', short: 'Joi', date: '12', label: 'Joi, 12 noiembrie 2026' },
  { key: '2026-11-13', short: 'Vin', date: '13', label: 'Vineri, 13 noiembrie 2026' },
  { key: '2026-11-14', short: 'Sâm', date: '14', label: 'Sâmbătă, 14 noiembrie 2026' },
];

const people = ['Ion Cebotari', 'Maria Lungu', 'Victor Cojocaru', 'Elena Moraru', 'Andrei Botnari', 'Sofia Rusu', 'Petru Munteanu', 'Ana Grițco', 'Dumitru Luca', 'Olga Mocanu', 'Nicolae Russu', 'Irina Bivol'];
const reasons = ['Control periodic', 'Dureri în piept', 'Tensiune arterială', 'ECG de control', 'Consultație inițială', 'Rezultate analize', 'Amețeli'];
const visitStatuses = ['Confirmată', 'În așteptare', 'Confirmată', 'Confirmată', 'Anulată', 'În așteptare', 'Confirmată'];
const dayPlan = {
  '2026-11-08': ['09:00', '09:30', '10:30', '11:00', '13:00', '15:00', '16:00'],
  '2026-11-09': ['09:00', '10:00', '11:00', '12:00', '14:00', '16:00'],
  '2026-11-10': [],
  '2026-11-11': ['09:30', '10:30', '11:30', '14:00', '15:00'],
  '2026-11-12': ['09:00', '09:30', '10:00', '11:00', '13:00', '14:30', '16:00'],
  '2026-11-13': ['09:00', '10:30', '11:30', '13:00', '15:00', '16:00'],
  '2026-11-14': ['10:00', '11:00', '12:00', '14:00', '15:00'],
};

function buildSchedule() {
  let cursor = 0;
  return Object.entries(dayPlan).flatMap(([date, times]) => times.map((time) => {
    const visit = {
      id: `${date}-${time}`,
      date,
      time,
      patient: people[cursor % people.length],
      reason: reasons[cursor % reasons.length],
      status: visitStatuses[cursor % visitStatuses.length],
    };
    cursor += 1;
    return visit;
  }));
}

const extraDoctors = [
  {
    id: 'irina-pascal',
    name: 'Dr. Irina Pascal',
    specialty: 'Pediatrie',
    rating: '4.7',
    reviews: 42,
    price: 450,
    experience: '8 ani experiență',
    initials: 'IP',
    tone: 'mint',
    availability: 'Mâine, 10:00',
    location: 'Medpark · Chișinău',
    clinic: 'Medpark',
    description: 'Consultații pediatrice calme, cu explicații pentru părinte și copil.',
    education: 'Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu”',
    languages: ['Română', 'Rusă'],
  },
  {
    id: 'vlad-grosu',
    name: 'Dr. Vlad Grosu',
    specialty: 'Oftalmologie',
    rating: '4.8',
    reviews: 37,
    price: 550,
    experience: '11 ani experiență',
    initials: 'VG',
    tone: 'teal',
    availability: 'Joi, 12:30',
    location: 'Ares Medical · Chișinău',
    clinic: 'Ares Medical',
    description: 'Consultații oftalmologice și recomandări clare pentru controlul vederii.',
    education: 'Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu”',
    languages: ['Română', 'Engleză'],
  },
];

const seedReviews = [
  { id: 'rev-maria', author: 'Maria P.', doctorId: 'ana-popescu', stars: 5, text: 'Consultația a fost atentă și toate explicațiile au fost foarte clare.', date: '12 octombrie 2026', status: 'Aprobată' },
  { id: 'rev-radu', author: 'Radu C.', doctorId: 'ana-popescu', stars: 3, text: 'Programarea a început cu întârziere, iar sala de așteptare era aglomerată.', date: '20 octombrie 2026', status: 'Ascunsă' },
  { id: 'rev-ion', author: 'Ion M.', doctorId: 'mihai-rusu', stars: 4, text: 'Am așteptat puțin, dar medicul a fost foarte răbdător.', date: '2 noiembrie 2026', status: 'Nouă' },
  { id: 'rev-sofia', author: 'Sofia L.', doctorId: 'mihai-rusu', stars: 5, text: 'Explicații pe înțelesul meu, fără grabă.', date: '30 octombrie 2026', status: 'Aprobată' },
  { id: 'rev-elena', author: 'Elena V.', doctorId: 'elena-ciobanu', stars: 5, text: 'Recomandări clare și o atmosferă liniștită.', date: '28 octombrie 2026', status: 'Aprobată' },
  { id: 'rev-andrei', author: 'Petru D.', doctorId: 'andrei-munteanu', stars: 5, text: 'Am înțeles planul de îngrijire și pașii următori.', date: '18 octombrie 2026', status: 'Aprobată' },
  { id: 'rev-anon', author: 'Anonim', doctorId: 'andrei-munteanu', stars: 1, text: 'Comentariu jignitor, fără legătură cu consultația.', date: '5 noiembrie 2026', status: 'Nouă' },
  { id: 'rev-irina', author: 'Carmen S.', doctorId: 'irina-pascal', stars: 5, text: 'Copilul a fost liniștit, iar explicațiile pentru părinți au fost clare.', date: '1 noiembrie 2026', status: 'Aprobată' },
];

function initialsFrom(name) {
  const parts = name.replace(/^dr\.?\s+/i, '').split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
}

export function formatDoctorName(name) {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  return /^dr\.?\s/i.test(trimmed) ? trimmed.replace(/^dr\.?\s+/i, 'Dr. ') : `Dr. ${trimmed}`;
}

function slugify(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeDoctor(doctor, index) {
  const clinic = doctor.clinic || 'Modus Vivendi';
  return {
    ...doctor,
    clinic,
    active: doctor.active !== false,
    location: doctor.location || `${clinic} · Chișinău`,
    tone: doctor.tone || tones[index % tones.length],
    initials: doctor.initials || initialsFrom(doctor.name || 'Medic'),
  };
}

function createSeed() {
  return {
    role: 'pacient',
    blocks: [],
    doctors: [...seedDoctors.map((doctor) => normalizeDoctor({ ...doctor, clinic: 'Modus Vivendi' })), ...extraDoctors.map((doctor, index) => normalizeDoctor(doctor, index))],
    clinics: [
      { id: 'modus-vivendi', name: 'Modus Vivendi', city: 'Chișinău' },
      { id: 'medpark', name: 'Medpark', city: 'Chișinău' },
      { id: 'ares-medical', name: 'Ares Medical', city: 'Chișinău' },
    ],
    reviews: seedReviews,
    schedule: buildSchedule(),
  };
}

function loadInitial() {
  const seed = createSeed();
  if (typeof localStorage === 'undefined') return seed;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return seed;
    const role = saved.role === 'medic' || saved.role === 'administrator' || saved.role === 'pacient' ? saved.role : 'pacient';
    return {
      role,
      blocks: Array.isArray(saved.blocks) ? saved.blocks : [],
      doctors: Array.isArray(saved.doctors) && saved.doctors.length ? saved.doctors.map(normalizeDoctor) : seed.doctors,
      clinics: Array.isArray(saved.clinics) && saved.clinics.length ? saved.clinics : seed.clinics,
      reviews: Array.isArray(saved.reviews) && saved.reviews.length ? saved.reviews : seed.reviews,
      schedule: Array.isArray(saved.schedule) && saved.schedule.length ? saved.schedule : seed.schedule,
    };
  } catch {
    return seed;
  }
}

export function toMinutes(value) {
  const [hours, minutes] = String(value).split(':').map(Number);
  return hours * 60 + minutes;
}

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function isSlotBlocked(blocks, doctorId, date, time) {
  const start = toMinutes(time);
  return blocks.some((block) => block.doctorId === doctorId && block.date === date && rangesOverlap(start, start + 30, toMinutes(block.from), toMinutes(block.to)));
}

export function displayAvailability(doctor, blocks, schedule = []) {
  const match = String(doctor.availability).match(/(\d{2}:\d{2})/);
  if (!String(doctor.availability).startsWith('Azi') || !match) return doctor.availability;
  const isOccupied = (time) => occupiedSlots.includes(time)
    || (doctor.id === sessionDoctorId && schedule.some((visit) => visit.date === demoToday && visit.time === time && isOpenVisit(visit)));
  if (!isOccupied(match[1]) && !isSlotBlocked(blocks, doctor.id, demoToday, match[1])) return doctor.availability;
  const next = timeSlots.find((time) => toMinutes(time) > toMinutes(match[1]) && !isOccupied(time) && !isSlotBlocked(blocks, doctor.id, demoToday, time));
  return next ? `Azi, ${next}` : 'Fără intervale libere azi';
}

export function isOpenVisit(visit) {
  return visit.status !== 'Anulată' && visit.status !== 'Anulată de medic';
}

export function visitsOverlapping(schedule, block) {
  return schedule.filter((visit) => {
    if (!isOpenVisit(visit) || visit.date !== block.date) return false;
    const start = toMinutes(visit.time);
    return rangesOverlap(start, start + 30, toMinutes(block.from), toMinutes(block.to));
  });
}

export function activeVisitCount(schedule, date) {
  return schedule.filter((visit) => visit.date === date && isOpenVisit(visit)).length;
}

export function firstVisitTime(schedule, date) {
  const times = schedule.filter((visit) => visit.date === date && isOpenVisit(visit)).map((visit) => visit.time).sort();
  return times[0] || '—';
}

export function freeSlotCount(schedule, blocks, date) {
  return timeSlots.filter((time) => {
    const taken = schedule.some((visit) => visit.date === date && visit.time === time && isOpenVisit(visit));
    return !taken && !isSlotBlocked(blocks, sessionDoctorId, date, time);
  }).length;
}

export function formatDemoDate(iso) {
  if (!iso || !iso.includes('-')) return iso || '';
  const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  const [year, month, day] = iso.split('-');
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

export function doctorCountLabel(count) {
  return count === 1 ? '1 medic' : `${count} medici`;
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Prototipul rămâne funcțional și fără stocare locală. */
    }
  }, [state]);

  const value = {
    ...state,
    setRole: (role) => setState((current) => ({ ...current, role })),
    cancelVisit: (id) => setState((current) => ({
      ...current,
      schedule: current.schedule.map((visit) => (visit.id === id ? { ...visit, status: 'Anulată de medic' } : visit)),
    })),
    addBlock: (block) => setState((current) => ({
      ...current,
      blocks: [...current.blocks, { ...block, id: `block-${Date.now()}` }],
    })),
    removeBlock: (id) => setState((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== id),
    })),
    addDoctor: (input) => setState((current) => {
      const name = formatDoctorName(input.name);
      const base = slugify(name) || 'medic';
      let id = base;
      let suffix = 2;
      while (current.doctors.some((doctor) => doctor.id === id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
      }
      const doctor = normalizeDoctor({
        id,
        name,
        specialty: input.specialty,
        clinic: input.clinic,
        price: Number(input.price),
        rating: '5.0',
        reviews: 0,
        experience: 'Profil nou',
        initials: initialsFrom(name),
        tone: tones[current.doctors.length % tones.length],
        availability: 'Săptămâna aceasta',
        location: `${input.clinic} · Chișinău`,
        description: 'Consultații medicale în cadrul demonstrației MedTime.',
        education: 'Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu”',
        languages: ['Română'],
        active: true,
      }, current.doctors.length);
      return { ...current, doctors: [...current.doctors, doctor] };
    }),
    updateDoctor: (id, input) => setState((current) => ({
      ...current,
      doctors: current.doctors.map((doctor) => (doctor.id === id ? {
        ...doctor,
        name: formatDoctorName(input.name),
        specialty: input.specialty,
        clinic: input.clinic,
        price: Number(input.price),
        location: `${input.clinic} · Chișinău`,
        initials: initialsFrom(input.name),
      } : doctor)),
    })),
    setDoctorActive: (id, active) => setState((current) => ({
      ...current,
      doctors: current.doctors.map((doctor) => (doctor.id === id ? { ...doctor, active } : doctor)),
    })),
    addClinic: (input) => setState((current) => {
      const name = input.name.trim().replace(/\s+/g, ' ');
      const base = slugify(name) || 'clinica';
      let id = base;
      let suffix = 2;
      while (current.clinics.some((clinic) => clinic.id === id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
      }
      return { ...current, clinics: [...current.clinics, { id, name, city: input.city.trim() }] };
    }),
    setReviewStatus: (id, status) => setState((current) => ({
      ...current,
      reviews: current.reviews.map((review) => (review.id === id ? { ...review, status } : review)),
    })),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState trebuie folosit în AppStateProvider');
  return value;
}

export function useDoctor(id) {
  const { doctors } = useAppState();
  if (!id) return doctors[0];
  return doctors.find((doctor) => doctor.id === id) || doctors[0];
}
