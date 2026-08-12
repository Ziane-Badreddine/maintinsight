"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

const ResponsiveModalContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: true,
});

function useResponsiveModal() {
  return React.useContext(ResponsiveModalContext);
}

interface ResponsiveModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <ResponsiveModalContext.Provider value={{ isDesktop }}>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
          {children}
        </Drawer>
      )}
    </ResponsiveModalContext.Provider>
  );
}

// NOTE: We intentionally avoid the `const Comp = isDesktop ? A : B` pattern.
// Base UI's Dialog and Drawer components are parallel APIs but not
// structurally identical — e.g. `handle` is branded differently
// (DialogHandle vs DrawerHandle), and `className` render-prop callbacks
// receive different state shapes (DialogPopupState has `nestedDialogOpen`,
// DrawerPopupState doesn't). Unifying them into one variable, or spreading
// Dialog-typed props onto a Drawer component, trips these mismatches one
// field at a time. Branching with explicit JSX per case, and casting the
// whole prop bag at the boundary, treats them as the two distinct-but-
// parallel APIs they actually are instead of pretending they're identical.

type DrawerTriggerProps = React.ComponentProps<typeof DrawerTrigger>;
type DrawerHeaderProps = React.ComponentProps<typeof DrawerHeader>;
type DrawerTitleProps = React.ComponentProps<typeof DrawerTitle>;
type DrawerDescriptionProps = React.ComponentProps<typeof DrawerDescription>;
type DrawerFooterProps = React.ComponentProps<typeof DrawerFooter>;
type DrawerCloseProps = React.ComponentProps<typeof DrawerClose>;

export function ResponsiveModalTrigger({
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return <DialogTrigger {...props}>{children}</DialogTrigger>;
  }

  return (
    <DrawerTrigger {...(props as unknown as DrawerTriggerProps)}>
      {children}
    </DrawerTrigger>
  );
}

export function ResponsiveModalContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent
      className={className as unknown as DrawerHeaderProps["className"]}
    >
      {children}
    </DrawerContent>
  );
}

export function ResponsiveModalHeader({
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return <DialogHeader {...props}>{children}</DialogHeader>;
  }

  return (
    <DrawerHeader {...(props as unknown as DrawerHeaderProps)}>
      {children}
    </DrawerHeader>
  );
}

export function ResponsiveModalTitle({
  children,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return <DialogTitle {...props}>{children}</DialogTitle>;
  }

  return (
    <DrawerTitle {...(props as unknown as DrawerTitleProps)}>
      {children}
    </DrawerTitle>
  );
}

export function ResponsiveModalDescription({
  children,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return <DialogDescription {...props}>{children}</DialogDescription>;
  }

  return (
    <DrawerDescription {...(props as unknown as DrawerDescriptionProps)}>
      {children}
    </DrawerDescription>
  );
}

export function ResponsiveModalFooter({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return <DialogFooter {...props}>{children}</DialogFooter>;
  }

  return (
    <DrawerFooter {...(props as unknown as DrawerFooterProps)}>
      {children}
    </DrawerFooter>
  );
}

export function ResponsiveModalClose({
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return <DialogClose {...props}>{children}</DialogClose>;
  }

  return (
    <DrawerClose {...(props as unknown as DrawerCloseProps)}>
      {children}
    </DrawerClose>
  );
}
