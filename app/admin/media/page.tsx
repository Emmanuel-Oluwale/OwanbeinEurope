'use client';

import { useEffect, useState } from 'react';
import { OrganizerGate } from '@/app/components/OrganizerGate';

type MediaFile = {
  name: string;
  folder: string;
  path: string;
  publicUrl: string;
  size: number | null;
  updatedAt: string | null;
};

const folders = ['hero', 'flyers', 'sponsors', 'gallery', 'uploads'];

export default function MediaManagerPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [bucket, setBucket] = useState('');
  const [folder, setFolder] = useState('gallery');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadMedia() {
    setLoading(true);
    const response = await fetch('/api/admin/media');
    const data = await response.json();
    setFiles(data.files || []);
    setBucket(data.bucket || '');
    setMessage(data.error || '');
    setLoading(false);
  }

  async function uploadMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage('Choose a file to upload.');
      return;
    }

    const body = new FormData();
    body.append('folder', folder);
    body.append('file', file);

    setUploading(true);
    setMessage('Uploading media...');
    const response = await fetch('/api/admin/media', { method: 'POST', body });
    const data = await response.json();
    setMessage(data.error || 'Media uploaded.');
    setFile(null);
    setUploading(false);
    await loadMedia();
  }

  async function deleteMedia(path: string) {
    setMessage('Deleting media...');
    const response = await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    const data = await response.json();
    setMessage(data.error || 'Media deleted.');
    await loadMedia();
  }

  useEffect(() => {
    loadMedia();
  }, []);

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/organizer">Owanbe Media</a>
          <div className="nav-links">
            <a href="/organizer">Organizer</a>
            <button className="button secondary compact" type="button" onClick={loadMedia}>Refresh</button>
          </div>
        </nav>
      </header>

      <OrganizerGate area="admin" nextPath="/admin/media">
        <section className="section">
          <div className="container">
            <p className="kicker">Media Manager</p>
            <h1 className="section-title">Upload and manage event media.</h1>
            <p className="muted">Storage bucket: {bucket || 'event-media'}</p>

            {message && <div className={`result-box ${message.toLowerCase().includes('could not') || message.toLowerCase().includes('choose') || message.toLowerCase().includes('large') ? 'error' : ''}`}>{message}</div>}

            <form className="checkout-form" onSubmit={uploadMedia}>
              <section className="form-section">
                <p className="kicker">Upload</p>
                <label className="field-label">Folder</label>
                <select className="field" value={folder} onChange={(event) => setFolder(event.target.value)}>
                  {folders.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <label className="field-label">File</label>
                <input className="field" type="file" accept="image/*,video/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                <button className="button primary submit-button" type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </button>
              </section>
            </form>

            {loading ? (
              <div className="result-box">Loading media...</div>
            ) : files.length === 0 ? (
              <div className="result-box">No uploaded media found.</div>
            ) : (
              <div className="grid three">
                {files.map((item) => (
                  <article className="card" key={item.path}>
                    <p className="kicker">{item.folder}</p>
                    <h3>{item.name}</h3>
                    {item.publicUrl.match(/\.(png|jpe?g|gif|webp|avif)$/i) && (
                      <img className="media-thumb" src={item.publicUrl} alt={item.name} />
                    )}
                    <div className="payment-details">
                      <p><span>Path</span><strong>{item.path}</strong></p>
                      <p><span>Size</span><strong>{item.size ? `${Math.round(item.size / 1024).toLocaleString()} KB` : 'Unknown'}</strong></p>
                      <p><span>Updated</span><strong>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Unknown'}</strong></p>
                    </div>
                    <div className="actions compact-actions">
                      <a className="button secondary" href={item.publicUrl} target="_blank" rel="noreferrer">Open</a>
                      <button className="button secondary" type="button" onClick={() => navigator.clipboard.writeText(item.publicUrl)}>Copy URL</button>
                      <button className="button green" type="button" onClick={() => deleteMedia(item.path)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </OrganizerGate>
    </main>
  );
}
