import React from 'react';

export const ADS_ENABLED = false;

interface AdSlotProps {
  size: '300x250' | '728x90' | '320x50';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ size, className = '' }) => {
  const dimensions = {
    '300x250': { width: 300, height: 250, wrapperClass: 'w-[300px] h-[250px]' },
    '728x90': { width: 728, height: 90, wrapperClass: 'w-full max-w-[728px] h-[90px]' },
    '320x50': { width: 320, height: 50, wrapperClass: 'w-[320px] h-[50px]' },
  }[size];

  return (
    <div
      role="complementary"
      aria-label="Advertisement placeholder"
      className={`relative mx-auto flex flex-col justify-between p-3 rounded-[12px] border border-dashed border-[#CFC3AA] bg-[#F4EEE1]/60 text-[#5E564A] select-none ${dimensions.wrapperClass} ${className}`}
      style={{ minHeight: dimensions.height }}
    >
      <div className="flex items-center justify-between w-full">
        <span className="font-mono-respell text-[10px] tracking-widest uppercase text-[#6B5A12] font-semibold">
          ADVERTISEMENT
        </span>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <span className="font-mono-respell text-xs text-[#6F6659] tracking-wider">
          Ad space {size}
        </span>
      </div>

      <div className="w-full flex justify-end">
        <span className="text-[10px] text-[#6F6659]/70 font-mono-respell">Placeholder</span>
      </div>
    </div>
  );
};
