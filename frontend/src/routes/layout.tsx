import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

type LayoutProps = {
  children?: React.ReactNode;
};

/**
 * Represents the layout component that provides a common structure for the application.
 * It includes a navigation bar, content area, and a footer.
 * Also includes a gradient background for specific paths.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const [useGradient, setuseGradient] = React.useState(false);

  useEffect(() => {
    const path = pathname.split("/")[1];
    setuseGradient(pathsWithGradient.includes(path));
  }, [pathname]);

  return (
    <div
      className={cn(
        layoutVariant({ gradient: useGradient ? "default" : false })
      )}
    >
      <div className="grid col-start-2 content-start">
        <NavigationBar />
        {children ?? (
          <div className="py-4">
            <Outlet />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const pathsWithGradient = ["login", "signup", "verify", ""];
const layoutVariant = cva("grid grid-cols-[1fr_18fr_1fr] min-h-screen", {
  variants: {
    gradient: {
      default: "bg-gradient-to-b from-white to-indigo-300",
      false: "",
    },
  },
  defaultVariants: {
    gradient: "default",
  },
});

export default Layout;
