import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

/** A decorative, lightweight character; no image download is needed. */
export function FriendMascot({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('friend-mascot', compact && 'friend-mascot--compact', className)} aria-hidden="true">
      <div className="friend-mascot__antenna"><span /></div>
      <div className="friend-mascot__arm friend-mascot__arm--left" />
      <div className="friend-mascot__arm friend-mascot__arm--right" />
      <div className="friend-mascot__body">
        <div className="friend-mascot__face">
          <i className="friend-mascot__eye" /><i className="friend-mascot__eye" />
          <i className="friend-mascot__cheek friend-mascot__cheek--left" /><i className="friend-mascot__cheek friend-mascot__cheek--right" />
          <i className="friend-mascot__smile" />
        </div>
        <Heart className="friend-mascot__heart" size={20} fill="currentColor" />
      </div>
      <div className="friend-mascot__foot friend-mascot__foot--left" />
      <div className="friend-mascot__foot friend-mascot__foot--right" />
      <div className="friend-mascot__shadow" />
    </div>
  );
}
