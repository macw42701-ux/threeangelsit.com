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
  const fullLogoSrc = `${import.meta.env.BASE_URL}assets/aistudio/Three_Angels_IT_Services_Logo_08f158bf.png`;

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
              src={fullLogoSrc}
              alt="THREE ANGELS IT SERVICES"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-24 w-auto object-contain select-none"
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
        <span className="logo-plaque-3d inline-flex shrink-0 items-center justify-center rounded-xl px-2 py-0.5 transition-transform duration-200 group-hover:-translate-y-0.5">
          <img
            src={fullLogoSrc}
            alt="Three Angels IT Services logo"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-9 w-auto object-contain sm:h-10"
          />
        </span>
      )}
      {wordmark3D('text-[13px] sm:text-[15px]')}
    </span>
  );
}
