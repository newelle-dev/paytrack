"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/login/actions";
import { toast } from "sonner";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  userEmail,
}: ProfileSettingsModalProps) {
  const [email, setEmail] = useState(userEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdating(true);
    const formData = new FormData();
    if (email !== userEmail) formData.append("email", email);
    if (password) formData.append("password", password);

    if (formData.entries().next().done) {
      toast.info("No changes to update");
      setIsUpdating(false);
      return;
    }

    const result = await updateProfile(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated successfully");
      if (email !== userEmail) {
        toast.info("Please check your new email for a confirmation link");
      }
      onClose();
    }
    setIsUpdating(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings">
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
          />
        </div>
        
        <div className="border-t border-ivory-cream pt-4 mt-4">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Change Password</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
