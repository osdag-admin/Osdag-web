import MainNavBar from './MainNavBar';

const DockTemplatePage = ({
    InputComponent,
    MiddleComponent,
    OutputComponent,
}) => {
    return (
        <div className='dock-template-page'>
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
        </div>
    );
};

export default DockTemplatePage; 