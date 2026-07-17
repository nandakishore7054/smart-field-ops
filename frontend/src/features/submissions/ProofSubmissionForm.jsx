import { useMemo, useState } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../../app/api';
import { useLocation } from '../../common/contexts/LocationContext';
import { Card } from '../../common/components/ui/Card';
import { Button } from '../../common/components/ui/Button';
import { Upload, MapPinned, Camera, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <Card className="p-5 border-border/50 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Proof submission becomes available after the task is started.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-success/50" />

      <div className="flex items-center gap-2 mb-5">
        <Camera className="w-5 h-5 text-success" />
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-success dark:text-success-hover">Proof Submission</p>
          <h3 className="text-xl font-bold text-foreground">Upload Evidence</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File Upload */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Images</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring shadow-sm file:mr-3 file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:px-3 file:py-1 file:rounded-lg file:text-xs transition-all"
            />
          </div>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {previews.map((preview) => (
              <motion.figure
                key={preview.url}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="overflow-hidden rounded-xl border border-border/50 bg-surface-muted/20 shadow-sm"
              >
                <img src={preview.url} alt="Submission preview" className="h-40 w-full object-cover" />
              </motion.figure>
            ))}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm font-semibold text-foreground">Notes</label>
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm transition-all"
            placeholder="Add job notes, observations, or handoff details"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={captureLocation}
            className="gap-2"
          >
            <MapPinned className="w-4 h-4" />
            Capture Location
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Submit Proof
          </Button>
        </div>

        {/* Location Ready */}
        {location && (
          <div className="flex items-center gap-2 bg-success/10 border border-success/20 px-4 py-2.5 rounded-xl text-sm text-success dark:text-success-hover font-medium">
            <MapPinned className="w-4 h-4 shrink-0" />
            Location ready: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
          </div>
        )}

        {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">{error}</div>}
        {success && <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success dark:text-success-hover font-medium">{success}</div>}
      </form>
    </Card>
  );
}