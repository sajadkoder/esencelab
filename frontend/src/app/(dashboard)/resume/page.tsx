'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Resume } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { Upload, FileText, CheckCircle, Loader, X } from 'lucide-react';

export default function ResumeUploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resume, setResume] = useState<Resume | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        },
      });

      setResume(response.data.data);
      alert('Resume uploaded and parsed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!resume) return;
    
    if (confirm('Are you sure you want to delete your resume?')) {
      try {
        await api.delete(`/resume/${resume.id}`);
        setResume(null);
        setFile(null);
        alert('Resume deleted successfully');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete resume');
      }
    }
  };

  if (user?.role !== 'student') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary">Resume Management</h1>
      <p className="text-slate-500">Upload your resume to get AI-powered job recommendations</p>

      <Card>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? 'border-secondary bg-blue-50' : 'border-slate-200'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          
          {file ? (
            <div className="flex items-center justify-center space-x-3">
              <FileText className="w-10 h-10 text-secondary" />
              <div className="text-left">
                <p className="font-medium text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <p className="text-lg font-medium text-slate-700 mb-1">
                  Drop your resume here or click to upload
                </p>
                <p className="text-sm text-slate-500">PDF files only (max 5MB)</p>
              </label>
            </>
          )}
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2 text-center">{uploadProgress}% uploaded</p>
          </div>
        )}

        {file && !uploading && !resume && (
          <div className="mt-4 flex justify-center">
            <Button onClick={handleUpload} isLoading={uploading}>
              Upload Resume
            </Button>
          </div>
        )}
      </Card>

      {resume && (
        <Card title="Parsed Resume Data">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="font-medium text-slate-800">Resume successfully parsed</span>
              </div>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>

            {resume.parsedData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resume.parsedData.name && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Name</h4>
                    <p className="text-slate-800">{resume.parsedData.name}</p>
                  </div>
                )}
                {resume.parsedData.email && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Email</h4>
                    <p className="text-slate-800">{resume.parsedData.email}</p>
                  </div>
                )}
                {resume.parsedData.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Phone</h4>
                    <p className="text-slate-800">{resume.parsedData.phone}</p>
                  </div>
                )}
                {resume.parsedData.summary && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Summary</h4>
                    <p className="text-slate-800">{resume.parsedData.summary}</p>
                  </div>
                )}
              </div>
            )}

            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Extracted Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
                    <Badge key={index} variant="info">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {resume.parsedData?.education && resume.parsedData.education.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Education</h4>
                <div className="space-y-2">
                  {resume.parsedData.education.map((edu, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-slate-800">{edu.degree}</p>
                      <p className="text-sm text-slate-500">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resume.parsedData?.experience && resume.parsedData.experience.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Experience</h4>
                <div className="space-y-2">
                  {resume.parsedData.experience.map((exp, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-slate-800">{exp.title}</p>
                      <p className="text-sm text-slate-500">{exp.company} {exp.duration && `• ${exp.duration}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
