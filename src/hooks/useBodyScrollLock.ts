import { useEffect } from 'react';

/**
 * Custom React hook to lock body scrolling when a modal or dialog is active.
 * Restores the previous body overflow setting when closed or unmounted.
 */
export function useBodyScrollLock(isOpen: boolean = true): void {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);
}
