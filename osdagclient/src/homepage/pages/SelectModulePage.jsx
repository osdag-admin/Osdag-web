import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import Footer from '../components/Footer';
import { useParams } from 'react-router-dom';
import TabbedConnectionSelector from '../components/ModulesCardLayout';

const SelectModulePage = () => {
    const [showSideBar, setshowSideBar] = useState(false);
    // No modulename param in the URL, so this will be undefined
    const modulename = window.location.pathname.split('/')[1];
    console.log("endpoint : ", modulename);
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 antialiased w-full">
            <div className="flex lg:h-screen">
                {/* Sidebar */}
                {showSideBar && (
                    <div className="fixed inset-0 z-40 flex">
                        <div className="flex-shrink-0 bg-white dark:bg-slate-950 w-sidebar h-screen border-r border-osdag-border dark:border-gray-700">
                            <Sidebar setshowSideBar={setshowSideBar} />
                        </div>
                    </div>
                )}
                <div className="flex-shrink-0 hidden lg:block">
                    <Sidebar setshowSideBar={setshowSideBar} active={modulename} />
                </div>
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header */}
                    <Header setshowSideBar={setshowSideBar} active={modulename} />

                    {/* Main Content */}
                    <div className="flex-1 lg:overflow-y-auto">
                        <TabbedConnectionSelector />
                    </div>

                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default SelectModulePage; 