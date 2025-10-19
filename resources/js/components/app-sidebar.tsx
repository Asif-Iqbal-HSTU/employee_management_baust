import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Clock, Logs, User2, CalendarClock, Calendar  } from 'lucide-react';
import AppLogo from './app-logo';



export function AppSidebar() {
    const { props } = usePage();
    const authUser = props.auth.user;


    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

// if dept head
    if (authUser?.headed_department) {
        mainNavItems.push({
            title: 'My Department Attendance',
            href: '/dept-head/attendance',
            icon: CalendarClock,
        },{
            title: 'Time Assignment',
            href: '/time-assignments',
            icon: Clock,
        });
    }

    if (authUser?.employee_id==25052) {
        mainNavItems.push({
            title: 'Assign Users',
            href: '/user-assignments',
            icon: User2,
        }, {
            title: 'Sync Logs',
            href: '/sync-logs',
            icon: Logs,
        });
    }

    if (authUser?.employee_id==25052 || authUser?.employee_id==15012 || authUser?.employee_id==25040) {
        mainNavItems.push({
            title: 'All Departments',
            href: '/departments',
            icon: Logs,
        },{
            title: 'Late Summary Report',
            href: '/late-summary-report',
            icon: Logs,
        });
    }

    if (authUser?.employee_id==23033 || authUser?.employee_id==25052 || authUser?.employee_id==25040 || authUser?.employee_id==15012) {
        mainNavItems.push({
            title: 'Monthly Report',
            href: '/departmentList',
            icon: Calendar,
        });
    }
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
