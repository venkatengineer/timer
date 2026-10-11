import React, { useState } from 'react'
import { Shield, KeyRound, User, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'

interface LoginScreenProps {
  onLoginSuccess: () => void
  onPlayBeep?: (freq?: number, duration?: number) => void
  onPlaySuccess?: () => void
}

export const HARDCODED_LOGIN = 'sedsrec'
export const HARDCODED_PASSWORD = 'sedssdes'

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onPlayBeep,
  onPlaySuccess,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsAuthenticating(true)
    onPlayBeep?.(880, 0.08)

    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase()
      if (trimmedUser === HARDCODED_LOGIN && password === HARDCODED_PASSWORD) {
        onPlaySuccess?.()
        setIsAuthenticating(false)
        onLoginSuccess()
      } else {
        setIsAuthenticating(false)
        onPlayBeep?.(320, 0.25)
        if (trimmedUser !== HARDCODED_LOGIN) {
          setError('ACCESS DENIED: UNKNOWN OPERATOR CALLSIGN')
        } else {
          setError('ACCESS DENIED: INVALID SECURITY PASSPHRASE')
        }
      }
    }, 400)
  }

  const handleQuickFill = () => {
    setUsername(HARDCODED_LOGIN)
    setPassword(HARDCODED_PASSWORD)
    setError(null)
    onPlayBeep?.(1050, 0.05)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05050A]/40 backdrop-blur-sm select-none">
      {/* Background radial glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#A78BFA]/15 to-[#6DADEB]/15 blur-3xl pointer-events-none" />

      <div className="relative max-w-md w-full p-8 rounded-2xl bg-[#100B20]/85 border border-[#A78BFA]/40 shadow-[0_0_60px_rgba(167,139,250,0.3)] space-y-6 backdrop-blur-md">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#05050A] border border-[#A78BFA]/50 text-[#A78BFA] shadow-[0_0_25px_rgba(167,139,250,0.3)] mb-2">
            <Shield className="w-7 h-7 text-[#6DADEB]" />
          </div>
          <div className="text-[11px] font-mono tracking-[0.3em] text-[#8D8BA0] uppercase">
            SEDS REC • FLIGHT OPERATIONS
          </div>
          <h2 className="text-2xl font-mono font-bold text-[#F3F2FA] tracking-wide uppercase">
            SECURITY CLEARANCE GATE
          </h2>
          <p className="text-xs font-mono text-[#8D8BA0]">
            Enter authorized flight director credentials to unlock Lunar Clock
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Operator ID Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#8D8BA0] flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>OPERATOR CALLSIGN</span>
              </span>
              <span className="text-[10px] text-[#A78BFA]/70">REQUIRED</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError(null)
                }}
                placeholder="sedsrec"
                autoComplete="username"
                autoFocus
                required
                className="w-full px-4 py-3 rounded-xl bg-[#05050A] border border-[#A78BFA]/30 focus:border-[#A78BFA] text-[#F3F2FA] text-sm font-mono placeholder:text-[#8D8BA0]/40 outline-none transition-all shadow-inner focus:shadow-[0_0_15px_rgba(167,139,250,0.2)]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#8D8BA0] flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#6DADEB]" />
                <span>SECURITY PASSPHRASE</span>
              </span>
              <span className="text-[10px] text-[#6DADEB]/70">ENCRYPTED</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-11 rounded-xl bg-[#05050A] border border-[#A78BFA]/30 focus:border-[#A78BFA] text-[#F3F2FA] text-sm font-mono placeholder:text-[#8D8BA0]/40 outline-none transition-all shadow-inner focus:shadow-[0_0_15px_rgba(167,139,250,0.2)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8D8BA0] hover:text-[#F3F2FA] transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#6DADEB] hover:opacity-95 active:scale-[0.99] text-[#05050A] font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(167,139,250,0.35)] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>VERIFYING TELEMETRY CREDENTIALS...</span>
              ) : (
                <>
                  <span>AUTHENTICATE & ENTER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Credentials Info / Autofill Helper */}
        <div className="pt-2 border-t border-[#A78BFA]/15 flex items-center justify-between text-[11px] font-mono text-[#8D8BA0]">
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3 h-3 text-[#A78BFA]" />
            <span>LOGIN: <code className="text-[#F3F2FA] font-bold">sedsrec</code> / PASS: <code className="text-[#F3F2FA] font-bold">sedssdes</code></span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[#6DADEB] hover:text-[#A78BFA] underline cursor-pointer transition-colors"
          >
            Autofill
          </button>
        </div>
      </div>
    </div>
  )
}
