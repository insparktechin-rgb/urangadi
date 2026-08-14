export function Logo({
  className = '',
  size = 'h-9',
}: {
  className?: string;
  size?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="URANGADI Logo"
        className={`object-contain ${size} max-w-full drop-shadow-sm`}
      />
    </div>
  );
}

export function LogoWhite({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="URANGADI Logo"
        className="h-10 object-contain max-w-full drop-shadow-md bg-white/90 p-1 rounded-xl"
      />
    </div>
  );
}
