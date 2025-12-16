import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Info } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface HomeostasisInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeostasisLevel: number;
  healthData: any;
  environmentalData: any;
  userId: string;
}

export default function HomeostasisInsightsDialog({
  open,
  onOpenChange,
  homeostasisLevel,
  healthData,
  environmentalData,
  userId,
}: HomeostasisInsightsDialogProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadInsights = async () => {
    if (insights) return;
    
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/homeostasis-insights", {
        userId,
        homeostasisLevel,
        healthData,
        environmentalData,
      });
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error("Failed to load insights:", error);
      setInsights("Unable to generate insights at this time.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && !insights && !loading) {
      loadInsights();
    }
  };

  const getColor = () => {
    if (homeostasisLevel >= 80) return "#0066FF";
    if (homeostasisLevel >= 60) return "#0088FF";
    if (homeostasisLevel >= 40) return "#00AAFF";
    return "#00CCFF";
  };

  const getLabel = () => {
    if (homeostasisLevel >= 80) return "Optimal Balance";
    if (homeostasisLevel >= 60) return "High Balance";
    if (homeostasisLevel >= 40) return "Moderate Balance";
    return "Building Balance";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-black border-white/10 text-white max-w-md" data-testid="dialog-homeostasis-insights">
        <DialogHeader>
          <DialogTitle className="text-xl">Homeostasis Level</DialogTitle>
          <DialogDescription className="text-white/60">
            Understanding your body's balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
            <div className="text-6xl font-bold font-mono" style={{ color: getColor() }}>
              {homeostasisLevel}
            </div>
            <div className="text-sm opacity-60 mt-1">HOMEOSTASIS</div>
            <div className="mt-3 text-sm font-medium" style={{ color: getColor() }}>
              {getLabel()}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">How It's Calculated</span>
            </div>
            <div className="space-y-2 text-sm opacity-80">
              <div className="flex items-center justify-between">
                <span>Metabolic Stability</span>
                <span className="font-mono">{healthData.glucose ? Math.min(100, Math.round(100 - Math.abs(healthData.glucose - 100) * 0.5)) : 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Environmental Quality</span>
                <span className="font-mono">{environmentalData.aqi ? Math.min(100, Math.round(100 - environmentalData.aqi * 0.5)) : 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recovery Score</span>
                <span className="font-mono">{healthData.sleep ? Math.min(100, Math.round(healthData.sleep * 12.5)) : 0}%</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Insights</span>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{insights || "Loading insights..."}</p>
              </div>
            )}
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
            data-testid="button-close-homeostasis-dialog"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
