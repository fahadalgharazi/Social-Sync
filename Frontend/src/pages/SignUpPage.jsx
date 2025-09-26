import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Heart, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signup, login } from "../features/auth/api/authApi";

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    bio: "",
    interests: "",
    zip: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const nav = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(form.password);

  // Email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ZIP validation
  const isValidZip = (zip) => {
    return /^\d{5}$/.test(zip);
  };

  const updateForm = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const isStep1Valid = () => {
    return form.firstName && form.lastName && 
           form.email && isValidEmail(form.email) &&
           form.password && form.confirmPassword && 
           form.password === form.confirmPassword &&
           passwordStrength.strength >= 2; // At least medium strength
  };

  const isStep2Valid = () => {
    return form.gender && form.zip && isValidZip(form.zip);
  };

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      gender: form.gender,
      bio: form.bio,
      interests: form.interests,
      zip: form.zip.trim(),
    };

    try {
      setSubmitting(true);
      await signup(payload);
      await login(payload.email, payload.password);
      nav("/questionnaire");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Sign up failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-xl">
        {/* Main card */}
        <Card className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          {/* Header */}
          <CardHeader className="px-8 pt-6 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-3 mx-auto shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Join the Community
            </CardTitle>
            <CardDescription className="text-gray-500">
              Step {currentStep} of 2: {currentStep === 1 ? 'Account Information' : 'Personal Details'}
            </CardDescription>
          </CardHeader>

          {/* Progress Indicator */}
          <div className="px-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                currentStep >= 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 rounded transition-all duration-300 ${
                currentStep >= 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                currentStep >= 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Form */}
          <CardContent className="px-8 pb-6">
            <form onSubmit={submit} className="space-y-4">
              {currentStep === 1 ? (
                /* Step 1: Account Information */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={form.firstName}
                          onChange={(e) => updateForm('firstName', e.target.value)}
                          className="pl-10 h-11 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={form.lastName}
                          onChange={(e) => updateForm('lastName', e.target.value)}
                          className="pl-10 h-12 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        className="pl-10 h-12 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>
                    {form.email && !isValidEmail(form.email) && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={(e) => updateForm('password', e.target.value)}
                        className="pl-10 pr-12 h-11 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {form.password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength.label === 'Weak' ? 'text-red-600' :
                            passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Use 8+ characters with mix of letters, numbers & symbols
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={(e) => updateForm('confirmPassword', e.target.value)}
                        className="pl-10 pr-12 h-12 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}

                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Valid()}
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                /* Step 2: Personal Information */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
                      <Select value={form.gender} onValueChange={(value) => updateForm('gender', value)}>
                        <SelectTrigger className="h-11 border-gray-200 bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="nonbinary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-sm font-medium text-gray-700">ZIP Code</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="zip"
                          type="text"
                          inputMode="numeric"
                          placeholder="12345"
                          maxLength={5}
                          value={form.zip}
                          onChange={(e) => updateForm('zip', e.target.value.replace(/\D/g, ''))}
                          className="pl-10 h-12 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          required
                        />
                      </div>
                      {form.zip && !isValidZip(form.zip) && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Please enter a valid 5-digit ZIP code
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      value={form.bio}
                      onChange={(e) => updateForm('bio', e.target.value)}
                      className="min-h-16 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests" className="text-sm font-medium text-gray-700">Interests (Optional)</Label>
                    <Textarea
                      id="interests"
                      placeholder="e.g., hiking, photography, cooking, music"
                      value={form.interests}
                      onChange={(e) => updateForm('interests', e.target.value)}
                      className="min-h-20 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                    <p className="text-xs text-gray-500">Separate interests with commas</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="w-1/3 h-11 bg-white/50"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !isStep2Valid()}
                      className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>

          {/* Footer */}
          <CardFooter className="px-8 py-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
            <p className="text-center text-sm text-gray-600 w-full">
              Already have an account?{' '}
              <Button
                variant="link"
                onClick={() => nav('/login')}
                className="text-indigo-600 hover:text-indigo-500 p-0 h-auto font-medium"
              >
                Sign in
              </Button>
            </p>
          </CardFooter>
        </Card>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <button className="text-indigo-600 hover:text-indigo-500 transition-colors">Terms of Service</button>
          {' '}and{' '}
          <button className="text-indigo-600 hover:text-indigo-500 transition-colors">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}