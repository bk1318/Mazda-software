/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  Star, 
  Navigation, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Menu,
  X,
  MessageCircle,
  FileText,
  Globe,
  Moon,
  Sun,
  Upload,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Language, t } from './translations';
import { openWhatsApp, calculateDistance, generateInvoice } from './utils';

// --- Types ---

type Role = 'client' | 'driver';

interface MazdaModel {
  id: string;
  name: string;
  type: string;
  image: string;
  pricePerKm: number;
}

interface Ad {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  content: string;
  vehicleType?: string;
  createdAt: number;
  phone?: string;
  budget?: number;
  pickup?: string;
  destination?: string;
  weight?: string;
  image?: string;
}

// --- Mock Data ---

const VEHICLE_TYPES = [
  'Mazda 16 ft',
  'Mazda 18 ft',
  'Hyundai',
  'Shezore',
  'Mazda container body',
  'Shezore container body'
];

const MAZDA_MODELS: MazdaModel[] = [
  { 
    id: 'm16', 
    name: 'Mazda 16 ft', 
    type: 'Truck', 
    image: 'https://images.unsplash.com/photo-1586191582151-f746323d1899?auto=format&fit=crop&q=80&w=800',
    pricePerKm: 3.5 
  },
  { 
    id: 'm18', 
    name: 'Mazda 18 ft', 
    type: 'Truck', 
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    pricePerKm: 4.2 
  },
  { 
    id: 'hundai', 
    name: 'Hyundai', 
    type: 'Pickup', 
    image: 'https://images.unsplash.com/photo-1591860454444-53d301149508?auto=format&fit=crop&q=80&w=800',
    pricePerKm: 2.8 
  },
  { 
    id: 'shezore', 
    name: 'Shezore', 
    type: 'Mini Truck', 
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800',
    pricePerKm: 2.2 
  },
  { 
    id: 'm-container', 
    name: 'Mazda Container Body', 
    type: 'Container', 
    image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800',
    pricePerKm: 5.5 
  },
  { 
    id: 's-container', 
    name: 'Shezore Container Body', 
    type: 'Container', 
    image: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&q=80&w=800',
    pricePerKm: 3.8 
  },
];

// --- Components ---

