import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", flow);
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            #c9a54a 40px,
            #c9a54a 41px
          )`
        }} />
      </div>

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo & Brand */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 border border-amber-600/30 bg-gradient-to-br from-amber-900/20 to-transparent">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white tracking-tight mb-2">
            Lex<span className="text-amber-500">Chambers</span>
          </h1>
          <p className="text-amber-500/50 text-sm md:text-base tracking-[0.3em] uppercase font-light">
            Legal Practice Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          <div className="relative bg-[#12121a] border border-amber-900/30 p-6 md:p-8">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 md:w-8 h-6 md:h-8 border-t border-l border-amber-600/50" />
            <div className="absolute top-0 right-0 w-6 md:w-8 h-6 md:h-8 border-t border-r border-amber-600/50" />
            <div className="absolute bottom-0 left-0 w-6 md:w-8 h-6 md:h-8 border-b border-l border-amber-600/50" />
            <div className="absolute bottom-0 right-0 w-6 md:w-8 h-6 md:h-8 border-b border-r border-amber-600/50" />

            <h2 className="font-serif text-xl md:text-2xl text-white mb-6 md:mb-8 text-center">
              {flow === "signIn" ? "Welcome Back" : "Create Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-600/60 transition-colors text-sm md:text-base"
                  placeholder="counsel@lexchambers.com"
                  required
                />
              </div>

              <div>
                <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-600/60 transition-colors text-sm md:text-base"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/10 border border-red-900/30 px-4 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white py-3 md:py-4 font-serif tracking-wider uppercase text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Please wait..." : flow === "signIn" ? "Enter Chambers" : "Register"}
              </button>
            </form>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-amber-900/20">
              <p className="text-center text-white/40 text-sm">
                {flow === "signIn" ? "New to LexChambers?" : "Already have an account?"}
              </p>
              <button
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="w-full mt-3 py-2 md:py-3 text-amber-500 hover:text-amber-400 text-sm tracking-wider transition-colors"
              >
                {flow === "signIn" ? "Create an Account" : "Sign In Instead"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 md:mt-12 text-center">
          <p className="text-white/20 text-xs">
            Requested by @web-user · Built by @clonkbot
          </p>
        </footer>
      </div>
    </div>
  );
}
