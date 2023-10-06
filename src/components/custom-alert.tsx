'use client';

import React, { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const CustomAlert = ({
  children,
  title,
  description,
  continueTitle,
  cancelTitle,
  continueHandler,
}: {
  children: ReactNode;
  description: string;
  title: string;
  continueTitle: string;
  cancelTitle: string;
  continueHandler: () => void;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={continueHandler}>
            {continueTitle}
          </AlertDialogCancel>
          <AlertDialogAction>{cancelTitle}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlert;
