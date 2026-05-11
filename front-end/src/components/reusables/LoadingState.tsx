const THEME = {
    card: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    primary: '#fbbf24',
};

interface LoadingStateProps {
    message?: string;
    fullPage?: boolean;
}

const LoadingState = ({ message = "Fetching data...", fullPage = false }: LoadingStateProps) => {
    const containerStyle: React.CSSProperties = fullPage ? {
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    } : {
        padding: '3rem',
        textAlign: 'center' as const,
    };

    return (
        <div style={containerStyle}>
        <style>
            {`
            @keyframes spinCustom {
                to { transform: rotate(360deg); }
            }
            @keyframes pulseCustom {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.95); }
            }
            .custom-loader {
                width: 48px;
                height: 48px;
                border: 3px solid rgba(251, 191, 36, 0.1);
                border-radius: 50%;
                border-top-color: ${THEME.primary};
                animation: spinCustom 0.8s linear infinite;
                display: inline-block;
                margin-bottom: 1rem;
            }
            .loading-text {
                color: ${THEME.muted};
                font-size: 0.9rem;
                letter-spacing: 0.5px;
                animation: pulseCustom 1.5s ease-in-out infinite;
                text-transform: uppercase;
                font-weight: 600;
            }
            `}
        </style>
        <div className="custom-loader"></div>
        <div className="loading-text">{message}</div>
        </div>
    );
};

export default LoadingState;