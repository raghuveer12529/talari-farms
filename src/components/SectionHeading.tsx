import React from 'react';

interface SectionHeadingProps {
    badge: string;
    title: React.ReactNode;
    subtitle?: string;
    centered?: boolean;
    dark?: boolean;
}

export default function SectionHeading({
    badge,
    title,
    subtitle,
    centered = true,
    dark = false
}: SectionHeadingProps) {
    return (
        <div className={`space-y-6 ${centered ? 'text-center' : 'text-left'} max-w-4xl ${centered ? 'mx-auto' : ''} font-sans`}>
            <span className={`inline-block font-bold tracking-[0.3em] uppercase text-xs ${dark ? 'text-[#FA9842]' : 'text-[#DA341B]'}`}>
                {badge}
            </span>
            <h2 className={`heading-section ${dark ? 'text-white' : 'text-[#301D17]'}`}>
                {title}
            </h2>
            {subtitle && (
                <p className={`text-premium ${dark ? 'text-white/60' : 'text-[#301D17]/70'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
