// src/components/UserProfileDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  usePricing,
  PLAN_FEATURES,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
  type PlanName,
  formatFromMinor,
} from "@/hooks/pricing";
import FeedbackForm from "@/components/FeedbackForm/FeedbackForm";

import { 
  User, 
  Calendar, 
  CreditCard, 
  Settings, 
  Crown,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  plan: string;
  uploads_used: number;
  upload_limit: number;
  date_joined: string;
  is_email_verified: boolean;
  profile_picture?: string;

  // NEW fields from backend
  plan_expires_at?: string | null;
  plan_expires_in_days?: number | null;
  is_plan_active?: boolean;
}

interface UserProfileDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  authToken: string;
  onUpgrade: () => void;
}

export const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({
  isOpen,
  onClose,
  authToken,
  onUpgrade
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  // ==================== Pricing / currency =============================
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>("INR");
  const { prices, basePrices, currency, activeOffer, error: pricingError, isLoading: pricingLoading } =
    usePricing(userCurrency);

  const offerEndsText = useMemo(() => {
    if (!activeOffer?.endsAt) return null;
    const date = new Date(activeOffer.endsAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }, [activeOffer?.endsAt]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const detected = typeof data.currency === "string" ? data.currency.toUpperCase() : "";
        if ((SUPPORTED_CURRENCIES as readonly string[]).includes(detected)) {
          setUserCurrency(detected as CurrencyCode);
        }
      })
      .catch(() => {
        setUserCurrency("INR"); // fallback
      });
  }, []);
  // =====================================================================

  const API_BASE = 'http://127.0.0.1:8000';

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: UserProfile = await response.json();
        setProfile(data);
        setEditedProfile(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        const data: UserProfile = await response.json();
        setProfile(data);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Update failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/resend-verification/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: "Verification email sent successfully",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && authToken) {
      fetchProfile();
    }
  }, [isOpen, authToken]);

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const planColors: Record<string, string> = {
    basic: "bg-gray-100 text-gray-800",
    premium: "bg-blue-100 text-blue-800",
    pro: "bg-purple-100 text-purple-800"
  };

  const usagePercentage = (profile.uploads_used / Math.max(1, profile.upload_limit)) * 100;

  // ---------- NEW expiry helpers ----------
  const expiresAtDate = profile.plan_expires_at ? new Date(profile.plan_expires_at) : null;
  const daysLeft = typeof profile.plan_expires_in_days === "number" ? profile.plan_expires_in_days : null;
  const expiryBadge =
    profile.plan !== "basic" && expiresAtDate
      ? (daysLeft !== null && daysLeft <= 3
          ? "bg-red-100 text-red-800"
          : "bg-amber-100 text-amber-800")
      : "bg-gray-100 text-gray-600";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="usage">Usage & Plans</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ---------------- Profile Tab ---------------- */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant={isEditing ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        setEditedProfile(profile);
                      }
                      setIsEditing(!isEditing);
                    }}
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.first_name || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-sm font-medium">{profile.first_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.last_name || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-sm font-medium">{profile.last_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <p className="text-sm font-medium">{profile.username}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{profile.email}</p>
                      {profile.is_email_verified ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                          <Button size="sm" variant="outline" onClick={sendVerificationEmail}>
                            Verify
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(profile.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                    <button
                    onClick={() => setShowForm(!showForm)}
                    className="fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
                  >
                    Feedback
                  </button>
                  {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                      <div className="bg-white p-6 rounded-2xl shadow-xl">
                        <button
                          onClick={() => setShowForm(false)}
                          className="float-right text-gray-600"
                        >
                          ✕
                        </button>
                        <FeedbackForm />
                      </div>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={updateProfile} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- Usage & Plans Tab ---------------- */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold capitalize">{profile.plan} Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.upload_limit} uploads per month
                      </p>
                    </div>
                  </div>
                  <Badge className={planColors[profile.plan as keyof typeof planColors] || planColors.basic}>
                    {profile.plan.toUpperCase()}
                  </Badge>
                </div>

                {/* Upload usage */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Upload Usage</span>
                    <span>{profile.uploads_used} / {profile.upload_limit}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.max(0, profile.upload_limit - profile.uploads_used)} uploads remaining this month
                  </p>
                </div>

                {/* Plan expiry row */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {profile.plan === "basic" ? (
                      <span>No expiry for Basic plan</span>
                    ) : expiresAtDate ? (
                      <span>
                        {profile.is_plan_active ? "Expires on" : "Expired on"}{" "}
                        <strong>{expiresAtDate.toLocaleDateString()}</strong>
                      </span>
                    ) : (
                      <span>Expiry not available</span>
                    )}
                  </div>

                  {profile.plan !== "basic" && (
                    <Badge className={expiryBadge}>
                      {profile.is_plan_active
                        ? (daysLeft !== null ? `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` : "Active")
                        : "Expired"}
                    </Badge>
                  )}
                </div>

                {/* Upgrade CTA for basic */}
                {profile.plan === 'basic' && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Upgrade Your Plan</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get more uploads, advanced features, and priority support
                    </p>
                    <Button onClick={onUpgrade} variant="hero" size="sm">
                      Upgrade Now
                    </Button>
                  </div>
                )}

                {/* Gentle nudge near expiry */}
                {profile.plan !== "basic" && daysLeft !== null && daysLeft <= 3 && profile.is_plan_active && (
                  <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
                    Your plan is expiring in {daysLeft} day{daysLeft === 1 ? "" : "s"}. Renew or upgrade to avoid interruptions.
                    <div className="mt-2">
                      <Button onClick={onUpgrade} size="sm" variant="hero">Renew / Upgrade</Button>
                    </div>
                  </div>
                )}

                {/* If expired */}
                {profile.plan !== "basic" && profile.is_plan_active === false && (
                  <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-900 text-sm">
                    Your plan has expired. Some features may be limited.
                    <div className="mt-2">
                      <Button onClick={onUpgrade} size="sm" variant="hero">Reactivate</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing cards */}
            <Card>
              <CardContent>
                {pricingError && !pricingLoading && (
                  <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {pricingError}
                  </div>
                )}

                {activeOffer && (
                  <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-amber-900 text-sm">
                    <div className="font-semibold">
                      {activeOffer.label || "Limited-time offer"}
                    </div>
                    {activeOffer.description && (
                      <div className="mt-1 text-xs md:text-sm">
                        {activeOffer.description}
                      </div>
                    )}
                    {offerEndsText && (
                      <div className="mt-1 text-xs">Offer ends {offerEndsText}</div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(Object.entries(PLAN_FEATURES) as [PlanName, (typeof PLAN_FEATURES)[PlanName]][]).map(
                    ([planKey, planInfo]) => {
                      const amountMinor = prices[planKey] ?? 0;
                      const baseMinor = basePrices[planKey] ?? amountMinor;
                      const hasDiscount = baseMinor !== amountMinor;
                      const showStriked = hasDiscount && baseMinor > amountMinor && baseMinor > 0;
                      const displayPrice =
                        amountMinor === 0 ? 'Free' : formatFromMinor(amountMinor, currency);
                      const baseDisplay = showStriked ? formatFromMinor(baseMinor, currency) : null;
                      const isPopular = planKey === 'premium';

                      return (
                        <div
                          key={planKey}
                          className={`border rounded-lg p-4 space-y-3 relative ${
                            isPopular ? "border-2 border-primary" : ""
                          }`}
                        >
                          {isPopular && (
                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              Popular
                            </Badge>
                          )}

                          <div className="text-center">
                            <h3 className="font-semibold capitalize">{planInfo.label}</h3>
                            <div className="flex flex-col items-center gap-1">
                              {baseDisplay && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {baseDisplay}
                                </span>
                              )}
                              <p className="text-2xl font-bold">{displayPrice}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{planInfo.uploads}</p>
                            {showStriked && (
                              <div className="mt-2 text-xs font-medium text-emerald-600">
                                Limited-time price
                              </div>
                            )}
                          </div>

                          <ul className="text-sm space-y-1 text-left">
                            {planInfo.features.map((f, i) => (
                              <li key={i}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-6 text-center">
                  <Button onClick={() => navigate('/upgrade')} variant="hero">
                    Choose Your Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- Settings Tab ---------------- */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Resume analysis results</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Monthly usage reports</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Marketing emails</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Privacy Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Make profile public</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Allow data export</span>
                    </label>
                  </div>
                </div>
                            

                {/* <div className="pt-4 border-t space-y-3">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
