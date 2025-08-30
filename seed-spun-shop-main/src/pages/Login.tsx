import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { useToast } from "@/hooks/use-toast";

type Mode = "login" | "signup";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const isSignUp = mode === "signup";

  const [name, setName] = useState("");
  const [asSeller, setAsSeller] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, refresh } = useAuth(); // ← register + refresh added in AuthContext (see section 2)
  const { addLog } = useLog();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await register({ name, email, password, asSeller });
        addLog("Auth", "User signed up successfully", "click");
        toast({ title: "Account created", description: "Welcome aboard!" });
      } else {
        await login(email, password);
        addLog("Auth", "User logged in successfully", "click");
        toast({ title: "Welcome back!", description: "Signed in successfully." });
      }

      await refresh?.(); // optional, if your context supports it
      navigate("/");
    } catch (error: any) {
      addLog("Auth Error", isSignUp ? "Signup failed" : "Login failed", "error");
      toast({
        title: isSignUp ? "Sign-up Failed" : "Login Failed",
        description:
          error?.message ||
          (isSignUp ? "Could not create account." : "Invalid email or password."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setMode("login");
    setEmail("demo@example.com");
    setPassword("demo");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        {/* Header + Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Join the marketplace in seconds" : "Sign in to your account"}
            </p>
          </div>
          <Button
            variant="link"
            className="px-0"
            onClick={() => setMode(isSignUp ? "login" : "signup")}
          >
            {isSignUp ? "Have an account? Sign in" : "New here? Sign up"}
          </Button>
        </div>

        <Card className="marketplace-card">
          <CardHeader>
            <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="search-input mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="search-input mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="search-input mt-1"
                />
              </div>

              {isSignUp && (
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="asSeller"
                    checked={asSeller}
                    onCheckedChange={(v) => setAsSeller(Boolean(v))}
                  />
                  <Label htmlFor="asSeller" className="text-sm text-muted-foreground">
                    I want to sell items (create listings)
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (isSignUp ? "Creating..." : "Signing in...") : isSignUp ? "Create account" : "Sign in"}
              </Button>
            </form>

            {/* Divider + Demo */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" onClick={handleDemoLogin}>
                Use Demo Account
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Demo credentials: demo@example.com / demo
              </p>
            </div>

            {/* Optional helper text */}
            {!isSignUp && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Need to verify your email? Use the profile menu after login to send OTP.
              </p>
            )}

            {/* Back link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Prefer a separate route?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Dedicated sign-up page
                </Link>
              </p>
              <div className="mt-4">
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  ← Back to Marketplace
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
