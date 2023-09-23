'use client';
import { Select } from '@radix-ui/react-select';
import { useRouter } from 'next/navigation';
import React, { FC, ReactNode } from 'react';

interface ClientSelectorProps {
  children: ReactNode;
  defaultValue: string | 'Workspace';
}

const ClientSelector: FC<ClientSelectorProps> = ({
  children,
  defaultValue,
  ...props
}) => {
  const router = useRouter();
  return (
    <Select
      onValueChange={(value) => router.push(`/dashboard/${value}`)}
      defaultValue={defaultValue}
      {...props}
    >
      {children}
    </Select>
  );
};

export default ClientSelector;
