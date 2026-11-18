import { useEffect, useState } from 'react';
import { sb } from './supabase.js';

const STATUS = ['baru', 'dibaca', 'didampingi', 'dirujuk', 'selesai'];
const ya = v => (v ? 'ya' : 'tidak');

function Stories() {
  const [r, setR] = useState([]);
  const load = () => sb.from('stories').select('*').order('created_at', { ascending: false }).then(({ data }) => setR(data || []));
  useEffect(() => { load(); }, []);
  const upd = async (id, status) => { await sb.from('stories').update({ status }).eq('id', id); load(); };
  const del = async id => { if (confirm('Hapus permanen cerita ini?')) { await sb.from('stories').delete().eq('id', id); load(); } };
  return <>{r.length === 0 && <p>Belum ada cerita masuk.</p>}{r.map(s => (
    <div className="card" key={s.id}>
      <small>{new Date(s.created_at).toLocaleString('id-ID')} | {s.anonymous ? 'Anonim' : `${s.name} (${s.school || '-'})`}{s.is_minor ? ' | di bawah 18' : ''} | Kontak: {s.contact || '-'}</small>
      <h3>{s.title || '(tanpa judul)'}</h3><p>{s.body}</p>
      <p className="note">Adaptasi: {ya(s.consent_adaptation)} | Publikasi: {ya(s.consent_publication)} | Izin wali: {ya(s.consent_guardian)}</p>
      <select value={s.status} onChange={e => upd(s.id, e.target.value)}>{STATUS.map(x => <option key={x}>{x}</option>)}</select>{' '}
      <button onClick={() => del(s.id)}>Hapus</button>
    </div>))}</>;
}

function Posts() {
  const [r, setR] = useState([]);
  const load = () => sb.from('posts').select('*').order('created_at', { ascending: false }).then(({ data }) => setR(data || []));
  useEffect(() => { load(); }, []);
  async function add(e) {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
    await sb.from('posts').insert({ title: d.title, body: d.body || null, image_url: d.image_url || null, published: !!d.published });
    e.target.reset(); load();
  }
  const tog = async p => { await sb.from('posts').update({ published: !p.published }).eq('id', p.id); load(); };
  const del = async id => { if (confirm('Hapus konten ini?')) { await sb.from('posts').delete().eq('id', id); load(); } };
  return <>
    <form className="card" onSubmit={add}><h3>Tambah konten</h3>
      <input name="title" placeholder="Judul" required /><textarea name="body" placeholder="Deskripsi" />
      <input name="image_url" placeholder="URL gambar (mis. /assets/dok1.jpeg)" />
      <label><input type="checkbox" name="published" /> Terbitkan</label><button className="btn">Simpan konten</button></form>
    {r.map(p => <div className="card" key={p.id}><h3>{p.title}</h3><p className="note">{p.published ? 'Terbit' : 'Draf'}</p>
      <button onClick={() => tog(p)}>{p.published ? 'Tarik' : 'Terbitkan'}</button>{' '}<button onClick={() => del(p.id)}>Hapus</button></div>)}
  </>;
}

export default function Admin() {
  const [u, setU] = useState(null), [ok, setOk] = useState(null), [tab, setTab] = useState('s'), [err, setErr] = useState('');
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setU(data.session?.user ?? null));
    const { data: l } = sb.auth.onAuthStateChange((_, s) => setU(s?.user ?? null));
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!u) return setOk(null);
    sb.from('staff').select('user_id').eq('user_id', u.id).maybeSingle().then(({ data }) => setOk(!!data));
  }, [u]);
  async function login(e) {
    e.preventDefault(); const d = new FormData(e.target);
    const { error } = await sb.auth.signInWithPassword({ email: d.get('e'), password: d.get('p') });
    setErr(error ? 'Email atau kata sandi salah.' : '');
  }
  if (!u) return <form className="card narrow" onSubmit={login}><h2>Masuk staf</h2>
    <input name="e" type="email" placeholder="Email" required /><input name="p" type="password" placeholder="Kata sandi" required />
    <button className="btn">Masuk</button><p className="err">{err}</p></form>;
  if (ok === null) return <p>Memuat…</p>;
  if (!ok) return <div className="card"><p>Akun ini tidak memiliki akses staf.</p><button className="btn" onClick={() => sb.auth.signOut()}>Keluar</button></div>;
  return <div>
    <div className="row"><button className={'btn' + (tab === 's' ? '' : ' ghost')} onClick={() => setTab('s')}>Cerita masuk</button>
      <button className={'btn' + (tab === 'p' ? '' : ' ghost')} onClick={() => setTab('p')}>Konten situs</button>
      <button className="btn ghost" onClick={() => sb.auth.signOut()}>Keluar</button></div>
    {tab === 's' ? <Stories /> : <Posts />}
  </div>;
}
