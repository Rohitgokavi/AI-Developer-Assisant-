import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, History } from "lucide-react";
import { toast } from "sonner";

interface UserProfileDropdownProps {
  user: User | null;
  onShowHistory: () => void;
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export const UserProfileDropdown = ({ user, onShowHistory }: UserProfileDropdownProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={onShowHistory} className="cursor-pointer">
          <History className="mr-2 h-4 w-4" />
          <span>Chat History</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
