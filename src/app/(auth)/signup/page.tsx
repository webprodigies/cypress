'use client';

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
      .min(6, 'Password must be minimun 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], //need to pass this
  });

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeExchangeError = searchParams.get('error_description');
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx('bg-primary', {
        'bg-red-500/10': codeExchangeError,
        'border-red-500/50': codeExchangeError,
        'text-red-700': codeExchangeError,
      }),
    [codeExchangeError]
  );

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const isLoading = form.formState.isSubmitting;
  async function onSubmit({ email, password }: z.infer<typeof FormSchema>) {
    const { error, data } = await actionSignUpUser({ email, password });
    if (error) {
      setSubmitError(error.message);
      form.reset();
      return;
    }
    setConfirmation(true);
  }

  // WIP
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
        {!confirmation && !codeExchangeError && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full p-6"
              disabled={isLoading}
            >
              {!isLoading ? (
                'Create Account'
              ) : (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-primary-foreground/30 fill-primary-foreground "
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
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
