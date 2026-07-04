import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../app/api';
import { useAuth } from '../app/auth-context';
import { useTheme } from '../app/theme-context';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });
      setAvatarFile(compressed);
      setAvatarUrl(URL.createObjectURL(compressed));
    } catch (err) {
      setError('Failed to compress image');
    }
  }

  async function uploadToCloudinary(file) {
    const signatureResponse = await api.get('/upload/signature');
    const signaturePayload = signatureResponse.data?.data || {};

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signaturePayload.apiKey);
    formData.append('timestamp', signaturePayload.timestamp);
    formData.append('signature', signaturePayload.signature);
    formData.append('folder', signaturePayload.folder);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Cloudinary upload failed.');
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult.secure_url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let uploadedAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        uploadedAvatarUrl = await uploadToCloudinary(avatarFile);
      }

      const payload = { name, phone };
      if (password) payload.password = password;
      if (uploadedAvatarUrl !== user.avatarUrl) payload.avatarUrl = uploadedAvatarUrl;

      const response = await api.put('/users/me', payload);
      setUser(response.data?.data?.user);
      setSuccess('Profile updated successfully.');
      setPassword('');
      setAvatarFile(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-3xl font-semibold">Settings</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Manage your profile and application preferences.</p>
      </div>

      {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</p>}
      {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{success}</p>}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-3xl font-bold border-4 border-slate-100 dark:border-slate-800">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-1.5 bg-sky-500 text-white rounded-full cursor-pointer hover:bg-sky-400 transition shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.email}</p>
              <p className="text-xs text-slate-500 capitalize mt-1">{user?.role} Account</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="+1 234 567 890"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password (Optional)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Leave blank to keep current password"
            />
          </label>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-sky-500 px-6 py-2.5 font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-semibold mb-6">Application Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">Theme Preference</p>
            <p className="text-sm text-slate-500">Select your preferred color theme.</p>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>
    </section>
  );
}
