import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import AppearanceToggleTab from '@/components/appearance-tabs';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center border-b px-6 md:px-4">
            {/* FULL-WIDTH ROW */}
            <div className="flex w-full items-center justify-between">

                {/* LEFT */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* RIGHT */}
                <AppearanceToggleTab />
            </div>
        </header>
    );
}
