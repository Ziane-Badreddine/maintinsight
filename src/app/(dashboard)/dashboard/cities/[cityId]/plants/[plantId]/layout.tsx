import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Header from "@/features/dashboard/components/header";
import { AppSidebar } from "@/features/dashboard/layouts/app-sidebar";
export default async function PlantLayout({
  params,
  children,
}: LayoutProps<"/dashboard/cities/[cityId]/plants/[plantId]">) {
  const { plantId, cityId } = await params;
  return (
    <div className="[--header-height:calc(--spacing(16))] ">
      <SidebarProvider className="flex flex-col">
        <Header />
        <div className="flex flex-1 ">
          <AppSidebar plantId={plantId} cityId={cityId} />
          <SidebarInset>
            <ScrollArea className="h-[calc(100svh-64.8px)]">
              <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </ScrollArea>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
