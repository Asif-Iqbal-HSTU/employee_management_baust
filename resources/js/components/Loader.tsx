import { useState, useEffect } from "react";

export default function Loader() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const show = () => setLoading(true);
        const hide = () => setLoading(false);

        // Listen to Inertia global events
        window.addEventListener("inertia:start", show);
        window.addEventListener("inertia:finish", hide);
        window.addEventListener("inertia:error", hide);

        return () => {
            window.removeEventListener("inertia:start", show);
            window.removeEventListener("inertia:finish", hide);
            window.removeEventListener("inertia:error", hide);
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-blue-700 font-semibold">Loading...</span>
        </div>
    );
}
