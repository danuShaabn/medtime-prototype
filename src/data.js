export const doctors = [
  {
    id: 'ana-popescu',
    name: 'Dr. Ana Popescu',
    specialty: 'Cardiologie',
    rating: '4.9',
    reviews: 128,
    price: 650,
    experience: '12 ani experiență',
    initials: 'AP',
    tone: 'lavender',
    availability: 'Azi, 10:30',
    location: 'Modus Vivendi · Chișinău',
    description: 'Consultații cardiologice cu explicații clare și un plan de îngrijire adaptat fiecărui pacient.',
    education: 'Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu”',
    languages: ['Română', 'Rusă'],
  },
  {
    id: 'mihai-rusu',
    name: 'Dr. Mihai Rusu',
    specialty: 'Medicină internă',
    rating: '4.8',
    reviews: 94,
    price: 500,
    experience: '9 ani experiență',
    initials: 'MR',
    tone: 'mint',
    availability: 'Azi, 11:00',
    location: 'Modus Vivendi · Chișinău',
    description: 'Evaluare generală și consultații de medicină internă într-un cadru calm și atent.',
    education: 'Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu”',
    languages: ['Română', 'Engleză'],
  },
  {
    id: 'elena-ciobanu',
    name: 'Dr. Elena Ciobanu',
    specialty: 'Dermatologie',
    rating: '5.0',
    reviews: 76,
    price: 600,
    experience: '10 ani experiență',
    initials: 'EC',
    tone: 'peach',
    availability: 'Mâine, 09:30',
    location: 'Modus Vivendi · Chișinău',
    description: 'Consultații dermatologice și recomandări personalizate, explicate pe înțelesul tuturor.',
    education: 'Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu”',
    languages: ['Română', 'Rusă', 'Engleză'],
  },
  {
    id: 'andrei-munteanu',
    name: 'Dr. Andrei Munteanu',
    specialty: 'Neurologie',
    rating: '4.9',
    reviews: 61,
    price: 700,
    experience: '14 ani experiență',
    initials: 'AM',
    tone: 'blue',
    availability: 'Joi, 14:00',
    location: 'Modus Vivendi · Chișinău',
    description: 'Consultații neurologice într-un ritm potrivit pacientului, cu atenție la istoricul medical.',
    education: 'Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu”',
    languages: ['Română', 'Rusă'],
  },
];

export const specialties = [
  { name: 'Cardiologie', icon: 'heart' },
  { name: 'Dermatologie', icon: 'skin' },
  { name: 'Neurologie', icon: 'brain' },
  { name: 'Pediatrie', icon: 'child' },
  { name: 'Oftalmologie', icon: 'eye' },
  { name: 'Medicină internă', icon: 'medical' },
];

export const appointments = {
  Viitoare: [
    { doctorId: 'ana-popescu', date: 'Marți, 27 octombrie', time: '10:30', type: 'Consultație cardiologică' },
    { doctorId: 'mihai-rusu', date: 'Vineri, 30 octombrie', time: '15:00', type: 'Consultație de medicină internă' },
  ],
  Trecute: [
    { doctorId: 'elena-ciobanu', date: 'Luni, 12 octombrie', time: '09:30', type: 'Consultație dermatologică' },
  ],
  Anulate: [
    { doctorId: 'andrei-munteanu', date: 'Miercuri, 7 octombrie', time: '13:00', type: 'Consultație neurologică' },
  ],
};

export const getDoctor = (id) => doctors.find((doctor) => doctor.id === id) ?? doctors[0];
export const formatPrice = (value) => `${value} lei`;

/** Dată fixă a demonstrației, ca ecranele capturate să nu depindă de ceasul dispozitivului. */
export const demoToday = '2026-11-08';

export const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '14:00', '14:30', '15:00', '16:00'];
export const occupiedSlots = ['09:30', '11:30', '14:00'];

const weekdayShort = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
const weekdayLong = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

/** Două săptămâni (2–15 noiembrie 2026, luni–duminică); zilele dinaintea datei demo sunt trecute. */
export const calendarDays = Array.from({ length: 14 }, (_, index) => {
  const date = index + 2;
  const key = `2026-11-${String(date).padStart(2, '0')}`;
  return {
    key,
    day: weekdayShort[index % 7],
    date: String(date),
    label: `${weekdayLong[index % 7]}, ${date} noiembrie`,
    past: key < demoToday,
  };
});
