import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, Loader2, Eye, EyeOff, User, ArrowRight, 
  Utensils, Github, Chrome, Sparkles 
} from "lucide-react";
import authService from "../../lib/services/authService";
import { signUpSchema } from "../../lib/services/validation";
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
      <div className="relative flex items-center">
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
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-red-500" />
      ) : (
        <>
          <Icon className="h-5 w-5 text-current/70 group-hover:text-red-500 transition-colors" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            {label}
          </span>
        </>
      )}
    </div>
  </motion.button>
);

export default function SignUp() {
  const navigate = useNavigate();
  const parallax = useMouseParallax();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const { showAlert } = useAlert();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur"
  });

  // Handle email/password sign up submission
  const handleEmailSignUp = async (data) => {
    try {
      setErrorMessage("");
      await authService.registerWithEmail(data);
      showAlert("Welcome to GrubGo! Your account has been created successfully.", "success");
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.message.includes("email-already-in-use") 
        ? "This email is already on our list." 
        : "We couldn't set up your account. Please try again.";
      setErrorMessage(errorMsg);
      showAlert(errorMsg, "error");
    }
  };

  // Handle OAuth provider sign up (Google/GitHub)
  const handleOAuthSignUp = async (provider) => {
    try {
      setLoadingProvider(provider);
      setErrorMessage("");
      
      if (provider === 'google') {
        await authService.loginWithGoogle();
      } else if (provider === 'github') {
        await authService.loginWithGithub();
      }
      
      showAlert(`Welcome to GrubGo! You've signed up with ${provider}.`, "success");
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = `Failed to sign up with ${provider}. Please try again.`;
      setErrorMessage(errorMsg);
      showAlert(errorMsg, "error");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans overflow-hidden selection:bg-red-500/30 selection:text-red-500 text-left">
      
      {/* LEFT SIDE: GRUBGO BRANDING - Desktop only */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-6 lg:p-12 relative border-r border-current/5 perspective-[1000px] overflow-hidden"
      >
        {/* Animated Particle Effects */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              y: [null, -30, 30, -30],
              x: [null, 30, -30, 30],
              scale: [0, 1, 0.5, 1, 0],
              opacity: [0, 0.5, 0.2, 0.5, 0]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}

        {/* Animated Gradient Orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] bg-linear-to-r from-red-500/10 via-red-500/10 to-red-500/10 rounded-full blur-3xl"
        />

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
              className="text-[20rem] font-black leading-none bg-linear-to-b from-red-500/30 via-red-500/20 to-transparent bg-clip-text text-transparent tracking-[-0.15em] filter blur-[1px]"
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
            <h1 className="text-6xl font-black text-current tracking-tighter drop-shadow-sm mb-4">
              Join <span className="text-red-500 relative inline-block">
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
            className="text-gray-400 mt-3 font-black tracking-[0.4em] uppercase text-[9px] opacity-80"
          >
            Your seat at the table is waiting
          </motion.p>

          {/* Decorative Sparkles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -right-10"
          >
            <Sparkles className="h-6 w-6 text-red-500/30" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Sign Up Form Section */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 lg:py-12 relative"
      >
        {/* Mobile Logo Header - visible only on small screens */}
        <div className="lg:hidden text-center mb-6">
          <h1 className="text-3xl font-black text-current">
            Join <span className="text-red-500">GrubGo.</span>
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

        <div className="w-full max-w-md space-y-6 sm:space-y-8 relative z-10">
          <header className="space-y-1 text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black flex gap-1 tracking-tighter"
            >
              {'SIGNUP'.split('').map((letter, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ 
                    scale: 1.2,
                    color: '#f97316',
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="inline-block text-transparent transition-all duration-300 cursor-default"
                  style={{ WebkitTextStroke: '2px #f97316' }}
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
              Get ready for your first delivery
            </motion.p>
          </header>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-linear-to-r from-red-500/10 to-red-500/10 text-red-500 p-4 rounded-2xl text-[11px] font-black tracking-wider border border-red-500/20 text-center uppercase backdrop-blur-xl"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit(handleEmailSignUp)} className="space-y-5">
              <FormInput 
                icon={User} 
                name="username" 
                label="Display Name"
                placeholder="What should we call you?" 
                register={register} 
                error={errors.username} 
              />

              <FormInput 
                icon={Mail} 
                name="email" 
                label="Email Address"
                placeholder="your@email.com" 
                register={register} 
                error={errors.email} 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <FormInput 
                    icon={Lock} 
                    name="password" 
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password" 
                    register={register} 
                    error={errors.password} 
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[42px] text-gray-500 hover:text-red-500 transition-colors z-20"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>

                <div className="relative">
                  <FormInput 
                    icon={Utensils} 
                    name="confirmPassword" 
                    label="Confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password" 
                    register={register} 
                    error={errors.confirmPassword} 
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-[42px] text-gray-500 hover:text-red-500 transition-colors z-20"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full py-5 bg-linear-to-r from-red-600 to-red-600 text-white font-black uppercase tracking-[0.25em] rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 group mt-4 relative overflow-hidden"
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
                    <span>Join GrubGo</span>
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
                OR SIGN UP WITH
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
              label="Continue with Google"
              onClick={() => handleOAuthSignUp('google')}
              isLoading={loadingProvider === 'google'}
            />
            
            <SocialLoginButton
              provider="github"
              icon={Github}
              label="Continue with GitHub"
              onClick={() => handleOAuthSignUp('github')}
              isLoading={loadingProvider === 'github'}
            />
          </motion.div>

          {/* Sign In Link */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[10px] font-black text-gray-600 tracking-widest uppercase"
          >
            Already have an account?{' '}
            <Link 
              to="/auth/signin" 
              className="relative inline-block group"
            >
              <span className="text-red-500 group-hover:text-current transition-colors border-b border-red-500/20 ml-1">
                Log in here
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