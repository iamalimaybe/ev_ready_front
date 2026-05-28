import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApiClient } from '../../utils/adminApi';

type AdminSession = {
  username?: string;
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await adminApiClient.post<AdminSession>('/api/v1/admin/auth/login', {
        username,
        password,
      });
      setPassword('');
      navigate('/admin');
    } catch {
      setError('Invalid admin username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Internal admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in to view EVReady Pakistan Get Help leads and Contact Us submissions. This area is for
          authorized internal use only.
        </p>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
            Username
            <input
              autoComplete="username"
              className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none ring-emerald-600 transition focus:ring-2"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
            Password
            <input
              autoComplete="current-password"
              className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none ring-emerald-600 transition focus:ring-2"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            className="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      <Link className="text-sm font-medium text-emerald-700 hover:text-emerald-800" to="/">
        Back to EVReady Pakistan
      </Link>
    </main>
  );
};

export default AdminLogin;
