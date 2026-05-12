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

// Definimos la propiedad 'limit' para poder reusarlo en la Home
interface TradingNewsProps {
    limit?: number;
}

export default function TradingNews({ limit = 5 }: TradingNewsProps) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            const API_KEY = 'cbdd652e1e44218c9ab07d7da959cb49';
            const CACHE_KEY = `trading_news_cache_${limit}`; // Clave de caché única por límite
            const CACHE_TIME = 30 * 60 * 1000;

            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { articles, timestamp } = JSON.parse(cachedData);
                    if (Date.now() - timestamp < CACHE_TIME) {
                        setArticles(articles);
                        setLoading(false);
                        return;
                    }
                }

                const query = encodeURIComponent('trading OR stocks OR crypto');
                // Usamos el prop 'limit' en la URL
                const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=${limit}&apikey=${API_KEY}`;

                const response = await fetch(url);
                if (response.status === 429) throw new Error("Límite de API agotado");

                const data = await response.json();
                if (data.articles) {
                    setArticles(data.articles);
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        articles: data.articles,
                        timestamp: Date.now()
                    }));
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [limit]);

    return (
        <div className="card border-0 shadow-lg" style={{ 
            backgroundColor: THEME.card, 
            border: `1px solid ${THEME.border}`, 
            borderRadius: '12px',
            height: '100%' // Para que se ajuste al contenedor en una fila
        }}>
            <div className="card-header bg-transparent border-bottom border-secondary p-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 text-uppercase fw-bold" style={{ color: THEME.primary, fontSize: limit < 5 ? '0.75rem' : '0.9rem', letterSpacing: '1px' }}>
                    <span className="news-pulse"></span> {limit < 5 ? 'Market News' : 'Live Market Feed'}
                </h6>
            </div>
            
            <div className="card-body p-0" style={{ maxHeight: limit < 5 ? 'auto' : '500px', overflowY: 'auto' }}>
                {loading ? (
                    <div className="p-4 text-center text-white small">
                        <div className="spinner-border spinner-border-sm text-warning me-2"></div>
                        Loading...
                    </div>
                ) : error ? (
                    <div className="p-3 text-center text-danger small" style={{fontSize: '0.7rem'}}>{error}</div>
                ) : (
                    <div className="list-group list-group-flush">
                        {articles.map((item, idx) => (
                            <a 
                                key={idx} 
                                href={item.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="list-group-item list-group-item-action bg-transparent border-secondary px-3 py-2 news-item text-decoration-none"
                            >
                                <div className="d-flex align-items-start gap-2">
                                    {/* TEXTO A LA IZQUIERDA */}
                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="d-flex justify-content-between mb-0">
                                            <small style={{ color: THEME.primary, fontSize: '0.65rem', fontWeight: 'bold' }}>{item.source.name}</small>
                                        </div>
                                        <h6 className="mb-1 fw-bold text-white text-truncate-2" style={{ fontSize: limit < 5 ? '0.8rem' : '0.9rem', lineHeight: '1.2' }}>
                                            {item.title}
                                        </h6>
                                        {limit >= 5 && ( // Ocultar descripción en vista mini para ahorrar espacio
                                            <p className="mb-0 small news-description" style={{ color: THEME.muted, fontSize: '0.75rem' }}>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* IMAGEN A LA DERECHA */}
                                    {item.image && (
                                        <div className="flex-shrink-0 mt-1">
                                            <img 
                                                src={item.image} 
                                                alt="news" 
                                                className="rounded" 
                                                style={{ 
                                                    width: limit < 5 ? '50px' : '65px', 
                                                    height: limit < 5 ? '50px' : '65px', 
                                                    objectFit: 'cover', 
                                                    border: `1px solid ${THEME.border}` 
                                                }} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <style>
                {`
                .news-item { transition: all 0.2s ease; border-bottom: 1px solid ${THEME.border} !important; }
                .news-item:hover { background-color: rgba(240, 185, 11, 0.08) !important; }
                
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .news-description {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .news-pulse { height: 7px; width: 7px; background-color: #ff4d4d; border-radius: 50%; display: inline-block; margin-right: 5px; animation: pulse-red 1.5s infinite; }
                @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(255, 77, 77, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); } }
                
                .card-body::-webkit-scrollbar { width: 3px; }
                .card-body::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 10px; }
                `}
            </style>
        </div>
    );
}