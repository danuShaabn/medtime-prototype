import { Navigate, Route, Routes } from 'react-router-dom';
import { OnboardingPage, AuthPage, HomePage, DoctorsPage, DoctorProfilePage, CalendarPage, ConfirmPage, SuccessPage } from './pages/FlowPages.jsx';
import { AppointmentsPage, ProfilePage } from './pages/AccountPages.jsx';
import { OfflinePage, SlotUnavailablePage, ServiceUnavailablePage } from './pages/ErrorPages.jsx';
import { AppRestartedPage, BookingNotSavedPage, DoctorCancelledPage, DoctorUnavailablePage, DoubleBookingPage, PasswordResetPage, PasswordResetSentPage, SessionExpiredPage } from './pages/StatePages.jsx';
import { AdminDirectoryPage, BlockHoursPage, ReportsPage, ReviewsPage, SchedulePage } from './pages/StaffPages.jsx';

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/onboarding" replace />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/autentificare" element={<AuthPage />} />
    <Route path="/acasa" element={<HomePage />} />
    <Route path="/medici" element={<DoctorsPage />} />
    <Route path="/medici/:id" element={<DoctorProfilePage />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/confirmare" element={<ConfirmPage />} />
    <Route path="/succes" element={<SuccessPage />} />
    <Route path="/programari" element={<AppointmentsPage />} />
    <Route path="/profil" element={<ProfilePage />} />
    <Route path="/medic" element={<SchedulePage />} />
    <Route path="/medic/blocare" element={<BlockHoursPage />} />
    <Route path="/admin" element={<AdminDirectoryPage />} />
    <Route path="/admin/rapoarte" element={<ReportsPage />} />
    <Route path="/admin/recenzii" element={<ReviewsPage />} />
    <Route path="/eroare/fara-conexiune" element={<OfflinePage />} />
    <Route path="/eroare/ora-indisponibila" element={<SlotUnavailablePage />} />
    <Route path="/eroare/serviciu-indisponibil" element={<ServiceUnavailablePage />} />
    <Route path="/eroare/programare-nesalvata" element={<BookingNotSavedPage />} />
    <Route path="/eroare/medic-indisponibil" element={<DoctorUnavailablePage />} />
    <Route path="/eroare/sesiune-expirata" element={<SessionExpiredPage />} />
    <Route path="/eroare/aplicatie-repornita" element={<AppRestartedPage />} />
    <Route path="/eroare/programare-dubla" element={<DoubleBookingPage />} />
    <Route path="/eroare/programare-anulata" element={<DoctorCancelledPage />} />
    <Route path="/resetare-parola" element={<PasswordResetPage />} />
    <Route path="/resetare-parola/trimis" element={<PasswordResetSentPage />} />
    <Route path="*" element={<Navigate to="/acasa" replace />} />
  </Routes>;
}
