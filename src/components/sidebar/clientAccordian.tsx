'use client';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Accordion } from '../ui/accordion';
import { usePathname, useRouter } from 'next/navigation';

interface ClientAccordianProps {
  children: ReactNode;
  className?: string;
}

const ClientAccordian: FC<ClientAccordianProps> = ({ children, className }) => {
  const pathname = usePathname();
  // router.refresh();
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
