import { StrictMode } from 'react';
export default function ServerModeDisplay() {
    let mode = "";
    if (process.env.NODE_ENV === 'development')
        mode = process.env.REACT_APP_DEV_MODE
    else if (process.env.NODE_ENV === 'production')
        mode = process.env.REACT_APP_PRO_MODE;
    else if (process.env.NODE_ENV === 'test')
        mode = process.env.REACT_APP_TEST_MODE;
    else
        mode = 'unknown';
    
    // Get status color based on mode
    const getStatusColor = () => {
        // Check if mode is undefined or null before calling toLowerCase()
        const modeValue = mode || 'unknown';
        
        switch(modeValue.toLowerCase()) {
            case 'development':
                return 'var(--accent-yellow)';
            case 'production':
                return 'var(--accent-green)';
            case 'test':
                return 'var(--accent-purple)';
            default:
                return 'var(--accent-red)';
        }
    };
    
    return (
        <StrictMode>
            <div className="server-mode-display">
                <div className="app-title">WeNote</div>
                <div className="server-status">
                    <span 
                        className="status-indicator" 
                        style={{ backgroundColor: getStatusColor() }}
                    ></span>
                    <span className="status-text">{mode || 'unknown'}</span>
                </div>
            </div>
        </StrictMode>
    );
};