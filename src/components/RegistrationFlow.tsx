import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  Shield, 
  ArrowRight, 
  X, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  User,
  FileText
} from 'lucide-react';

import { User as UserType } from '../types';

interface RegistrationFlowProps {
  onComplete: (user: UserType) => void;
  onCancel: () => void;
  appConfig: { name: string, logo: string };
}

type Step = 'phone' | 'otp' | 'password' | 'nrc' | 'passport' | 'selfie' | 'success';

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onComplete, onCancel, appConfig }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [nrcNumber, setNrcNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [nrcFront, setNrcFront] = useState<string | null>(null);
  const [nrcBack, setNrcBack] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  const validatePassword = (pass: string) => {
    let strength = 0;
    const feedback: string[] = [];
    
    if (pass.length >= 8) {
      strength += 1;
    } else {
      feedback.push('At least 8 characters');
    }
    
    if (/[A-Z]/.test(pass)) {
      strength += 1;
    } else {
      feedback.push('One uppercase letter');
    }
    
    if (/[0-9]/.test(pass)) {
      strength += 1;
    } else {
      feedback.push('One number');
    }
    
    if (/[^A-Za-z0-9]/.test(pass)) {
      strength += 1;
    } else {
      feedback.push('One special character');
    }
    
    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const [otpError, setOtpError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length >= 9) {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const users: UserType[] = await res.json();
          const existingUser = users.find(u => u.phone === phoneNumber || u.nrc === nrcNumber);
          if (existingUser) {
            alert('Your information has registered in our system, please login.');
            onCancel(); // Close registration and let them login
            return;
          }
        }
      } catch (e) {
        console.error('Error checking existing user:', e);
        const storedUsers: UserType[] = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
        const existingUser = storedUsers.find(u => u.phone === phoneNumber || u.nrc === nrcNumber);
        if (existingUser) {
          alert('Your information has registered in our system, please login.');
          onCancel();
          return;
        }
      }

      setStep('otp');
      // Generate 6-digit secure OTP
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const newOtp = (array[0] % 900000 + 100000).toString();
      setGeneratedOtp(newOtp);
      console.log('OTP Sent to +260' + phoneNumber + ': ' + newOtp);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === generatedOtp) {
      setStep('password');
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code. Please try again.');
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordStrength >= 3) {
      setStep('nrc');
    }
  };

  const handleNrcFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNrcFront(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNrcBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNrcBack(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    const newUser: UserType = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: 'default_admin', // Default to main admin
      name: userName,
      phone: phoneNumber,
      nrc: nrcNumber,
      password: password,
      isRegistered: true,
      nrcFront: nrcFront || undefined,
      nrcBack: nrcBack || undefined,
      selfiePhoto: selfiePhoto || undefined,
      passportPhoto: passportPhoto || undefined,
      balance: 0,
      isVerified: false
    };

    try {
      // Save to backend
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      // Send Welcome Notification via API
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUser.id,
          title: `Welcome to ${appConfig.name}`,
          message: 'Your account has been created. Please wait for document verification.',
          isRead: false,
          type: 'system'
        })
      });
      
      // Notify Admin via API
      await fetch('/api/admin-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New User Registration',
          message: `${newUser.name} (+260 ${newUser.phone}) has registered and is awaiting verification.`,
          userId: newUser.id,
          type: 'registration',
          isRead: false
        })
      });

      onComplete(newUser);
    } catch (error) {
      console.error('Failed to register user on backend, falling back to local storage:', error);
      const existingUsers = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
      localStorage.setItem('moneylink_users', JSON.stringify([...existingUsers, newUser]));
      
      // Send Welcome Notification
      const notifications = JSON.parse(localStorage.getItem('moneylink_notifications') || '[]');
      notifications.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: newUser.id,
        title: `Welcome to ${appConfig.name}`,
        message: 'Your account has been created. Please wait for document verification.',
        date: new Date().toLocaleString(),
        isRead: false,
        type: 'system'
      });
      localStorage.setItem('moneylink_notifications', JSON.stringify(notifications));
      
      // Notify Admin
      const adminNotifications = JSON.parse(localStorage.getItem('moneylink_admin_notifications') || '[]');
      adminNotifications.push({
        id: Math.random().toString(36).substr(2, 9),
        title: 'New User Registration',
        message: `${newUser.name} (+260 ${newUser.phone}) has registered and is awaiting verification.`,
        time: new Date().toLocaleString(),
        isRead: false,
        userId: newUser.id,
        type: 'registration'
      });
      localStorage.setItem('moneylink_admin_notifications', JSON.stringify(adminNotifications));

      onComplete(newUser);
    }
  };

  const steps: Step[] = ['phone', 'otp', 'password', 'nrc', 'passport', 'selfie', 'success'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 hover:bg-[#F0F0F0] rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-[#999]" />
        </button>

        <div className="p-8">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {steps.filter(s => s !== 'success').map((s, i) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStepIndex ? 'bg-green-700' : 'bg-[#F0F0F0]'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Registration</h2>
                  <p className="text-[#666] text-sm mt-2 leading-relaxed">
                    Enter your details to create your {appConfig.name} account.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]">
                      <User className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold focus:outline-none focus:border-green-700 transition-colors"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      value={nrcNumber}
                      onChange={(e) => setNrcNumber(e.target.value.replace(/[^0-9/]/g, ''))}
                      className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold focus:outline-none focus:border-green-700 transition-colors"
                      placeholder="NRC Number (e.g. 123456/78/1)"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-[#E5E5E5] pr-3">
                      <span className="text-sm font-bold text-[#1A1A1A]">+260</span>
                    </div>
                    <input 
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-20 pr-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold tracking-widest focus:outline-none focus:border-green-700 transition-colors"
                      placeholder="971234567"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-2">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
                    />
                    <label htmlFor="terms" className="text-[11px] text-[#666] leading-tight">
                      I agree to the <button onClick={() => setShowTermsModal(true)} className="text-green-700 font-bold hover:underline">Terms of Service</button> and <button onClick={() => setShowTermsModal(true)} className="text-green-700 font-bold hover:underline">Privacy Policy</button>.
                    </label>
                  </div>
                </div>
                <button 
                  onClick={handlePhoneSubmit}
                  disabled={phoneNumber.length < 9 || !userName || !nrcNumber || !acceptedTerms}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Send OTP
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Verify OTP</h2>
                  <p className="text-[#666] text-sm mt-2 leading-relaxed">
                    Enter the 6-digit code sent to <span className="font-bold text-[#1A1A1A]">+260 {phoneNumber}</span>
                  </p>
                  {generatedOtp && (
                    <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold text-center border border-blue-200">
                      Test OTP: {generatedOtp}
                    </div>
                  )}
                </div>
                {otpError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100">
                    {otpError}
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-center text-xl font-bold focus:outline-none focus:border-green-700 transition-colors"
                    />
                  ))}
                </div>
                <div className="text-center">
                  <button className="text-green-700 text-xs font-bold hover:underline">Resend Code in 0:59</button>
                </div>
                <button 
                  onClick={handleOtpSubmit}
                  disabled={!otp.every(d => d !== '')}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Verify Code
                </button>
              </motion.div>
            )}

            {step === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Set Password</h2>
                  <p className="text-[#666] text-sm mt-2 leading-relaxed">
                    Create a strong password to secure your account.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-medium focus:outline-none focus:border-green-700 transition-colors"
                      placeholder="Enter password"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((s) => (
                        <div 
                          key={s}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            s <= passwordStrength 
                              ? passwordStrength === 1 ? 'bg-red-500' 
                                : passwordStrength === 2 ? 'bg-orange-400'
                                : passwordStrength === 3 ? 'bg-yellow-400'
                                : 'bg-green-500'
                              : 'bg-[#F0F0F0]'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {['Length', 'Uppercase', 'Number', 'Special'].map((label, i) => {
                        const requirements = [
                          password.length >= 8,
                          /[A-Z]/.test(password),
                          /[0-9]/.test(password),
                          /[^A-Za-z0-9]/.test(password)
                        ];
                        const met = requirements[i];
                        return (
                          <div key={label} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors ${met ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                            {met ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                            {label}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <span className={
                        passwordStrength <= 1 ? 'text-red-500' : 
                        passwordStrength === 2 ? 'text-orange-500' :
                        passwordStrength === 3 ? 'text-yellow-600' : 
                        'text-green-600'
                      }>
                        Strength: {
                          passwordStrength <= 1 ? 'Weak' : 
                          passwordStrength === 2 ? 'Fair' :
                          passwordStrength === 3 ? 'Good' : 
                          'Excellent'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    <span className="font-bold">Activation Requirement:</span> KYC must be submitted to the SIM registering to activate your account features.
                  </p>
                </div>
                <button 
                  onClick={handlePasswordSubmit}
                  disabled={passwordStrength < 3}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 'nrc' && (
              <motion.div
                key="nrc"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Upload NRC</h2>
                  <p className="text-[#666] text-sm mt-2 leading-relaxed">
                    Please upload clear photos of both the front and back of your NRC.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest text-center">Front</p>
                    <div className="aspect-[1.6/1] bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#E5E5E5] flex items-center justify-center overflow-hidden relative">
                      {nrcFront ? (
                        <img 
                          src={nrcFront} 
                          alt="NRC Front" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"; }}
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-[#999]" />
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleNrcFrontUpload} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest text-center">Back</p>
                    <div className="aspect-[1.6/1] bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#E5E5E5] flex items-center justify-center overflow-hidden relative">
                      {nrcBack ? (
                        <img 
                          src={nrcBack} 
                          alt="NRC Back" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"; }}
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-[#999]" />
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleNrcBackUpload} />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep('passport')}
                  disabled={!nrcFront || !nrcBack}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'passport' && (
              <motion.div
                key="passport"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Passport Photo</h2>
                  <p className="text-[#666] text-sm mt-2 leading-relaxed">
                    Please upload a clear passport-sized photo for your digital banking profile.
                  </p>
                </div>
                
                <div className="aspect-square w-48 mx-auto bg-[#F8F9FA] rounded-3xl border-2 border-dashed border-[#E5E5E5] flex items-center justify-center overflow-hidden relative">
                  {passportPhoto ? (
                    <img 
                      src={passportPhoto} 
                      alt="Passport" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"; }}
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-[#999]" />
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handlePassportUpload} />
                </div>

                <button 
                  onClick={() => setStep('selfie')}
                  disabled={!passportPhoto}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'selfie' && (
              <motion.div
                key="selfie"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Take a Selfie</h2>
                  <p className="text-[#666] text-sm mt-2 leading-relaxed">
                    We need a live photo of you to match with your NRC. Ensure your face is clearly visible.
                  </p>
                </div>
                <div className="aspect-square bg-[#F8F9FA] rounded-3xl border-2 border-dashed border-[#E5E5E5] flex items-center justify-center overflow-hidden relative">
                  {selfiePhoto ? (
                    <img 
                      src={selfiePhoto} 
                      alt="Selfie Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"; }}
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-[#999] mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Face not captured</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <input 
                    type="file" 
                    id="selfie-capture" 
                    className="hidden" 
                    accept="image/*"
                    capture="user"
                    onChange={handleSelfieCapture}
                  />
                  <label 
                    htmlFor="selfie-capture"
                    className="w-full bg-[#F8F9FA] border border-[#E5E5E5] text-[#1A1A1A] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer hover:bg-[#F0F0F0]"
                  >
                    <Camera className="w-5 h-5" />
                    {selfiePhoto ? 'Retake Selfie' : 'Capture Selfie'}
                  </label>

                  <button 
                    onClick={() => setStep('success')}
                    disabled={!selfiePhoto}
                    className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                  >
                    Complete Registration
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto border-4 border-green-50">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Verification Pending</h2>
                  <p className="text-[#666] text-sm mt-2 leading-relaxed">
                    Your account has been created and documents submitted. Our team will verify your identity shortly.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    <span className="font-bold">Activation Requirement:</span> KYC must be submitted to the SIM registering to activate your account features.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 text-left">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    {appConfig.name} uses bank-grade encryption to protect your personal data. Your data is only used for verification.
                  </p>
                </div>
                <button 
                  onClick={handleComplete}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative max-h-[80vh] flex flex-col"
            >
              <button 
                onClick={() => setShowTermsModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#999]" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Terms & Privacy</h2>
                <p className="text-[#666] text-xs mt-1">Last updated: February 2026</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 space-y-6 text-sm text-[#444] leading-relaxed">
                <section>
                  <h3 className="font-bold text-[#1A1A1A] mb-2">1. Introduction</h3>
                  <p>Welcome to {appConfig.name}. By registering an account, you agree to comply with our terms of service and privacy policy. We are committed to protecting your financial data.</p>
                </section>
                <section>
                  <h3 className="font-bold text-[#1A1A1A] mb-2">2. KYC Verification</h3>
                  <p>To prevent fraud and comply with Zambian financial regulations, we require valid NRC documentation and a live selfie. Your data is encrypted and used only for identity verification.</p>
                </section>
                <section>
                  <h3 className="font-bold text-[#1A1A1A] mb-2">3. Loan Terms</h3>
                  <p>All loans are subject to approval. Interest rates and repayment periods are clearly stated during the application process. Failure to repay may affect your credit score.</p>
                </section>
                <section>
                  <h3 className="font-bold text-[#1A1A1A] mb-2">4. Privacy Policy</h3>
                  <p>We do not share your personal information with third parties except as required by law. We use your location data to verify "Digital Connection" security during transactions.</p>
                </section>
              </div>

              <button 
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg shadow-green-700/20"
              >
                I Accept the Terms
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationFlow;
