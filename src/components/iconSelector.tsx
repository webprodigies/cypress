import React from 'react';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ICON_NAMES } from '@/lib/constants';
import Icon from './icon';

interface IconSelectorProps {}
const IconSelector: React.FC<IconSelectorProps> = () => {
  return (
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Icons">
          <div className="flex flex-wrap">
            {ICON_NAMES.map((icon) => (
              <CommandItem key={icon}>
                <Icon name={icon} />
                <span className="hidden absolute">{icon}</span>
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default IconSelector;
