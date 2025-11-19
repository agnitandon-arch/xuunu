import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import EnvironmentalCard from "@/components/EnvironmentalCard";
import HealthEntryCard from "@/components/HealthEntryCard";

interface HomeScreenProps {
  userName?: string;
  onLogClick: () => void;
}

export default function HomeScreen({ userName = "User", onLogClick }: HomeScreenProps) {
  //todo: remove mock functionality - replace with real data from API/Firebase
  const mockRecentEntries = [
    {
      timestamp: new Date(),
      glucose: 125,
      symptomSeverity: 3,
      symptoms: ["Fatigue"],
      location: "Seattle, WA",
      weather: "Cloudy",
      aqi: 45,
      notes: "Feeling good today"
    },
    {
      timestamp: new Date(Date.now() - 86400000),
      glucose: 165,
      symptomSeverity: 6,
      symptoms: ["Fatigue", "Brain Fog", "Headache"],
      location: "Seattle, WA",
      weather: "Rainy",
      aqi: 95,
    },
    {
      timestamp: new Date(Date.now() - 172800000),
      glucose: 110,
      symptomSeverity: 2,
      symptoms: [],
      location: "Seattle, WA",
      weather: "Sunny",
      aqi: 35,
    }
  ];

  const lastLoggedHours = 6;

  return (
    <div className="flex-1 overflow-y-auto pb-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-welcome">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-date">
            {format(new Date(), "EEEE, MMMM dd, yyyy")}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span data-testid="text-last-logged">Last logged {lastLoggedHours} hours ago</span>
        </div>
        
        <EnvironmentalCard
          aqi={65}
          temperature={72}
          feelsLike={70}
          humidity={55}
          weather="Partly Cloudy"
          pm25={12.5}
          pm10={22.3}
        />
        
        <Button 
          className="w-full h-14 text-lg"
          onClick={onLogClick}
          data-testid="button-log-health"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Health Data
        </Button>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
          <div className="space-y-3">
            {mockRecentEntries.map((entry, index) => (
              <HealthEntryCard
                key={index}
                {...entry}
                onClick={() => console.log("View entry", index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
