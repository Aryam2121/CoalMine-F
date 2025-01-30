import React, { Suspense, lazy } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ResourceProvider } from './context/ResourceContext';
import { WeatherProvider } from './context/WeatherContext';
import Layout from './components/Layout'; // Import the Layout component
import WeatherTrivia from './components/weatherQuiz';

// Lazy-loaded components
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
const CreateCoalMines = lazy(() => import('./components/CoalMineCards'));
const Attendance = lazy(() => import('./components/Attendance'));
const Chatbot = lazy(() => import('./components/chatbot'));
const VoiceDictation = lazy(()=> import('./components/voiceDictation'));
const Achievements = lazy(() => import('./components/Achievements'));
function App() {
  return (
    <ResourceProvider>
      <WeatherProvider>
        <Router>
          {/* Wrap the application in the Layout */}
          <Layout>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path='/voiceDictation' element={<VoiceDictation />} />
                <Route path='/notificationsfire' element={<NotificationsFire />} />
                <Route path='/safety-protocol' element={<SafetyProtocol />} />
                <Route path='/achievements' element={<Achievements />} />
                <Route path='/weatherQuiz' element={<WeatherTrivia />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/coalMines" element={<CoalMineCards />} />
                <Route path="/createMines" element={<CreateCoalMines />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/Weather" element={<WeatherAlerts />} />
                <Route path="/Audit-Logs" element={<AuditLog />} />
                <Route path="/User-Management" element={<UserManagement />} />
                <Route path="/Data-Visualization" element={<DataVisualization />} />
                <Route path="/Report-Generation" element={<ReportGeneration />} />
                <Route path="/shift-logs" element={<ShiftHandoverLog />} />
                <Route path="/safety-plan" element={<SafetyManagementPlan />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/login" element={<Login />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/Alerts" element={<Alerts />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<div>Page Not Found</div>} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </WeatherProvider>
    </ResourceProvider>
  );
}

export default App;