const ProfileSettings = ({ lang, onClose, role, theme }: { lang: Language, onClose: () => void, role: Role, theme: 'dark'|'light' }) => {
  const [profilePic, setProfilePic] = useState<string | null>(() => localStorage.getItem('profilePic'));
  const [vehiclePic, setVehiclePic] = useState<string | null>(() => localStorage.getItem('vehiclePic'));
  const [cnicStatus, setCnicStatus] = useState<'unverified' | 'pending' | 'verified'>(() => (localStorage.getItem('cnicStatus') as any) || 'unverified');
  const [licenseStatus, setLicenseStatus] = useState<'unverified' | 'pending' | 'verified'>(() => (localStorage.getItem('licenseStatus') as any) || 'unverified');
  const [name, setName] = useState(() => localStorage.getItem('name') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('phone') || '');

  useEffect(() => {
    if (profilePic) localStorage.setItem('profilePic', profilePic);
    if (vehiclePic) localStorage.setItem('vehiclePic', vehiclePic);
    localStorage.setItem('cnicStatus', cnicStatus);
    localStorage.setItem('licenseStatus', licenseStatus);
    localStorage.setItem('name', name);
    localStorage.setItem('phone', phone);
  }, [profilePic, vehiclePic, cnicStatus, licenseStatus, name, phone]);

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePic(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleVehicleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVehiclePic(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCnicUpload = () => {
    setCnicStatus('pending');
    alert(t(lang, 'success'));
  };

  const handleLicenseUpload = () => {
    setLicenseStatus('pending');
    alert(t(lang, 'success'));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg border rounded-3xl p-8 max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#151515] border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t(lang, 'profile')}</h2>
          <button onClick={onClose} className={`${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}><X /></button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className={`w-24 h-24 rounded-full border-2 overflow-hidden flex items-center justify-center ${theme === 'dark' ? 'bg-white/10 border-white' : 'bg-black/10 border-black'}`}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className={`w-10 h-10 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`} />
              )}
            </div>
            {role === 'driver' && (
              <div className="flex items-center gap-2">
                {cnicStatus === 'verified' && <span className={`text-xs px-2 py-1 rounded-full font-bold ${theme === 'dark' ? 'bg-white/20 text-white' : 'bg-black/20 text-black'}`}>{t(lang, 'verifiedDriver')}</span>}
                {cnicStatus === 'pending' && <span className={`text-xs px-2 py-1 rounded-full font-bold ${theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-black/10 text-black/60'}`}>{t(lang, 'verificationPending')}</span>}
                {cnicStatus === 'unverified' && <span className={`text-xs px-2 py-1 rounded-full font-bold ${theme === 'dark' ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'}`}>Unverified</span>}
              </div>
            )}
            <label className={`cursor-pointer text-xs font-bold px-4 py-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}>
              {t(lang, 'uploadPhoto')}
              <input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'fullName')}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`} 
              />
            </div>
            <div>
              <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'phone')}</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 0000000" 
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`} 
              />
            </div>
          </div>

          {role === 'driver' && (
            <>
              <div className={`border rounded-2xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}><Car className="w-4 h-4" /> Vehicle Picture</h3>
                <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>Upload a clear picture of your vehicle.</p>
                <label className={`cursor-pointer text-xs font-bold px-4 py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'border-white/20 hover:bg-white/5 text-white' : 'border-black/20 hover:bg-black/5 text-black'}`}>
                  <Upload className="w-4 h-4" />
                  {vehiclePic ? 'Vehicle Image Selected' : 'Upload Vehicle Picture'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleVehicleUpload} />
                </label>
                {vehiclePic && (
                  <div className="mt-4 w-full h-32 rounded-xl overflow-hidden">
                    <img src={vehiclePic} alt="Vehicle Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className={`border rounded-2xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}><FileText className="w-4 h-4" /> {t(lang, 'cnicUpload')}</h3>
                <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>Upload front and back of your CNIC for verification.</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-black/20 hover:bg-black/5'}`}>
                    <Upload className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`} />
                    <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Front Side</span>
                  </div>
                  <div className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-black/20 hover:bg-black/5'}`}>
                    <Upload className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`} />
                    <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Back Side</span>
                  </div>
                </div>
                <button onClick={handleCnicUpload} className={`w-full font-bold py-3 rounded-xl text-sm ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  Submit CNIC
                </button>
              </div>

              <div className={`border rounded-2xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}><FileText className="w-4 h-4" /> Driving License</h3>
                <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>Upload your valid driving license.</p>
                <div className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-4 ${theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-black/20 hover:bg-black/5'}`}>
                  <Upload className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`} />
                  <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Upload License</span>
                </div>
                <button onClick={handleLicenseUpload} className={`w-full font-bold py-3 rounded-xl text-sm ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  Submit License
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  return new GoogleGenAI({ apiKey });
};

const AiAssistant = ({ theme }: { theme: 'dark'|'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const ai = getAi();
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a Mazda Connect assistant. Help users with vehicle types (Mazda 16ft, 18ft, Hyundai, Shezore, Container bodies) and general booking questions. User asks: ${query}`,
      });
      setResponse(result.text || "I'm sorry, I couldn't process that.");
    } catch (error) {
      console.error("AI Error:", error);
      setResponse("Error connecting to AI. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-black/10 hover:bg-black/20 border-black/20 text-black'}`}
      >
        <Search className="w-4 h-4" />
        AI Assistant
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-full right-0 mt-4 w-80 border rounded-2xl p-4 shadow-2xl z-[60] ${theme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white/95 border-black/10'}`}
          >
            <div className="space-y-4">
              <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Mazda AI Helper</h3>
              <div className={`max-h-40 overflow-y-auto text-xs leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                {response || "Ask me anything about our vehicles or how to book!"}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="How do I book a 16ft Mazda?"
                  className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button 
                  onClick={handleAsk}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}
                >
                  {loading ? "..." : "Ask"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthScreen = ({ onLogin, lang, setLang, theme }: { onLogin: (role: Role) => void, lang: Language, setLang: (l: Language) => void, theme: 'dark'|'light' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>('client');

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-gray-100'}`}>
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className={`flex items-center gap-2 transition-colors text-sm font-bold ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
        >
          <Globe className="w-4 h-4" />
          {lang === 'en' ? 'اردو' : 'English'}
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md border rounded-3xl p-8 backdrop-blur-xl ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-xl'}`}
      >
        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <Car className={`w-7 h-7 ${theme === 'dark' ? 'text-black' : 'text-white'}`} />
          </div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Mazda Connect</h2>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{isLogin ? t(lang, 'welcomeBack') : t(lang, 'createAccount')}</p>
        </div>

        <div className={`flex rounded-xl p-1 mb-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
          <button 
            onClick={() => setRole('client')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'client' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white') : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black')}`}
          >
            {t(lang, 'client')}
          </button>
          <button 
            onClick={() => setRole('driver')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'driver' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white') : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black')}`}
          >
            {t(lang, 'driver')}
          </button>
        </div>

        <div className="space-y-4">
          <input type="email" placeholder={t(lang, 'emailAddress')} className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-white/50' : 'bg-black/5 border-black/10 text-black focus:border-black/50'}`} />
          <input type="password" placeholder={t(lang, 'password')} className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-white/50' : 'bg-black/5 border-black/10 text-black focus:border-black/50'}`} />
          {!isLogin && <input type="text" placeholder={t(lang, 'fullName')} className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-white/50' : 'bg-black/5 border-black/10 text-black focus:border-black/50'}`} />}
          
          <button 
            onClick={() => onLogin(role)}
            className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-white text-black shadow-white/10' : 'bg-black text-white shadow-black/10'}`}
          >
            {isLogin ? t(lang, 'login') : t(lang, 'signUp')}
          </button>
        </div>

        <p className={`text-center text-xs mt-6 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
          {isLogin ? t(lang, 'dontHaveAccount') : t(lang, 'alreadyHaveAccount')}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className={`font-bold hover:underline ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {isLogin ? t(lang, 'signUp') : t(lang, 'login')}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const AdPostModal = ({ role, onPost, onClose, lang, theme }: { role: Role, onPost: (content: string, vehicle?: string, image?: string) => void, onClose: () => void, lang: Language, theme: 'dark'|'light' }) => {
  const [content, setContent] = useState('');
  const [vehicle, setVehicle] = useState(VEHICLE_TYPES[0]);
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg border rounded-3xl p-8 ${theme === 'dark' ? 'bg-[#151515] border-white/10' : 'bg-white border-black/10'}`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t(lang, 'postAnAd')}</h2>
        <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'adExpiresIn')}</p>
        
        <div className="space-y-4">
          <div>
            <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'whatDoYouNeed')}</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={role === 'client' ? "Need a 16ft Mazda for shifting..." : "Available for long routes with 18ft Mazda..."}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none min-h-[120px] ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
            />
          </div>

          <div>
            <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'vehicleType')}</label>
            <select 
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
            >
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={`cursor-pointer text-xs font-bold px-4 py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'border-white/20 hover:bg-white/5 text-white' : 'border-black/20 hover:bg-black/5 text-black'}`}>
              <Upload className="w-4 h-4" />
              {image ? 'Image Selected' : 'Upload Picture (Optional)'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {image && (
              <div className="mt-2 w-full h-32 rounded-xl overflow-hidden">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className={`flex-1 py-3 rounded-xl border font-bold ${theme === 'dark' ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}>{t(lang, 'cancel')}</button>
            <button 
              onClick={() => onPost(content, vehicle, image || undefined)}
              className={`flex-1 py-3 rounded-xl font-bold ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}
            >
              {t(lang, 'postAd')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ role, setRole, onLogout, lang, setLang, theme, setTheme, onProfileClick }: { role: Role, setRole: (r: Role) => void, onLogout: () => void, lang: Language, setLang: (l: Language) => void, theme: 'dark'|'light', setTheme: (t: 'dark'|'light') => void, onProfileClick: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b px-6 py-4 ${theme === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white/90 border-black/10'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}>
            <Car className={`w-5 h-5 ${theme === 'dark' ? 'text-black' : 'text-white'}`} />
          </div>
          <span className={`font-bold text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>MAZDA <span className="font-light opacity-70">CONNECT</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <AiAssistant theme={theme} />
          <div className={`h-4 w-[1px] ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`} />
          
          <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className={`text-sm font-bold flex items-center gap-1 ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
            <Globe className="w-4 h-4" /> {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button onClick={onProfileClick} className={`${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
            <User className="w-5 h-5" />
          </button>

          <button onClick={onLogout} className={`${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'} transition-colors`}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <button className={`md:hidden ${theme === 'dark' ? 'text-white' : 'text-black'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-full left-0 right-0 border-b p-6 md:hidden ${theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}
          >
            <div className="flex flex-col gap-4">
              <button onClick={() => { onProfileClick(); setIsMenuOpen(false); }} className={`text-left py-2 border-b ${theme === 'dark' ? 'text-white border-white/5' : 'text-black border-black/5'}`}>{t(lang, 'profile')}</button>
              <button onClick={() => { setLang(lang === 'en' ? 'ur' : 'en'); setIsMenuOpen(false); }} className={`text-left py-2 border-b ${theme === 'dark' ? 'text-white border-white/5' : 'text-black border-black/5'}`}>Language: {lang === 'en' ? 'اردو' : 'English'}</button>
              <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsMenuOpen(false); }} className={`text-left py-2 border-b ${theme === 'dark' ? 'text-white border-white/5' : 'text-black border-black/5'}`}>Theme: {theme === 'dark' ? 'Light' : 'Dark'}</button>
              <button onClick={onLogout} className={`text-left py-2 font-bold ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>{t(lang, 'logout')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ClientDashboard = ({ ads, onPostClick, lang, theme, onDeleteAd }: { ads: Ad[], onPostClick: () => void, lang: Language, theme: 'dark'|'light', onDeleteAd: (id: string) => void }) => {
  return (
    <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto space-y-8">
      <div className={`border rounded-3xl p-12 text-center ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
        <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t(lang, 'clientDashboard')}</h2>
        <p className={`mb-8 max-w-lg mx-auto ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
          {t(lang, 'premiumDesc')}
        </p>
        <button 
          onClick={onPostClick}
          className={`px-8 py-4 rounded-xl font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2 mx-auto ${theme === 'dark' ? 'bg-white text-black shadow-white/10' : 'bg-black text-white shadow-black/10'}`}
        >
          <Plus className="w-5 h-5" />
          {t(lang, 'postAd')}
        </button>
      </div>

      <div className={`border rounded-3xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
        <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}><Search className="w-4 h-4" /> {t(lang, 'filters')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'priceRange')}</label>
            <div className="flex gap-2">
              <input type="number" placeholder={t(lang, 'minPrice')} className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/40 border-black/10 text-black'}`} />
              <input type="number" placeholder={t(lang, 'maxPrice')} className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/40 border-black/10 text-black'}`} />
            </div>
          </div>
          <div>
            <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'location')}</label>
            <input type="text" placeholder="City or Area" className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/40 border-black/10 text-black'}`} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${theme === 'dark' ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'}`}>{t(lang, 'clearFilters')}</button>
          <button className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>{t(lang, 'applyFilters')}</button>
        </div>
      </div>

      <div>
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t(lang, 'liveAds')}</h2>
        <div className="grid grid-cols-1 gap-4">
          {ads.length === 0 ? (
            <div className={`col-span-full p-12 text-center border border-dashed rounded-3xl uppercase tracking-widest font-bold ${theme === 'dark' ? 'border-white/10 text-white/20' : 'border-black/10 text-black/20'}`}>
              {t(lang, 'noActiveAds')}
            </div>
          ) : (
            ads.map(ad => (
              <div key={ad.id} className={`border rounded-2xl p-6 space-y-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>{ad.userRole}</span>
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{new Date(ad.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ad.content}</p>
                
                {ad.image && (
                  <div className="w-full h-48 rounded-xl overflow-hidden mt-4">
                    <img src={ad.image} alt="Ad attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
                    <User className={`w-4 h-4 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`} />
                  </div>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ad.userName}</span>
                  {ad.vehicleType && <span className={`ml-auto text-[10px] px-3 py-1 rounded-full font-bold ${theme === 'dark' ? 'text-white/60 bg-white/10' : 'text-black/60 bg-black/10'}`}>{ad.vehicleType}</span>}
                </div>
                <div className="pt-2 flex justify-between items-center">
                  {ad.userId === 'user-1' && (
                    <button 
                      onClick={() => onDeleteAd(ad.id)}
                      className={`text-xs font-bold transition-colors ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                    >
                      Delete Ad
                    </button>
                  )}
                  {ad.userRole === 'driver' && (
                    <button 
                      onClick={() => openWhatsApp(ad.phone || '+923000000000', ad.userName)}
                      className="flex items-center gap-1 bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors ml-auto"
                    >
                      <MessageCircle className="w-4 h-4" /> {t(lang, 'whatsapp')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const DriverDashboard = ({ ads, onPostClick, lang, theme, onDeleteAd }: { ads: Ad[], onPostClick: () => void, lang: Language, theme: 'dark'|'light', onDeleteAd: (id: string) => void }) => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t(lang, 'driverDashboard')}</h2>
        <button 
          onClick={onPostClick}
          className={`text-xs font-bold px-6 py-3 rounded-xl shadow-lg transition-all ${theme === 'dark' ? 'bg-white text-black shadow-white/10' : 'bg-black text-white shadow-black/10'}`}
        >
          {t(lang, 'postVehicleAd')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-3xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
              <DollarSign className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
            </div>
            <span className={`text-xs font-bold flex items-center gap-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className={`text-xs uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'todaysEarnings')}</p>
          <h3 className={`text-3xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Rs. 28450</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`border rounded-3xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
              <Navigation className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
            </div>
          </div>
          <p className={`text-xs uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'totalTrips')}</p>
          <h3 className={`text-3xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>14</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`border rounded-3xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
              <Star className={`w-6 h-6 ${theme === 'dark' ? 'text-white fill-white' : 'text-black fill-black'}`} />
            </div>
          </div>
          <p className={`text-xs uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'rating')}</p>
          <h3 className={`text-3xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>4.98</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-3xl p-6 border transition-all ${
            isOnline 
              ? (theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30') 
              : (theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10')
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <span className={`text-xs font-bold uppercase tracking-widest ${isOnline ? (theme === 'dark' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-white/40' : 'text-black/40')}`}>
              {isOnline ? t(lang, 'online') : t(lang, 'offline')}
            </span>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isOnline ? (theme === 'dark' ? 'bg-white' : 'bg-black') : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}
            >
              <motion.div 
                animate={{ x: isOnline ? 24 : 4 }}
                className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${isOnline ? (theme === 'dark' ? 'bg-black' : 'bg-white') : (theme === 'dark' ? 'bg-white' : 'bg-black')}`}
              />
            </button>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {isOnline ? t(lang, 'visibleToClients') : t(lang, 'goOnlineToReceive')}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className={`border rounded-3xl p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}><Search className="w-4 h-4" /> {t(lang, 'filters')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'priceRange')}</label>
                <div className="flex gap-2">
                  <input type="number" placeholder={t(lang, 'minPrice')} className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/40 border-black/10 text-black'}`} />
                  <input type="number" placeholder={t(lang, 'maxPrice')} className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/40 border-black/10 text-black'}`} />
                </div>
              </div>
              <div>
                <label className={`text-xs uppercase tracking-widest font-bold mb-2 block ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{t(lang, 'location')}</label>
                <input type="text" placeholder="City or Area" className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/40 border-black/10 text-black'}`} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${theme === 'dark' ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'}`}>{t(lang, 'clearFilters')}</button>
              <button className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>{t(lang, 'applyFilters')}</button>
            </div>
          </div>

          <h2 className={`text-2xl font-bold mt-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t(lang, 'liveAds')}</h2>
          <div className="grid grid-cols-1 gap-4">
            {ads.length === 0 ? (
              <div className={`col-span-full p-12 text-center border border-dashed rounded-3xl uppercase tracking-widest font-bold ${theme === 'dark' ? 'border-white/10 text-white/20' : 'border-black/10 text-black/20'}`}>
                {t(lang, 'noActiveAds')}
              </div>
            ) : (
              ads.map(ad => (
                <div key={ad.id} className={`border rounded-2xl p-4 space-y-2 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>{ad.userRole}</span>
                    <span className={`text-[10px] ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}>{new Date(ad.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ad.content}</p>
                  
                  {ad.image && (
                    <div className="w-full h-48 rounded-xl overflow-hidden mt-4">
                      <img src={ad.image} alt="Ad attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
                      <User className={`w-4 h-4 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`} />
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>{ad.userName}</span>
                    {ad.vehicleType && <span className={`ml-auto text-[10px] px-2 py-1 rounded-md ${theme === 'dark' ? 'text-white/40 bg-white/5' : 'text-black/40 bg-black/5'}`}>{ad.vehicleType}</span>}
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    {ad.userId === 'user-1' && (
                      <button 
                        onClick={() => onDeleteAd(ad.id)}
                        className={`text-xs font-bold transition-colors ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                      >
                        Delete Ad
                      </button>
                    )}
                    {ad.userRole === 'client' && (
                      <button 
                        onClick={() => openWhatsApp(ad.phone || '+923000000000', ad.userName)}
                        className="flex items-center gap-1 bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ml-auto"
                      >
                        <MessageCircle className="w-3 h-3" /> {t(lang, 'whatsapp')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Your Vehicle</h2>
          <div className={`border rounded-3xl p-6 space-y-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img 
                src={localStorage.getItem('vehiclePic') || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"} 
                alt="My Mazda"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-black'}`}>My Vehicle</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>ABC-1234</p>
            </div>
            <div className={`pt-4 border-t grid grid-cols-2 gap-4 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>Insurance</p>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Active</p>
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>Next Service</p>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>1,240 km</p>
              </div>
            </div>
            <button className={`w-full py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'border-white/10 text-white/60 hover:text-white hover:bg-white/5' : 'border-black/10 text-black/60 hover:text-black hover:bg-black/5'}`}>
              <Settings className="w-4 h-4" />
              Vehicle Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('role') as Role) || 'client');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [ads, setAds] = useState<Ad[]>(() => {
    const saved = localStorage.getItem('ads');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');

  useEffect(() => {
    localStorage.setItem('role', role);
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
    localStorage.setItem('ads', JSON.stringify(ads));
    localStorage.setItem('lang', lang);
    localStorage.setItem('theme', theme);
  }, [role, isLoggedIn, ads, lang, theme]);

  // Auto-expire ads after 12 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      setAds(prev => prev.filter(ad => now - ad.createdAt < twelveHours));
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
  };

  const handleDeleteAd = (id: string) => {
    setAds(ads.filter(ad => ad.id !== id));
  };

  const handlePostAd = (content: string, vehicle?: string, image?: string) => {
    const newAd: Ad = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'user-1',
      userName: role === 'client' ? 'Sarah Johnson' : 'John Driver',
      userRole: role,
      content,
      vehicleType: vehicle,
      image,
      createdAt: Date.now(),
      phone: '+923000000000'
    };
    setAds([newAd, ...ads]);
    setIsAdModalOpen(false);
  };

  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} lang={lang} setLang={setLang} theme={theme} />;
  }

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[#050505] text-white selection:bg-white/20' : 'bg-gray-50 text-black selection:bg-black/20'}`}>
      <Navbar 
        role={role} 
        setRole={setRole} 
        onLogout={() => setIsLoggedIn(false)} 
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onProfileClick={() => setIsProfileOpen(true)}
      />
      
      <main>
        <AnimatePresence mode="wait">
          {role === 'client' ? (
            <motion.div
              key="client"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ClientDashboard ads={ads} onPostClick={() => setIsAdModalOpen(true)} lang={lang} theme={theme} onDeleteAd={handleDeleteAd} />
            </motion.div>
          ) : (
            <motion.div
              key="driver"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DriverDashboard ads={ads} onPostClick={() => setIsAdModalOpen(true)} lang={lang} theme={theme} onDeleteAd={handleDeleteAd} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isAdModalOpen && (
        <AdPostModal 
          role={role} 
          onPost={handlePostAd} 
          onClose={() => setIsAdModalOpen(false)} 
          lang={lang}
          theme={theme}
        />
      )}

      {isProfileOpen && (
        <ProfileSettings lang={lang} onClose={() => setIsProfileOpen(false)} role={role} theme={theme} />
      )}

      {/* Footer */}
      <footer className={`border-t py-12 px-6 mt-12 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`}>
              <Car className={`w-3 h-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
            </div>
            <span className={`font-bold text-sm tracking-tight ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>MAZDA CONNECT</span>
          </div>
          
          <div className={`flex gap-8 text-xs font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
            <a href="#" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>Privacy Policy</a>
            <a href="#" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>Terms of Service</a>
            <a href="#" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>Support</a>
            <a href="#" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>Safety</a>
          </div>

          <div className={`text-[10px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}>
            © 2024 Mazda Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
