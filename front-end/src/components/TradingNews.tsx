import { useEffect, useState } from 'react';

type Article = {
    title: string;
    description: string;
    url: string;
    image: string;
    publishedAt: string;
    source: { name: string };
    };

const THEME = {
    card: '#1a2949',
    border: '#2b3139',
    primary: '#f0b90b',
    text: '#ffffff',
    muted: '#848e9c',
};

export default function TradingNews() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
        try {
            const API_KEY = 'TU_API_KEY_AQUI'; 
            const query = 'trading OR stocks OR "stock market" OR crypto';
            const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=5&apikey=${API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();
            setArticles(data.articles || []);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchNews();
    }, []);

    return (
        <div className="card border-0 shadow-lg mt-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: '12px' }}>
        <div className="card-header bg-transparent border-bottom border-secondary p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-uppercase fw-bold" style={{ color: THEME.primary, letterSpacing: '1px' }}>
            <span className="news-pulse"></span> Live Market Feed
            </h5>
            <span className="badge bg-dark border border-secondary text-white small">TOPIC: FINANCE</span>
        </div>
        
        <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
            <div className="p-5 text-center text-white">
                <div className="spinner-border spinner-border-sm text-warning me-2"></div>
                Syncing news wires...
            </div>
            ) : (
            <div className="list-group list-group-flush">
                {articles.map((item, idx) => (
                <a 
                    key={idx} 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="list-group-item list-group-item-action bg-transparent border-secondary p-3 news-item"
                >
                    <div className="d-flex w-100 justify-content-between mb-1">
                    <small style={{ color: THEME.primary }}>{item.source.name}</small>
                    <small className="text-white-50">{new Date(item.publishedAt).toLocaleTimeString()}</small>
                    </div>
                    <h6 className="mb-1 fw-bold text-white">{item.title}</h6>
                    <p className="mb-1 small text-truncate" style={{ color: THEME.muted }}>{item.description}</p>
                </a>
                ))}
            </div>
            )}
        </div>

        <style>
            {`
            .news-item {
                transition: background-color 0.3s ease;
                border-bottom: 1px solid ${THEME.border} !important;
            }
            .news-item:hover {
                background-color: rgba(240, 185, 11, 0.05) !important;
            }
            .news-pulse {
                height: 10px;
                width: 10px;
                background-color: #ff4d4d;
                border-radius: 50%;
                display: inline-block;
                margin-right: 8px;
                animation: pulse-red 1.5s infinite;
            }
            @keyframes pulse-red {
                0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
            }
            /* Custom Scrollbar */
            .card-body::-webkit-scrollbar { width: 4px; }
            .card-body::-webkit-scrollbar-track { background: transparent; }
            .card-body::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 10px; }
            `}
        </style>
        </div>
    );
}