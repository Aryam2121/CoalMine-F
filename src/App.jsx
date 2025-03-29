// import React, { Suspense, lazy } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { ResourceProvider } from './context/ResourceContext';
// import { WeatherProvider } from './context/WeatherContext';
// import Layout from './components/Layout'; // Import the Layout component
// import WeatherTrivia from './components/weatherQuiz';
// import { GoogleOAuthProvider } from '@react-oauth/google';


// // Lazy-loaded components
// const Notifications = lazy(() => import('./components/Notificationweb'));
// const SafetyProtocol = lazy(() => import('./components/Safetyprotocol')); 
// const CoalMineCards = lazy(() => import('./components/CoalMineCards'));
// const Dashboard = lazy(() => import('./components/Dashboard'));
// const WeatherAlerts = lazy(() => import('./components/WeatherWidget'));
// const AuditLog = lazy(() => import('./components/AuditLog'));
// const UserManagement = lazy(() => import('./components/UserManagement'));
// const DataVisualization = lazy(() => import('./components/DataVisualization'));
// const ReportGeneration = lazy(() => import('./components/ReportGeneration'));
// const ShiftHandoverLog = lazy(() => import('./components/ShiftLogs'));
// const SafetyManagementPlan = lazy(() => import('./components/Safetymanagement'));
// const NotificationsFire = lazy(() => import('./components/NotificationFire'));
// const Login = lazy(() => import('./pages/Login'));
// const Resources = lazy(() => import('./components/Resources'));
// const Inventory = lazy(() => import('./components/Inventory'));
// const Alerts = lazy(() => import('./components/Alerts'));
// const Signup = lazy(() => import('./pages/Signup'));
// const CreateCoalMines = lazy(() => import('./components/CoalMineCards'));
// const Attendance = lazy(() => import('./components/Attendance'));
// const Chatbot = lazy(() => import('./components/chatbot'));
// const VoiceDictation = lazy(()=> import('./components/voiceDictation'));
// const Achievements = lazy(() => import('./components/Achievements'));

// const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
// function App() {
//   return (
//     <ResourceProvider>
//       <WeatherProvider>
//       <GoogleOAuthProvider clientId= {import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//         <Router>
//           {/* Wrap the application in the Layout */}
//           <Layout>
//           <Suspense fallback={<div className="loading-spinner">Loading...</div>}>

//               <Routes>
//                 <Route path='/voiceDictation' element={<VoiceDictation />} />
//                 <Route path='/notificationsfire' element={<NotificationsFire />} />
//                 <Route path='/safety-protocol' element={<SafetyProtocol />} />
//                 <Route path='/achievements' element={<Achievements />} />
//                 <Route path='/weatherQuiz' element={<WeatherTrivia />} />
//                 <Route path="/chatbot" element={<Chatbot />} />
//                 <Route path="/attendance" element={<Attendance />} />
//                 <Route path="/coalMines" element={<CoalMineCards />} />
//                 <Route path="/createMines" element={<CreateCoalMines />} />
//                 <Route path="/Weather" element={<WeatherAlerts />} />
//                 <Route path="/Audit-Logs" element={<AuditLog />} />
//                 <Route path="/Data-Visualization" element={<DataVisualization />} />
//                 <Route path="/Report-Generation" element={<ReportGeneration />} />
//                 <Route path="/notifications" element={<Notifications />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/resources" element={<Resources />} />
//                 <Route path="/inventory" element={<Inventory />} />
//                 <Route path="/Alerts" element={<Alerts />} />
//                 {/* <Route path="/User-Management" element={<UserManagement />} /> */}
//                 {/* <Route path="/safety-plan" element={<SafetyManagementPlan />} /> */}
//                 {/* <Route path="/shift-logs" element={<ShiftHandoverLog />} /> */}
//                 {/* <Route path="/" element={<Dashboard />} /> */}
//                 <Route 
//                     path="/" 
//                     element={
//                       <ProtectedRoute>
//                         <Dashboard />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/User-Management" 
//                     element={
//                       <ProtectedRoute>
//                         <UserManagement />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/shift-logs" 
//                     element={
//                       <ProtectedRoute>
//                         <ShiftHandoverLog />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/safety-plan" 
//                     element={
//                       <ProtectedRoute>
//                         <SafetyManagementPlan />
//                       </ProtectedRoute>
//                     } 
//                   />
//                 <Route path="*" element={<div>Page Not Found</div>} />
            
//                   <Route path="/signup" element={<Signup />} />
              
//               </Routes>
//             </Suspense>
//           </Layout>
//         </Router>
//         </GoogleOAuthProvider>
//       </WeatherProvider>
//     </ResourceProvider>
//   );
// }

// export default App;
// App.js
import React, { Suspense, lazy } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ResourceProvider } from './context/ResourceContext';
import { WeatherProvider } from './context/WeatherContext';
import { AuthProvider } from './context/AuthContext';  // Import AuthContext
import Layout from './components/Layout'; // Import the Layout component
import WeatherTrivia from './components/weatherQuiz';
import { GoogleOAuthProvider } from '@react-oauth/google';


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
const VoiceDictation = lazy(() => import('./components/voiceDictation'));
const Achievements = lazy(() => import('./components/Achievements'));
const ComplianceReports = lazy(() => import('./components/CompilanceReports'));
const SafetyReportsPage = lazy(() => import('./components/SafetyReport'));
const Profile = lazy(() => import('./components/Profile'));
const Settings = lazy(() => import('./components/Settings'));
// Protected Route Component
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));


function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider> {/* Wrap the AuthProvider inside Router */}
          <ResourceProvider>
            <WeatherProvider>
              <Layout>
                <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/User-Management"
                      element={
                        <ProtectedRoute>
                          <UserManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shift-logs"
                      element={
                        <ProtectedRoute>
                          <ShiftHandoverLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/safety-plan"
                      element={
                        <ProtectedRoute>
                          <SafetyManagementPlan />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/voiceDictation"
                      element={
                        <ProtectedRoute>
                          <VoiceDictation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notificationsfire"
                      element={
                        <ProtectedRoute>
                          <NotificationsFire />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/safety-protocol"
                      element={
                        <ProtectedRoute>
                          <SafetyProtocol />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/achievements"
                      element={
                        <ProtectedRoute>
                          <Achievements />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/weatherQuiz"
                      element={
                        <ProtectedRoute>
                          <WeatherTrivia />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chatbot"
                      element={
                        <ProtectedRoute>
                          <Chatbot />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile/>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings/>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/attendance"
                      element={
                        <ProtectedRoute>
                          <Attendance />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/coalMines"
                      element={
                        <ProtectedRoute>
                          <CoalMineCards />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/createMines"
                      element={
                        <ProtectedRoute>
                          <CreateCoalMines />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Weather"
                      element={
                        <ProtectedRoute>
                          <WeatherAlerts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Audit-Logs"
                      element={
                        <ProtectedRoute>
                          <AuditLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Data-Visualization"
                      element={
                        <ProtectedRoute>
                          <DataVisualization />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Report-Generation"
                      element={
                        <ProtectedRoute>
                          <ReportGeneration />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/resources"
                      element={
                        <ProtectedRoute>
                          <Resources />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Safety-Report"
                      element={
                        <ProtectedRoute>
                          <SafetyReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute>
                          <Inventory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Alerts"
                      element={
                        <ProtectedRoute>
                          <Alerts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/compliance-reports"
                      element={
                        <ProtectedRoute>
                          <ComplianceReports />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route path="*" element={<div>Page Not Found</div>} />
                  </Routes>
                </Suspense>
              </Layout>
            </WeatherProvider>
          </ResourceProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
