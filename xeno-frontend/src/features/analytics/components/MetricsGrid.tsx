import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, Eye, MousePointerClick, Target } from "lucide-react";
import { StatsCard } from "../../../components/StatsCard";

// Helper component to smoothly animate numeric value changes
interface AnimatedNumberProps {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatter = (v) => `${v.toFixed(1)}%`,
  duration = 500,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad function
      const ease = progress * (2 - progress);
      const current = start + (end - start) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
        prevValueRef.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
};

interface MetricsGridProps {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  convertedCount: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  deliveryRate,
  openRate,
  clickRate,
  conversionRate,
  deliveredCount,
  openedCount,
  clickedCount,
  convertedCount,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
      <StatsCard
        title="Delivery Rate"
        value={<AnimatedNumber value={deliveryRate} />}
        description={`${deliveredCount.toLocaleString()} messages delivered`}
        icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />}
      />
      <StatsCard
        title="Open Rate"
        value={<AnimatedNumber value={openRate} />}
        description={`${openedCount.toLocaleString()} messages opened`}
        icon={<Eye className="h-5 w-5 text-purple-500" />}
      />
      <StatsCard
        title="Click Rate"
        value={<AnimatedNumber value={clickRate} />}
        description={`${clickedCount.toLocaleString()} messages clicked`}
        icon={<MousePointerClick className="h-5 w-5 text-pink-500" />}
      />
      <StatsCard
        title="Conversion Rate"
        value={<AnimatedNumber value={conversionRate} />}
        description={`${convertedCount.toLocaleString()} customer conversions`}
        icon={<Target className="h-5 w-5 text-emerald-500" />}
      />
    </div>
  );
};
