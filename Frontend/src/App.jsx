import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import WorkspaceDashboard from './pages/WorkspaceDashboar';
import { UserProvider } from './context/UserContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import Team from './pages/Team';
import TeamDashboard from './pages/TeamDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import TaskAnalysis from './pages/TaskAnalysis';
import WorkspaceSettings from './pages/WorkspaceSettings';
import TeamSettings from './pages/TeamSettings';
import TaskPage from './pages/TaskPage';
import ProjectSettings from './pages/ProjectSettings'
import { TeamProvider } from './context/TeamContext';
import Project from './pages/Project';
import CreateTask from './pages/CreateTask';
import TaskSettings from './pages/TaskSetting';
import NotificationsPage from './pages/NotificationsPage';
import AcceptInvite from './pages/AcceptInvite';
import { useEffect } from 'react';
import socket from './socket'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkspaceSocketManager from './sockets/WorkspaceSocketManager';
import TeamSocketManager from './sockets/TeamSocketManager';
import ProjectSocketManager from './sockets/ProjectSocketManager';
import { ProjectProvider } from './context/ProjectContext';
import TaskSocketManager from './sockets/TaskSocketManager';
import { TaskProvider } from './context/TaskContext';
import NotificationSocketManager from './sockets/NotificationSocketManager';
import UserSocketManager from './sockets/UserSocketManager';

const queryClient = new QueryClient();

function App() {

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected", socket.id);
    });

    return () => {
      socket.off("connect");
    }
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <WorkspaceProvider >
            <TeamProvider>
              <ProjectProvider >
                <TaskProvider>
                  <NotificationSocketManager />
                  <UserSocketManager />
                  <WorkspaceSocketManager />
                  <TeamSocketManager />
                  <ProjectSocketManager />
                  <TaskSocketManager />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard"
                      element={(
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/workspace/new"
                      element={(
                        <ProtectedRoute>
                          <Workspace />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/team/:workspaceId/new"
                      element={(
                        <ProtectedRoute>
                          <Team />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:teamId/project/new"
                      element={(
                        <ProtectedRoute>
                          <Project />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:teamId/:projectId/task/new"
                      element={(
                        <ProtectedRoute>
                          <CreateTask />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/workspace/:workspaceId"
                      element={(
                        <ProtectedRoute>
                          <WorkspaceDashboard />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/team/:teamId"
                      element={(
                        <ProtectedRoute>
                          <TeamDashboard />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/project/:projectId"
                      element={(
                        <ProtectedRoute>
                          <ProjectDashboard />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:projectId/task-analysis"
                      element={(
                        <ProtectedRoute>
                          <TaskAnalysis />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:workspaceId/workspace-settings"
                      element={(
                        <ProtectedRoute>
                          <WorkspaceSettings />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:teamId/team-settings"
                      element={(
                        <ProtectedRoute>
                          <TeamSettings />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:projectId/project-settings"
                      element={(
                        <ProtectedRoute>
                          <ProjectSettings />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:projectId/:taskId/task-settings"
                      element={(
                        <ProtectedRoute>
                          <TaskSettings />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:projectId/:taskId/task"
                      element={(
                        <ProtectedRoute>
                          <TaskPage />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/notification"
                      element={(
                        <ProtectedRoute>
                          <NotificationsPage />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/:workspaceId/notification"
                      element={(
                        <ProtectedRoute>
                          <NotificationsPage />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/accept-invite"
                      element={(
                        <ProtectedRoute>
                          <AcceptInvite />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/auth/verify-email" element={<VerifyEmail />} />
                    <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </TaskProvider>
              </ProjectProvider>
            </TeamProvider>
          </WorkspaceProvider>
        </UserProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;