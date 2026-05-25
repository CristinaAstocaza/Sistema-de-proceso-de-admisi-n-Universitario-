import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/api/apiClient";
import logoSanLuis from "@/assets/logo-sanluis.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    try {
      setCargando(true);
      setError("");

      const { data } = await apiClient.post("/api/auth/login", {
        username: username.trim(),
        password,
      });

      localStorage.setItem("auth_user", JSON.stringify(data));
      navigate("/gestion-procesos", { replace: true });
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  const inputClases =
    "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-500 dark:hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-600/50 transition-all duration-200";
  const btnPrimarioClases =
    "w-full bg-slate-700 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white transition-colors duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-8 py-10 transition-colors duration-300 font-sans">
      <div className="w-full max-w-2xl space-y-12 bg-white dark:bg-slate-900 p-14 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="text-center space-y-6">
          <img
            src={logoSanLuis}
            alt="Universidad Nacional San Luis Gonzaga de Ica (UNICA) Logo"
            className="h-36 w-auto mx-auto drop-shadow-md transition-all duration-300 dark:brightness-110"
          />

          <div className="space-y-1.5">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Sistema de Revisión OMR
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
              Universidad Nacional San Luis Gonzaga - UNICA
            </p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-3.5 rounded-lg text-sm border border-red-100 dark:border-red-900 text-center font-medium shadow-inner">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-10">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Usuario
              </label>
              <Input
                type="text"
                placeholder="admin"
                className={`${inputClases} h-14 text-lg`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <Input
                type="password"
                placeholder="••••••••••"
                className={`${inputClases} h-14 text-lg`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button type="submit" className={`${btnPrimarioClases} h-14 text-lg`} disabled={cargando}>
            {cargando ? "Validando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;

