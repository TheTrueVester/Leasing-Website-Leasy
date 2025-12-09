import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription} from "@/components/ui/card.tsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {CircleX, FileIcon, ImageIcon} from "lucide-react";
import {Dispatch, SetStateAction, useCallback} from "react";
import {FileRejection, useDropzone} from "react-dropzone";

type Props = {
  files: (File & { preview: string })[];
  setFiles: Dispatch<SetStateAction<(File & { preview: string })[]>>;
  fileType: string;
  className: string;
};

/**
 * A custom file upload component.
 * Supports drag and drop and preview.
 * Inspired by https://www.youtube.com/watch?v=eGVC8UUqCBE
 * @param {Array(File & { preview: string })} files - An array of uploaded files and their preview links
 * @param setFiles - Setter for files
 * @param {string} fileType - type of files acceptable by the component, "image" or "document"
 * @param {string} className - extra classnames for styling
 */
const Dropzone = ({
                    files,
                    setFiles,
                    fileType = "image",
                    className = "py-2 border border-neutral-200 rounded-xl",
                  }: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles?.length) {
        setFiles((previousFiles) => [
          ...previousFiles,
          ...acceptedFiles.map((file) =>
            Object.assign(file, {preview: URL.createObjectURL(file)})
          ),
        ]);
      }
      if (rejectedFiles?.length) {
        toast({
          title:
            "The following file(s) you uploaded are not of the correct format. Please try again.",
          variant: "destructive",
        });
      }
    },
    []
  );

  const removeFile = (name: string) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept:
      fileType === "image"
        ? {"image/*": [".jpg", ".jpeg", ".png"]}
        : fileType === "document"
          ? {"application/pdf": [".pdf"]}
          : {"": []},
    maxSize: 5000 * 1000,
    maxFiles: 20,
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div {...getRootProps({className: className})}>
        <input {...getInputProps()} type="file"/>
        <div className="h-fit text-neutral-500">
          <div className="text-center justify-center items-center">
            <div className="flex justify-center py-2">
              {fileType === "image" ? (
                <ImageIcon className="w-8 h-8"/>
              ) : (
                <FileIcon className="w-8 h-8"/>
              )}
            </div>
            <p>Drag and drop {fileType} files here</p>
            <p>or</p>
            <Button variant="outline" size="sm" type="button">
              Browse {fileType === "image" ? "images" : "files"}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-[80%]">
        {files.length !== 0 && (
          <Carousel className="max-w-[16rem] xl:max-w-[21rem] 2xl:max-w-lg pt-2">
            <CarouselContent className="-ml-2">
              {files.map((file, index) => (
                <CarouselItem
                  key={`${file.name}-${index}`}
                  className="pl-1 md:basis-1/2 lg:basis-1/3 2xl:basis-1/5"
                >
                  <Card className="p-1">
                    <CardContent className="relative aspect-square items-center justify-center p-1">
                      <img
                        className="rounded-md aspect-square"
                        src={file.preview}
                        alt={file.name}
                        onLoad={() => {
                          URL.revokeObjectURL(file.preview);
                        }}
                      />
                      <Button
                        className="absolute w-6 h-6 top-0 right-0"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFile(file.name)}
                      >
                        <CircleX className="fill-red-600 stroke-red-100"/>
                      </Button>
                    </CardContent>
                    <CardDescription className="truncate px-1">
                      {file.name}
                      <p className="text-xs font-semibold">
                        {formatFileSize(file.size)}
                      </p>
                    </CardDescription>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious/>
            <CarouselNext/>
          </Carousel>
        )}
      </div>
    </div>
  );
};

function formatFileSize(size: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }
  return `${size.toFixed(1)}${units[index]}`;
}

export default Dropzone;
