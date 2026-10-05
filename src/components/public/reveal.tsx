"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
  type TransitionEvent,
} from "react";

/** Stagger steps beyond this share the last delay, so nothing waits long. */
export const MAX_STAGGER_STEPS = 3;

/**
 * Fades and slides its content up as it scrolls into view. Timing comes from
 * the --motion-* variables in globals.css.
 *
 * The server HTML and the first client render are plain and fully visible.
 * After mount, an element is hidden only when it is entirely below the
 * viewport, motion is allowed and IntersectionObserver exists. So nothing is
 * hidden without JavaScript, from crawlers or from assistive technology
 * (opacity and transform only, never display or aria-hidden), and an element
 * that is already in view is never hidden. It animates transform and opacity
 * only, so it cannot shift layout, and it drops its inline styles when done.
 *
 * Put it around a card, not on an element that has its own hover transform.
 */
export function Reveal({
  children,
  step = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Stagger position within a group; each step adds --motion-stagger. */
  step?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    // Only elements wholly below the viewport are hidden.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    const delay = `calc(var(--motion-stagger) * ${Math.min(
      Math.max(0, Math.floor(step)),
      MAX_STAGGER_STEPS,
    )})`;
    const timing = `var(--motion-duration) var(--motion-ease) ${delay}`;
    let observer: IntersectionObserver | null = null;

    const clear = () => {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("transition");
      delete el.dataset.reveal;
    };
    const stop = () => {
      observer?.disconnect();
      observer = null;
    };
    const show = () => {
      stop();
      // Commit the hidden state before changing it, so it transitions.
      void el.offsetHeight;
      el.dataset.reveal = "revealing";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    };
    const onMotionChange = () => {
      if (!motion.matches) return;
      stop();
      clear();
    };

    el.dataset.reveal = "hidden";
    el.style.opacity = "0";
    el.style.transform = "translateY(var(--motion-distance))";
    el.style.transition = `opacity ${timing}, transform ${timing}`;

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) show();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    observer.observe(el);
    motion.addEventListener("change", onMotionChange);

    return () => {
      motion.removeEventListener("change", onMotionChange);
      stop();
      clear();
    };
  }, [step]);

  const onTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    const el = ref.current;
    if (
      el &&
      event.target === el &&
      event.propertyName === "opacity" &&
      el.dataset.reveal === "revealing"
    ) {
      // Done: no lingering transform or stacking context.
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("transition");
      delete el.dataset.reveal;
    }
  };

  return (
    <Tag ref={ref} className={className} onTransitionEnd={onTransitionEnd}>
      {children}
    </Tag>
  );
}
