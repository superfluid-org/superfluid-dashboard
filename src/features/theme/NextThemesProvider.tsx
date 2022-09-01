import { css, Global } from "@emotion/react";
import { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";

const NextThemesProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      {/* https://github.com/pacocoursey/next-themes#without-css-variables */}
      <Global
        styles={css`
          :root {
            --fg: #000;
            --bg: #fff;
          }

          [data-theme="dark"] {
            --fg: #fff;
            --bg: #000;
          }
        `}
      />
      <ThemeProvider defaultTheme="light" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </>
  );
};

export default NextThemesProvider;
