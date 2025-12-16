import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Shield, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Logo } from '@/components/ui/Logo';

interface HeaderProps {
  onSignOut: () => Promise<void>;
}

export const Header = ({ onSignOut }: HeaderProps) => {
  const { user, profile, isAdmin } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { siteName, siteDescription, logoUrl } = useSettingsStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <Logo
              src={logoUrl}
              alt="Logo"
              size="md"
              mode="contain"
              square
            />
          ) : (
            <Shield className="w-10 h-10 text-primary" />
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">{siteName}</h1>
            <p className="text-xs text-muted-foreground">{siteDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.username || '用户'}
                  {isAdmin && <Badge className="ml-2">管理员</Badge>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/favorites">
                    我的收藏
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Settings className="w-4 h-4 mr-2" />
                      管理后台
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
