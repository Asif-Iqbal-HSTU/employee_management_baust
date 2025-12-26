import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Clock,
    Logs,
    User2,
    CalendarClock,
    Calendar,
    MonitorCog,
    FileSliders,
    ScrollText,
    Warehouse,
    TreePalm,
    Volleyball,
    TicketsPlane
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage();
    const authUser = props.auth.user;
    const repairCounts = props.repairCounts;
    const leaveCounts = props.leaveCounts;
    const storeCounts = props.storeCounts;


    function Badge({ count }: { count: number }) {
        if (!count || count <= 0) return null;

        return (
            <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                {count}
            </span>
        );
    }

    const isITAdmin = authUser?.employee_id === "25052";

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', category: 'Dashboard', icon: LayoutGrid },
    ];

    if (authUser?.headed_department || authUser?.employee_id == 25052 || authUser?.employee_id == 21023 || authUser?.employee_id == 25040) {
        mainNavItems.push(
            { title: 'My Department Attendance', href: '/dept-head/attendance', category: 'Attendance', icon: CalendarClock },
            {
                title: (
                    <span className="flex w-full items-center gap-2">
            <span>Leaves Requested</span>
            <Badge count={leaveCounts.head_pending} />
        </span>
                ),
                href: '/dept-head/leaves',
                category: 'Leave Management',
                icon: TreePalm,
            },

            // { title: 'Leaves Requested', href: '/dept-head/leaves', category: 'Leave Management', icon: TreePalm },
        );
    }

    if (authUser?.headed_department) {
        mainNavItems.push(
            { title: 'Store Requisitions', href: '/dept-head/store/requisitions', category: 'Store', icon: Clock },
        );
    }

    if (authUser?.employee_id == 25052) {
        mainNavItems.push(
            { title: 'Assign Users', href: '/user-assignments', category: 'Attendance', icon: User2 },
            { title: 'Sync Logs', href: '/sync-logs', category: 'Attendance', icon: Logs }
        );
    }

    if (authUser?.employee_id == 25040) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', category: 'Attendance', icon: Logs },
            { title: 'Late Summary Report', href: '/late-summary-report', category: 'Attendance', icon: Logs },
            { title: 'Monthly Report', href: '/departmentList', category: 'Attendance', icon: Calendar },
            {
                title: (
                    <span className="flex w-full items-center gap-2">
            <span>Leave Finalization</span>
            <Badge count={leaveCounts.registrar_pending} />
        </span>
                ),
                href: '/registrar/leave-requests',
                category: 'Leave Management',
                icon: TicketsPlane,
            },

            // { title: 'Leave Finalization', href: '/registrar/leave-requests', category: 'Leave Management', icon: TicketsPlane }
        );
    }

    if (
        authUser?.employee_id == 25052 ||
        authUser?.employee_id == 15012 ||
        authUser?.employee_id == 21023 ||
        authUser?.employee_id == 15231
    ) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', category: 'Attendance', icon: Logs },
            { title: 'Late Summary Report', href: '/late-summary-report', category: 'Attendance', icon: Logs }
        );
    }

    if (authUser?.employee_id == 15005) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', category: 'Attendance', icon: Logs },
        );
    }

    if (
        authUser?.employee_id == 15302 || authUser?.employee_id == 19001) {
        mainNavItems.push({
            title: (
                <span className="flex w-full items-center gap-2">
                <span>Issue List</span>
                <Badge count={storeCounts.pending_issues} />
            </span>
            ),
            href: '/storeman/issues',
            category: 'Store',
            icon: Logs,
        });
    }


    if (
        authUser?.employee_id == 23033 ||
        authUser?.employee_id == 25052 ||
        authUser?.employee_id == 15012 ||
        authUser?.employee_id == 21023
    ) {
        mainNavItems.push({
            title: 'Monthly Report',
            href: '/departmentList',
            category: 'Attendance',
            icon: Calendar
        });
    }

    if (isITAdmin) {
        mainNavItems.push(
            {
                title: (
                    <span className="flex w-full items-center gap-2">
                        <span>My Repair Requests</span>
                    </span>
                ),
                href: '/repair-requests?mine=1',
                category: 'IT Repair Cell',
                icon: FileSliders,
            },
            {
                title: (
                    <span className="flex w-full items-center gap-2">
                        <span>All Repair Requests</span>
                        <Badge count={repairCounts.admin_pending} />
                    </span>
                ),
                href: '/repair-requests',
                category: 'IT Repair Cell',
                icon: FileSliders,
            }
        );
    }

    if (!isITAdmin) {
        mainNavItems.push({
            title: 'My Repair Requests',
            href: '/repair-requests',
            category: 'IT Repair Cell',
            icon: FileSliders,
        });
    }

    mainNavItems.push(
        { title: 'Request Leaves', href: '/leave-management', category: 'Leave Management', icon: Volleyball },
        { title: 'Request a Repair', href: '/repair-requests/create', category: 'IT Repair Cell', icon: MonitorCog },
        { title: 'Store Items', href: '/categories', category: 'Store', icon: Warehouse },
        { title: 'Requisition from Store', href: '/requisitions', category: 'Store', icon: ScrollText },
    );

    // ✅ FIX: ensure every item has a stable string key
    /*mainNavItems.forEach((item, index) => {
        // @ts-ignore
        item.key = item.href + '-' + index;
    });*/

    // ✅ ADD KEYS (TYPE-SAFE)
    const navItemsWithKeys: NavItem[] = mainNavItems.map((item, index) => ({
        ...item,
        key: `${item.category}-${item.href}-${index}`,
    }));


    const groupedNav = navItemsWithKeys.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {Object.entries(groupedNav).map(([category, items]) => (
                    <NavMain key={category} title={category} items={items} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
