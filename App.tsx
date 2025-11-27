import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { History } from './components/History';
import { Pricing } from './components/Pricing';
import { Button } from './components/Button';
import { Profile } from './components/Profile';
import { VerifyEmail } from './components/VerifyEmail';
import { ResetPassword } from './components/ResetPassword';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';
import { ReturnPolicy } from './components/ReturnPolicy';
import { AdminDashboard } from './components/AdminDashboard';
import { humanizeText, detectAIContent, evaluateQuality } from './services/geminiService';
import { logoutUser, signupWithEmail, loginWithEmail } from './services/authService';
import { View, Tone, HistoryItem, UserState, DetectionResult, EvaluationResult, Vocabulary } from './types';
import { 
  Wand2, 
  Copy, 
  RotateCcw, 
  ArrowRightLeft,
  Quote,
  Check,
  Sparkles,
  ScanSearch,
  Activity,
  BarChart3,
  CheckCircle2,
  XCircle,
  Settings2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  PenLine,
  FileText,
  Key,
  Upload,
  X
} from 'lucide-react';

// Custom MinihaAI Logo Component (using favicon design)
const MinihaAILogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg 
      viewBox="0 0 32 32" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradLanding" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#f43f5e'}} />
          <stop offset="100%" style={{stopColor: '#e11d48'}} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoGradLanding)"/>
      <text x="16" y="23" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">M</text>
    </svg>
  );
};

// --- Landing Page Component ---
const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="py-4 px-4 sm:px-8 max-w-7xl mx-auto w-full flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-50 sm:border-none sm:static">
        <div className="flex items-center gap-2">
           <div className="p-1.5 rounded-lg flex items-center justify-center">
            <MinihaAILogo className="w-5 h-5" />
           </div>
           <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">MinihaAI</span>
        </div>
        <button onClick={onGetStarted} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 rounded-full sm:bg-transparent sm:rounded-none">
          Sign In
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden pt-8 sm:pt-0">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-rose-100/50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-orange-100/40 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-6 sm:mb-8 border border-rose-100">
           <Zap className="w-3 h-3" />
           New: Undetectable by Turnitin
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-4 sm:mb-6 max-w-4xl leading-[1.1]">
          Make AI Text <br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">100% Human</span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-500 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2">
          The advanced humanizing engine that transforms robotic AI content into natural, authentic writing with zero detectable AI tone.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto border-t border-slate-100 pt-12 pb-12 w-full px-4">
           <div className="flex flex-col gap-2 p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                 <ShieldCheck className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-slate-900">Bypass Detectors</h3>
              <p className="text-sm text-slate-500">Beats Turnitin, GPTZero, and Originality.ai with 99% success rate.</p>
           </div>
           <div className="flex flex-col gap-2 p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                 <Sparkles className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-slate-900">Natural Flow</h3>
              <p className="text-sm text-slate-500">Removes robotic patterns and adds human imperfections.</p>
           </div>
           <div className="flex flex-col gap-2 p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                 <Lock className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-slate-900">Secure & Private</h3>
              <p className="text-sm text-slate-500">Your content is never stored or used for training models.</p>
           </div>
        </div>
      </main>

      <footer className="py-6 px-4 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="text-slate-400 text-xs sm:text-sm">
              © 2025 MinihaAI. All rights reserved. <span className="font-semibold text-slate-500">Developed By Sahil Haq</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
              <button onClick={() => setView(View.PRIVACY_POLICY)} className="text-slate-500 hover:text-slate-700 transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => setView(View.TERMS_CONDITIONS)} className="text-slate-500 hover:text-slate-700 transition-colors">
                Terms & Conditions
              </button>
              <button onClick={() => setView(View.RETURN_POLICY)} className="text-slate-500 hover:text-slate-700 transition-colors">
                Return Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Auth Page Component ---
