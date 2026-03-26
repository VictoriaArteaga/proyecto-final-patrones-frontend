import "../styles/login.css";
import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";

export default function Login() {
    const [toggle, setToggle] = useState<boolean>(false);

  // LOGIN
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

  // REGISTROO
    const [name, setName] = useState<string>("");
    const [regEmail, setRegEmail] = useState<string>("");
    const [regPassword, setRegPassword] = useState<string>("");

  // LOGIN
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const data = await loginUser({ email, password });
        console.log(data);
        alert("Login exitoso");
        } catch (error) {
        console.error(error);
        alert("Error en login");
        }
    };

// REGISTRO
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const data = await registerUser({
            name,
            email: regEmail,
            password: regPassword,
        });
        console.log(data);
        alert("Registro exitoso");
        setToggle(false); 
        } catch (error) {
        console.error(error);
        alert("Error en registro");
        }
    };

    return (
        <div className={`container ${toggle ? "toggle" : ""}`}>

        {/* LOGIN */}
        <div className="form-container sign-in">
            <form onSubmit={handleLogin}>
            <h2>Iniciar Sesión</h2>

            <div className="container-input">
                <input
                type="email"
                placeholder="Correo"
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="container-input">
                <input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button className="button" type="submit">
                Iniciar sesión
            </button>
            </form>
        </div>

        {/* REGISTRO */}
        <div className="form-container sign-up">
            <form onSubmit={handleRegister}>
            <h2>Regístrate</h2>

            <div className="container-input">
                <input
                type="text"
                placeholder="Nombre"
                onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="container-input">
                <input
                type="email"
                placeholder="Correo"
                onChange={(e) => setRegEmail(e.target.value)}
                />
            </div>

            <div className="container-input">
                <input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setRegPassword(e.target.value)}
                />
            </div>

            <button className="button" type="submit">
                Registrarse
            </button>
            </form>
        </div>

        {/* PANEL */}
        <div className="container-welcome">
            <div className="welcome welcome-sign-in">
            <h3>¡Bienvenido!</h3>
            <p>¿No tienes cuenta?</p>
            <button className="button" onClick={() => setToggle(true)}>
                Regístrate
            </button>
            </div>

            <div className="welcome welcome-sign-up">
            <h3>¡Hola!</h3>
            <p>¿Ya tienes cuenta?</p>
            <button className="button" onClick={() => setToggle(false)}>
                Iniciar sesión
            </button>
            </div>
        </div>

        </div>
    );
    }