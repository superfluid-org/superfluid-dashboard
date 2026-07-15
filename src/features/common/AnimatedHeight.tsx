import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FC, PropsWithChildren, useEffect, useRef } from "react";

/**
 * Animates its own height to follow its content's natural height, so containers whose
 * children swap abruptly (e.g. a dialog switching between its loading and success
 * branches) glide instead of jumping. The height is driven imperatively off a
 * ResizeObserver — no React state — and settles back to `height: auto` after each
 * transition so scrolling and max-height constraints keep working between changes.
 *
 * Both wrappers preserve the flex-column contract of a MUI Dialog paper: in a fixed-size
 * (fullscreen) paper the chain stretches and DialogContent keeps scrolling — but pass
 * `disableAnimation` there, since the paper's height isn't content-driven and animating
 * the content would only detach the actions from the bottom.
 */

const Outer = styled("div")`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
`;

const Inner = styled("div")`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
`;

const AnimatedHeight: FC<
  PropsWithChildren<{
    disableAnimation?: boolean;
    durationMs?: number;
  }>
> = ({ children, disableAnimation = false, durationMs = 300 }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const easing = theme.transitions.easing.easeInOut;

  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );
  // Read through a ref so the ResizeObserver callback sees the current value without
  // re-subscribing.
  const enabledRef = useRef(false);
  enabledRef.current = !disableAnimation && !prefersReducedMotion;

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || typeof ResizeObserver === "undefined") return;

    let lastHeight: number | null = null;
    let animating = false;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    // `lastHeight` is deliberately NOT updated here: restoring `auto` lets the content
    // report its natural height again, so a change that landed mid-animation re-fires
    // the observer and animates the remainder from the previous target.
    const settle = () => {
      if (!animating) return;
      animating = false;
      clearTimeout(settleTimer);
      outer.style.transition = "";
      outer.style.height = "auto";
      outer.style.overflow = "";
      inner.style.flexShrink = "";
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === outer && event.propertyName === "height") settle();
    };
    outer.addEventListener("transitionend", onTransitionEnd);

    const observer = new ResizeObserver(() => {
      // While the height is pinned, the flex chain makes the content track the animated
      // (not natural) height — those fires must not retarget the animation.
      if (animating) return;
      const newHeight = inner.getBoundingClientRect().height;
      const from = lastHeight;
      lastHeight = newHeight;
      // `from === null` is the initial observe fire on mount — record only, no animation
      // on dialog open.
      if (from === null || !enabledRef.current || Math.abs(newHeight - from) < 1)
        return;

      outer.style.overflow = "hidden";
      // Keep the content at its natural height while Outer glides: without this, growing
      // flex-squeezes the content (min-height: 0), and a scroll container inside (e.g.
      // DialogContent) flashes its own scrollbar mid-animation. Clipping via Outer's
      // overflow reveals the content progressively instead.
      inner.style.flexShrink = "0";
      outer.style.height = `${from}px`;
      // Reflow so the transition starts from the old height instead of snapping.
      void outer.offsetHeight;
      outer.style.transition = `height ${durationMs}ms ${easing}`;
      outer.style.height = `${newHeight}px`;
      animating = true;
      // transitionend is swallowed when the tab is hidden or the transition is
      // interrupted — the timer guarantees the settle.
      settleTimer = setTimeout(settle, durationMs + 60);
    });
    observer.observe(inner);

    return () => {
      observer.disconnect();
      outer.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(settleTimer);
      outer.style.transition = "";
      outer.style.height = "";
      outer.style.overflow = "";
      inner.style.flexShrink = "";
    };
  }, [durationMs, easing]);

  return (
    <Outer ref={outerRef}>
      <Inner ref={innerRef}>{children}</Inner>
    </Outer>
  );
};

export default AnimatedHeight;
