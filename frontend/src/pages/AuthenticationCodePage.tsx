import { SignUpFormData, useSignup } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {Separator} from "@/components/ui/separator.tsx";

/**
 * AuthenticationCodePage displays the page where the user enters the OTP code sent to their email address.
 * The user can complete the registration process by entering the 6-digit code and clicking the "Sign Up" button.
 */
const AuthenticationCodePage = () => {
  const [enteredCode, setEnteredCode] = useState("");
  const location = useLocation();
  const data: SignUpFormData = location.state;

  const { mutateAsync: signUp } = useSignup();

  const completeSignUp = () => {
    void signUp({
      ...data,
      otp: enteredCode,
    });
  };

  useEffect(() => {
    if (enteredCode.length === 6) {
      completeSignUp();
    }
  }, [enteredCode]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-bold text-center text-indigo-600">
              Almost there!
            </h2>
          </CardTitle>
          <CardDescription>
            <p className="text-center text-base text-gray-600">
              We have sent a one-time password to your email address.
              <br />
              Complete your registration by entering the code below.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center space-y-4">
          <div className="flex justify-center py-4">
            <InputOTP
              maxLength={6}
              value={enteredCode}
              onChange={(value) => setEnteredCode(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSeparator />
                <Separator orientation="vertical" className="h-14"/>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full" onClick={() => completeSignUp()}>
            Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationCodePage;
