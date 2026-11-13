import { useState } from 'react';

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className = 'h-12 w-auto' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
        Three Angels IT Services
      </span>
    );
  }

  return (
    <img
      src="/assets/aistudio/Three_Angels_IT_Services_Logo_08f158bf.png"
      alt="Three Angels IT Services"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`object-contain select-none ${className}`}
    />
  );
}
