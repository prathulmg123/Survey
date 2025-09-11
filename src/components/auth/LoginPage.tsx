import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (email && password) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", email);
        toast.success("Welcome back! Redirecting to dashboard...");
        navigate("/dashboard");
      } else {
        toast.error("Please fill in all fields");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center">
      {/* Left curved blue shape */}
      <div className="absolute left-0 top-0 w-1/2 h-full pointer-events-none">
        <div className="absolute -left-32 top-0 w-96 h-full">
          <div className="w-full h-full bg-accent-blue rounded-r-full transform scale-150 origin-left"></div>
        </div>
        <div className="absolute -left-20 top-20 w-80 h-96">
          <div className="w-full h-full bg-accent-blue/70 rounded-r-full transform scale-125 origin-left"></div>
        </div>
      </div>

      {/* Right curved gray shapes */}
      <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none">
        <div className="absolute -right-32 top-0 w-96 h-full">
          <div className="w-full h-full bg-accent-light-gray rounded-l-full transform scale-150 origin-right"></div>
        </div>
        <div className="absolute -right-20 bottom-20 w-80 h-96">
          <div className="w-full h-full bg-accent-gray/30 rounded-l-full transform scale-125 origin-right"></div>
        </div>
      </div>

      {/* Bottom left dots pattern */}
      <div className="absolute bottom-8 left-8 grid grid-cols-4 gap-2 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-accent-blue rounded-full opacity-60"
          ></div>
        ))}
      </div>

      {/* Top right navigation */}
      {/* <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
        <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
          Register
        </Button>
        <Button variant="default" size="sm" className="bg-accent-blue hover:bg-accent-blue/90">
          Sign In
        </Button>
      </div> */}

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto px-6 z-10">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Katalyze.<span className="text-accent-blue">ai</span>
            </h1>
            {/* <p className="text-accent-blue text-sm font-medium tracking-wider uppercase">
              COMPLIANCE
            </p> */}
          </div>

          {/* <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2> */}
        </div>

        <Card className="bg-white border-0 shadow-encore">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-accent-blue transition-all"
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-14 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-accent-blue transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-medium"
                disabled={isLoading}
                variant="encore"
              >
                {isLoading ? "Signing In..." : "Login"}
              </Button>

              <div className="text-center">
                <Button variant="link" className="text-gray-500 hover:text-accent-blue p-0">
                  Forgot Password?
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                Demo: Use any email and password to login
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;