import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tooltip } from 'antd';
import homeIcon from '../../../assets/homepage/home_default.svg';
import connectionIcon from '../../../assets/homepage/connection.svg';
import tensionIcon from '../../../assets/homepage/tension_member.svg';
import compressionIcon from '../../../assets/homepage/compression_member.svg';
import flexuralIcon from '../../../assets/homepage/flexural_member.svg';
import beamcolumnIcon from '../../../assets/homepage/beam_column.svg';
import trussIcon from '../../../assets/homepage/truss.svg';
import frame2dIcon from '../../../assets/homepage/2d_frame.svg';
import frame3dIcon from '../../../assets/homepage/3d_frame.svg';

const FloatingNavBar = () => {
    const navigate = useNavigate();
    const { moduleName } = useParams();
    const [isOpen, setIsOpen] = useState(false);

    const navigationItems = [
        { name: 'Home', icon: homeIcon, link: '/home' },
        { name: 'Connection', icon: connectionIcon, link: '/Connections' },
        { name: 'Tension Member', icon: tensionIcon, link: '/TensionMember' },
        { name: 'Compression Member', icon: compressionIcon, link: '/CompressionMember' },
        { name: 'Flexural Member', icon: flexuralIcon, link: '/FlexureMember' },
        { name: 'Beam-Column', icon: beamcolumnIcon, link: '/Beam-Column', comingSoon: true },
        { name: 'Truss', icon: trussIcon, link: '/Truss', comingSoon: true },
        { name: '2D Frame', icon: frame2dIcon, link: '/2DFrame', comingSoon: true },
        { name: '3D Frame', icon: frame3dIcon, link: '/3DFrame', comingSoon: true },
    ];

    const toggleOpen = (e) => {
        // Only toggle if we didn't click on a button inside
        if (e.target.closest('button')) return;
        setIsOpen(prev => !prev);
    };

    return (
        <div 
            className={`fixed left-0 top-1/2 -translate-y-1/2 z-[2000] flex items-center transition-all duration-300 ease-in-out cursor-pointer ${
                isOpen ? 'translate-x-0' : '-translate-x-[calc(100%-12px)]'
            }`}
            onMouseEnter={() => window.innerWidth >= 1024 && setIsOpen(true)}
            onMouseLeave={() => window.innerWidth >= 1024 && setIsOpen(false)}
            onClick={toggleOpen}
        >
            <div className="bg-white dark:bg-osdag-dark-color border border-osdag-border dark:border-gray-700 rounded-r-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-4 px-2 flex flex-col gap-3 items-center min-w-[56px] backdrop-blur-sm bg-opacity-90">
                <div className="w-8 h-1 bg-osdag-green/20 rounded-full mb-2"></div>
                {navigationItems.map((item, index) => {
                    // Check if current item matches the active module
                    const isActive = item.link.toLowerCase().includes((moduleName || '').toLowerCase()) && moduleName;
                    
                    return (
                        <Tooltip key={index} title={item.comingSoon ? `${item.name} (Coming Soon)` : item.name} placement="right">
                            <button
                                onClick={() => {
                                    if (!item.comingSoon) {
                                        navigate(item.link);
                                    }
                                }}
                                className={`p-2.5 rounded-xl transition-all duration-300 group relative ${
                                    isActive 
                                        ? 'bg-osdag-green text-white shadow-lg shadow-osdag-green/30' 
                                        : item.comingSoon
                                            ? 'opacity-20 cursor-not-allowed grayscale'
                                            : 'hover:bg-osdag-green hover:text-white text-osdag-text-primary dark:text-white'
                                }`}
                            >
                                <img 
                                    src={item.icon} 
                                    alt={item.name} 
                                    className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                                />
                                {isActive && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-osdag-green rounded-full shadow-[0_0_8px_rgba(145,176,20,0.6)]"></div>
                                )}
                            </button>
                        </Tooltip>
                    );
                })}
                <div className="w-8 h-1 bg-osdag-green/20 rounded-full mt-2"></div>
            </div>
            
            {/* Hover Handle indicator */}
            <div className={`w-3 h-32 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-1.5 h-16 bg-osdag-green rounded-full shadow-[0_0_10px_rgba(145,176,20,0.5)] animate-pulse"></div>
            </div>
        </div>
    );
};

export default FloatingNavBar;
