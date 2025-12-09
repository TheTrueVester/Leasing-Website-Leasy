import { useLogout } from "@/api/auth";
import LeasyLogo from "@/assets/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";
import { getUserInitials } from "@/utils/stringUtils";
import {
  AvatarIcon,
  CardStackPlusIcon,
  ChatBubbleIcon,
  DashboardIcon,
  ExitIcon,
  LoopIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { CircleIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/**
 * NavigationBar component displays the navigation bar at the top of the application.
 * It includes various buttons and links based on the user's authentication status and role (renter or tenant).
 */
const NavigationBar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogout();
  const { isRenter, switchToRenter, switchToTenant } = useProfile();
  const location = window.location;

  const [pageName, setPageName] = useState(location.pathname.split("/")[1]);
  const [chatsUnreadStatus, setChatsUnreadStatus] = useState(
    new Array<string>()
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setChatsUnreadStatus(user?.unreadMessages ?? []);
  }, [user]);

  useEffect(() => {
    setPageName(location.pathname.split("/")[1]);
  }, [location.pathname]);

  return (
    <nav className="py-4 z-50">
      <div className="flex justify-between">
        <div className="inline-flex space-x-4">
          <Link
            to={isRenter ? "/sublet/overview" : "/"}
            className="py-1 flex space-x-2 hover:-translate-y-0.5 transition-all duration-200"
          >
            <LeasyLogo className="h-8 w-8 hover:animate-spin" />
            <div className="h-10">
              <span className="font-bold text-2xl">Leasy</span>
              {isRenter && (
                <p className="text-xs -mt-1.5 pl-4 text-indigo-400 font-semibold">
                  Subletting
                </p>
              )}
            </div>
          </Link>
        </div>

        {isAuthenticated && user ? (
          <div className="hidden md:flex items-center space-x-4">
            {isRenter && (
              <div className="space-x-2">
                {user.userBioAttributes.bankingDetails?.length > 1 ? (
                  <Link to="/sublet/listings/create">
                    <Button>
                      <CardStackPlusIcon className="h-5 w-5 mr-2" />
                      Create a Listing
                    </Button>
                  </Link>
                ) : (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger>
                      <Button className="flex">
                        <CardStackPlusIcon className="h-5 w-5 mr-2" />
                        Create a Listing
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        Listing creation is not possible without a valid IBAN.
                      </DialogHeader>
                      <DialogDescription>
                        Enter your IBAN in your profile page to proceed. By
                        doing this, we can know where to send the money after a
                        stay ends.
                      </DialogDescription>
                      <DialogFooter>
                        <Link to="/me">
                          <Button onClick={() => setOpen(false)}>
                            Add my IBAN in my profile
                          </Button>
                        </Link>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button variant="ghost" onClick={() => switchToTenant()}>
                  <AvatarIcon className="h-5 w-5 mr-2" />
                  {`Switch to tenant`}
                </Button>
              </div>
            )}
            {!isRenter && (
              <div className="space-x-2">
                <Link to="/listings">
                  <Button>
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Search for Listings
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => switchToRenter()}>
                  <AvatarIcon className="h-5 w-5 mr-2" />
                  {`Switch to renter`}
                </Button>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <div className="flex">
                    <Avatar>
                      <AvatarImage
                        src={user?.profilePicture || ""}
                        alt="avatar"
                      />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    {chatsUnreadStatus.length > 0 && (
                      <CircleIcon className="absolute fill-amber-400 stroke-0 size-3" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-medium">
                  <p className="">{`${user.firstname} ${user.lastname}`}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to={isRenter ? "/sublet/overview" : "/overview"}>
                  <DropdownMenuItem
                    className={`${
                      pageName === "sublet" || pageName === "overview"
                        ? "text-indigo-500 bg-indigo-50"
                        : ""
                    }`}
                  >
                    <DashboardIcon className="mr-2 h-4 w-4" />
                    Overview
                  </DropdownMenuItem>
                </Link>
                <Link to="/chat">
                  <DropdownMenuItem
                    className={`${
                      pageName === "chat" ? "text-indigo-500 bg-indigo-50" : ""
                    }`}
                  >
                    <ChatBubbleIcon className="mr-2 h-4 w-4" />
                    Chat
                    {chatsUnreadStatus.length > 0 && (
                      <div className="flex items-center ml-auto">
                        <CircleIcon className="fill-amber-400 stroke-0 size-3" />
                      </div>
                    )}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link to="/me">
                  <DropdownMenuItem
                    className={`${
                      pageName === "me" ? "text-indigo-500 bg-indigo-50" : ""
                    }`}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                  }}
                >
                  <ExitIcon className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={() =>
                navigate("/login", {
                  state: { from: window.location.pathname },
                })
              }
            >
              Login
            </Button>
            <Button
              onClick={() =>
                navigate("/signup", {
                  state: { from: window.location.pathname },
                })
              }
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
