import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CompanyLogoUpload } from '../features/admin/components/CompanyLogoUpload';

describe('CompanyLogoUpload Component', () => {
  it('renders upload trigger and company monogram fallback when no logo', () => {
    const handleUpdated = vi.fn();
    render(
      <CompanyLogoUpload
        companyName="Apple"
        currentLogoUrl={null}
        onLogoUpdated={handleUpdated}
      />
    );

    expect(screen.getByText('Upload company logo')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('rejects files exceeding 2MB limit with user-friendly error message', () => {
    const handleUpdated = vi.fn();
    const { container } = render(
      <CompanyLogoUpload
        companyName="Apple"
        currentLogoUrl={null}
        onLogoUpdated={handleUpdated}
      />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const oversizedFile = new File(['x'.repeat(3 * 1024 * 1024)], 'huge.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(screen.getByText(/exceeds 2 MB limit/i)).toBeInTheDocument();
    expect(handleUpdated).not.toHaveBeenCalled();
  });

  it('rejects invalid file types', () => {
    const handleUpdated = vi.fn();
    const { container } = render(
      <CompanyLogoUpload
        companyName="Apple"
        currentLogoUrl={null}
        onLogoUpdated={handleUpdated}
      />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const textFile = new File(['hello world'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [textFile] } });

    expect(screen.getByText(/Invalid format/i)).toBeInTheDocument();
    expect(handleUpdated).not.toHaveBeenCalled();
  });
});
