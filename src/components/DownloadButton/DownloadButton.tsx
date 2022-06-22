import { styled } from "@mui/material";
import { FC, useRef } from "react";

const HiddenLink = styled("a")({ display: "none" });

interface DownloadButtonProps {
  content: string;
  contentType: string;
  fileName: string;
  children: ({ download }: { download: () => void }) => JSX.Element;
}

const DownloadButton: FC<DownloadButtonProps> = ({
  content,
  fileName,
  contentType,
  children,
}) => {
  const downloadElementRef = useRef<HTMLAnchorElement | null>(null);

  const download = () => {
    const contentBlob = new Blob([content], { type: contentType });
    const fileUrl = URL.createObjectURL(contentBlob);

    if (!downloadElementRef.current) return;

    downloadElementRef.current.href = fileUrl;
    downloadElementRef.current.setAttribute("download", fileName);
    downloadElementRef.current.click();
  };

  return (
    <>
      <HiddenLink ref={downloadElementRef} />
      {children({ download })}
    </>
  );
};

export default DownloadButton;
