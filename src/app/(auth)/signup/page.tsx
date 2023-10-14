'use client';

// Import necessary dependencies and components
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { MailCheck } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import Logo from '../../../../public/cypresslogo.svg';
import Google from '../../../../public/google.png';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { actionSignUpUser } from '@/lib/serverActions';
import { FormSchema } from '@/lib/types';
import clsx from 'clsx';

// Define the SignUpFormSchema using Zod for validation
const SignUpFormSchema = z
  .object({
    email: z.string().describe('Email').email({
      message: 'Invalid Email',
    }),
    password: z
      .string()
      .describe('Password')
      .min(6, 'Password must be minimum 6 characters'),
    confirmPassword: z
      .string()
      .describe('Confirm Password')
      .min(6, 'Password must be minimum 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Define the functional component for SignUp
export default function SignUp() {
  // Initialize router and search parameters
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set codeExchangeError to the error description from search parameters
  const codeExchangeError = useMemo(() => {
    if (!searchParams) return '';
    return searchParams.get('error_description');
  }, [searchParams]);

  // Initialize submitError and confirmation states
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmation, setConfirmation] = useState<boolean>(false);

  // Calculate the styles for confirmation and error based on codeExchangeError
  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx('bg-primary', {
        'bg-red-500/10': codeExchangeError,
        'border-red-500/50': codeExchangeError,
        'text-red-700': codeExchangeError,
      }),
    [codeExchangeError]
  );

  // Create a form instance using react-hook-form
  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  // Determine if the form is currently submitting
  const isLoading = form.formState.isSubmitting;

  // Define the form submission handler
  async function onSubmit({ email, password }: z.infer<typeof FormSchema>) {
    const { error, data } = await actionSignUpUser({ email, password });
    if (error) {
      setSubmitError(error.message);
      form.reset();
      return;
    }
    setConfirmation(true);
  }

  // Define the signUpHandler function
  const signUpHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push('/auth/signup');
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError('');
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col "
      >
        <Link
          href="/"
          className="w-full flex justify-left items-center"
        >
          <Image
            src={Logo}
            alt="Cypress Logo"
            width={50}
            height={50}
          />
          <span className="font-semibold dark:text-white text-4xl ml-2">
            cypress.
          </span>
        </Link>
        <FormDescription className=" text-foreground/60">
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>

        {/* Conditional rendering based on confirmation and codeExchangeError */}
        {!confirmation && !codeExchangeError && (
          <>
            {/* Form fields for email, password, and confirmPassword */}
            {/* ... (Other form fields) ... */}
            {/* Submit button with loading animation */}
            <Button
              type="submit"
              className="w-full p-6"
              disabled={isLoading}
            >
              {!isLoading ? (
                'Create Account'
              ) : (
                <div role="status">{/* Loading animation */}</div>
              )}
            </Button>
            {submitError && <FormMessage>{submitError}</FormMessage>}
            <span className="self-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary"
              >
                Login
              </Link>
            </span>
            <hr className="border-1 border-muted-foreground/30"></hr>
            {/* WIP */}
            <Button
              type="button"
              className="w-full p-6 relative"
              onClick={signUpHandler}
              size="lg"
              variant="outline"
              icon={Google}
              logoStyles=""
            >
              Sign up with Google
            </Button>
          </>
        )}
        {(confirmation || codeExchangeError) && (
          <React.Fragment>
            {/* Conditional rendering based on confirmation and codeExchangeError */}
            <Alert className={confirmationAndErrorStyles}>
              {!codeExchangeError && <MailCheck className="h-4 w-4" />}
              <AlertTitle className="">
                {codeExchangeError ? 'Invalid Link' : 'Check your email.'}
              </AlertTitle>
              <AlertDescription>
                {codeExchangeError || 'An email confirmation has been sent.'}
              </AlertDescription>
            </Alert>
            {codeExchangeError && (
              <span className="self-center">
                Try again?{' '}
                <Link
                  href="/signup"
                  className="text-primary"
                >
                  Sign Up
                </Link>
              </span>
            )}
          </React.Fragment>
        )}
      </form>
    </Form>
  );
}
