import React from 'react';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';

interface GacProductCardProps {
    title: string;
    category: string;
    badge: string;
    description: string;
    features: string[];
    image: string;
}

export default function GacProductCard({
    title,
    category,
    badge,
    description,
    features,
    image,
}: GacProductCardProps) {
    return (
        <div className="reveal group glass-card rounded-3xl overflow-hidden flex flex-col hover:shadow-elegant hover:-translate-y-2 transition-all duration-500">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Badge overlay */}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-bold text-foreground shadow-soft">
                        {badge}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col flex-grow bg-transparent">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary mt-1 mb-3">
                    {category}
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 mt-3">
                    {description}
                </p>

                <ul className="space-y-2.5">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <Check size={16} className="text-primary shrink-0 mt-0.5" strokeWidth={3} />
                            <span className="text-sm text-foreground/80 font-medium">{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <div className="mt-auto pt-4 border-t border-border/40">
                    <a
                        href="#contact"
                        className="flex items-center justify-center gap-2 bg-gradient-hero text-white font-bold py-3.5 rounded-xl transition-all hover:opacity-90"
                    >
                        Inquire Now
                        <ArrowRight size={17} />
                    </a>
                </div>
            </div>
        </div>
    );
}
