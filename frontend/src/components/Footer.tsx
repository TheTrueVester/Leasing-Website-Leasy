import LeasyLogo from "@/assets/Logo";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full h-fit col-start-2 md:py-12">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <LeasyLogo className="h-8 w-8" />
          <span className="font-semibold">Leasy</span>
        </Link>
        <span className="flex space-x-2 text-xs text-muted-foreground">
          <p className="font-medium hover:text-indigo-500 transition-all duration-300">
            <a href="mailto:leasy.subletting@gmail.com">Support</a>
          </p>
          <p>| &copy; 2024 Leasy. All rights reserved.</p>
        </span>
      </div>
    </footer>
  );
}
