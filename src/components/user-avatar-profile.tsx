import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface SidebarUserProfile {
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: SidebarUserProfile | null;
}

export function UserAvatarProfile({ className, showInfo = false, user }: UserAvatarProfileProps) {
  const fallbackLabel =
    user?.fullName?.slice(0, 2)?.toUpperCase() ||
    user?.email?.slice(0, 2)?.toUpperCase() ||
    'SP';

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={user?.avatarUrl || ''} alt={user?.fullName || user?.email || ''} />
        <AvatarFallback className='rounded-lg'>{fallbackLabel}</AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.fullName || 'Support Promise Vault'}</span>
          <span className='truncate text-xs'>{user?.email || ''}</span>
        </div>
      )}
    </div>
  );
}
