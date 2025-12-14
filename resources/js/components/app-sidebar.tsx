import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Clock, Logs, User2, CalendarClock, Calendar, MonitorCog, FileSliders, ScrollText, Warehouse } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage();
    const authUser = props.auth.user;

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', category: 'Dashboard', icon: LayoutGrid },
    ];

    // Conditional items
    if (authUser?.headed_department || authUser?.employee_id == 25052 || authUser?.employee_id == 21023 || authUser?.employee_id == 25040) {
        mainNavItems.push(
            { title: 'My Department Attendance', href: '/dept-head/attendance', category: 'Attendance', icon: CalendarClock },
            // { title: 'Time Assignment', href: '/time-assignments', category: 'Attendance', icon: Clock },
            { title: 'Leaves Requested', href: '/dept-head/leaves', category: 'Leave Management', icon: Clock },
        );
    }

    if (authUser?.headed_department) {
        mainNavItems.push(
            { title: 'Store Requisitions', href: '/dept-head/store/requisitions', category: 'Store', icon: Clock },
        );
    }

    // if (authUser?.headed_department || authUser?.employee_id == 25052) {
    //     mainNavItems.push(
    //         { title: 'My Department Attendance', href: '/dept-head/attendance', category: 'Attendance', icon: CalendarClock },
    //     );
    // }

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
            { title: 'Leave Finalization', href: '/registrar/leave-requests', category: 'Leave Management', icon: Calendar }
        );
    }

    /*if (authUser?.employee_id == 23033) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', category: 'Attendance', icon: Logs },
            { title: 'Late Summary Report', href: '/late-summary-report', category: 'Attendance', icon: Logs },
        );
    }*/


    if (authUser?.employee_id == 25052 ||
        authUser?.employee_id == 15012 ||
        authUser?.employee_id == 21023 ||
        authUser?.employee_id == 25040 ||
        authUser?.employee_id == 15231) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', category: 'Attendance', icon: Logs },
            { title: 'Late Summary Report', href: '/late-summary-report', category: 'Attendance', icon: Logs }
        );
    }

    if (
        authUser?.employee_id == 15005) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', category: 'Attendance', icon: Logs },
        );
    }

    if (
        authUser?.employee_id == 15302 || authUser?.employee_id == 19001) {
        mainNavItems.push(
            { title: 'Issue List', href: '/storeman/issues', category: 'Store', icon: Logs },
        );
    }

    /*if ([25052, 15012, 25040, 21023, 15231].includes(authUser?.employee_id)) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', icon: Logs },
            { title: 'Late Summary Report', href: '/late-summary-report', icon: Logs }
        );
    }*/

    if (authUser?.employee_id == 23033 ||
        authUser?.employee_id == 25052 ||
        authUser?.employee_id == 25040 ||
        authUser?.employee_id == 15012 ||
        authUser?.employee_id == 21023)
    {
        mainNavItems.push({ title: 'Monthly Report', href: '/departmentList', category: 'Attendance', icon: Calendar });
    }

    mainNavItems.push(
        { title: 'Request Leaves', href: '/leave-management', category: 'Leave Management', icon: Calendar },
        // { title: 'Worklog', href: '/worklog', category: 'Attendance', icon: Calendar },
        { title: 'My Repair Requests', href: '/repair-requests', category: 'IT Repair Cell', icon: FileSliders },
        { title: 'Request a Repair', href: '/repair-requests/create', category: 'IT Repair Cell', icon: MonitorCog },
        { title: 'Store Items', href: '/categories', category: 'Store', icon: Warehouse },
        { title: 'Requisition from Store', href: '/requisitions', category: 'Store', icon: ScrollText },
    );


    const groupedNav = mainNavItems.reduce((acc, item) => {
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

            {/*<SidebarContent>
                <NavMain
                    title="Platform"
                    items={mainNavItems.filter(
                        (item) => item.title !== 'My Repair Requests' && item.title !== 'Request a Repair'
                    )}
                />

                <NavMain
                    title="IT Repair"
                    items={mainNavItems.filter(
                        (item) => item.title === 'My Repair Requests' || item.title === 'Request a Repair'
                    )}
                />
            </SidebarContent>*/}

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
