/**
 * Motion gate (CLAUDE.md §8): only sections near the viewport keep their
 * animations.
 *
 * Chrome services every scroll-driven animation on every scroll frame, even
 * for sections thousands of pixels away, and that cost made the whole page
 * scroll heavily. A section further than a screen away gets `is-far`,
 * which removes its animations (`styles.css`). It gets them back well before
 * it can be seen, and a scroll-linked animation picks up exactly where the
 * scroll position says it should be, so nothing visible changes.
 *
 * Facilities is several screens tall, so each of its rooms is also gated on
 * its own; the pinned directory follows the section.
 *
 * Browser only; call from afterNextRender. The hero is never gated: its load
 * sequence is time-based and would replay. Without JavaScript nothing is gated.
 */
export function startMotionGate(): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => undefined;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('is-far', !e.isIntersecting);
    },
    { rootMargin: '100% 0px' },
  );

  const watched = new WeakSet<Element>();
  const scan = () => {
    document
      .querySelectorAll(
        'main section[id]:not([aria-labelledby="hero-title"]), main article.room, footer.footer',
      )
      .forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
  };
  scan();

  // Sections arrive later (@defer) and change with the route.
  const mo = new MutationObserver(scan);
  const main = document.getElementById('main');
  if (main) mo.observe(main, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
  };
}
