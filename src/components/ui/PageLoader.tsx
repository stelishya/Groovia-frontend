const PageLoader: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            minHeight: '400px',
            color: '#9333ea'
        }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-purple-300 font-medium animate-pulse">Loading Groovia...</p>
        </div>
    );
};

export default PageLoader;