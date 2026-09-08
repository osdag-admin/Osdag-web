/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { getModuleRoute } from "../../constants/moduleRoutes";

const ModulesListCard = ({ items }) => {
  const navigate = useNavigate();

  const handleModuleClick = (item) => {
    const route = getModuleRoute(item.submodule);
    if (!route) return;
    navigate(route);
  };

  const getIcon = () => (
    <div className="w-8 h-8 bg-osdag-green/10 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-osdag-green" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return (
    <>
      {items.map((item, index) => (
        <div key={index} className="p-4 rounded-xl border transition-all duration-300 group bg-gray-50/50 dark:bg-gray-800/20 border-osdag-border dark:border-gray-700 hover:bg-osdag-green/20 hover:border-osdag-green/20 dark:hover:bg-osdag-green/20 hover:shadow-sm pb-8 md:pb-4 md:hover:pb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getIcon()}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-item-text text-osdag-text-primary dark:text-white font-semibold">{item.name}</span>
                </div>
                {item.subtitle && (
                  <p className="text-subtitle text-osdag-text-secondary dark:text-gray-400 mb-2">{item.subtitle}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 opacity-100 max-h-40 md:opacity-0 md:group-hover:opacity-100 md:max-h-0 md:group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                  <button className="px-3 py-1.5 text-xs font-medium bg-osdag-green/10 text-osdag-green rounded-lg hover:bg-osdag-green/20 transition-colors" onClick={(e) => { e.stopPropagation(); handleModuleClick(item); }}>
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

    </>
  );
};

export default ModulesListCard;


