import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const token = searchParams.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Save JWT
        localStorage.setItem("token", token);

        // Get authenticated user
        const res = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Save user
        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );

        // Go to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("OAuth login failed:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      }
    };

    handleOAuthSuccess();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          Signing you in...
        </h1>

        <p className="text-gray-500 mt-2">
          Please wait.
        </p>
      </div>
    </div>
  );
}

export default OAuthSuccess;