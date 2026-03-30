import { useState, useRef, useEffect } from 'react';
import api from '../api';

export default function UploadModal({ isOpen, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (selected) => {
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
    } else if (selected) {
      setError('Vui lòng chọn một file ảnh hợp lệ.');
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Add paste event listener
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isOpen) return;
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;
      
      for (const item of clipboardItems) {
        if (item.type.startsWith('image/')) {
          const pastedFile = item.getAsFile();
          processFile(pastedFile);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn một ảnh');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    try {
      await api.post('/api/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setDescription('');
      setFile(null);
      setPreview(null);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setPreview(null);
    setError('');
    setIsDragging(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Ảnh</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div
            className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">🖼️</span>
                <p>Click, kéo thả ảnh hoặc Ctrl+V để dán</p>
                <p className="upload-hint">JPEG, PNG, GIF, WebP</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              hidden
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo-title">Tiêu đề *</label>
            <input
              id="photo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ảnh..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo-desc">Mô tả</label>
            <textarea
              id="photo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ảnh (tùy chọn)..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={uploading}
          >
            {uploading ? 'Đang upload...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
