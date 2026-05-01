import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';


import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import CreateSkill from './pages/CreateSkill';
import Matches from './pages/Matches';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import SkillDetail from './pages/SkillDetail';
import NotFound from './pages/NotFound';
import EditSkill from './pages/EditSkill';
import Chat from './pages/Chat';
import Sessions from './pages/Sessions';
import Notifications from './pages/Notifications';
import CreditHistory from './pages/CreditHistory';
import PublicProfile from './pages/PublicProfile';



const App = () => (
  <AuthProvider>
    <SocketProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/skills"    element={<Skills />} />
        <Route path="/skills/:id" element={<SkillDetail />} />

        {/* Protected */}
        <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/skills/create" element={<ProtectedRoute><CreateSkill /></ProtectedRoute>} />
        <Route path="/matches"       element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/requests"      element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/skills/edit/:id" element={<ProtectedRoute><EditSkill /></ProtectedRoute>} />
        
        <Route path="/chat"             element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/credits"       element={<ProtectedRoute><CreditHistory /></ProtectedRoute>} />
        <Route path="/user/:userId"  element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </BrowserRouter>
    </SocketProvider>
  </AuthProvider>
);

export default App;