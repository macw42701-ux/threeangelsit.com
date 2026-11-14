import { useState } from 'react';

interface BrandLogoProps {
  variant?: 'horizontal' | 'stacked';
  className?: string;
}

export default function BrandLogo({
  variant = 'horizontal',
  className = '',
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const wordmark3D = (sizeClass: string) => (
    <span className={`font-display font-extrabold tracking-tight uppercase whitespace-nowrap shrink-0 ${sizeClass}`}>
      <span className="logo-3d-white">THREE</span>{' '}
      <span className="logo-3d-orange">ANGELS</span>{' '}
      <span className="logo-3d-cyan">IT SERVICES</span>
    </span>
  );

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-start gap-3 select-none ${className}`}>
        {!imgError && (
          <div className="logo-plaque-3d inline-flex items-center justify-center rounded-2xl px-4 py-2.5 transition-transform duration-200 hover:-translate-y-0.5">
            <img
              src="/assets/aistudio/Three_Angels_IT_Services_Logo_08f158bf.png"
              alt="THREE ANGELS IT SERVICES"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-20 w-auto object-contain select-none"
            />
          </div>
        )}
        {wordmark3D('text-base sm:text-lg')}
      </div>
    );
  }

  return (
    <span className={`group inline-flex items-center gap-2.5 select-none ${className}`}>
      {!imgError && (
        <span className="logo-plaque-3d inline-flex shrink-0 items-center justify-center rounded-xl px-2 py-1 transition-transform duration-200 group-hover:-translate-y-0.5">
          <img
            src="/assets/aistudio/three_angels_emblem_transparent.png"
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-7 w-auto object-contain sm:h-8"
          />
        </span>
      )}
      {wordmark3D('text-[13px] sm:text-[15px]')}
    </span>
  );
}
