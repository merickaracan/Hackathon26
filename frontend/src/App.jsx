import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { getMe } from "./api/users";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover";
import Posts from "./pages/Posts";
import PostSession from "./pages/PostSession";
import Matches from "./pages/Matches";
import RateSession from "./pages/RateSession";
import Profile from "./pages/Profile";

// Components
import Layout from "./components/Layout";

// Layout wrapper for protected routes — redirects to /login if not authenticated
function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout matchCount={0}>
      <Outlet />
    </Layout>
  );
}

// Bare protected route — auth required but no Layout wrapper
function ProtectedRoute() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  if (!user && !token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppContent() {
  const { user } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // On mount, verify the stored token is still valid
  useEffect(() => {
    const verify = async () => {
      const stored = localStorage.getItem("token");
      if (!stored) {
        setIsAuthChecked(true);
        return;
      }
      try {
        await getMe();
      } catch {
        // Token invalid or expired — AuthContext clears state on 4xx
      } finally {
        setIsAuthChecked(true);
      }
    };
    verify();
  }, []);

  // Hold render until token is verified to avoid flashing /login
  if (!isAuthChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0F0E0C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          color: "rgba(255,255,255,0.4)",
          fontSize: 15,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#C4856A",
          colorBgBase: "#F5F0E8",
          colorTextBase: "#2C2420",
          borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif",
        },
      }}
    >
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — no sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to={user ? "/discover" : "/login"} replace />} />

          {/* Protected routes — wrapped in Layout, redirect to /login if not authenticated */}
          <Route element={<ProtectedLayout />}>
            <Route path="/discover"     element={<Discover />} />
            <Route path="/posts"        element={<Posts />} />
            <Route path="/post-session" element={<PostSession />} />
            <Route path="/matches"      element={<Matches />} />
            <Route path="/rate-session" element={<RateSession />} />
            <Route path="/profile"      element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={user ? "/discover" : "/login"} replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
