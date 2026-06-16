import { useEffect, useRef } from "react";

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold },
    );

    const observeIn = (root: Element) => {
      if (root.classList.contains("fade-up")) observer.observe(root);
      root
        .querySelectorAll(".fade-up")
        .forEach((child) => observer.observe(child));
    };

    observeIn(element);

    // Observe .fade-up nodes added after mount (e.g. async-loaded lists),
    // otherwise they never become visible and stay at opacity: 0.
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) observeIn(node);
        });
      });
    });
    mutationObserver.observe(element, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold]);

  return ref;
}
