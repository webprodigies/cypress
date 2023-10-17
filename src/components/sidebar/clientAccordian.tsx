'use client';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Accordion } from '../ui/accordion';
import { usePathname, useRouter } from 'next/navigation';

interface ClientAccordianProps {
  children: ReactNode;
  className?: string;
}
// A simple container component that will wrap the children and also set its default value.
const ClientAccordian: FC<ClientAccordianProps> = ({ children, className }) => {
  const pathname = usePathname();
  return (
    <Accordion
      defaultValue={pathname?.split('/dashboard/')[1].split('/')}
      className={className}
      type="multiple"
    >
      {children}
    </Accordion>
  );
};

export default ClientAccordian;
