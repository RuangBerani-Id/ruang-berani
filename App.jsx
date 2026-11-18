import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { sb } from './supabase.js';
import Story from './Story.jsx';
import Admin from './Admin.jsx';

const SLOGAN = 'Ciptakan lingkungan hangat, demi lingkungan aman dan nyaman';
const FALLBACK = [1, 2, 3, 4, 5].map(i => ({ id: i, title: 'Indonesian Youth Summit', image_url: `/assets/dok${i}.jpeg` }));

function Layout({ children }) {
  return (<>
    <header className="top">
      <Link to="/" className="brand"><img src="/assets/logo.jpeg" alt="Logo Ruang Berani" />Ruang Berani</Link>
      <nav><Link to="/">Beranda</Link><Link to="/cerita">Ruang Cerita</Link><Link to="/privasi">Privasi</Link></nav>
    </header>
    <div className="banner"><span>📣 {SLOGAN} ✦ {SLOGAN}</span></div>
    <main>{children}</main>
    <footer><span>© 2026 Ruang Berani</span><Link to="/privasi">Kebijakan Privasi</Link><Link to="/admin">Staf</Link></footer>
  </>);
}

function Home() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { sb.from('posts').select('*').eq('published', true).order('created_at', { ascending: false }).then(({ data }) => setPosts(data || [])); }, []);
  const items = posts.length ? posts : FALLBACK;
  return (<>
    <section className="hero">
      <div>
        <h1>Ruang Berani</h1>
        <p className="tag">Berani bersuara. Ruang aman untuk semua.</p>
        <p>Komunitas kepemudaan di Jakarta yang mengajak pelajar Indonesia mengenali kekerasan, berani bersuara, dan saling menguatkan.</p>
        <div className="row"><Link className="btn" to="/cerita">Ceritakan kisahmu</Link><a className="btn ghost" href="#kegiatan">Lihat kegiatan</a></div>
      </div>
      <figure className="founder"><img src="/assets/founder.jpeg" alt="Safa Tiara Salsabillah" /><figcaption><b>Safa Tiara Salsabillah</b><br />Founder Ruang Berani</figcaption></figure>
    </section>
    <h2 id="kegiatan">Kegiatan & dokumentasi</h2>
    <div className="grid">{items.map(p => (
      <article className="card" key={p.id}>{p.image_url && <img src={p.image_url} alt={p.title} />}<h3>{p.title}</h3>{p.body && <p>{p.body}</p>}</article>))}</div>
  </>);
}

function Privacy() {
  return (<article className="card prose">
    <h1>Kebijakan Privasi</h1>
    <p><i>Draf, harap ditinjau konsultan hukum (UU PDP) sebelum rilis.</i></p>
    <h3>Data yang kami kumpulkan</h3>
    <p>Isi cerita dan persetujuanmu. Jika memilih tidak anonim: nama, sekolah, dan kontak. Mode anonim tidak meminta nama dan sekolah; kontak bersifat opsional.</p>
    <h3>Persetujuan terpisah</h3>
    <p><b>Penyimpanan data</b> (wajib agar cerita terkirim), <b>adaptasi cerita</b> untuk edukasi, dan <b>publikasi cerita</b>. Ketiganya berdiri sendiri; tanpa persetujuan adaptasi dan publikasi, ceritamu tidak akan diadaptasi atau dipublikasikan.</p>
    <h3>Pelajar di bawah 18 tahun</h3>
    <p>Pengiriman tidak anonim memerlukan izin orang tua atau wali. Pengiriman anonim tanpa data pribadi tidak memerlukannya.</p>
    <h3>Siapa yang dapat membaca</h3>
    <p>Hanya staf Ruang Berani yang ditugaskan dan login.</p>
    <h3>Batas anonimitas</h3>
    <p>Tanpa kontak, kami tidak dapat menghubungimu. Jika ada ancaman nyata dan kamu tidak anonim, kami hanya meneruskan ke pihak sekolah (mis. BK) dengan persetujuanmu.</p>
    <h3>Penarikan persetujuan & penyimpanan</h3>
    <p>[Isi: masa simpan data dan cara menarik persetujuan lewat kontak resmi Ruang Berani.]</p>
  </article>);
}

export default function App() {
  return (<Layout><Routes>
    <Route path="/" element={<Home />} /><Route path="/cerita" element={<Story />} />
    <Route path="/privasi" element={<Privacy />} /><Route path="/admin" element={<Admin />} />
  </Routes></Layout>);
}
