"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { changePassword, getProfile, updateProfile } from "../../../lib/auth/api";
import { getSession } from "../../../lib/auth/session";

export default function SettingsPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    setEmail(session.user?.email ?? "");

    getProfile(session.access_token)
      .then(({ user, profile }) => {
        setEmail(user?.email ?? "");
        setBusinessName((profile?.business_name as string) ?? "");
        setPhone((profile?.phone_number as string) ?? "");
      })
      .catch((err) => {
        setProfileError(err instanceof Error ? err.message : "Unable to load profile.");
      })
      .finally(() => setIsLoadingProfile(false));
  }, [router]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    setProfileError(null);
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      await updateProfile(session.access_token, {
        business_name: businessName,
        phone_number: phone,
      });
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Unable to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(session.access_token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Unable to change password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-1 items-center justify-center rounded-lg bg-carolina-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-6 w-6 text-white"
          >
          </svg>
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Profile Information</h1>
      </div>

      {/* Profile information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Profile information</h2>
        <p className="mt-1 text-sm text-slate-500">Update your name and contact details.</p>

        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
          {profileError ? (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 sm:col-span-2">
              {profileError}
            </p>
          ) : null}
          {profileMessage ? (
            <p className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600 sm:col-span-2">
              {profileMessage}
            </p>
          ) : null}

          <div>
            <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-slate-700">
              Business name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Acme Inc."
              value={businessName}
              disabled={isLoadingProfile}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label htmlFor="gmailAddress" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="gmailAddress"
              name="gmailAddress"
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="123-987-6543"
              value={phone}
              disabled={isLoadingProfile}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100 disabled:bg-slate-50"
            />
          </div>

          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={isSavingProfile || isLoadingProfile}
              className="rounded-lg bg-carolina-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-carolina-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingProfile ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your password to keep your account secure.
        </p>

        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handlePasswordSubmit}>
          {passwordError ? (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 sm:col-span-2">
              {passwordError}
            </p>
          ) : null}
          {passwordMessage ? (
            <p className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600 sm:col-span-2">
              {passwordMessage}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
            />
          </div>

          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="rounded-lg bg-carolina-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-carolina-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingPassword ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}


