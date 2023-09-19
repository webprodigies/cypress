'use client';

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

export default function Login() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData
  ) => {
    const { error } = await actionLoginUser(formData);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }
    router.replace('/dashboard');
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError('');
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full  sm:justify-center sm:w-[400px] space-y-6 flex flex-col "
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  disabled={isLoading}
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
                  disabled={isLoading}
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
          {!isLoading ? (
            'Login'
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