const AuthPage: React.FC<{ onLoginSuccess: (user: any) => void; onBack: () => void; onForgotPassword: () => void }> = ({ onLoginSuccess, onBack, onForgotPassword }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear error when switching modes
    setError(null);
    setEmail('');
    setPassword('');
  }, [authMode]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
        setError("Please fill in all fields.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        let user;
        if (authMode === 'signup') {
            user = await signupWithEmail(email, password);
            // After successful signup, automatically log the user in
            if (user) {
                // User is automatically logged in after account creation
                onLoginSuccess(user);
                return; // Exit early after successful signup and login
            }
        } else {
            user = await loginWithEmail(email, password);
            onLoginSuccess(user);
        }
    } catch (err: any) {
        // Check if it's an email verification error
        if (err.message && err.message.includes('verify your email')) {
            setError(err.message + ' Click "Resend" below to get a new verification email.');
        } else {
            setError(err.message || "Authentication failed");
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-rose-600" />
            </div>
            
            <div className="flex gap-4 border-b border-slate-100 mb-6">
                <button 
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${authMode === 'signup' ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Create Account
                    {authMode === 'signup' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-full"></div>}
                </button>
                <button 
                     onClick={() => setAuthMode('login')}
                    className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${authMode === 'login' ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Log In
                    {authMode === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-full"></div>}
                </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                {authMode === 'signup' ? 'Get started for free' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 mb-8 text-center text-sm">
                {authMode === 'signup' 
                    ? 'Join thousands of creators writing undetectable text.' 
                    : 'Sign in to access your history and saved tones.'}
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="space-y-3">
                <input 
                    type="email" 
                    placeholder="Email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" 
                />
                <Button 
                    variant="primary" 
                    className="w-full py-3 text-sm shadow-lg shadow-rose-900/20"
                    onClick={handleEmailAuth}
                    isLoading={isLoading && !!email}
                >
                    {authMode === 'signup' ? 'Create Account' : 'Log In'}
                </Button>
                
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="w-full mt-3 text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
            </div>
            
            <div className="mt-6 text-xs text-slate-400 text-center">
                By clicking continue, you agree to our <span className="underline cursor-pointer hover:text-slate-600">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
            </div>
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 font-medium">
                Back to Home
            </button>
        </div>
      </div>
      <footer className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-xs">
        © 2025 MinihaAI. All rights reserved. <span className="font-semibold text-slate-500">Developed By Sahil Haq</span>
      </footer>
    </div>
  );
};

// --- Settings Modal for API Key ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-rose-600" /> Settings
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="mb-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-green-900 mb-1">API Key Secured</h4>
                                <p className="text-sm text-green-700">
                                    Your Gemini API key is securely stored on our backend server. 
                                    You don't need to enter it manually. All AI features work automatically!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
  // --- State ---
  const [view, setView] = useState<View>(View.LANDING); 
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tone, setTone] = useState<Tone>(Tone.STANDARD);
  
  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [vocabulary, setVocabulary] = useState<Vocabulary>(Vocabulary.STANDARD);
  const [intensity, setIntensity] = useState<number>(50);
  
  // API Key is now handled securely on the backend - no need for client-side storage

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  
  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  // Detector State
  const [detectorInput, setDetectorInput] = useState('');
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // User Persistence
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('miniha_user');
    return saved ? JSON.parse(saved) : { 
        isLoggedIn: false, 
        isPremium: false, 
        history: [] 
    };
  });

  useEffect(() => {
    localStorage.setItem('miniha_user', JSON.stringify(userState));
  }, [userState]);

  // Check payment status periodically if user is logged in and not premium
  useEffect(() => {
    if (!userState.isLoggedIn || !userState.user?.id || userState.isPremium) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api'}/payment/status/${userState.user.id}`);
        const data = await response.json();
        
        if (data.success && data.isPremium) {
          // User's payment was approved - refresh user data
          const userResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api'}/user/${userState.user.id}`);
          const userData = await userResponse.json();
          
          if (userData.success && userData.user.isPremium) {
            setUserState(prev => ({
              ...prev,
              isPremium: true,
              user: { ...prev.user!, isPremium: true }
            }));
            // Show success notification
            alert('🎉 Your payment has been approved! Your Pro plan is now active.');
          }
        }
      } catch (error) {
        console.error('Payment status check error:', error);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Check every 30 seconds if user has pending payment
    const interval = setInterval(checkPaymentStatus, 30000);

    return () => clearInterval(interval);
  }, [userState.isLoggedIn, userState.user?.id, userState.isPremium]);


  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('token') && params.get('email')) {
      const path = window.location.pathname;
      if (path.includes('verify-email') || params.get('verify')) {
        setView(View.VERIFY_EMAIL);
        return;
      }
      if (path.includes('reset-password') || params.get('reset')) {
        setView(View.RESET_PASSWORD);
        return;
      }
    }
    
    // Payment success is now handled directly in Pricing component
    // No need to check for session_id in URL
  }, []);

  // Initial View Logic
  useEffect(() => {
    if (userState.isLoggedIn) {
        if (view === View.LANDING || view === View.AUTH) {
            setView(View.EDITOR);
        }
    } else {
        if (view !== View.AUTH && view !== View.VERIFY_EMAIL && view !== View.RESET_PASSWORD) {
            setView(View.LANDING);
        }
    }
  }, [userState.isLoggedIn, view]);

  // --- Handlers ---
  const handleLoginSuccess = (userProfile: any) => {
    setUserState(prev => ({
        ...prev,
        isLoggedIn: true,
        isPremium: userProfile?.isPremium || false,
        user: userProfile
    }));
    setView(View.EDITOR);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserState(prev => ({
        ...prev,
        isLoggedIn: false,
        user: undefined
    }));
    setView(View.LANDING);
    setInput('');
    setOutput('');
  };

  const handleHumanize = async () => {
    if (!input.trim()) return;
    
    if (!userState.isPremium && (tone !== Tone.STANDARD || intensity > 70)) {
      setView(View.PRICING);
      return;
    }

    setIsProcessing(true);
    setEvalResult(null); 
    if (window.innerWidth < 1024) {
      setMobileTab('output');
    }

    try {
      const result = await humanizeText(input, {
        tone,
        vocabulary,
        intensity
      });
      setOutput(result);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        original: input,
        humanized: result,
        tone: tone,
        timestamp: Date.now()
      };

      setUserState(prev => ({
        ...prev,
        history: [newItem, ...prev.history].slice(0, 50) 
      }));
    } catch (err: any) {
      console.error(err);
      alert("Failed to process text. " + err.message);
      setMobileTab('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEvaluate = async () => {
    if (!input || !output) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateQuality(input, output);
      setEvalResult(result);
    } catch (err: any) {
      console.error(err);
      alert("Evaluation failed.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDetect = async () => {
    if (!detectorInput.trim()) return;
    setIsProcessing(true);
    setDetectionResult(null); // Clear previous result
    try {
        const result = await detectAIContent(detectorInput);
        setDetectionResult(result);
    } catch (err: any) {
      console.error(err);
      alert("Failed to detect content. " + err.message);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept text files
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      alert('Please upload a text file (.txt)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text.length > 15000) {
        alert('File is too large. Maximum 15,000 characters allowed.');
        setDetectorInput(text.substring(0, 15000));
      } else {
        setDetectorInput(text);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = () => {
    setUserState(prev => ({ 
      ...prev, 
      isPremium: true,
      user: prev.user ? { ...prev.user, isPremium: true } : prev.user
    }));
    setView(View.EDITOR);
  };

  const handlePaymentSuccess = async () => {
    // Refresh user data from backend
    if (userState.user?.id) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api'}/user/${userState.user.id}`);
        const data = await response.json();
        if (data.success) {
          setUserState(prev => ({
            ...prev,
            isPremium: data.user.isPremium,
            user: { ...prev.user!, ...data.user }
          }));
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
    handleSubscribe();
  };

  const handleClearHistory = () => {
    setUserState(prev => ({ ...prev, history: [] }));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setInput(item.original);
    setOutput(item.humanized);
    setTone(item.tone);
    setEvalResult(null);
    setView(View.EDITOR);
    if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setMobileTab('output'); 
    }
  };

  // --- Render Helpers ---

  const renderDetector = () => {
    const charCount = detectorInput.length;
    const maxChars = 15000;
    const isOverLimit = charCount > maxChars;
    
    return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full animate-in fade-in duration-500">
        <div className="mb-8 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                Trusted GPT-5, ChatGPT and AI Detector tool
            </h1>
            <p className="text-slate-500 text-base sm:text-lg">
                The most Advanced and Reliable Chat GPT, GPT5 & AI Content Detector
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[700px]">
            {/* Input Side */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow h-[500px] lg:h-auto">
                 <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detect Text</span>
                     <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".txt,text/plain"
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload File
                        </label>
                        {detectorInput && (
                            <button 
                              onClick={() => {
                                setDetectorInput('');
                                setDetectionResult(null);
                              }} 
                              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              Clear
                            </button>
                        )}
                     </div>
                 </div>
                 <textarea
                    value={detectorInput}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue.length <= maxChars) {
                        setDetectorInput(newValue);
                        setDetectionResult(null); // Clear result when text changes
                      }
                    }}
                    placeholder="Paste your text here to check for AI traces..."
                    className="flex-1 w-full p-6 resize-none focus:outline-none text-slate-700 leading-relaxed placeholder:text-slate-300 text-base"
                    spellCheck={false}
                    maxLength={maxChars}
                  />
                  <div className="p-4 border-t border-slate-100 bg-slate-50/30 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                          <span className={`font-medium ${isOverLimit ? 'text-rose-600' : 'text-slate-500'}`}>
                              {charCount.toLocaleString()}/{maxChars.toLocaleString()} Characters
                          </span>
                          {isOverLimit && (
                              <span className="text-rose-600 font-semibold">Text will be truncated</span>
                          )}
                      </div>
                      <Button 
                        onClick={handleDetect} 
                        isLoading={isProcessing} 
                        disabled={!detectorInput.trim() || isOverLimit}
                        className="w-full py-3 text-base shadow-rose-500/20"
                      >
                          <ScanSearch className="w-5 h-5 mr-2" />
                          Detect Text
                      </Button>
                  </div>
            </div>

            {/* Result Side */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden hover:shadow-md transition-shadow min-h-[500px]">
                {!detectionResult ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center bg-slate-50/20">
                        <div className="bg-slate-50 p-6 rounded-3xl mb-6 shadow-inner">
                            <ScanSearch className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Awaiting Content</h3>
                        <p className="text-sm max-w-xs text-slate-500">Paste your text on the left to analyze against top AI detection models.</p>
                    </div>
                ) : (
                    <div className="flex-1 p-6 sm:p-8 flex flex-col h-full overflow-hidden">
                        <div className="text-center mb-6 shrink-0">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">AI Probability</span>
                            <div className="relative inline-flex items-center justify-center mb-4">
                                <svg className="w-32 h-32 sm:w-48 sm:h-48 transform -rotate-90 drop-shadow-lg">
                                    <circle
                                        className="text-slate-100"
                                        strokeWidth="12"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="64"
                                        cy="64"
                                    />
                                    <circle
                                        className={`${detectionResult.score > 60 ? 'text-rose-500' : detectionResult.score > 30 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                                        strokeWidth="12"
                                        strokeDasharray={364} // 2 * pi * 58
                                        strokeDashoffset={364 - (364 * detectionResult.score) / 100}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="64"
                                        cy="64"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className={`text-4xl sm:text-5xl font-extrabold tracking-tighter ${detectionResult.score > 60 ? 'text-rose-600' : detectionResult.score > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {detectionResult.score}%
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${
                                    detectionResult.score > 60 ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                    detectionResult.score > 30 ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}>
                                    {detectionResult.label}
                                </span>
                            </div>
                            {detectionResult.detectedModels && detectionResult.detectedModels.length > 0 && (
                                <div className="text-xs text-slate-500 mb-2">
                                    Possibly generated by: {detectionResult.detectedModels.join(', ')}
                                </div>
                            )}
                        </div>
                        
                        {/* Sentence Highlighting Section */}
                        {detectionResult.sentences && detectionResult.sentences.length > 0 && (
                            <div className="mb-4 shrink-0">
                                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-rose-500" />
                                    Highlighted Sentences (AI Detected)
                                </h4>
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-32 overflow-y-auto">
                                    <div className="space-y-2">
                                        {detectionResult.sentences
                                            .filter(s => s.isHighlighted)
                                            .slice(0, 5)
                                            .map((sentence, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="text-xs text-slate-700 p-2 bg-rose-50 border-l-2 border-rose-400 rounded"
                                                >
                                                    <span className="font-medium text-rose-700">{sentence.aiProbability}% AI:</span> {sentence.sentence.substring(0, 100)}{sentence.sentence.length > 100 ? '...' : ''}
                                                </div>
                                            ))}
                                        {detectionResult.sentences.filter(s => s.isHighlighted).length === 0 && (
                                            <p className="text-xs text-slate-500 italic">No sentences detected as AI-generated</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex-1 overflow-y-auto shadow-inner">
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-rose-500" />
                                Detection Analysis
                            </h4>
                            <p className="text-slate-600 text-sm leading-7 mb-4">
                                {detectionResult.analysis}
                            </p>
                            
                            {/* Metrics Display */}
                            {detectionResult.metrics && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <h5 className="text-xs font-bold text-slate-700 mb-2">Text Metrics</h5>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <span className="text-slate-500">Avg Sentence:</span>
                                            <span className="font-semibold text-slate-700 ml-1">{detectionResult.metrics.averageSentenceLength?.toFixed(1) || 'N/A'} words</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Vocabulary:</span>
                                            <span className="font-semibold text-slate-700 ml-1">{detectionResult.metrics.vocabularyRichness?.toFixed(1) || 'N/A'}%</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Burstiness:</span>
                                            <span className="font-semibold text-slate-700 ml-1">{detectionResult.metrics.burstiness?.toFixed(2) || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {detectionResult.score > 50 && (
                            <div className="mt-6 shrink-0 pt-4 border-t border-slate-100">
                                <Button 
                                    className="w-full shadow-lg shadow-rose-500/20"
                                    onClick={() => {
                                        setInput(detectorInput);
                                        setView(View.EDITOR);
                                    }}
                                >
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Humanize This Text Now
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
    );
  };

  const renderEditor = () => (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:flex-row bg-slate-50/50">
      {/* Sidebar (Desktop) */}
      <div 
        className={`hidden lg:block transition-all duration-300 border-r border-slate-200/60 bg-white ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden opacity-0'}`}
      >
        <History 
          items={userState.history} 
          onSelect={loadHistoryItem}
          onClear={handleClearHistory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex border-b border-slate-200 bg-white">
          <button 
            onClick={() => setMobileTab('input')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${mobileTab === 'input' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500'}`}
          >
             <PenLine className="w-4 h-4" /> Source
          </button>
          <button 
            onClick={() => setMobileTab('output')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${mobileTab === 'output' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500'}`}
          >
             <Sparkles className="w-4 h-4" /> Output
             {output && <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 rounded-full">1</span>}
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 z-20 px-3 sm:px-6 py-2 sm:py-3 flex flex-col gap-3 shadow-sm">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                title="Toggle Sidebar"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              
              <div className="h-5 w-px bg-slate-200 hidden lg:block"></div>

              {/* Basic Tone Select */}
              <div className="relative group flex-1 sm:flex-none">
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="appearance-none block w-full sm:w-40 rounded-lg border-slate-200 text-sm font-medium focus:border-rose-500 focus:ring-rose-500 bg-white py-2 pl-3 pr-8 shadow-sm hover:border-slate-300 transition-colors cursor-pointer text-slate-700 h-10"
                >
                  {Object.values(Tone).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              {/* Advanced Toggle */}
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all h-10 ${
                  showAdvanced 
                    ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                }`}
              >
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            
            <div className="flex items-center gap-2 ml-auto w-full lg:w-auto justify-end mt-1 lg:mt-0">
              <Button 
                variant="ghost" 
                size="md"
                onClick={() => { setInput(''); setOutput(''); setEvalResult(null); }}
                className="text-slate-500 font-normal hidden sm:flex h-10"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Clear
              </Button>
              <Button 
                onClick={handleHumanize} 
                isLoading={isProcessing}
                className="shadow-rose-500/20 w-full sm:w-auto h-10"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Humanize
              </Button>
            </div>
          </div>

          {/* Advanced Panel */}
          {showAdvanced && (
            <div className="pt-2 pb-1 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-1">
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Vocabulary Level</label>
                 <div className="relative">
                    <select 
                        value={vocabulary}
                        onChange={(e) => setVocabulary(e.target.value as Vocabulary)}
                        className="appearance-none block w-full rounded-lg border-slate-200 text-sm focus:border-rose-500 focus:ring-rose-500 bg-white shadow-sm py-2 px-3 text-slate-700 hover:border-slate-300 transition-colors"
                      >
                        {Object.values(Vocabulary).map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                 </div>
               </div>
               
               <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center pl-1 pr-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intensity</label>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 rounded">{intensity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-rose-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                     <span>Subtle</span>
                     <span>Balanced</span>
                     <span>Creative</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px] lg:min-h-[600px] max-w-screen-2xl mx-auto pb-20 lg:pb-0">
            
            {/* Input Card */}
            <div className={`flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-200 ${mobileTab === 'input' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Quote className="w-3 h-3" /> Source Text
                </span>
                <span className="text-xs font-medium text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{input.length} chars</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your AI content here to begin transformation..."
                className="flex-1 w-full p-4 sm:p-6 resize-none focus:outline-none text-slate-700 leading-8 placeholder:text-slate-300 rounded-b-2xl text-base bg-transparent"
                spellCheck={false}
              />
            </div>

            {/* Output Card */}
            <div className={`flex-col h-full rounded-2xl border transition-all duration-300 relative overflow-hidden ${output ? 'bg-white border-rose-200 shadow-lg shadow-rose-100/50' : 'bg-slate-100/40 border-slate-200 border-dashed'} ${mobileTab === 'output' ? 'flex' : 'hidden lg:flex'}`}>
               <div className={`px-5 py-4 border-b flex justify-between items-center rounded-t-2xl ${output ? 'bg-white border-rose-50' : 'bg-transparent border-slate-200'}`}>
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${output ? 'text-rose-600' : 'text-slate-400'}`}>
                  <Sparkles className="w-3 h-3" /> Humanized Output
                </span>
                {output && (
                  <div className="flex items-center gap-2">
                     <button
                        onClick={handleEvaluate}
                        className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200 mr-1"
                        title="Analyze quality metrics"
                        disabled={isEvaluating}
                     >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">{isEvaluating ? 'Checking...' : 'Check Quality'}</span>
                     </button>
                    <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                    <button 
                      onClick={handleCopy}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
              
              {output ? (
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto leading-8 text-slate-800 whitespace-pre-wrap font-medium pb-32 lg:pb-6">
                      {output}
                    </div>

                    {/* Quality Report Overlay */}
                    {evalResult && (
                        <div className="bg-white/95 backdrop-blur border-t border-rose-100 p-4 sm:p-5 animate-in slide-in-from-bottom-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] absolute bottom-0 left-0 right-0 max-h-[50%] overflow-y-auto">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-rose-500" />
                                        Quality Analysis
                                    </h4>
                                    <button onClick={() => setEvalResult(null)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                    <div className="bg-slate-50 p-2 sm:p-4 rounded-xl border border-slate-100 text-center flex flex-col items-center justify-center">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Human Score</span>
                                        <span className={`font-black text-xl sm:text-2xl ${evalResult.humanScore > 85 ? 'text-emerald-500' : evalResult.humanScore > 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                                            {evalResult.humanScore}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-2 sm:p-4 rounded-xl border border-slate-100 text-center flex flex-col items-center justify-center">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Meaning</span>
                                        <div className="flex justify-center items-center h-8">
                                            {evalResult.meaningPreserved ? (
                                                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs sm:text-sm">
                                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> Preserved
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-rose-600 font-bold text-xs sm:text-sm">
                                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Changed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-2 sm:p-4 rounded-xl border border-slate-100 text-center flex flex-col justify-center">
                                         <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Variety</span>
                                         <span className="text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">
                                             {evalResult.sentenceVariety}
                                         </span>
                                    </div>
                                </div>
                                <div className="bg-rose-50 p-3 rounded-lg text-xs font-medium text-rose-800 border border-rose-100 flex gap-2">
                                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                                    "{evalResult.feedback}"
                                </div>
                            </div>
                        </div>
                    )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                  <div className="bg-white p-5 rounded-full shadow-sm mb-5 border border-slate-100">
                     <Wand2 className="w-8 h-8 text-rose-200" />
                  </div>
                  <p className="font-semibold text-slate-600 text-lg">Waiting to humanize</p>
                  <p className="text-sm mt-2 max-w-[200px] leading-relaxed text-slate-400">Your undetectable, natural text will be generated here.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
       {/* Conditional Rendering for Views */}
       {view === View.LANDING && <LandingPage onGetStarted={() => setView(View.AUTH)} />}

       {view === View.AUTH && <AuthPage onLoginSuccess={handleLoginSuccess} onBack={() => setView(View.LANDING)} onForgotPassword={() => setView(View.RESET_PASSWORD)} />}
       
       {view === View.VERIFY_EMAIL && <VerifyEmail onBack={() => setView(View.LANDING)} />}
       
       {view === View.RESET_PASSWORD && <ResetPassword onBack={() => setView(View.AUTH)} />}
       
       {view === View.PAYMENT_SUCCESS && <PaymentSuccess onPaymentSuccess={handlePaymentSuccess} onBack={() => setView(View.EDITOR)} />}

       {view === View.PRIVACY_POLICY && <PrivacyPolicy onBack={() => setView(userState.isLoggedIn ? View.EDITOR : View.LANDING)} />}
       {view === View.TERMS_CONDITIONS && <TermsConditions onBack={() => setView(userState.isLoggedIn ? View.EDITOR : View.LANDING)} />}
       {view === View.RETURN_POLICY && <ReturnPolicy onBack={() => setView(userState.isLoggedIn ? View.EDITOR : View.LANDING)} />}
       {view === View.ADMIN_DASHBOARD && <AdminDashboard onBack={() => setView(userState.isLoggedIn ? View.EDITOR : View.LANDING)} />}

       {(view !== View.LANDING && view !== View.AUTH && view !== View.VERIFY_EMAIL && view !== View.RESET_PASSWORD && view !== View.PAYMENT_SUCCESS && view !== View.PRIVACY_POLICY && view !== View.TERMS_CONDITIONS && view !== View.RETURN_POLICY && view !== View.ADMIN_DASHBOARD) && (
        <>
          <Header 
            currentView={view} 
            onChangeView={setView} 
            isPremium={userState.isPremium} 
            onLogout={handleLogout}
            user={userState.user}
          />
          <main className="flex-1 bg-slate-50 relative">
             {view === View.EDITOR && renderEditor()}
             {view === View.DETECTOR && renderDetector()}
             {view === View.PRICING && <Pricing onSubscribe={handleSubscribe} onPaymentSuccess={handlePaymentSuccess} isPremium={userState.isPremium} userId={userState.user?.id} />}
             {view === View.HISTORY && (
                <div className="h-full bg-white">
                    <History items={userState.history} onSelect={loadHistoryItem} onClear={handleClearHistory} />
                </div>
             )}
             {view === View.PROFILE && (
                <Profile 
                    user={userState.user || { id: 'guest', name: 'Guest', email: '', isPremium: false }} 
                    history={userState.history}
                    onLogout={handleLogout}
                    onUpgrade={() => setView(View.PRICING)}
                    onUserUpdate={(updatedUser) => {
                      setUserState(prev => ({
                        ...prev,
                        user: updatedUser,
                        isPremium: updatedUser.isPremium || false
                      }));
                    }}
                    onNavigateToAdmin={() => setView(View.ADMIN_DASHBOARD)}
                />
             )}
             {view === View.ADMIN_DASHBOARD && (
                <AdminDashboard onBack={() => setView(View.PROFILE)} />
             )}
          </main>
          <footer className="py-4 px-4 border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-slate-400 text-xs sm:text-sm">
                  © 2025 MinihaAI. All rights reserved. <span className="font-semibold text-slate-500">Developed By Sahil Haq</span>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
                  <button onClick={() => setView(View.PRIVACY_POLICY)} className="text-slate-500 hover:text-slate-700 transition-colors">
                    Privacy Policy
                  </button>
                  <button onClick={() => setView(View.TERMS_CONDITIONS)} className="text-slate-500 hover:text-slate-700 transition-colors">
                    Terms & Conditions
                  </button>
                  <button onClick={() => setView(View.RETURN_POLICY)} className="text-slate-500 hover:text-slate-700 transition-colors">
                    Return Policy
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </>
       )}
       
    </div>
  );
};

export default App;