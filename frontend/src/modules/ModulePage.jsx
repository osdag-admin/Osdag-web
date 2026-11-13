import { lazy } from "react";

// One lazy page per registry entry, created on first use. The shared module
// UI and the module's configs load together in the module's own chunk.
const pages = new Map();

const pageFor = (module) => {
  if (!pages.has(module.id)) {
    pages.set(
      module.id,
      lazy(async () => {
        const [{ EngineeringModule }, { moduleConfig, outputConfig }] = await Promise.all([
          import("./shared/components/EngineeringModule"),
          module.load(),
        ]);
        const Page = () => (
          <EngineeringModule moduleConfig={moduleConfig} outputConfig={outputConfig} title={module.title} />
        );
        return { default: Page };
      })
    );
  }
  return pages.get(module.id);
};

function ModulePage({ module }) {
  const Page = pageFor(module);
  return <Page />;
}

export default ModulePage;
