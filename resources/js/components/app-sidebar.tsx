import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Clock, Logs, User2, CalendarClock, Calendar, MonitorCog, FileSliders } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage();
    const authUser = props.auth.user;

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    ];

    // Conditional items
    if (authUser?.headed_department || authUser?.employee_id == 25052 || authUser?.employee_id == 21023 || authUser?.employee_id == 25040) {
        mainNavItems.push(
            { title: 'My Department Attendance', href: '/dept-head/attendance', icon: CalendarClock },
            { title: 'Time Assignment', href: '/time-assignments', icon: Clock },
        );
    }

    if (authUser?.employee_id == 25052) {
        mainNavItems.push(
            { title: 'Assign Users', href: '/user-assignments', icon: User2 },
            { title: 'Sync Logs', href: '/sync-logs', icon: Logs }
        );
    }

    if (authUser?.employee_id == 25040) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', icon: Logs },
            { title: 'Late Summary Report', href: '/late-summary-report', icon: Logs },
            { title: 'Monthly Report', href: '/departmentList', icon: Calendar }
        );
    }

    if ([25052, 15012, 25040, 21023, 15231].includes(authUser?.employee_id)) {
        mainNavItems.push(
            { title: 'All Departments', href: '/departments', icon: Logs },
            { title: 'Late Summary Report', href: '/late-summary-report', icon: Logs }
        );
    }

    if ([23033, 25052, 25040, 15012, 21023].includes(authUser?.employee_id)) {
        mainNavItems.push({ title: 'Monthly Report', href: '/departmentList', icon: Calendar });
    }

    mainNavItems.push(
        { title: 'Worklog', href: '/worklog', icon: Calendar },
        { title: 'My Repair Requests', href: '/repair-requests', icon: FileSliders },
        { title: 'Request a Repair', href: '/repair-requests/create', icon: MonitorCog }
    );

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
                {/* Main navigation */}
                <NavMain
                    title="Platform"
                    items={mainNavItems.filter(
                        (item) => item.title !== 'My Repair Requests' && item.title !== 'Request a Repair'
                    )}
                />

                {/* IT Repair section */}
                <NavMain
                    title="IT Repair"
                    items={mainNavItems.filter(
                        (item) => item.title === 'My Repair Requests' || item.title === 'Request a Repair'
                    )}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
