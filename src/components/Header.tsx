import { useAppStore } from '@/store/appStore';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user, logout } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-semibold text-stone-900">Esencelab</span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">{user?.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-stone-200 capitalize">
                  {user?.role}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-stone-600 hover:text-stone-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
