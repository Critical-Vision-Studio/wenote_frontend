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
    return <StrictMode><div> {mode} </div> </StrictMode>;
};