import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type Role = "partner" | "senior_lawyer" | "junior_lawyer" | "paralegal" | "clerk";

const roles: { value: Role; label: string; description: string }[] = [
  { value: "partner", label: "Partner", description: "Full access to all features and team management" },
  { value: "senior_lawyer", label: "Senior Lawyer", description: "Manage cases and delegate to juniors" },
  { value: "junior_lawyer", label: "Junior Lawyer", description: "Handle assigned cases and tasks" },
  { value: "paralegal", label: "Paralegal", description: "Support case preparation and documentation" },
  { value: "clerk", label: "Clerk", description: "Administrative and scheduling duties" },
];

export function OnboardingScreen() {
  const createProfile = useMutation(api.profiles.create);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("junior_lawyer");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createProfile({
        name,
        email,
        role,
        phone: phone || undefined,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #c9a54a 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mb-4 border border-amber-600/30 bg-gradient-to-br from-amber-900/20 to-transparent">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-white mb-2">Complete Your Profile</h1>
            <p className="text-white/40 text-sm md:text-base">Set up your LexChambers account</p>
          </div>

          <div className="bg-[#12121a] border border-amber-900/30 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-600/60 transition-colors text-sm md:text-base"
                  placeholder="Adv. John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-600/60 transition-colors text-sm md:text-base"
                  placeholder="john.smith@lawfirm.com"
                  required
                />
              </div>

              <div>
                <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-600/60 transition-colors text-sm md:text-base"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-3">
                  Your Role
                </label>
                <div className="space-y-2">
                  {roles.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 p-3 md:p-4 border cursor-pointer transition-all ${
                        role === r.value
                          ? "border-amber-600/60 bg-amber-900/10"
                          : "border-amber-900/30 hover:border-amber-900/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="mt-1 accent-amber-500"
                      />
                      <div>
                        <div className="text-white font-medium text-sm md:text-base">{r.label}</div>
                        <div className="text-white/40 text-xs md:text-sm">{r.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name || !email}
                className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white py-3 md:py-4 font-serif tracking-wider uppercase text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Profile..." : "Continue to Dashboard"}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-white/20 text-xs">
            Requested by @web-user · Built by @clonkbot
          </p>
        </footer>
      </div>
    </div>
  );
}
