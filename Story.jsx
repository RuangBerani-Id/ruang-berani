import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sb } from './supabase.js';

const n = v => v.trim() || null;
export default function Story() {
  const [f, setF] = useState({ anonymous: true, is_minor: false, name: '', school: '', contact: '', title: '', body: '',
    consent_storage: false, consent_adaptation: false, consent_publication: false, consent_guardian: false });
  const [msg, setMsg] = useState(''), [done, setDone] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const needGuardian = !f.anonymous && f.is_minor;

  async function submit(e) {
    e.preventDefault();
    if (!f.body.trim()) return setMsg('Tulis ceritamu terlebih dahulu.');
    if (!f.anonymous && !f.name.trim()) return setMsg('Isi namamu, atau pilih mode anonim.');
    if (!f.consent_storage) return setMsg('Centang persetujuan penyimpanan data agar cerita bisa terkirim.');
    if (needGuardian && !f.consent_guardian) return setMsg('Pengiriman tidak anonim untuk pelajar di bawah 18 tahun memerlukan izin orang tua atau wali.');
    setMsg('Mengirim…');
    const { error } = await sb.from('stories').insert({
      anonymous: f.anonymous, is_minor: f.is_minor, name: f.anonymous ? null : n(f.name), school: f.anonymous ? null : n(f.school),
      contact: n(f.contact), title: n(f.title), body: f.body,
      consent_storage: f.consent_storage, consent_adaptation: f.consent_adaptation,
      consent_publication: f.consent_publication, consent_guardian: needGuardian && f.consent_guardian });
    if (error) return setMsg('Ceritamu belum terkirim. Periksa koneksi lalu coba lagi.');
    setDone(true);
  }
  if (done) return <div className="card"><h2>Terima kasih sudah berani bersuara</h2><p>Ceritamu sudah diterima. Staf yang ditugaskan akan membacanya.</p><Link className="btn" to="/">Kembali ke beranda</Link></div>;

  const C = [['consent_storage', 'Data storage / Penyimpanan data', 'Saya mengizinkan ceritaku disimpan dan dibaca staf Ruang Berani yang ditugaskan. (wajib)'],
    ['consent_adaptation', 'Story adaptation / Adaptasi cerita', 'Ceritaku boleh diadaptasi untuk edukasi, identitas disamarkan.'],
    ['consent_publication', 'Story publication / Publikasi cerita', 'Ceritaku boleh dipublikasikan, identitas disamarkan.']];
  return (<form className="card" onSubmit={submit}>
    <button type="button" className="exit" onClick={() => window.location.replace('https://www.google.com')}>Keluar cepat</button>
    <h1>Ruang Cerita</h1>
    <p>Daruratkah? Hubungi layanan SAPA 129 {/* TODO: verifikasi nomor sebelum rilis */}.</p>
    <fieldset><legend>Cara mengirim</legend>
      <label><input type="radio" checked={f.anonymous} onChange={() => set('anonymous', true)} /> Anonim: tanpa nama dan sekolah</label>
      <label><input type="radio" checked={!f.anonymous} onChange={() => set('anonymous', false)} /> Tidak anonim: staf bisa mengetahui identitasku</label>
    </fieldset>
    {f.anonymous && <p className="note">Tanpa kontak, kami tidak dapat menghubungi atau membantumu langsung.</p>}
    {!f.anonymous && <><input placeholder="Nama" value={f.name} onChange={e => set('name', e.target.value)} /><input placeholder="Sekolah" value={f.school} onChange={e => set('school', e.target.value)} /></>}
    <input placeholder={f.anonymous ? 'Kontak (opsional, agar bisa dihubungi)' : 'Kontak (WhatsApp/email)'} value={f.contact} onChange={e => set('contact', e.target.value)} />
    <input placeholder="Judul (opsional)" value={f.title} onChange={e => set('title', e.target.value)} />
    <textarea rows="8" placeholder="Ceritamu" value={f.body} onChange={e => set('body', e.target.value)} />
    <label><input type="checkbox" checked={f.is_minor} onChange={e => set('is_minor', e.target.checked)} /> Saya berusia di bawah 18 tahun</label>
    <fieldset><legend>Persetujuan</legend>
      {C.map(([k, t, d]) => <label key={k}><input type="checkbox" checked={f[k]} onChange={e => set(k, e.target.checked)} /><span><b>{t}</b><br />{d}</span></label>)}
      {f.is_minor && <label><input type="checkbox" checked={f.consent_guardian} onChange={e => set('consent_guardian', e.target.checked)} /><span><b>Guardian permission for minor / Izin wali</b><br />Orang tua atau wali mengizinkan pengiriman ini{needGuardian ? ' (wajib)' : ' (wajib jika tidak anonim)'}.</span></label>}
    </fieldset>
    <p className="note">Baca <Link to="/privasi">Kebijakan Privasi</Link>.</p>
    <button className="btn">Kirim cerita</button><p className="err" role="alert">{msg}</p>
  </form>);
}
