import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, Github, Chrome } from "lucide-react";
import authService from "../../lib/services/authService";
import { signInSchema } from "../../lib/services/validation";
import { useAlert } from '../../context/AlertContext'

// Custom hook for parallax mouse movement effect
function useMouseParallax() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 60;
      const y = (e.clientY - window.innerHeight / 2) / 60;
      setPosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return position;
}

// Styled input component with animated focus states
const FormInput = ({ icon: Icon, register, name, label, error, ...props }) => (
  <div className="space-y-1.5 w-full text-left">
    <label className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">
      {label}
    </label>
    <motion.div 
      initial={false} 
      whileFocus={{ scale: 1.01 }} 
      className="relative group"
    >
      <div className="absolute -inset-[2px] bg-linear-to-r from-red-500/20 to-red-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center text-left">
        <div className="absolute left-4 flex items-center justify-center pointer-events-none z-10">
          <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
        </div>
        <input
          {...register(name)}
          {...props}
          className={`w-full bg-black/5 dark:bg-white/5 backdrop-blur-xl border-2 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all duration-300 
          placeholder:text-current/30 text-current font-medium
          ${error ? "border-red-500/40 focus:border-red-500" : "border-current/10 focus:border-red-500"}`}
        />
      </div>
    </motion.div>
    <AnimatePresence mode="wait">
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: 10 }}
          className="text-[10px] text-red-500 ml-2 font-black uppercase tracking-wider"
        >
          {error.message}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// OAuth button component for social login
const SocialLoginButton = ({ provider, icon: Icon, label, onClick, isLoading }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={isLoading}
    className="relative group w-full"
  >
    <div className="absolute -inset-[1px] bg-linear-to-r from-red-500/20 to-red-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative flex items-center justify-center gap-3 w-full py-4 px-6 bg-black/5 dark:bg-white/5 backdrop-blur-xl border-2 border-current/10 rounded-2xl hover:border-red-500/50 transition-all duration-300">
      <Icon className="h-5 w-5 text-current/70 group-hover:text-red-500 transition-colors" />
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  </motion.button>
);

export default function SignIn() {
  const navigate = useNavigate();
  const parallax = useMouseParallax();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const { showAlert } = useAlert();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signInSchema),
  });

  // Handle email/password sign in submission
  const handleEmailSignIn = async (data) => {
    try {
      setErrorMessage("");
      await authService.loginWithEmail(data);
      showAlert("Welcome back! You've signed in successfully.", "success");
      navigate("/");
    } catch (error) {
      setErrorMessage("Invalid login details. Please try again.");
      showAlert("Invalid login details. Please try again.", "error");
    }
  };

  // Handle OAuth provider sign in (Google/GitHub)
  const handleOAuthSignIn = async (provider) => {
    try {
      setLoadingProvider(provider);
      setErrorMessage("");
      
      if (provider === 'google') {
        await authService.loginWithGoogle();
      } else if (provider === 'github') {
        await authService.loginWithGithub();
      }
      
      showAlert(`Successfully signed in with ${provider}!`, "success");
      navigate("/");
    } catch (error) {
      setErrorMessage(`Failed to sign in with ${provider}. Please try again.`);
      showAlert(`Failed to sign in with ${provider}. Please try again.`, "error");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans overflow-hidden selection:bg-red-500/30 selection:text-red-500 text-left">
      
      {/* LEFT SIDE: GRUBGO LOGO - Desktop only */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-6 lg:p-12 relative perspective-[1000px] overflow-hidden"
      >
        {/* Floating GG Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <motion.span 
              animate={{ 
                textShadow: [
                  "0 0 30px rgba(249,115,22,0.3)",
                  "0 0 60px rgba(249,115,22,0.5)",
                  "0 0 30px rgba(249,115,22,0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-[10rem] md:text-[15rem] lg:text-[20rem] font-black leading-none bg-linear-to-b from-red-500/30 via-red-500/20 to-transparent bg-clip-text text-transparent tracking-[-0.15em] filter blur-[1px]"
            >
              GG
            </motion.span>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div 
          style={{ rotateX: -parallax.y * 0.5, rotateY: parallax.x * 0.5 }} 
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-current tracking-tighter drop-shadow-sm mb-4">
              Welcome to <br className="sm:hidden" />
              <span className="text-red-500 relative inline-block">
                GrubGo.
                <motion.div
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-2 left-0 h-[3px] bg-linear-to-r from-transparent via-red-500 to-transparent"
                />
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 mt-6 font-black tracking-[0.4em] uppercase text-[9px] opacity-80"
          >
            Your favorite meals, delivered fast
          </motion.p>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/5 rounded-full blur-3xl" />
        </motion.div>

        {/* Ambient Glow Effect */}
        <div className="absolute w-[600px] h-[600px] bg-linear-to-r from-red-500/5 to-red-500/5 blur-[120px] rounded-full z-0" />
      </motion.div>

      {/* Sign In Form Section */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-20 relative"
      >
        {/* Mobile Logo Header - visible only on small screens */}
        <div className="lg:hidden text-center mb-6">
          <h1 className="text-3xl font-black text-current">
            Welcome to <span className="text-red-500">GrubGo.</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Your favorite meals, delivered fast</p>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="w-full max-w-md space-y-6 sm:space-y-10 relative z-10">
          <header className="space-y-1 text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black flex gap-1 tracking-tighter"
            >
              {'SIGNIN'.split('').map((letter, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ 
                    scale: 1.2,
                    color: '#ef4444',
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="inline-block text-transparent transition-all duration-300 cursor-default"
                  style={{ WebkitTextStroke: '2px #ef4444' }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 font-black tracking-widest text-[10px] uppercase ml-1"
            >
              Log in to place your order
            </motion.p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit(handleEmailSignIn)} className="space-y-6">
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs font-bold uppercase bg-red-500/10 border border-red-500/20 rounded-2xl py-3 px-4"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <FormInput 
                icon={Mail} 
                name="email" 
                label="Email Address"
                placeholder="Enter your email" 
                register={register} 
                error={errors.email} 
              />

              <div className="space-y-1 relative">
                <FormInput 
                  icon={Lock} 
                  name="password" 
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  register={register} 
                  error={errors.password} 
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[45px] text-gray-500 hover:text-red-500 transition-colors z-20"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full py-5 bg-linear-to-r from-red-600 to-red-600 text-white font-black uppercase tracking-[0.25em] rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <motion.div
                  animate={isSubmitting ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* OAuth Divider */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-current/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-4 bg-transparent text-current/40 font-black tracking-[0.2em] text-[10px]">
                OR CONTINUE WITH
              </span>
            </div>
          </motion.div>

          {/* OAuth Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <SocialLoginButton
              provider="google"
              icon={Chrome}
              label="Sign in with Google"
              onClick={() => handleOAuthSignIn('google')}
              isLoading={loadingProvider === 'google'}
            />
            
            <SocialLoginButton
              provider="github"
              icon={Github}
              label="Sign in with GitHub"
              onClick={() => handleOAuthSignIn('github')}
              isLoading={loadingProvider === 'github'}
            />
          </motion.div>

          {/* Sign Up Link */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[10px] font-black text-gray-600 tracking-widest uppercase"
          >
            Still hungry?{' '}
            <Link 
              to="/auth/signup" 
              className="relative inline-block group"
            >
              <span className="text-red-500 group-hover:text-current transition-colors border-b border-red-500/20 ml-1">
                Create a GrubGo account
              </span>
              <motion.span
                className="absolute bottom-0 left-0 w-full h-[1px] bg-red-500"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}