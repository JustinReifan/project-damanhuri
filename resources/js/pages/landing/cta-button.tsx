import { CheckCircle } from 'lucide-react';

interface CtaButtonProps {
    text?: string;
    variant?: 'primary' | 'secondary' | 'dark';
    className?: string;
    id?: string;
    size?: 'default' | 'large';
    context?: 'light' | 'dark';
    onClick?: () => void;
    href?: string;
}

export default function CtaButton({
    text = 'Dapatkan Panduannya Sekarang',
    variant = 'primary',
    className = '',
    id,
    size = 'default',
    context = 'light',
    onClick,
    href,
}: CtaButtonProps) {
    const sizeClasses =
        size === 'large'
            ? 'px-10 py-5 text-lg sm:text-xl'
            : 'px-8 py-4 text-base sm:text-lg';

    const variantClasses =
        variant === 'primary'
            ? 'bg-lp-blue-600 text-white shadow-lg shadow-lp-blue-600/25 hover:bg-lp-blue-700 hover:shadow-xl hover:shadow-lp-blue-700/25 hover:-translate-y-0.5'
            : variant === 'dark'
              ? 'bg-lp-slate-900 text-white shadow-lg shadow-black/25 hover:bg-black hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-white text-lp-blue-700 shadow-lg hover:bg-lp-blue-50 hover:-translate-y-0.5 ring-1 ring-lp-blue-200';

    const socialProofTextClass =
        context === 'dark' ? 'text-white/70' : 'text-lp-slate-500';
    const socialProofIconClass =
        context === 'dark' ? 'text-white/60' : 'text-lp-blue-500';

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            <button
                type="button"
                id={id}
                onClick={() => {
                    onClick?.();
                    if (href) {
                        window.location.href = href;
                    } else {
                        document
                            .getElementById('harga')
                            ?.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ${sizeClasses} ${variantClasses}`}
            >
                {text}
            </button>
            <p
                className={`flex items-center gap-1.5 text-sm ${socialProofTextClass}`}
            >
                <CheckCircle className={`h-4 w-4 ${socialProofIconClass}`} />
                7.000+ orang sudah bergabung
            </p>
        </div>
    );
}
