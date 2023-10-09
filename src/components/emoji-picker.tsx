'use client';
import React, { FC, ReactNode, useState } from 'react';
import Picker from 'emoji-picker-react';
import { useRouter } from 'next/navigation';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import dynamic from 'next/dynamic';

interface EmojiPickerProps {
  children: ReactNode;
  getValue?: (emoji: string) => void;
}

const EmojiPicker: FC<EmojiPickerProps> = ({ children, getValue }) => {
  const router = useRouter();
  const Picker = dynamic(() => import('emoji-picker-react'));

  const onClick = async (selectedEmoji: any) => {
    if (getValue) getValue(selectedEmoji.emoji);
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="hover:cursor-pointer">
          {children}
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none">
          <Picker onEmojiClick={onClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
