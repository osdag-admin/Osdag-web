const SectionCards = ({ section, onModuleClick }) => (
  <div
    key={section.label}
    className="flex-1 min-w-[380px] border-2 border-osdag-border rounded-xl mb-8 px-4 py-4 shadow-card dark:text-white"
  >
    <div className="flex flex-col items-center justify-center sm:flex-col md:flex-row lg:flex-row gap-6">
      {section.options.map((opt) => (
        <div
          key={opt.key}
          onClick={() => onModuleClick(opt.key, section.label)}
          className="cursor-pointer group flex-1 h-40 min-w-[120px] max-w-[280px] flex flex-col items-center justify-between 
             border rounded-lg shadow-card transition-all duration-200 bg-white dark:bg-osdag-dark-color/90
             hover:bg-osdag-green dark:hover:hover:bg-osdag-green relative"
        >
          <div
            style={{ backgroundImage: `url(/images/${opt.img})` }}
            className="h-40 w-40 mt-5 mb-2 bg-cover bg-center bg-no-repeat"
          ></div>
          <div className="font-semibold mb-2 text-black dark:text-white group-hover:text-white">
            {opt.label}
          </div>

           <div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full group-hover:translate-y-0
              opacity-0 group-hover:opacity-100 text-osdag-green font-bold text-base bg-white 
              border-osdag-border rounded-b-lg py-2 transition-all duration-200 ease-out
              pointer-events-none w-full text-center"
          >
            Open
          </div>

        </div>
      ))}
    </div>
  </div>

);


export default SectionCards;
