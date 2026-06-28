import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type DialogPortalProps = {
  children: ReactNode;
};

export function DialogPortal({ children }: DialogPortalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.classList.add("vih-modal-open");
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("vih-modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(children, document.body);
}
