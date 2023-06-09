import { styled } from "@mui/material";
import { FC, useRef } from "react";

const HiddenInput = styled("input")({ display: "none" });

interface ReadFileButtonProps {
  mimeType: string;
  onLoaded: (file: File) => any;
  children: ({ selectFile }: { selectFile: () => void }) => JSX.Element;
}

const ReadFileButton: FC<ReadFileButtonProps> = ({
  onLoaded,
  mimeType,
  children,
}) => {
  const inputElementRef = useRef<HTMLInputElement | null>(null);

  const selectFile = () => {
    if (!inputElementRef.current) return;
    inputElementRef.current.click();
  };

  const onFileCanged = async () => {
    if (!inputElementRef.current?.files) return;
    onLoaded(inputElementRef.current.files[0]);
    // Resets file input so selecting the same file will trigger onChange event again.
    inputElementRef.current.value = "";
  };

  return (
    <>
      <HiddenInput
        ref={inputElementRef}
        type="file"
        accept={mimeType}
        onChange={onFileCanged}
      />
      {children({ selectFile })}
    </>
  );
};

export default ReadFileButton;
