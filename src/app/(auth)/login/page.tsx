'use client';

// Import necessary dependencies and components
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '../../../../public/cypresslogo.svg';
import Google from '../../../../public/google.png';
import { Separator } from '@/components/ui/separator';
import { actionLoginUser } from '@/lib/serverActions';
import { FormSchema } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader';

// Define the main functional component for Login
export default function Login() {
  // Initialize the router and submitError state
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  // Create a form instance using react-hook-form
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  // Determine if the form is currently submitting
  const isLoading = form.formState.isSubmitting;

  // Define the form submission handler
  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData
  ) => {
    // Attempt to login the user using provided data
    // Reset the form if there's an error
    // Set the error message
    const { error } = await actionLoginUser(formData);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }
    // Redirect to the dashboard upon successful login
    router.replace('/dashboard');
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError('');
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
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
        <FormDescription className="text-foreground/60">
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>
        <FormField
          disabled={isLoading}
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
          disabled={isLoading}
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

        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button
          type="submit"
          className="w-full p-6"
          size="lg"
          disabled={isLoading}
        >
          {!isLoading ? 'Login' : <Loader />}
        </Button>
        <span className="self-center">
          Dont have an account?{' '}
          <Link
            href="/signup"
            className="text-primary"
          >
            Sign Up
          </Link>
        </span>
        <Separator></Separator>
        <Button
          type="button"
          className="w-full relative"
          size="lg"
          variant="outline"
          icon={Google}
          logoStyles=""
        >
          Login with Google
        </Button>
      </form>
    </Form>
  );
}
