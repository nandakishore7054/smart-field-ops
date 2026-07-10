import { useMemo, useState } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../../app/api';

import { useLocation } from '../../common/contexts/LocationContext';

function toDataUrl(file) {
  return URL.createObjectURL(file);
}

export default function ProofSubmissionForm({ task, onSubmitted }) {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [location, setLocation] = useState(null);
  const { getFreshLocation } = useLocation();

  const previews = useMemo(() => files.map((file) => ({ file, url: toDataUrl(file) })), [files]);

  async function handleFileChange(event) {
    setError('');
    setSuccess('');

    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      setFiles([]);
      return;
    }

    try {
      const compressed = await Promise.all(
        selectedFiles.map((file) =>
          imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
          })
        )
      );

      setFiles(compressed);
    } catch (compressionError) {
      setError(compressionError.message || 'Unable to compress images.');
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!task?._id) {
      setError('Task details are missing.');
      return;
    }

    if (!files.length) {
      setError('Please select at least one image.');
      return;
    }

    setLoading(true);

    try {
      let submittedLocation = location;
      if (!submittedLocation) {
        const position = await getFreshLocation();
        submittedLocation = {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude],
        };
      }
      const imageUrls = [];

      for (const file of files) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }

      const response = await api.post('/submissions', {
        taskId: task._id,
        images: imageUrls,
        notes,
        submittedLocation,
      });

      setSuccess('Proof submitted successfully.');
      setFiles([]);
      setNotes('');
      setLocation(submittedLocation);
      onSubmitted?.(response.data?.data?.task || null);
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || 'Unable to submit proof.');
    } finally {
      setLoading(false);
    }
  }

  async function captureLocation() {
    setError('');
    try {
      const position = await getFreshLocation();
      const nextLocation = {
        type: 'Point',
        coordinates: [position.coords.longitude, position.coords.latitude],
      };
      setLocation(nextLocation);
    } catch (locationError) {
      setError(locationError.message || 'Unable to capture location.');
    }
  }

  if (task?.status !== 'in-progress') {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
        Proof submission becomes available after the task is started.
      </div>
    );
  }

  return (
    <form className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6" onSubmit={handleSubmit}>
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Proof submission</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Upload evidence</h3>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300"
          />
        </label>

        {previews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {previews.map((preview) => (
              <figure key={preview.url} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                <img src={preview.url} alt="Submission preview" className="h-40 w-full object-cover" />
              </figure>
            ))}
          </div>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Notes</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            placeholder="Add job notes, observations, or handoff details"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={captureLocation}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Capture location
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Submitting...' : 'Submit proof'}
          </button>
        </div>

        {location ? (
          <p className="text-sm text-slate-400">
            Location ready: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
          </p>
        ) : null}

        {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
        {success ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</p> : null}
      </div>
    </form>
  );
}