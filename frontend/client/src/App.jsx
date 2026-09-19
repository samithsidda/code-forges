import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Room from "./pages/Room";
import ProtectedRoute from "./routes/ProtectedRoute";
import OAuthSuccess from "./pages/OAuthSuccess";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/room/:roomCode" element={<ProtectedRoute><Room /></ProtectedRoute>} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
    </Routes>
  );
}

export default App;