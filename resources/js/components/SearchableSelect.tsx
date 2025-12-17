import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
                                             items,
                                             value,
                                             onChange,
                                             placeholder = "Select",
                                             labelKey = "name",
                                             valueKey = "id",
                                         }: any) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const filtered = items.filter((item: any) =>
        item[labelKey].toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const clickOutside = (e: any) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", clickOutside);
        return () => document.removeEventListener("mousedown", clickOutside);
    }, []);

    const selected = items.find((i: any) => i[valueKey] == value);

    return (
        <div className="relative" ref={ref}>
            {/* Selected */}
            <div
                className="input cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                {selected ? selected[labelKey] : placeholder}
            </div>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded border bg-white shadow">
                    <input
                        type="text"
                        className="w-full border-b p-2 text-sm focus:outline-none"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length ? (
                            filtered.map((item: any) => (
                                <div
                                    key={item[valueKey]}
                                    onClick={() => {
                                        onChange(item[valueKey]);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-50"
                                >
                                    {item[labelKey]}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No results
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
