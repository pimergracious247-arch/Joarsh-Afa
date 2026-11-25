import type React from 'react';
import { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import type { AvatarId, PlayerProfile } from '../types';
import { BIBLE_AVATARS, BibleAvatarIcon } from './BibleAvatarIcon';

interface PlayerProfileModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  isFirstLaunchPrompt: boolean;
  onSave: (profile: PlayerProfile) => void;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  profile,
  isFirstLaunchPrompt,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(profile.displayName || '');
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName: name.trim() || 'Bible Pilgrim',
      avatarId,
      isCustomized: true,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-profile-modal-title"
      className="fixed inset-0 z-50 bg-[#14274E]/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[28px] max-w-md w-full p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,30,61,0.35)] border-2 border-white space-y-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#164A9E]">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>{isFirstLaunchPrompt ? 'Welcome to Bible Quest' : 'Leaderboard Profile'}</span>
            </div>
            <h2
              id="player-profile-modal-title"
              className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] mt-0.5"
            >
              {isFirstLaunchPrompt ? 'Choose Your Scholar Profile' : 'Edit Display Name & Avatar'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label
            htmlFor="scholar-name-input"
            className="block text-xs font-bold text-[#47608B] mb-1.5"
          >
            Display Name
          </label>
          <input
            id="scholar-name-input"
            type="text"
            maxLength={22}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name (e.g. David)"
            className="w-full min-h-[44px] rounded-2xl border-2 border-[#DCEBFF] focus:border-[#2F8FFF] px-3.5 py-2 text-sm font-bold text-[#14274E] bg-[#F8FBFF] focus:outline-none"
          />
        </div>

        <div>
          <span className="block text-xs font-bold text-[#47608B] mb-2">Pick a Bible Avatar</span>
          <div className="grid grid-cols-5 gap-2">
            {BIBLE_AVATARS.map((item) => {
              const selected = avatarId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAvatarId(item.id)}
                  className={`min-h-[68px] rounded-2xl p-2 flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#E5F0FF] border-[#2F8FFF] scale-[1.03] shadow-xs'
                      : 'bg-[#F8FBFF] border-[#DCEBFF] hover:border-[#B0D4FA]'
                  }`}
                >
                  <BibleAvatarIcon avatarId={item.id} size="md" />
                  <span className="text-[10px] font-bold text-[#14274E] truncate max-w-full">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full min-h-[48px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>Save Profile</span>
        </button>
      </form>
    </div>
  );
};
