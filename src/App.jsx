import { Suspense, lazy } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ResourceProvider } from './context/ResourceContext';
import { WeatherProvider } from './context/WeatherContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PageNotFound from './components/PageNotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';

const WeatherTrivia = lazy(() => import('./components/weatherQuiz'));

const Notifications = lazy(() => import('./components/Notificationweb'));
const SafetyProtocol = lazy(() => import('./components/Safetyprotocol'));
const CoalMineCards = lazy(() => import('./components/CoalMineCards'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const WeatherAlerts = lazy(() => import('./components/WeatherWidget'));
const AuditLog = lazy(() => import('./components/AuditLog'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const DataVisualization = lazy(() => import('./components/DataVisualization'));
const ReportGeneration = lazy(() => import('./components/ReportGeneration'));
const ShiftHandoverLog = lazy(() => import('./components/ShiftLogs'));
const SafetyManagementPlan = lazy(() => import('./components/Safetymanagement'));
const NotificationsFire = lazy(() => import('./components/NotificationFire'));
const Login = lazy(() => import('./pages/Login'));
const Resources = lazy(() => import('./components/Resources'));
const Inventory = lazy(() => import('./components/Inventory'));
const Alerts = lazy(() => import('./components/Alerts'));
const Signup = lazy(() => import('./pages/Signup'));
const Attendance = lazy(() => import('./components/Attendance'));
const Chatbot = lazy(() => import('./components/chatbot'));
const VoiceDictation = lazy(() => import('./components/voiceDictation'));
const Achievements = lazy(() => import('./components/Achievements'));
const ComplianceReports = lazy(() => import('./components/CompilanceReports'));
const SafetyReportsPage = lazy(() => import('./components/SafetyReport'));
const Profile = lazy(() => import('./components/Profile'));
const Settings = lazy(() => import('./components/Settings'));
const EmergencyPage = lazy(() => import('./pages/EmergencyPage'));
const TrainingPage = lazy(() => import('./pages/TrainingPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const LiveOperationsPage = lazy(() => import('./pages/LiveOperationsPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const TeamChatPage = lazy(() => import('./pages/TeamChatPage'));
const SafetyCheckInPage = lazy(() => import('./pages/SafetyCheckInPage'));
const CAPAPage = lazy(() => import('./pages/CAPAPage'));
const ComplianceCenterPage = lazy(() => import('./pages/ComplianceCenterPage'));
const PredictiveMaintenancePage = lazy(() => import('./pages/PredictiveMaintenancePage'));
const ExecutiveDashboardPage = lazy(() => import('./pages/ExecutiveDashboardPage'));
const EvacuationCommandPage = lazy(() => import('./pages/EvacuationCommandPage'));
const IncidentForecastPage = lazy(() => import('./pages/IncidentForecastPage'));
const WorkPermitPage = lazy(() => import('./pages/WorkPermitPage'));
const EquipmentRegistryPage = lazy(() => import('./pages/EquipmentRegistryPage'));
const HazardZonesPage = lazy(() => import('./pages/HazardZonesPage'));
const NearMissPage = lazy(() => import('./pages/NearMissPage'));
const SafetyDrillPage = lazy(() => import('./pages/SafetyDrillPage'));
const ContractorVisitorPage = lazy(() => import('./pages/ContractorVisitorPage'));

const PageLoader = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 page-wrap">
    <div className="loading-spinner" aria-label="Loading page" />
    <p className="text-sm text-slate-500">Loading page…</p>
  </div>
);

const Guard = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <Router>
        <AuthProvider>
          <SocketProvider>
          <ResourceProvider>
            <WeatherProvider>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/" element={<Guard><Dashboard /></Guard>} />
                    <Route path="/coal-mines" element={<Guard><CoalMineCards /></Guard>} />
                    <Route path="/coalMines" element={<Navigate to="/coal-mines" replace />} />
                    <Route path="/shift-logs" element={<Guard><ShiftHandoverLog /></Guard>} />
                    <Route path="/safety-plan" element={<Guard><SafetyManagementPlan /></Guard>} />
                    <Route path="/user-management" element={<Guard><UserManagement /></Guard>} />
                    <Route path="/User-Management" element={<Navigate to="/user-management" replace />} />
                    <Route path="/resources" element={<Guard><Resources /></Guard>} />
                    <Route path="/inventory" element={<Guard><Inventory /></Guard>} />
                    <Route path="/weather" element={<Guard><WeatherAlerts /></Guard>} />
                    <Route path="/Weather" element={<Navigate to="/weather" replace />} />
                    <Route path="/data-visualization" element={<Guard><DataVisualization /></Guard>} />
                    <Route path="/Data-Visualization" element={<Navigate to="/data-visualization" replace />} />
                    <Route path="/report-generation" element={<Guard><ReportGeneration /></Guard>} />
                    <Route path="/Report-Generation" element={<Navigate to="/report-generation" replace />} />
                    <Route path="/audit-logs" element={<Guard><AuditLog /></Guard>} />
                    <Route path="/Audit-Logs" element={<Navigate to="/audit-logs" replace />} />
                    <Route path="/notifications" element={<Guard><Notifications /></Guard>} />
                    <Route path="/alerts" element={<Guard><Alerts /></Guard>} />
                    <Route path="/Alerts" element={<Navigate to="/alerts" replace />} />
                    <Route path="/compliance-reports" element={<Guard><ComplianceReports /></Guard>} />
                    <Route path="/safety-report" element={<Guard><SafetyReportsPage /></Guard>} />
                    <Route path="/Safety-Report" element={<Navigate to="/safety-report" replace />} />
                    <Route path="/attendance" element={<Guard><Attendance /></Guard>} />
                    <Route path="/emergency" element={<Guard><EmergencyPage /></Guard>} />
                    <Route path="/evacuation" element={<Guard><EvacuationCommandPage /></Guard>} />
                    <Route path="/training" element={<Guard><TrainingPage /></Guard>} />
                    <Route path="/live-operations" element={<Guard><LiveOperationsPage /></Guard>} />
                    <Route path="/maintenance" element={<Guard><MaintenancePage /></Guard>} />
                    <Route path="/team-chat" element={<Guard><TeamChatPage /></Guard>} />
                    <Route path="/safety-check-in" element={<Guard><SafetyCheckInPage /></Guard>} />
                    <Route path="/capa" element={<Guard><CAPAPage /></Guard>} />
                    <Route path="/compliance-center" element={<Guard><ComplianceCenterPage /></Guard>} />
                    <Route path="/predictive-maintenance" element={<Guard><PredictiveMaintenancePage /></Guard>} />
                    <Route path="/incident-forecast" element={<Guard><IncidentForecastPage /></Guard>} />
                    <Route path="/work-permits" element={<Guard><WorkPermitPage /></Guard>} />
                    <Route path="/equipment-registry" element={<Guard><EquipmentRegistryPage /></Guard>} />
                    <Route path="/hazard-zones" element={<Guard><HazardZonesPage /></Guard>} />
                    <Route path="/near-miss" element={<Guard><NearMissPage /></Guard>} />
                    <Route path="/safety-drills" element={<Guard><SafetyDrillPage /></Guard>} />
                    <Route path="/contractors" element={<Guard><ContractorVisitorPage /></Guard>} />
                    <Route path="/executive" element={<Guard><ExecutiveDashboardPage /></Guard>} />
                    <Route path="/predictive-analytics" element={<Guard><AnalyticsPage /></Guard>} />
                    <Route path="/profile" element={<Guard><Profile /></Guard>} />
                    <Route path="/settings" element={<Guard><Settings /></Guard>} />
                    <Route path="/chatbot" element={<Guard><Chatbot /></Guard>} />
                    <Route path="/achievements" element={<Guard><Achievements /></Guard>} />
                    <Route path="/voiceDictation" element={<Guard><VoiceDictation /></Guard>} />
                    <Route path="/notificationsfire" element={<Guard><NotificationsFire /></Guard>} />
                    <Route path="/safety-protocol" element={<Guard><SafetyProtocol /></Guard>} />
                    <Route path="/weatherQuiz" element={<Guard><WeatherTrivia /></Guard>} />

                    <Route path="*" element={<PageNotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </WeatherProvider>
          </ResourceProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
