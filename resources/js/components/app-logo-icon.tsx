import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <>
            <img
                {...props}
                src="/images/LOGO.png"
                alt="BAUST Logo"
            />
        </>
    );
}
