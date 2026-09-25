import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr('');
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setErr('Email o contraseña incorrectos.');
  };

  return (
    <div className="loginBox">
      <h2>Panel privado</h2>
      <p>Inicia sesión para gestionar la Wishlist de Casey.</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <div className="loginErr">{err}</div>
      <button className="aBtn" style={{ width: '100%' }} onClick={submit} disabled={busy}>
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
      <p style={{ marginTop: 16 }}>
        <a href="/" style={{ color: 'var(--sub)' }}>
          ← Volver a la wishlist
        </a>
      </p>
    </div>
  );
}
