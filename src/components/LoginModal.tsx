import React, { useState } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { Lock, User as UserIcon, Shield, Check, X, LogIn, Key, RefreshCw } from 'lucide-react';
import { googleSignIn } from '../utils/googleWorkspace';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

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
          avatarUrl:
            googleUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        };
        onLogin(mappedUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = INITIAL_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );

    if (found) {
      onLogin(found);
      onClose();
    } else {
      setError('Invalid username or password. You can also click any pre-configured role below.');
    }
  };

  const handleQuickRoleLogin = (user: User) => {
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#123b5d] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">System Authentication</h3>
              <p className="text-xs text-white/80">Apex Dyeing & Finishing Mills Security Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Session Info if logged in */}
          {currentUser && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-sky-300 object-cover"
                />
                <div>
                  <div className="font-bold text-sky-900">{currentUser.name}</div>
                  <div className="text-sky-700">{currentUser.roleTitle}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                Active
              </span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs hover:shadow transition flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              {isGoogleLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Connecting to Google...</span>
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

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[11px] text-slate-400 font-medium">or choose a factory role</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Quick 1-Click Role Login */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Role Profile (1-Click Instant Login):
            </label>
            <div className="space-y-2">
              {INITIAL_USERS.map((user) => {
                const isActive = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickRoleLogin(user)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition ${
                      isActive
                        ? 'bg-sky-50/90 border-[#123b5d] text-[#123b5d]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            user.role === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'HR_Compliance'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'Trainer'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{user.roleTitle}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <Check className="w-4 h-4 text-[#123b5d]" />
                    ) : (
                      <LogIn className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[11px] text-slate-400">or sign in with credentials</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Username / ID:</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / hr_manager / trainer / auditor"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password:</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 shadow"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Verify & Sign In</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
