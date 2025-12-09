import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Link, Navigate, useLocation } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

import { useLogin } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";
import { useForm } from "react-hook-form";

// Form schema for login form
const FormSchema = z.object({
  emailAddress: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string({}).min(1, {
    message: "Please enter your password.",
  }),
});

/**
 * LoginPage displays the login form for existing users to log in to their account.
 * It includes fields for email address and password.
 * The form is validated using zod schema and the form data is sent to the server to authenticate the user.
 **/
const LoginPage = () => {
  const { user } = useAuth();
  const { isRenter } = useProfile();
  const { mutateAsync: login, isPending } = useLogin();
  const location = useLocation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { emailAddress: email, password } = data;
    void login({
      email,
      password,
    });
  }

  if (user) {
    const origin =
      location.state?.from?.pathname ||
      `${isRenter ? "/sublet/overview" : "/overview"}`;
    return <Navigate to={origin} />;
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center ">
      <Card className="min-w-96">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-indigo-600">
            Log In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email address" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {!isPending ? "Log In" : "Logging you in..."}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign up for an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
