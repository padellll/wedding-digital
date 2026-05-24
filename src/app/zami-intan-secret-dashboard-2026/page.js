'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {

  const [password, setPassword] =
    useState('');

    const [isAdmin, setIsAdmin] =
    useState(false);

  const [rsvp, setRsvp] = useState([]);

  const login = () => {

    if (
      password ===
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      setIsAdmin(true);
    } else {
      alert('Password salah');
    }
  };

  useEffect(() => {

    if (!isAdmin) return;

    const loadData = async () => {

      const { data } = await supabase
        .from('rsvp')
        .select('*')
        .order('id', {
          ascending: false
        });

      setRsvp(data || []);
    };

    loadData();

  }, [isAdmin]);

  if (!isAdmin) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">

        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md space-y-5">

          <h1 className="text-3xl font-bold text-center">
            Admin Login
          </h1>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border p-4 rounded-xl"
          />

          <button
            onClick={login}
            className="w-full bg-emerald-900 text-white py-4 rounded-xl"
          >
            Login
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="p-10">

      <h1 className="text-4xl font-bold mb-10">
        Dashboard RSVP
      </h1>

      <div className="overflow-auto rounded-2xl border">

        <table className="w-full border-collapse">

          <thead>
            <tr className="bg-stone-100 text-left">
              <th className="p-4">Nama</th>
              <th className="p-4">Jumlah Tamu</th>
              <th className="p-4">Kehadiran</th>
            </tr>
          </thead>

          <tbody>
            {rsvp.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">
                  {item.nama}
                </td>

                <td className="p-4">
                  {item.jumlah_tamu}
                </td>

                <td className="p-4">
                  {item.kehadiran}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}