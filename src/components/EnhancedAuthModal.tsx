import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getDataMessage, getErrorMessage } from '@/lib/safeErrors';

import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/firebaseConfig';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, username: string, plan: string) => void;
}

export const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot-password UI state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });

  const { toast } = useToast();

  const API_BASE = 'http://127.0.0.1:8000';

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post(`${API_BASE}/auth/firebase/`, { idToken });

      if (res.data && res.data.token && res.data.username && res.data.plan) {
        onAuthSuccess(res.data.token, res.data.username, res.data.plan);
        toast({
          title: 'Welcome!',
          description: `Signed in with Google as ${res.data.username}`,
          variant: 'default'
        });
        onClose();
        resetForm();
      } else {
        toast({
          title: 'Login Failed',
          description: 'Could not retrieve user details from backend.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      let errorMessage = 'Google authentication failed. Please try again.';
      const errorCode = error?.code;
      const lowerMessage = typeof error?.message === 'string' ? error.message.toLowerCase() : '';

      if (errorCode === 'auth/popup-closed-by-user') {
        errorMessage = 'The Google sign-in window was closed before completing the process.';
      } else if (errorCode === 'auth/popup-blocked') {
        errorMessage = 'Your browser blocked the sign-in popup. Please allow popups and try again.';
      } else if (errorCode === 'auth/network-request-failed' || lowerMessage.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast({
          title: 'Email Not Verified',
          description: 'Please verify your email to log in. Check your inbox for the verification link.',
          variant: 'destructive'
        });
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(`${API_BASE}/auth/firebase_email_login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (response.ok && data.token && data.username && data.plan) {
        onAuthSuccess(data.token, data.username, data.plan);
        toast({
          title: 'Welcome!',
          description: `Signed in as ${user.email}`,
          variant: 'default'
        });
        onClose();
        resetForm();
      } else {
        const message = getDataMessage(data);
        toast({
          title: 'Login Failed',
          description: message,          
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });

      // Reveal the reset panel to help the user
      if (!showReset) {
        setShowReset(true);
        if (formData.email) setResetEmail(formData.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Email, Password, Username)',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.username });
      await sendEmailVerification(user);

      const idToken = await user.getIdToken();
      const backendResponse = await fetch(`${API_BASE}/auth/register_firebase_email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name
        })
      });

      const backendData = await backendResponse.json();

      if (backendResponse.ok) {
        toast({
          title: 'Registration Successful!',
          description:
            'Please check your email for a verification link to activate your account. You can log in after verification.',
          variant: 'default'
        });
        onClose();
        resetForm();
      } else {
        const message = getDataMessage(backendData);
        toast({
          title: 'Registration Failed on Backend',
          description: message,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      let errorMessage = 'Registration failed.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in or use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReset = async () => {
    if (!resetEmail) {
      toast({
        title: 'Enter your email',
        description: 'Please provide the email you used for your account.',
        variant: 'destructive'
      });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      toast({
        title: 'Reset link sent',
        description: 'Check your inbox for a password reset email.',
        variant: 'default'
      });
      setShowReset(false);
    } catch (error: any) {
      let msg = 'Could not send reset email.';
      if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (error.code === 'auth/invalid-email') msg = 'That email doesn’t look valid.';
      toast({
        title: 'Reset failed',
        description: msg,
        variant: 'destructive'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Prevent autofocus from shoving the dialog under the keyboard */}
      <DialogContent
        onOpenAutoFocus={e => e.preventDefault()}
        className="
          p-0
          sm:max-w-md
          rounded-2xl
          max-h-[85dvh]            /* dynamic viewport for mobile keyboards */
          sm:max-h-[90vh]
        "
      >
        {/* Inner scroll container (keyboard-safe) */}
        <div
          className="
            max-h-[inherit]
            p-5
            pt-4
            pb-[max(16px,env(safe-area-inset-bottom))]
          "
          style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' as any }}
        >
          <DialogHeader className="mb-2">
            <DialogTitle className="text-center gradient-text text-2xl">
              QuotientOne ATS
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col min-h-0">
            <Tabs defaultValue="login" className="w-full">
              {/* Sticky tabs so the switcher is always visible while scrolling */}
              <TabsList className="grid w-full grid-cols-2 sticky top-0 z-10 bg-background">
                <TabsTrigger value="login" data-value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="min-h-0">
                <div
                  className="max-h-[60dvh] sm:max-h-[65vh]"
                  style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' as any }}
                >
                  <Card>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl">Welcome back</CardTitle>
                      <CardDescription>Sign in to your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleGoogleLogin}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <img
                              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                              alt="Google"
                              className="w-5 h-5 mr-2"
                            />
                          )}
                          Continue with Google
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <form onSubmit={handleFirebaseEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-login">Email</Label>
                          <Input
                            id="email-login"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-login">Password</Label>
                          <div className="relative">
                            <Input
                              id="password-login"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Enter your password"
                              disabled={isLoading}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* <p className="text-xs text-muted-foreground">
                            Login uses <b>email + password</b>. (Username is for display/registration.)
                          </p> */}
                          <Button
                            type="button"
                            variant="link"
                            className="px-0"
                            onClick={() => {
                              setShowReset(prev => !prev);
                              if (!resetEmail && formData.email) setResetEmail(formData.email);
                            }}
                          >
                            Forgot password?
                          </Button>
                        </div>

                        {showReset && (
                          <div className="rounded-lg border p-3 space-y-3">
                            <p className="text-sm">We’ll email you a link to reset your password.</p>
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">Email</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={isResetting || isLoading}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowReset(false)}
                                disabled={isResetting}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="default"
                                onClick={handleSendReset}
                                disabled={isResetting || !resetEmail}
                              >
                                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send reset link
                              </Button>
                            </div>
                          </div>
                        )}

                        <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Login
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register" className="min-h-0">
                <div
                  className="max-h-[60dvh] sm:max-h-[65vh]"
                  style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' as any }}
                >
                  <Card>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl">Create account</CardTitle>
                      <CardDescription>Join QuotientOne ATS today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleGoogleLogin}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <img
                              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                              alt="Google"
                              className="w-5 h-5 mr-2"
                            />
                          )}
                          Continue with Google
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or register with email
                          </span>
                        </div>
                      </div>

                      <form onSubmit={handleFirebaseEmailRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                              id="first_name"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              placeholder="John"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                              id="last_name"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              placeholder="Doe"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-username">Username *</Label>
                          <Input
                            id="reg-username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Choose a username"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email-register">Email *</Label>
                          <Input
                            id="email-register"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Password *</Label>
                          <div className="relative">
                            <Input
                              id="reg-password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Create a password"
                              disabled={isLoading}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-confirmPassword">Confirm Password *</Label>
                          <Input
                            id="reg-confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder='Confirm your password'
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Account
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
