/**
 * Real Local Media Inspector Utility for Virtual Box
 * Extracts actual metadata from user-selected video files via browser HTML5 APIs.
 */

export const inspectLocalMediaFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('video/')) {
      return reject(new Error('Selected file is not a valid video format.'));
    }

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanFileName = file.name;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileSizeFormatted = file.size > 1024 * 1024 * 1024
      ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${fileSizeMB} MB`;
    const format = file.name.split('.').pop().toUpperCase() || 'MP4';

    video.onloadedmetadata = () => {
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;
      const durationSeconds = video.duration || 0;

      // Determine Resolution Label
      let resolutionLabel = `${width} × ${height}`;
      if (height >= 2160 || width >= 3840) {
        resolutionLabel += ' (4K / 2160p)';
      } else if (height >= 1440) {
        resolutionLabel += ' (1440p QHD)';
      } else if (height >= 1080) {
        resolutionLabel += ' (1080p Full HD)';
      } else if (height >= 720) {
        resolutionLabel += ' (720p HD)';
      } else {
        resolutionLabel += ' (SD)';
      }

      // Format duration hh:mm:ss
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = Math.floor(durationSeconds % 60);
      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // FPS detection: browser HTML5 video API does not directly expose FPS without requestVideoFrameCallback
      const fps = 'Unavailable';

      const metadata = {
        file: file,
        fileName: cleanFileName,
        fileSize: fileSizeFormatted,
        fileSizeBytes: file.size,
        objectUrl: objectUrl,
        width: width,
        height: height,
        resolution: resolutionLabel,
        durationSeconds: durationSeconds,
        formattedDuration: formattedDuration,
        fps: fps,
        format: format,
        mimeType: file.type,
      };

      resolve(metadata);
    };

    video.onerror = () => {
      reject(new Error('Your browser cannot read metadata for this video format.'));
    };

    video.src = objectUrl;
  });
};

export const formatTimeDisplay = (secs) => {
  if (isNaN(secs) || secs < 0) return '00:00:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
