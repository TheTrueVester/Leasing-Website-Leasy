import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CopyIcon, Share2Icon } from "@radix-ui/react-icons";
import { Label } from "@radix-ui/react-label";
import { Input } from "./input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { useToast } from "./use-toast";

type Props = React.ComponentProps<typeof Button>;

export function ShareButton({ ...props }: Props) {
  const { toast } = useToast();
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white border rounded-full p-2 text-gray-500 hover:text-indigo-500 hover:scale-[115%] transition-all duration-500"
                {...props}
              >
                <Share2Icon className="w-5 h-5" />
                <span className="sr-only">Share</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Share Listing</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Listing</DialogTitle>
          <DialogDescription>
            Share this listing with a friend in need!
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={window.location.href} readOnly />
          </div>
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({
                title: "Link copied to clipboard!",
              });
            }}
          >
            <span className="sr-only">Copy</span>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
