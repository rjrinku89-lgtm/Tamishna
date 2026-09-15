import React, { useState } from 'react';
import { User, FactoryFacilityIdentity } from '../types';
import { 
  Shield, 
  Lock, 
  Key, 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  Check, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Building, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Settings,
  Sparkles,
  Info
} from 'lucide-react';
import { googleSignIn } from '../utils/googleWorkspace';

interface LoginViewProps {
  users: User[];
  currentUser: User | null;
  factoryIdentity?: FactoryFacilityIdentity;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onOpenUserManagement: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  currentUser,
  factoryIdentity,
  onLogin,
  onLogout,
  onNavigate,
  onOpenUserManagement,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const facilityName = factoryIdentity?.facilityName || 'Apex Dyeing & Finishing Mills Ltd.';

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter your username or email address.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter your account password.');
      return;
    }

    // Match by username or email
    const foundUser = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        (u.email && u.email.toLowerCase() === cleanUser)
    );

    if (!foundUser) {
      setError('Account not found. Check your username or select one of the authorized profiles below.');
      return;
    }

    if (foundUser.status === 'Suspended') {
      setError(`Account "${foundUser.username}" is suspended. Please contact the General Manager.`);
      return;
    }

    // Password validation (default fallback if password unset is username123)
    const validPassword = foundUser.password || `${foundUser.username}123`;
    if (cleanPass !== validPassword) {
      setError('Incorrect password. For demo users, the default password is shown in the card below.');
      return;
    }

    // Successful login
    onLogin(foundUser);
    setSuccessMsg(`Welcome back, ${foundUser.name}! Session authenticated successfully.`);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 800);
  };

  const handleQuickRoleSelect = (user: User) => {
    setError('');
    onLogin(user);
    setSuccessMsg(`Signed in as ${user.name} (${user.roleTitle})`);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 600);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const res = await googleSignIn();
      if (res?.user) {
        const googleUser = res.user;
        const mappedUser: User = {
          id: googleUser.uid,
          username: googleUser.email?.split('@')[0] || 'google_user',
          name: googleUser.displayName || 'Google User',
          role: 'Admin',
          roleTitle: 'Google Workspace Compliance Officer',
          department: 'Compliance & Safety',
          email: googleUser.email || undefined,
          status: 'Active',
          avatarUrl:
            googleUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          permissions: ['Full System Admin', 'Google Sheets & Calendar Sync', 'Export Audit Reports'],
        };
        onLogin(mappedUser);
        setSuccessMsg(`Authenticated via Google Workspace: ${mappedUser.name}`);
        setTimeout(() => {
          onNavigate('dashboard');
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner & Mill Security Hub */}
      <div className="bg-linear-to-r from-slate-900 via-[#123b5d] to-sky-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                <span>Plant Security & Authentication Portal</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                ZDHC Gateway Verified
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {facilityName}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Sign in with your authorized operational credentials to access employee training schedules, chemical safety registries, DoE / ZDHC compliance ledgers, and QR attendance terminals.
            </p>
          </div>

          {/* Quick jump to Settings/User management */}
          <div className="shrink-0 flex md:flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-6">
            <div className="text-left md:text-right text-xs">
              <div className="text-slate-300 font-medium">Configured Accounts:</div>
              <div className="text-lg font-bold text-white font-mono">{users.length} Users</div>
            </div>

            <button
              type="button"
              onClick={onOpenUserManagement}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-sky-300" />
              <span>Edit Credentials</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Session Card (If Logged In) */}
      {currentUser && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                  {currentUser.name}
                </h3>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded-full">
                  Active Session
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                {currentUser.roleTitle} &bull; <strong>{currentUser.department}</strong>
              </p>
              <div className="text-[11px] text-emerald-700 font-mono mt-1">
                Username: <strong>{currentUser.username}</strong> | Role: <strong>{currentUser.role}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 hover:text-rose-800 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Lock</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center space-x-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-medium text-emerald-900 flex items-center space-x-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dual Panel Login Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Direct Authentication Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-[#123b5d] flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Log In With Credentials</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your plant login username and security password.
            </p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / Email Address
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or nasrin.hr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d] text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password / PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const firstUser = users[0];
                    if (firstUser) {
                      setUsername(firstUser.username);
                      setPassword(firstUser.password || `${firstUser.username}123`);
                    }
                  }}
                  className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold hover:underline"
                >
                  Autofill Admin Login
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d] text-slate-800 font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#123b5d] focus:ring-[#123b5d]"
                />
                <span className="text-[11px]">Remember terminal session</span>
              </label>

              <button
                type="button"
                onClick={onOpenUserManagement}
                className="text-[11px] text-sky-700 hover:underline font-semibold"
              >
                Forgot or reset password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-sky-300" />
              <span>Verify & Sign In</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
              or enterprise single sign-on
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Google Workspace SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs hover:shadow transition flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                <span>Authorizing with Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Sheets & Calendar)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: 1-Click Role Profiles & Configured Accounts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#123b5d] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Factory Personas (1-Click Instant Login)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any authorized role below to instantly authenticate and experience role-specific privileges.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenUserManagement}
                className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Manage Users & Roles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map((u) => {
                const isActive = currentUser?.id === u.id;
                const passwordToDisplay = u.password || `${u.username}123`;
                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                      isActive
                        ? 'bg-sky-50/80 border-[#123b5d] ring-1 ring-[#123b5d]/30'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-tight">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                              {u.roleTitle}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            u.role === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'HR_Compliance'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'Trainer'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>

                      {/* Credentials display */}
                      <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200/80 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                        <span>User: <strong>{u.username}</strong></span>
                        <span>Pass: <strong>{passwordToDisplay}</strong></span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {u.department}
                      </span>

                      {isActive ? (
                        <span className="text-[11px] font-bold text-[#123b5d] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Logged In</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickRoleSelect(u)}
                          className="px-2.5 py-1 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-[10px] font-bold rounded-md transition flex items-center space-x-1"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>1-Click Sign In</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environmental Compliance & Security Credentials Info Card */}
          <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-600">
            <div className="font-bold text-[#123b5d] flex items-center gap-2 text-xs">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Plant Terminal Security & Compliance Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              All logins are logged in compliance with <strong>ZDHC Gateway</strong> and <strong>DoE Red Category</strong> audit requirements. Passwords and credentials can be updated at any time by administrators under <em>System Settings & Administration &rarr; Active User & Security Credentials</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
