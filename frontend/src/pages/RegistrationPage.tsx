import {
  Card,
  CardContent,
  CardDescription,
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
import { Link } from "react-router-dom";

import { useSendOTP } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Regular expression to validate email domains --> Only certain university email addresses allowed
const emailDomainRegex =
  /^[\w-]+(?:\.[\w-]+)*@(lmu\.de|tum\.de|hm\.edu|adbk\.de|musikhochschule-muenchen\.de|hfph\.de|unibw\.de|ksfh\.de|hs-furtwangen\.de|fh-aachen\.de|jacobs-university\.de|mytum\.de)$/;

// Form schema for registration form
const FormSchema = z
  .object({
    firstname: z.string().min(1, {
      message: "Please enter your first name.",
    }),
    lastname: z.string().min(1, {
      message: "Please enter your last name.",
    }),
    email: z
      .string()
      .email({ message: "Please enter a valid email address." })
      .regex(emailDomainRegex, {
        message: "Email must be from one of the approved domains.",
      }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/**
 * RegistrationPage displays the registration form for new users to sign up for an account.
 * It includes fields for first name, last name, email address, password, and confirm password.
 * The form is validated using zod schema and the form data is sent to the server to send an OTP for verification.
 **/
const RegistrationPage = () => {
  const { mutateAsync: sendOTP } = useSendOTP();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { confirmPassword, ...rest } = data;
    void sendOTP({ ...rest });
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <Card className="min-w-96">
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-bold text-center text-indigo-600">
              Sign Up
            </h2>
          </CardTitle>
          <CardDescription>
            <p className="text-center text-base text-gray-600">
              Sign up for an account at Leasy to start renting and listing!
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm your password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button type="submit" className="w-full">
                  Sign up
                </Button>
                <p className="mt-2 text-center text-sm text-indigo-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;
