// resources/js/Pages/Welcome.tsx
import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome | BAUST Attendance" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 dark:bg-[#1b1b18]">
                <div className="max-w-3xl w-full bg-white dark:bg-[#2b2b27] shadow-xl rounded-2xl p-10 text-center space-y-6">

                    {/* Logo */}
                    <img
                        src="/images/BAUST logo.png"
                        alt="BAUST Logo"
                        className="mx-auto w-28 h-28 mb-4"
                    />

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                        BAUST Management System
                    </h1>

                    {/* Subtitle */}
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Bangladesh Army University of Science and Technology (BAUST)
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        {auth.user ? (
                            <Link
                                href={route("dashboard")}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                {/*<Link
                                    href={route("login")}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>*/}
                                <Link
                                    href={route("login")}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-10 text-gray-500 dark:text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} ICT Wing & Archive, BAUST · All Rights Reserved
                </footer>
                <footer className="mt-10 text-gray-500 dark:text-gray-400 text-sm">
                    If you face any problem, please call the developer: Md. Asif Iqbal, 01725215111
                </footer>
            </div>
        </>
    );
}
