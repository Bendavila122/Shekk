import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { hydrateStart } from "@tanstack/react-start/client";

startTransition(() => {
  void hydrateStart()
    .then((router) => {
      hydrateRoot(
        document,
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>,
      );
    })
    .catch((error) => {
      console.error(error);
      document.body.textContent = "Shekk couldn't load. Refresh and try again.";
    });
});