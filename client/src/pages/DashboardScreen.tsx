import HomeostasisRing from "@/components/HomeostasisRing";
import BioSignature from "@/components/BioSignature";
import HomeostasisInsightsDialog from "@/components/HomeostasisInsightsDialog";
import BioSignatureDialog from "@/components/BioSignatureDialog";
import MedicationQuickLog from "@/components/MedicationQuickLog";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import type { HealthEntry, EnvironmentalReading } from "@shared/schema";

export default function DashboardScreen() {
  const { user } = useAuth();
  const [showBioSignature, setShowBioSignature] = useState(false);
  const [showHomeostasisDialog, setShowHomeostasisDialog] = useState(false);
  const [showBioSignatureDialog, setShowBioSignatureDialog] = useState(false);

  const { data: latestHealth, isLoading: healthLoading } = useQuery<HealthEntry | null>({
    queryKey: [`/api/health-entries/latest?userId=${user?.uid}`],
    enabled: !!user,
  });

  const { data: latestEnv, isLoading: envLoading } = useQuery<EnvironmentalReading | null>({
    queryKey: [`/api/environmental-readings/latest?userId=${user?.uid}`],
    enabled: !!user,
  });

  const { data: recentEntries, isLoading: entriesLoading } = useQuery<HealthEntry[]>({
    queryKey: [`/api/health-entries?userId=${user?.uid}&limit=3`],
    enabled: !!user,
  });

  const healthData = {
    glucose: latestHealth?.glucose || 0,
    activity: 0,
    recovery: 0,
    strain: 0,
    aqi: latestEnv?.aqi || 0,
    heartRate: latestHealth?.heartRate || 0,
    sleep: latestHealth?.sleepHours ? parseFloat(latestHealth.sleepHours.toString()) : 0,
  };

  const calculateHomeostasis = () => {
    let score = 0;
    let factors = 0;
    
    if (latestHealth?.glucose) {
      score += Math.max(0, 100 - Math.abs(latestHealth.glucose - 100) * 0.8);
      factors++;
    }
    if (latestHealth?.hrv) {
      score += Math.min(100, latestHealth.hrv * 1.5);
      factors++;
    }
    if (latestHealth?.sleepHours) {
      score += Math.min(100, parseFloat(latestHealth.sleepHours.toString()) * 12.5);
      factors++;
    }
    if (latestEnv?.aqi) {
      score += Math.max(0, 100 - latestEnv.aqi * 0.5);
      factors++;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  };
  
  const homeostasisLevel = calculateHomeostasis();

  return (
    <div className="min-h-screen bg-black pb-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="max-w-lg mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-end">
          <button
            onClick={() => setShowBioSignature(!showBioSignature)}
            className="text-xs uppercase tracking-widest text-primary hover-elevate active-elevate-2 px-4 py-2 rounded-full border border-primary/30"
            data-testid="button-toggle-signature"
          >
            {showBioSignature ? "Show Homeostasis" : "Bio Signature"}
          </button>
        </div>

        <div className="flex items-center justify-center pt-4 pb-4">
          {showBioSignature ? (
            <button
              onClick={() => setShowBioSignatureDialog(true)}
              className="hover-elevate active-elevate-2 rounded-lg transition-all"
              data-testid="button-open-bio-signature"
            >
              <BioSignature healthData={healthData} size={280} />
            </button>
          ) : (
            <button
              onClick={() => setShowHomeostasisDialog(true)}
              className="hover-elevate active-elevate-2 rounded-lg transition-all"
              data-testid="button-open-homeostasis"
            >
              <HomeostasisRing homeostasisLevel={homeostasisLevel} />
            </button>
          )}
        </div>

        {user && (
          <HomeostasisInsightsDialog
            open={showHomeostasisDialog}
            onOpenChange={setShowHomeostasisDialog}
            homeostasisLevel={homeostasisLevel}
            healthData={healthData}
            environmentalData={latestEnv || {}}
            userId={user.uid}
          />
        )}

        {user && (
          <BioSignatureDialog
            open={showBioSignatureDialog}
            onOpenChange={setShowBioSignatureDialog}
            healthData={healthData}
            userId={user.uid}
          />
        )}

        {healthLoading || envLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-40 mb-4">HEALTH METRICS</div>
              <div className="grid grid-cols-2 gap-3">
                <Card data-testid="card-glucose">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Glucose</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {latestHealth?.glucose || "--"}
                    </div>
                    {latestHealth?.glucose && <div className="text-xs opacity-60 mt-1">mg/dL</div>}
                  </CardContent>
                </Card>

                <Card data-testid="card-hrv">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-widest opacity-60 mb-2">HRV</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {latestHealth?.hrv || "--"}
                    </div>
                    {latestHealth?.hrv && <div className="text-xs opacity-60 mt-1">ms</div>}
                  </CardContent>
                </Card>

                <Card data-testid="card-sleep">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Sleep</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {latestHealth?.sleepHours ? parseFloat(latestHealth.sleepHours.toString()).toFixed(1) : "--"}
                    </div>
                    {latestHealth?.sleepHours && <div className="text-xs opacity-60 mt-1">hours</div>}
                  </CardContent>
                </Card>

                <Card data-testid="card-bp">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Blood Pressure</div>
                    <div className="text-2xl font-bold font-mono text-primary">
                      {latestHealth?.bloodPressureSystolic && latestHealth?.bloodPressureDiastolic
                        ? `${latestHealth.bloodPressureSystolic}/${latestHealth.bloodPressureDiastolic}`
                        : "--"}
                    </div>
                    {latestHealth?.bloodPressureSystolic && <div className="text-xs opacity-60 mt-1">mmHg</div>}
                  </CardContent>
                </Card>

                <Card data-testid="card-heart-rate">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Heart Rate</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {latestHealth?.heartRate || "--"}
                    </div>
                    {latestHealth?.heartRate && <div className="text-xs opacity-60 mt-1">bpm</div>}
                  </CardContent>
                </Card>

                <Card data-testid="card-steps">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Steps</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {latestHealth?.steps ? latestHealth.steps.toLocaleString() : "--"}
                    </div>
                    {latestHealth?.steps && <div className="text-xs opacity-60 mt-1">today</div>}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-xs uppercase tracking-widest opacity-40 mb-3">ENVIRONMENT</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold font-mono mb-1">{latestEnv?.aqi || "—"}</div>
                  <div className="text-xs opacity-60">AQI • {latestEnv?.aqi ? (latestEnv.aqi < 50 ? "Good" : latestEnv.aqi < 100 ? "Moderate" : "Unhealthy") : "No data"}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono">{latestEnv?.temperature ? `${latestEnv.temperature}°F` : "—"}</div>
                  <div className="text-xs opacity-60">{latestEnv?.humidity ? `${latestEnv.humidity}% humidity` : "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs opacity-40">
                <MapPin className="w-3 h-3" />
                <span>{latestEnv?.locationMode === "manual" ? "Indoor" : "Outdoor"}</span>
              </div>
            </div>
          </>
        )}

        <MedicationQuickLog />

        <div>
          <div className="text-xs uppercase tracking-widest opacity-40 mb-4">RECENT ACTIVITY</div>
          {entriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : recentEntries && recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="w-full flex items-center justify-between p-4 border border-white/10 rounded-lg"
                  data-testid={`entry-${index}`}
                >
                  <div className="text-left">
                    <div className="text-sm opacity-60">{new Date(entry.timestamp).toLocaleString()}</div>
                    <div className="text-xs opacity-40 mt-1">
                      {entry.glucose && `Glucose: ${entry.glucose} • `}
                      {entry.heartRate && `HR: ${entry.heartRate} • `}
                      {entry.sleepHours && `Sleep: ${entry.sleepHours}h • `}
                      {entry.steps && `Steps: ${entry.steps.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 opacity-40">
              <p className="text-sm">No recent entries</p>
              <p className="text-xs mt-2">Data will appear from connected devices</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
