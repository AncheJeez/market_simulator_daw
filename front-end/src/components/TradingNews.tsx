import { useEffect, useState } from 'react';

type Article = {
    title: string;
    url: string;
    image: string;
    publishedAt: string;
    source: string;
};

const THEME = {
    card: '#1a2949',
    border: '#2b3139',
    primary: '#f0b90b',
    reddit: '#FF4500',
    text: '#ffffff',
    muted: '#848e9c',
};

interface FeedProps {
    type: 'news' | 'reddit';
    limit?: number; // Este será ahora el total a descargar (ej. 15)
}

export default function TradingSocialFeed({ type, limit = 15 }: FeedProps) {
    const [items, setItems] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 5;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (type === 'news') {
                    const API_KEY = 'cbdd652e1e44218c9ab07d7da959cb49';
                    const res = await fetch(`https://gnews.io/api/v4/search?q=trading&lang=en&max=${limit}&apikey=${API_KEY}`);
                    const data = await res.json();
                    setItems(data.articles.map((a: any) => ({
                        title: a.title,
                        url: a.url,
                        image: a.image,
                        publishedAt: a.publishedAt,
                        source: a.source.name
                    })));
                } else {
                    // Añadimos: wallstreetbets, investing y stocks al string de subreddits
                    const subreddits = 'trading+DayTrading+wallstreetbets+investing+stocks';
                    const res = await fetch(`https://www.reddit.com/r/${subreddits}/top.json?limit=${limit}&t=day`);
                    const data = await res.json();
                    
                    setItems(data.data.children.map((post: any) => ({
                        title: post.data.title,
                        url: `https://www.reddit.com${post.data.permalink}`,
                        image: post.data.thumbnail.startsWith('http') ? post.data.thumbnail : '',
                        publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
                        source: `r/${post.data.subreddit}`
                    })));
                }
            } catch (err) {
                console.error("Error fetching feed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type, limit]);

    // Lógica de paginación
    const totalPages = Math.ceil(items.length / pageSize);
    const visibleItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
    const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

    const isReddit = type === 'reddit';

    return (
        <div className="card border-0 shadow-lg mb-4" style={{ 
            backgroundColor: THEME.card, 
            border: `1px solid ${THEME.border}`, 
            borderRadius: '12px',
            overflow: 'hidden'
        }}>
            <div className="card-header bg-transparent border-bottom border-secondary p-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 text-uppercase fw-bold" style={{ 
                    color: isReddit ? THEME.reddit : THEME.primary, 
                    fontSize: '0.75rem', 
                    letterSpacing: '1px' 
                }}>
                    <span className="feed-pulse" style={{ backgroundColor: isReddit ? THEME.reddit : '#00ff88' }}></span>
                    {isReddit ? 'Reddit Community' : 'Market News'}
                </h6>
                
                {!loading && items.length > pageSize && (
                    <div className="d-flex gap-2">
                        <button onClick={prevPage} className="btn btn-sm btn-outline-secondary border-0 p-0 px-1" style={{ color: THEME.muted }}>
                            <i className="bi bi-chevron-left"></i> ◀
                        </button>
                        <span style={{ fontSize: '0.65rem', color: THEME.muted, alignSelf: 'center' }}>
                            {currentPage + 1} / {totalPages}
                        </span>
                        <button onClick={nextPage} className="btn btn-sm btn-outline-secondary border-0 p-0 px-1" style={{ color: THEME.muted }}>
                            <i className="bi bi-chevron-right"></i> ▶
                        </button>
                    </div>
                )}
            </div>
            
            <div className="card-body p-0">
                {loading ? (
                    <div className="p-4 text-center text-white small opacity-50">Syncing...</div>
                ) : (
                    <div className="list-group list-group-flush">
                        {visibleItems.map((item, idx) => (
                            <a key={idx} href={item.url} target="_blank" rel="noreferrer" 
                                className="list-group-item list-group-item-action bg-transparent border-secondary px-3 py-2 social-item text-decoration-none">
                                <div className="d-flex align-items-start gap-2">
                                    <div className="flex-grow-1">
                                        <small className="d-block mb-1" style={{ color: THEME.muted, fontSize: '0.6rem' }}>
                                            {item.source} • {new Date(item.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </small>
                                        <h6 className="mb-0 fw-normal text-white text-truncate-2" style={{ fontSize: '0.8rem' }}>
                                            {item.title}
                                        </h6>
                                    </div>
                                    {item.image && (
                                        <img src={item.image} alt="" className="rounded flex-shrink-0" 
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', opacity: 0.8 }} />
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                .social-item:hover { background-color: rgba(255,255,255,0.03) !important; }
                .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .feed-pulse { height: 6px; width: 6px; border-radius: 50%; display: inline-block; margin-right: 8px; vertical-align: middle; }
                .btn-outline-secondary:hover { color: white !important; background: transparent; }
            `}</style>
        </div>
    );
}