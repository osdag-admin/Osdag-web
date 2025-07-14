import React from 'react';
import MainNavBar from './MainNavBar';

const DockTemplatePage = ({
    InputComponent,
    MiddleComponent,
    OutputComponent,
}) => {
    return (
        <>
            <MainNavBar />
            <div className="dock-template-page-root">
                <div className="dock-template-page-dock dock-template-page-dock-left">
                    {InputComponent}
                </div>
                <div className="dock-template-page-middle">
                    {MiddleComponent}
                </div>
                <div className="dock-template-page-dock dock-template-page-dock-right">
                    {OutputComponent}
                </div>
            </div>
        </>
    );
};

export default DockTemplatePage; 