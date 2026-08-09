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

export function ResponsiveModalTrigger({
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const { isDesktop } = useResponsiveModal();
  const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;
  return <Trigger {...props}>{children}</Trigger>;
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

  return <DrawerContent className={className}>{children}</DrawerContent>;
}

export function ResponsiveModalHeader({
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const { isDesktop } = useResponsiveModal();
  const Header = isDesktop ? DialogHeader : DrawerHeader;
  return <Header {...props}>{children}</Header>;
}

export function ResponsiveModalTitle({
  children,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const { isDesktop } = useResponsiveModal();
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  return <Title {...props}>{children}</Title>;
}

export function ResponsiveModalDescription({
  children,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const { isDesktop } = useResponsiveModal();
  const Description = isDesktop ? DialogDescription : DrawerDescription;
  return <Description {...props}>{children}</Description>;
}

export function ResponsiveModalFooter({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const { isDesktop } = useResponsiveModal();
  const Footer = isDesktop ? DialogFooter : DrawerFooter;
  return <Footer {...props}>{children}</Footer>;
}

export function ResponsiveModalClose({
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const { isDesktop } = useResponsiveModal();
  const Close = isDesktop ? DialogClose : DrawerClose;
  return <Close {...props}>{children}</Close>;
}
