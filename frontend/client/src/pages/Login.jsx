import api from "../api/axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });

            localStorage.setItem("token", res.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(res.data.user)
            );

            navigate("/dashboard");
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const handleGoogleLogin = () => {
    window.location.href =
        `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    const handleGithubLogin = () => {
        window.location.href =
            `${import.meta.env.VITE_API_URL}/api/auth/github`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-lg w-96"
            >
                <h1 className="text-3xl font-bold text-center mb-6">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg p-3 mb-4"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg p-3 mb-4"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Login
                </button>

                {/* OAuth divider */}
                <div className="flex items-center my-5">
                    <div className="flex-1 border-t"></div>

                    <span className="px-3 text-sm text-gray-500">
                        OR
                    </span>

                    <div className="flex-1 border-t"></div>
                </div>

                {/* Google Login */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition mb-3"
                >
                    Continue with Google
                </button>

                {/* GitHub Login */}
                <button
                    type="button"
                    onClick={handleGithubLogin}
                    className="w-full bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition"
                >
                    Continue with GitHub
                </button>

                <p className="text-center mt-4">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;