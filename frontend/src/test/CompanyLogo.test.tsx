import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CompanyLogo, optimizeCloudinaryUrl } from '../components/ui/CompanyLogo';

describe('CompanyLogo Component', () => {
  it('optimizes Cloudinary image URLs with auto-format, quality, and fitted dimensions', () => {
    const rawCloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v12345/job-platform/company-logos/stripe_123.png';
    const optimized = optimizeCloudinaryUrl(rawCloudinaryUrl, 40);

    expect(optimized).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fit,w_80,h_80/v12345/job-platform/company-logos/stripe_123.png');
  });

  it('leaves non-Cloudinary URLs unmodified', () => {
    const externalUrl = 'https://images.unsplash.com/photo-12345';
    const optimized = optimizeCloudinaryUrl(externalUrl, 40);

    expect(optimized).toBe(externalUrl);
  });

  it('renders img element when a valid logoUrl is provided', () => {
    render(<CompanyLogo companyName="Stripe" logoUrl="https://example.com/stripe.png" size="md" />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Stripe logo');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('renders monogram with first letter when logoUrl is null or undefined', () => {
    render(<CompanyLogo companyName="Google" logoUrl={null} size="lg" />);

    const monogram = screen.getByText('G');
    expect(monogram).toBeInTheDocument();
    expect(monogram).toHaveAttribute('title', 'Google');
  });

  it('falls back to monogram if image fails to load (onError)', () => {
    render(<CompanyLogo companyName="Netflix" logoUrl="https://example.com/broken.png" size="md" />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    const fallbackMonogram = screen.getByText('N');
    expect(fallbackMonogram).toBeInTheDocument();
  });
});
