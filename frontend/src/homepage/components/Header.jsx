import { useRef, useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { useNavigate } from 'react-router-dom';
import { MODULE_ROUTES, MODULE_NAME_TO_KEY } from '../../constants/modules';
import { isGuestUser } from '../../utils/auth';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ setshowSideBar, active }) => {
  const [isDark, setIsDark] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user: firebaseUser } = useAuth();

  // Check if user is a guest
  const isGuest = isGuestUser();

  // Get user display name and email
  // Priority: Firebase displayName -> localStorage username -> email prefix
  const storedUsername = !isGuest ? localStorage.getItem('username') : '';
  const userDisplayName = firebaseUser?.displayName || storedUsername || firebaseUser?.email?.split('@')[0] || '';
  const userEmail = firebaseUser?.email || (!isGuest ? localStorage.getItem('email') : '') || '';
  // Get initial: from displayName, or email first letter, or 'G' for guest
  const userInitial = userDisplayName 
    ? userDisplayName[0].toUpperCase() 
    : (isGuest ? 'G' : (userEmail ? userEmail[0].toUpperCase() : 'U'));

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Handle login navigation
  const handleLogin = () => {
    navigate('/');
  };

  // Mock data for search
  const searchData = {
    modules: [
      // Connection modules
      { name: 'Connection', type: 'Shear Connection - Endplate', date: '' },
      { name: 'Connection', type: 'Shear Connection - Cleat Angle', date: '' },
      { name: 'Connection', type: 'Shear Connection - Fin Plate', date: '' },
      { name: 'Connection', type: 'Shear Connection - Single Plate', date: '' },
      { name: 'Connection', type: 'Moment Connection - Endplate', date: '' },
      { name: 'Connection', type: 'Moment Connection - Flange Plate', date: '' },
      { name: 'Connection', type: 'Moment Connection - Haunched', date: '' },
      { name: 'Connection', type: 'Base Plate Connection', date: '' },

      // Cleat Angle submodules
      { name: 'Cleat Angle', type: 'Single Angle Cleat', date: '' },
      { name: 'Cleat Angle', type: 'Double Angle Cleat', date: '' },

      // Tension Member submodules
      { name: 'Tension Member', type: 'Bolted Tension Member', date: '' },
      { name: 'Tension Member', type: 'Welded Tension Member', date: '' },

      // Compression Member submodules
      { name: 'Compression Member', type: 'Column Design', date: '' },
      { name: 'Compression Member', type: 'Built-up Column', date: '' },
    ],
    projects: [
      { name: 'Cleat Angle', type: 'ProjectA_R01_MB350-MB400_CleatAngle', date: '' },
      { name: 'Connection Project', type: 'ProjectB_R01_MB300-MB350_Connection', date: '' },
      { name: 'Steel Frame', type: 'ProjectC_R01_MB400-MB450_Frame', date: '' },
    ]
  };

  // Filter search results
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { modules: [], projects: [] };

    const query = searchQuery.toLowerCase();
    const filteredModules = searchData.modules.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );

    // Don't show projects for guest users
    const filteredProjects = isGuest ? [] : searchData.projects.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );

    return { modules: filteredModules, projects: filteredProjects };
  };

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          setIsSearchFocused(true);
        }
      }
      // Close search on Escape
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setIsSearchFocused(false);
      }
      if (!e.target.closest('.resources-dropdown')) {
        setShowResourcesDropdown(false);
      }
      if (!e.target.closest('.about-dropdown')) {
        setShowAboutDropdown(false);
      }
      if (!e.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const searchResults = getSearchResults();

  return (
    <div className="border-osdag-border dark:border-gray-700">
      {/* Hidden file input for OSI import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".osi,.yaml,.yml,text/yaml,text/x-yaml,application/x-yaml"
        className="hidden"
        onChange={async (e) => {
          try {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const text = await file.text();
            const uiObj = yaml.load(text) || {};
            const moduleField = uiObj.Module || uiObj["Module"] || uiObj.module || uiObj["module"] || uiObj.inputs?.module || uiObj.inputs?.Module || uiObj.module_id;
            if (!moduleField || typeof moduleField !== 'string') {
              alert('Unsupported or invalid OSI file: Module not found.');
              e.target.value = '';
              return;
            }
            const normalizedModule = moduleField.trim();
            // Resolve moduleKey and route
            let moduleKey = null;
            let route = MODULE_ROUTES[normalizedModule] || null;
            if (route) {
              moduleKey = normalizedModule;
            } else {
              moduleKey = MODULE_NAME_TO_KEY[normalizedModule] || null;
              route = moduleKey ? MODULE_ROUTES[moduleKey] : null;
            }
            if (!route) {
              alert(`Unsupported module in OSI: ${normalizedModule}`);
              e.target.value = '';
              return;
            }
            // Store raw uiObj for Phase 2 prefill
            try {
              if (moduleKey) {
                sessionStorage.setItem(`prefill:${moduleKey}`, JSON.stringify(uiObj));
              }
            } catch (_) { }
            navigate(route);
          } catch (err) {
            console.error('Failed to import OSI:', err);
            alert('Failed to import OSI. Please ensure the file is valid.');
          } finally {
            if (e?.target) e.target.value = '';
          }
        }}
      />
      {/* Main Header */}
      <div className="px-4 sm:px-8 md:px-12 pb-8">
        <div className="flex items-center justify-between py-4 md:py-0">
          {/* Hamburger Menu Icon (Mobile/Tablet Only) */}
          <button
            className="block lg:hidden p-2 rounded-lg text-osdag-text-muted hover:text-osdag-text-primary focus:outline-none focus:ring-2 focus:ring-osdag-green"
            aria-label="Open menu"
            onClick={() => {
              setshowSideBar(true);
            }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo and Branding */}
          <div className="flex-1 flex flex-col items-center lg:items-start md:flex-row md:items-end md:space-x-8">
            <div className="flex flex-col items-center lg:items-start">
              {/* Osdag Label - Light mode */}
              <img src="/images/Osdag_label.svg" alt="Osdag Logo" className="h-20 mt-2 dark:hidden" />
              {/* Osdag Label - Dark mode */}
              <img src="/images/Osdag_label_dark.svg" alt="Osdag Logo" className="h-20 mt-2 hidden dark:block" />
              {/* Osdag Tagline - Light mode */}
              <img src="/images/Osdag_tagline.svg" alt="Osdag Tagline" className="h-8 dark:hidden" />
              {/* Osdag Tagline - Dark mode */}
              <img src="/images/Osdag_tagline_dark.svg" alt="Osdag Tagline" className="h-8 hidden dark:block" />

            </div>
            {/* Icons (Mobile/Tablet: below logo, Desktop: right side) */}
            <div className="flex md:hidden mt-4 space-x-2">
              {/* Info Button */}
              <div className="relative group">
                <button className="p-3 text-osdag-text-muted hover:text-white dark:text-gray-400 dark:hover:text-white transition-all duration-300 hover:bg-osdag-green rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              {/* Settings Button */}
              <div className="relative group">
                <button className="p-3 text-osdag-text-muted hover:text-white dark:text-gray-400 dark:hover:text-white transition-all duration-300 hover:bg-osdag-green rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              {/* Resources Button */}
              <div className="relative resources-dropdown group">
                <button
                  onClick={() => setShowResourcesDropdown(!showResourcesDropdown)}
                  className={`p-3 transition-all duration-300 rounded-xl ${showResourcesDropdown ? 'bg-osdag-green text-white' : 'text-osdag-text-muted hover:text-white hover:bg-osdag-green'
                    }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </button>
                {(showResourcesDropdown || false) && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800/20 border border-osdag-border dark:border-gray-700 rounded-xl shadow-lg z-20 min-w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left text-osdag-text-primary  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Videos
                      </button>
                      <button className="w-full px-4 py-2 text-left text-osdag-text-primary  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Osi File
                      </button>
                      <button className="w-full px-4 py-2 text-left text-osdag-text-primary  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Documentation
                      </button>
                      <button className="w-full px-4 py-2 text-left text-osdag-text-primary  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Databases
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Documents Button */}
              <div className="relative group">
                <button className="p-3 text-osdag-text-muted hover:text-white dark:text-gray-400 dark:hover:text-white transition-all duration-300 hover:bg-osdag-green rounded-xl" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
              {/* Theme Toggle Button - Mobile */}
              <div className="relative group">
                <button
                  onClick={toggleTheme}
                  className="p-3 text-osdag-text-muted hover:text-white dark:text-gray-400 dark:hover:text-white transition-all duration-300 hover:bg-osdag-green rounded-xl"
                >
                  {isDark ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.64 13.64a1 1 0 00-1.05-.24 8 8 0 01-10-10 1 1 0 00-.24-1.05A1 1 0 008.73 2 10 10 0 1022 15.27a1 1 0 00-.36-1.63z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Profile Icon - Mobile */}
              <div className="relative profile-dropdown group">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-osdag-green text-white"
                >
                  <span className="font-semibold text-lg">
                    {userInitial}
                  </span>
                </button>
                {/* Dropdown */}
                {(showProfileDropdown || false) && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-black/70 border border-osdag-border dark:border-osdag-green rounded-xl shadow-lg z-20 min-w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isGuest ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-osdag-green/30">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Guest User
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Continue as guest or log in
                          </p>
                        </div>
                        <div className="py-2">
                          <button onClick={handleLogin} className="w-full px-4 py-2 text-left text-osdag-green hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                            Login
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-osdag-green/30">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userDisplayName || userEmail.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {userEmail}
                          </p>
                        </div>
                        <div className="py-2">
                          <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-osdag-green hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-1 mb-6 border-black p-2 bg-white dark:bg-osdag-dark-color rounded-lg justify-center" >
            {/* About Button with Dropdown */}
            <div className="relative about-dropdown group ">
              <button
                onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                className={`p-3 transition-all duration-300 rounded-xl group-hover:px-6 ${showAboutDropdown
                  ? 'bg-osdag-green text-white'
                  : 'text-black dark:text-white  hover:text-white hover:bg-osdag-green'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">
                    About
                  </span>
                  <svg
                    className={`w-4 h-4 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-all duration-300 ${showAboutDropdown ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {(showAboutDropdown || false) && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-black/70 border border-osdag-border dark:border-osdag-green rounded-xl shadow-lg z-20 min-w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-osdag-green  hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                      Help
                    </button>
                    <button className="w-full px-4 py-2 text-left text-osdag-green  hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                      Info
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Settings Button */}
            <div className="relative group">
              <button className="p-3 text-black dark:text-white hover:text-white dark:hover:text-white transition-all duration-300 hover:bg-osdag-green rounded-xl group-hover:px-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">
                    Plugins
                  </span>
                </div>
              </button>
            </div>
            {/* Resources Button with Dropdown */}
            <div className="relative resources-dropdown group ">
              <button
                onClick={() => setShowResourcesDropdown(!showResourcesDropdown)}
                className={`p-3 transition-all duration-300 rounded-xl group-hover:px-6 ${showResourcesDropdown
                  ? 'bg-osdag-green text-white'
                  : 'text-black dark:text-white hover:text-white hover:bg-osdag-green'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-640v560h560v-560h-80v280l-100-60-100 60v-280H200Zm0 560v-560 560Z" />
                  </svg>
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">
                    Resources
                  </span>
                  <svg
                    className={`w-4 h-4 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-all duration-300 ${showResourcesDropdown ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {(showResourcesDropdown || false) && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-black/70 border border-osdag-border dark:border-osdag-green rounded-xl shadow-lg z-20 min-w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-osdag-green  hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                      Videos
                    </button>
                    <button className="w-full px-4 py-2 text-left text-osdag-green  hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                      Osi File
                    </button>
                    <button className="w-full px-4 py-2 text-left text-osdag-green  hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                      Documentation
                    </button>
                    <button className="w-full px-4 py-2 text-left text-osdag-green  hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                      Databases
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Documents Button */}
            <div className="relative group">
              <button className="p-3 text-black dark:text-white hover:text-white transition-all duration-300 hover:bg-osdag-green rounded-xl group-hover:px-6" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">
                    Import
                  </span>
                </div>
              </button>
            </div>
            {/* Theme Toggle Button */}
            <div className="relative group">
              <button
                onClick={toggleTheme}
                className="p-2 text-black transition-colors dark:text-white hover:text-osdag-green"
              >
                {isDark ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                  >
                    <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.64 13.64a1 1 0 00-1.05-.24 8 8 0 01-10-10 1 1 0 00-.24-1.05A1 1 0 008.73 2 10 10 0 1022 15.27a1 1 0 00-.36-1.63z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {/* user details, logout */}
          <div className="relative profile-dropdown group hidden md:flex items-center space-x-1 mb-6 border-black p-2 rounded-lg justify-center">
            {/* Avatar Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-osdag-green text-white"
              >
                <span className="font-semibold text-lg">
                  {userInitial}
                </span>
              </button>
            </div>


            {/* Dropdown */}
            {(showProfileDropdown || false) && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-black/70 border border-osdag-border dark:border-osdag-green rounded-xl shadow-lg z-20 min-w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                {isGuest ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-osdag-green/30">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Guest User
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Continue as guest or log in
                      </p>
                    </div>
                    <div className="py-2">
                      <button onClick={handleLogin} className="w-full px-4 py-2 text-left text-osdag-green hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                        Login
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-osdag-green/30">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {userDisplayName || userEmail.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userEmail}
                      </p>
                    </div>
                    <div className="py-2">
                      <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-osdag-green hover:bg-osdag-green/10 dark:hover:bg-osdag-green/20 transition-colors">
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>


        </div>
      </div>
      {/* Search Section - Hidden for guest users */}
      {!active && !isGuest && <div className="px-12 pb-8 dark:bg-osdag-dark-color">
        <div className="flex items-center justify-center">
          <div className="relative w-search search-container">
            <div className="absolute inset-y-0 left-5 flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1">
                <span className="text-osdag-text-muted text-xs font-medium">Ctrl</span>
                <span className="text-osdag-text-muted text-xs">+</span>
                <span className="text-osdag-text-muted text-xs font-medium">K</span>
              </div>
            </div>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules or projects..."
              className={`w-full pl-24 pr-20 py-4 bg-gray-50 dark:bg-gray-800/20 border border-osdag-border dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-osdag-green focus:border-transparent text-osdag-text-primary  placeholder-osdag-text-muted text-base shadow-search transition-all ${isSearchFocused ? 'ring-2 ring-osdag-green' : ''
                }`}
              onFocus={() => {
                setIsSearchFocused(true);
              }}
              onBlur={(e) => {
                // Don't blur if clicking within the search results
                if (!e.currentTarget.closest('.search-container').contains(e.relatedTarget)) {
                  setTimeout(() => setIsSearchFocused(false), 100);
                }
              }}
            />
            <div className="absolute inset-y-0 right-5 flex items-center space-x-3">
              <button className="p-2 text-osdag-text-muted hover:text-osdag-text-secondary dark:hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

            </div>

            {/* Search Results Modal */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-osdag-dark-color border border-osdag-border dark:border-gray-700 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto scrollbar-thin">
                {searchQuery.trim() ? (
                  <>
                    {/* Modules Section */}
                    {searchResults.modules.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-osdag-text-secondary dark:text-gray-400 mb-3">Modules</h3>
                        <div className="space-y-2">
                          {searchResults.modules.map((item, index) => (
                            <div key={index} className="p-3 hover:bg-osdag-green/5 rounded-xl cursor-pointer transition-colors group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-osdag-green/10 rounded-lg flex items-center justify-center">
                                    <span className="text-osdag-green font-semibold text-sm">L</span>
                                  </div>
                                  <div>
                                    <div className="text-osdag-text-primary  font-medium text-sm">
                                      {item.name}
                                    </div>
                                    <div className="text-osdag-text-secondary dark:text-gray-400 text-xs">
                                      {item.type}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-osdag-text-muted text-xs">{item.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {searchResults.projects.length > 0 && (
                      <div className="p-4 border-t border-osdag-border dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-osdag-text-secondary dark:text-gray-400 mb-3">Projects</h3>
                        <div className="space-y-2">
                          {searchResults.projects.map((item, index) => (
                            <div key={index} className="p-3 hover:bg-osdag-green/5 rounded-xl cursor-pointer transition-colors group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-osdag-green/10 rounded-lg flex items-center justify-center">
                                    <span className="text-osdag-green font-semibold text-sm">L</span>
                                  </div>
                                  <div>
                                    <div className="text-osdag-text-primary  font-medium text-sm">
                                      {item.name}
                                    </div>
                                    <div className="text-osdag-text-secondary dark:text-gray-400 text-xs">
                                      {item.type}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-osdag-text-muted text-xs">{item.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results */}
                    {searchResults.modules.length === 0 && searchResults.projects.length === 0 && (
                      <div className="p-8 text-center">
                        <div className="text-osdag-text-muted dark:text-gray-500">
                          No results found for "{searchQuery}"
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-osdag-text-muted dark:text-gray-500 ">
                      Start typing to search modules and projects...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>}
    </div>
  );
};

export default Header; 
