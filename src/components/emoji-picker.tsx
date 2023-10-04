'use client';
import React, { FC, ReactNode, useState } from 'react';
import Picker from 'emoji-picker-react';
import { updateEmojiFile, updateEmojiFolder } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
} from './ui/tooltip';
import { XIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import dynamic from 'next/dynamic';

interface EmojiPickerProps {
  dropdownId?: string;
  type: 'file' | 'folder' | 'native' | 'workspace';
  children: ReactNode;
  getValue?: (emoji: string) => void;
}

const EmojiPicker: FC<EmojiPickerProps> = ({
  dropdownId,
  type,
  children,
  getValue,
}) => {
  const router = useRouter();
  const Picker = dynamic(() => import('emoji-picker-react'));

  const onClick = async (selectedEmoji: any) => {
    if (getValue) getValue(selectedEmoji.emoji);
    if (type === 'file' && dropdownId) {
      await updateEmojiFile(dropdownId, selectedEmoji.emoji);
      router.refresh();
    }
    if (type === 'folder' && dropdownId) {
      console.log('INVOKED FOLDER', selectedEmoji.emoji);
      await updateEmojiFolder(dropdownId, selectedEmoji.emoji);
      router.refresh();
    }
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="hover:cursor-pointer">
          {children}
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none">
          <Picker onEmojiClick={onClick}></Picker>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
