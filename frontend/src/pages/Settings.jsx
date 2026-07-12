import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../app/api';
import { useAuth } from '../app/auth-context';
import { useTheme } from '../app/theme-context';
import { Card } from '../common/components/ui/Card';
import { Input } from '../common/components/ui/Input';
import { Button } from '../common/components/ui/Button';
import { Badge } from '../common/components/ui/Badge';
import { Settings as SettingsIcon, User, Camera, Lock, Palette, Save } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Premium Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6 bg-gradient-to-r from-surface to-surface-muted/30 border-none shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-0.5">Manage your profile and application preferences.</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">{error}</div>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{success}</div>
        </motion.div>
      )}

      {/* Profile Information Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="p-6 sm:p-8 border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />

          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-surface-muted/30 p-5 rounded-xl border border-border/50">
              <div className="relative group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold border-4 border-background shadow-md">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition shadow-md group-hover:scale-110">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-base font-semibold text-foreground">{user?.email}</p>
                <Badge variant="outline" className="mt-1.5 capitalize">{user?.role} Account</Badge>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Phone Number</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="bg-background"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-semibold text-foreground">New Password (Optional)</label>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="bg-background"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                isLoading={loading}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Application Preferences Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="p-6 sm:p-8 border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Application Preferences</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-muted/30 p-5 rounded-xl border border-border/50">
            <div>
              <p className="font-semibold text-foreground">Theme Preference</p>
              <p className="text-sm text-muted-foreground mt-0.5">Select your preferred color theme.</p>
            </div>
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full sm:w-40 h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring shadow-sm appearance-none transition-all"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
