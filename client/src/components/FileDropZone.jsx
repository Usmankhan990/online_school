import { useState, useRef, useCallback } from 'react';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileDropZone({
  onFileSelect,
  existingFile = null,
  allowedTypes = ['.pdf'],
  maxSizeMB = 100,
  progress = 0,
  uploading = false,
  label = 'Drop your PDF file here',
}) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = useCallback((f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!allowedTypes.some(t => t.toLowerCase() === ext)) {
      setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      return false;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum: ${maxSizeMB}MB`);
      return false;
    }
    setError('');
    return true;
  }, [allowedTypes, maxSizeMB]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (validateFile(f)) {
      setFile(f);
      onFileSelect?.(f);
    }
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    handleFile(dropped);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleBrowse = useCallback((e) => {
    const f = e.target.files?.[0];
    handleFile(f);
  }, [handleFile]);

  const removeFile = useCallback(() => {
    setFile(null);
    setError('');
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [onFileSelect]);

  const hasFile = !!file;
  const hasExisting = existingFile && existingFile.trim() !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Existing file indicator */}
      {hasExisting && !hasFile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <span style={{ fontSize: 20 }}>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#059669', margin: 0 }}>Existing File Uploaded</p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {existingFile.split('/').pop()}
            </p>
          </div>
          <span className="badge badge-success" style={{ fontSize: 10 }}>✓ Active</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragOver ? '#10b981' : error ? '#ef4444' : 'var(--border-medium)'}`,
          borderRadius: 14,
          padding: hasFile ? '16px 20px' : '32px 20px',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: dragOver ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface-2)',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleBrowse}
          style={{ display: 'none' }}
        />

        {!hasFile ? (
          <div>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: dragOver ? 'rgba(16,185,129,0.12)' : 'rgba(30,58,95,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', fontSize: 28,
              transition: 'all 0.2s ease',
            }}>
              {dragOver ? '📥' : '📤'}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {label}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
              or <span style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'underline' }}>click to browse</span>
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Allowed: {allowedTypes.join(', ')} • Max: {maxSizeMB}MB
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>📄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{file.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                {formatFileSize(file.size)} • {file.type || 'PDF'}
              </p>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#ef4444', flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title="Remove file"
              >✕</button>
            )}
          </div>
        )}

        {/* Progress bar */}
        {uploading && progress > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{
              height: 6, borderRadius: 3,
              background: 'var(--border-light)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, #10b981, #059669)',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Uploading... {progress}%
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 6,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}
