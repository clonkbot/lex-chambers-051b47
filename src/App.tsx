import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.get);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-amber-500/60 font-serif tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Check if profile exists (undefined means still loading)
  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-amber-500/60 font-serif tracking-wide">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return <OnboardingScreen />;
  }

  return <Dashboard profile={profile} />;
}
