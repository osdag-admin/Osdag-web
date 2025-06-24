export const SectionCards = ({ section }) => (
  <div
    key={section.label}
    className="flex-1 min-w-[380px] border-2 border-osdag-border rounded-xl mb-8 px-4 py-4 shadow-card dark:text-gray-300"
  >
    {section.label && (
      <div className="mb-4 -mt-7 inline-block px-2">{section.label}</div>
    )}
    <div className="flex gap-6">
      {section.options.map((opt) => (
        <div
          key={opt.key}
          className="group flex-1 h-40 min-w-[120px] max-w-60 flex flex-col items-center justify-between
            border rounded-lg shadow-card transition-all duration-200
            hover:border-osdag-green hover:bg-osdag-green/20 relative"
        >
          <img src={opt.img} alt={opt.label} className="h-20 mt-5 mb-2" />
          <div className="font-semibold mb-2">{opt.label}</div>
          <div
            className="absolute cursor-pointer text-center left-0 right-0 bottom-[-40px] opacity-0 group-hover:bottom-0 group-hover:opacity-100
              text-osdag-green font-bold text-base bg-white hover:bg-osdag-green hover:text-white border-osdag-border rounded-b-lg py-2 transition-all duration-200"
          >
            Open
          </div>
        </div>
      ))}
    </div>
  </div>
);
