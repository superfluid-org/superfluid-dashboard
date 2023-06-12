import { styled } from "@mui/material";
import { FC } from "react";

const LoaderSvg = styled("svg")`
  position: relative;

  .rect1 {
    x: 0;
    y: 4;
  }

  .rect2 {
    opacity: 0;
    rx: 0;
  }

  polygon {
    transform: translate(0, 0);
  }

  @keyframes rectIn {
    0% {
      x: 0;
      y: 4;
    }
    25% {
      x: 1;
      y: 3;
    }
    65% {
      x: 1;
      y: 3;
    }
    85% {
      x: 0;
      y: 4;
    }
    100% {
      x: 0;
      y: 4;
    }
  }

  @keyframes polyIn {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-1px, 1px);
    }
    65% {
      transform: translate(-1px, 1px);
    }
    85% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    15% {
      transform: rotate(0deg);
    }
    65% {
      transform: rotate(360deg);
    }
    99% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(0);
    }
  }

  &:hover {
    animation: spin 1000ms cubic-bezier(0.6, 0, 0.4, 1);
    animation-iteration-count: infinite;

    .rect1 {
      animation: rectIn 1000ms cubic-bezier(0.6, 0, 0.4, 1);
      animation-iteration-count: infinite;
    }

    polygon {
      animation: polyIn 1000ms cubic-bezier(0.6, 0, 0.4, 1);
      animation-iteration-count: infinite;
    }
  }
`;

interface LoaderProps {}

const Loader: FC<LoaderProps> = ({}) => {
  return (
    <LoaderSvg viewBox="0 0 6 6" width="40" height="40">
      <rect className="rect1" x="0" y="4" width="2" height="2" fill="black" />
      <rect className="rect2" x="1" y="1" width="4" height="4" fill="black" />
      <polygon points="2,0 6,0 6,4 4,4 4,2 2,2" fill="black" />
    </LoaderSvg>
  );
};

export default Loader;
