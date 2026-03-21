import React from "react";
import SpacingDiagram from "../SpacingDiagram";

function TwoColumnLayout({ config, fields, output, getOutputValue, ValueBox, getImage }) {
  return (
    <div className="spacing-main-body">
      {config.note && (
        <p style={{ padding: "20px" }}>Note: {config.note}</p>
      )}
      <div className="spacing-main-two">
        <div className="spacing-left-body">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="spacing-left-body-align">
              <h4>{label}</h4>
              <ValueBox value={getOutputValue(key, output)} />
            </div>
          ))}
        </div>
        {config.hasImage && (
          <div className="spacing-right-body">
            <img src={getImage("spacing")} alt="Spacing Image" />
          </div>
        )}
      </div>
    </div>
  );
}

function CapacityComplexLayout({ config, fields, output, getOutputValue, ValueBox, getImage }) {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "Default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  return (
    <div className="spacing-main-body">
      {config.note && (
        <p style={{ padding: "20px" }}>Note: {config.note}</p>
      )}
      <div className="Capacity-main-body">
        {Object.entries(groupedFields).map(([sectionName, sectionFields], sectionIdx) => (
          <div key={sectionIdx}>
            <div className="Capacity-sub-body-title">
              <h4>{sectionName}</h4>
            </div>
            <div className="Capacity-sub-body">
              <div className="Capacity-left-body">
                {sectionFields.map(({ key, label }, idx) => (
                  <div key={idx} className="Capacity-left-body-align">
                    <p>{label}</p>
                    <ValueBox value={getOutputValue(key, output)} />
                  </div>
                ))}
              </div>
              {sectionIdx < 2 && (
                <div className="Capacity-right-body">
                  <img
                    src={getImage(sectionIdx === 0 ? "capacity1" : "capacity2")}
                    alt={`Capacity Image ${sectionIdx + 1}`}
                  />
                  <h5>Block Shear Pattern</h5>
                </div>
              )}
            </div>
            {sectionIdx < Object.entries(groupedFields).length - 1 && <hr />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageOnlyLayout({ config, extraState, getImage }) {
  const image = getImage(config.imageType, extraState?.selectedOption, extraState);
  return (
    <div className="spacing-main-body">
      {image && <img src={image} alt={`${config.imageType} Image`} />}
    </div>
  );
}

function SpacingDiagramLayout({ config, fields, diagram, output, getOutputValue, resolveDiagramProps, ValueBox }) {
  const diagramProps = resolveDiagramProps(diagram, output);
  return (
    <div className="flex w-full flex-col justify-center border border-gray-300 p-2">
      {config.note && (
        <p className="px-5 py-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3 px-4 md:w-1/2">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <h4 className="font-medium text-gray-700">{label}</h4>
              <div className="min-w-[40%]">
                <ValueBox value={getOutputValue(key, output)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full items-center justify-center px-4 pb-4 md:w-1/2 md:pb-0">
          {diagramProps ? (
            <SpacingDiagram className="md:max-w-2xl" {...diagramProps} />
          ) : (
            <div className="flex w-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
              No diagram data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SingleColumnLayout({ fields, output, getOutputValue, ValueBox }) {
  return (
    <div className="details-main-body">
      <div className="details-main-body-inside">
        {fields.length > 0 ? (
          fields.map(({ key, label }, idx) => (
            <div key={idx} className="details-main-body-align">
              <h4 dangerouslySetInnerHTML={{ __html: label }} />
              <ValueBox value={getOutputValue(key, output)} />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 px-2 py-4">No details available for this section.</p>
        )}
      </div>
    </div>
  );
}

export const OUTPUT_LAYOUTS = {
  "two-column": TwoColumnLayout,
  "capacity-complex": CapacityComplexLayout,
  "image-only": ImageOnlyLayout,
  "spacing-diagram": SpacingDiagramLayout,
  "single-column": SingleColumnLayout,
};
