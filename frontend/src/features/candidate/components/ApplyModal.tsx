import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle, User, Mail, Phone, Link2 } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import candidateService from '../../../api/candidateService';
import type { Job } from '../../../types/job.types';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, isOpen, onClose, onSuccess }) => {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim() || !resumeUrl.trim()) {
      setErrorMessage('Please provide your name, email, and a valid resume URL.');
      return;
    }

    if (!resumeUrl.startsWith('http://') && !resumeUrl.startsWith('https://')) {
      setErrorMessage('Resume URL must start with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await candidateService.apply({
        jobId: job.id,
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        candidatePhone: candidatePhone.trim() || undefined,
        resumeUrl: resumeUrl.trim(),
        coverLetter: coverLetter.trim() || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to submit application. You may have already applied.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
      <div className="bg-canvas-card border border-canvas-border rounded-card max-w-lg w-full p-6 sm:p-8 shadow-card space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Apply for Position</h2>
            <p className="text-xs text-ink-500">
              {job.title} at <span className="font-semibold">{job.company}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-button text-ink-400 hover:text-ink-700 hover:bg-canvas-subtle"
            aria-label="Close application modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink-900">Application Submitted!</h3>
            <p className="text-xs text-ink-500">Your profile and resume were securely sent to the hiring team.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="candidateName">
                Full Name *
              </label>
              <div className="relative">
                <input
                  id="candidateName"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <User className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="candidateEmail">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    id="candidateEmail"
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <Mail className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="candidatePhone">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    id="candidatePhone"
                    type="tel"
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Phone className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="resumeUrl">
                Resume Link (Google Drive, Dropbox, LinkedIn, PDF URL) *
              </label>
              <div className="relative">
                <input
                  id="resumeUrl"
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <Link2 className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
              </div>
              <span className="text-[11px] text-ink-400 mt-0.5 block">
                Ensure sharing permissions are set to &apos;Anyone with the link can view&apos;.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="coverLetter">
                Cover Note / Message to Recruiter (Optional)
              </label>
              <div className="relative">
                <textarea
                  id="coverLetter"
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly share why you are interested in this opportunity..."
                  className="w-full p-2.5 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-canvas-border">
              <SecondaryButton type="button" size="md" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                size="md"
                disabled={isSubmitting}
                icon={<Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
