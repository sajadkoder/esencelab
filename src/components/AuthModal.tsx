import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { Eye, EyeOff, User, Building2, Shield } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAppStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(email, password);
    if (success) {
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } else {
      setError('Invalid credentials. Try demo accounts below.');
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-50 border-stone-200 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-stone-900">
            Welcome to Esencelab
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-stone-200 rounded-lg">
            <TabsTrigger value="login" className="rounded-md">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-md">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="email" className="text-stone-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-white border-stone-300 rounded-lg mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-stone-700">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white border-stone-300 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-lg"
              >
                Login
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-500 mb-3 text-center">Demo Accounts (password: demo)</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillDemo('student@demo.com')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-stone-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">Student</p>
                    <p className="text-xs text-stone-500">student@demo.com</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('recruiter@demo.com')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors text-left"
                >
                  <Building2 className="w-4 h-4 text-stone-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">Recruiter</p>
                    <p className="text-xs text-stone-500">recruiter@demo.com</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin@demo.com')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-stone-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">Admin</p>
                    <p className="text-xs text-stone-500">admin@demo.com</p>
                  </div>
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="text-center py-8">
              <p className="text-stone-600 mb-4">Sign up is disabled in demo mode.</p>
              <p className="text-sm text-stone-500">Please use one of the demo accounts above.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
