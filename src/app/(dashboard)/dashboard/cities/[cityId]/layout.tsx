import Header from "@/features/dashboard/components/header";

export default async function PlantLayout({
  children,
}: LayoutProps<"/dashboard/cities/[cityId]">) {
  return (
    <div>
      <Header />
      <div className="[--app-layout-spacing:--spacing(6)] mx-auto mt-8 w-[calc(100%-var(--app-layout-spacing))]  pb-10">
        {children}
      </div>
    </div>
  );
}
