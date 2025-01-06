"use client";

import { User } from "@prisma/client";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { InterestsEditForm } from "@/components/profile/interests-edit-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProfileViewProps {
  user: UserProfile;
}

export function ProfileView({ user }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <ProfileEditForm user={user} onComplete={() => setIsEditing(false)} />
          <InterestsEditForm user={user} onComplete={() => setIsEditing(false)} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Name</h3>
              <p>{user.name || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{user.email || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p>{user.phoneNumber || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium">Age</h3>
              <p>{user.age?.toString() || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium">Education Level</h3>
              <p>{user.educationLevel || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium">Learning Style</h3>
              <p>{user.learningStyle || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium">Difficulty Preference</h3>
              <p>{user.difficultyPreference || "Not set"}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">Interests</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.interests && user.interests.length > 0 ? (
                user.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No interests set</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}