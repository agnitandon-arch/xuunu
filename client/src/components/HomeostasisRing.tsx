interface HomeostasisRingProps {
  homeostasisLevel: number;
  size?: number;
}

export default function HomeostasisRing({ 
  homeostasisLevel, 
  size = 200 
}: HomeostasisRingProps) {
  const percentage = Math.min(Math.max(homeostasisLevel, 0), 100);
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "#0066FF";
    if (percentage >= 60) return "#0088FF";
    if (percentage >= 40) return "#00AAFF";
    return "#00CCFF";
  };

  const getLabel = () => {
    if (percentage >= 80) return "Optimal Balance";
    if (percentage >= 60) return "High Balance";
    if (percentage >= 40) return "Moderate Balance";
    return "Building Balance";
  };

  return (
    <div className="flex flex-col items-center" data-testid="ring-homeostasis">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <defs>
            <linearGradient id="homeostasisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: getColor(), stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: getColor(), stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r="85"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="85"
            stroke="url(#homeostasisGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl font-bold font-mono" data-testid="text-homeostasis-level">{Math.round(percentage)}</span>
          <span className="text-xs uppercase tracking-widest mt-1 opacity-60">HOMEOSTASIS</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm font-medium" style={{ color: getColor() }}>
          {getLabel()}
        </span>
        <span className="text-xs opacity-40 block mt-1">Body balance score</span>
      </div>
    </div>
  );
}
