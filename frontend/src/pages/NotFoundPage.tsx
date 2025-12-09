import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="flex w-full h-full min-h-[70vh] justify-center items-center">
      <div className="justify-center text-center">
        <h1 className="text-3xl font-medium">404 - Page Not Found</h1>
        <p className="text-lg text-secondary-foreground">
          Oops! The page you are looking for does not exist.
        </p>
        <Link to="/">
          <Button variant="link">
            <p className="text-lg">Return to home page</p>
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
