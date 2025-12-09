import { useAddListingToFavorites } from "@/api/user";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";
import { HeartIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { useToast } from "./use-toast";

type Props = React.ComponentProps<typeof Button>;

type LikeButtonProps = {
  liked?: boolean;
  listingId: string;
  userFavorites?: string[];
} & Props;

export function LikeButton({
  liked,
  listingId,
  userFavorites,
  ...props
}: LikeButtonProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(liked);

  const { mutateAsync: addListingToFavorites } = useAddListingToFavorites(
    listingId,
    userFavorites ?? []
  );
  const { isRenter } = useProfile();
  const { toast } = useToast();

  const handleOnClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void addListingToFavorites(!isLiked)
      .then(() => {
        setIsLiked(!isLiked);
      })
      .catch((error) => {
        toast({
          title: "An error occurred.",
          description: error.message,
          variant: "destructive",
        });
        setIsLiked(false);
      });
  };

  return (
    <div
      className={`${
        !user || isLiked === undefined || isRenter ? "invisible" : ""
      }`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`bg-white border text-gray-500 ${
                isLiked ? " bg-red-50 stroke-red-500" : ""
              }  hover:text-red-500 rounded-full p-2 duration-500 hover:scale-[115%] transition-all`}
              onClick={handleOnClick}
              {...props}
            >
              <HeartIcon className="w-5 h-5" />
              <span className="sr-only">Like</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Add to favorites</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
