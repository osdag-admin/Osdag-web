/* eslint-disable react-refresh/only-export-components, react/prop-types */
import { Fragment } from "react";
import SpacingDiagram from "../diagrams/SpacingDiagram";
import BasePlateSketch from "../diagrams/BasePlateSketch";
import CapacityDiagram from "../diagrams/CapacityDiagram";
import WeldDiagram from "../diagrams/WeldDiagram";
import CleatBoltCapacityDiagram from "../diagrams/CleatBoltCapacityDiagram";
import CleatSectionCapacityDiagram from "../diagrams/CleatSectionCapacityDiagram";
import SeatedSectionCapacityDiagram from "../diagrams/SeatedSectionCapacityDiagram";
import B2BEndPlateDetailingDiagram from "../diagrams/B2BEndPlateDetailingDiagram";
import ColumnEndPlateBoltDiagram from "../diagrams/ColumnEndPlateBoltDiagram";
import BeamColumnEndPlateBoltDiagram from "../diagrams/BeamColumnEndPlateBoltDiagram";
import EndPlateCapacitySketch from "../diagrams/EndPlateCapacitySketch";
import SeatedAngleCapacitySketch from "../diagrams/SeatedAngleCapacitySketch";
import PlateFractureDiagram from "../diagrams/PlateFractureDiagram";

function TwoColumnLayout({ config, fields, output, getOutputValue, ValueBox, getImage }) {
  const imageType = config.imageType || "spacing";
  return (
    <div className="spacing-main-body">
      {config.note && (
        <p style={{ padding: "20px" }}>Note: {config.note}</p>
      )}
      <div className="spacing-main-two">
        <div className="spacing-left-body">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="spacing-left-body-align">
              <h4 dangerouslySetInnerHTML={{ __html: label }} />

              <ValueBox value={getOutputValue(key, output)} />
            </div>
          ))}
        </div>
        {config.hasImage && (
          <div className="spacing-right-body">
            <img src={getImage(imageType)} alt={`${imageType} Image`} />
          </div>
        )}
      </div>
    </div>
  );
}

function CapacityComplexLayout({
  config,
  fields,
  diagram,
  output,
  getOutputValue,
  resolveDiagramProps,
  ValueBox,
  getImage,
}) {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "Default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;

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
                  {diagramProps ? (
                    <CapacityDiagram
                      {...diagramProps}
                      fracturePattern={
                        diagram?.diagramType === "section"
                          ? (sectionIdx === 0 ? "section-shear" : "section-tension")
                          : (sectionIdx === 0 ? "shear" : "tension")
                      }
                      className="w-full max-w-[300px]"
                    />
                  ) : (
                    <img
                      src={getImage(sectionIdx === 0 ? "capacity1" : "capacity2")}
                      alt={`Capacity Image ${sectionIdx + 1}`}
                    />
                  )}
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
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3 px-4 md:w-1/2">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <h4 className="font-medium text-gray-700" dangerouslySetInnerHTML={{ __html: label }} />

              <div className="w-[100px] flex-shrink-0">
                <ValueBox value={getOutputValue(key, output)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-1/2 md:pb-0">
          {diagramProps ? (
            <SpacingDiagram className="w-full max-w-[400px]" {...diagramProps} />
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
  let lastSection = null;
  return (
    <div className="details-main-body">
      <div className="details-main-body-inside">
        {fields.length > 0 ? (
          fields.map(({ key, label, section }, idx) => {
            const showSection = section && section !== lastSection;
            if (showSection) {
              lastSection = section;
            }
            return (
              <Fragment key={idx}>
                {showSection && (
                  <h3 className="text-sm font-bold text-gray-800 border-b pb-1 dark:text-gray-200 mt-4 mb-2 first:mt-0">
                    {section}
                  </h3>
                )}
                <div className="flex w-full justify-between items-center mb-3 px-2">
                  <h4 className="w-[55%] text-sm font-medium text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: label }} />
                  <ValueBox value={getOutputValue(key, output)} />
                </div>
              </Fragment>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 px-2 py-4">No details available for this section.</p>
        )}
      </div>
    </div>
  );
}

function BasePlateSketchLayout({ config, fields, diagram, output, getOutputValue, resolveDiagramProps, ValueBox }) {
  const diagramProps = resolveDiagramProps(diagram, output);
  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3 px-4 md:w-1/2">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <h4 className="font-medium text-gray-700" dangerouslySetInnerHTML={{ __html: label }} />

              <div className="w-[100px] flex-shrink-0">
                <ValueBox value={getOutputValue(key, output)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-1/2 md:pb-0">
          {diagramProps ? (
            <BasePlateSketch className="w-full max-w-[400px]" {...diagramProps} />
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

function WeldDiagramLayout({ config, fields, diagram, output, getOutputValue, resolveDiagramProps, ValueBox }) {
  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;
  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3 px-4 md:w-1/2">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <h4 className="font-medium text-gray-700" dangerouslySetInnerHTML={{ __html: label }} />
              <div className="w-[100px] flex-shrink-0">
                <ValueBox value={getOutputValue(key, output)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-1/2 md:pb-0">
          {diagramProps ? (
            <WeldDiagram className="w-full max-w-[350px]" {...diagramProps} />
          ) : (
            <div className="flex w-full min-h-[200px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
              No diagram data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function CleatBoltCapacityLayout({
  config,
  fields,
  diagram,
  output,
  getOutputValue,
  resolveDiagramProps,
  ValueBox,
}) {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "Default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;

  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-6 px-4 md:w-[45%]">
          {Object.entries(groupedFields).map(([sectionName, sectionFields], sectionIdx) => (
            <div key={sectionIdx} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-1 dark:text-gray-200">
                {sectionName}
              </h3>
              {sectionFields.map(({ key, label }, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: label }} />
                  <div className="w-[100px] flex-shrink-0">
                    <ValueBox value={getOutputValue(key, output)} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 flex-col gap-4 px-4 pb-4 md:w-[55%] md:pb-0">
          {diagramProps ? (
            <>
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">Failure Pattern due to Shear</p>
                <CleatBoltCapacityDiagram className="w-full" {...diagramProps} mode="shear" />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">Failure Pattern due to Tension</p>
                <CleatBoltCapacityDiagram className="w-full" {...diagramProps} mode="tension" />
              </div>
            </>
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

function CleatSectionCapacityLayout({
  config,
  fields,
  diagram,
  output,
  getOutputValue,
  resolveDiagramProps,
  ValueBox,
}) {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "Default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;

  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-6 px-4 md:w-[45%]">
          {Object.entries(groupedFields).map(([sectionName, sectionFields], sectionIdx) => (
            <div key={sectionIdx} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-1 dark:text-gray-200">
                {sectionName}
              </h3>
              {sectionFields.map(({ key, label }, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: label }} />
                  <div className="w-[100px] flex-shrink-0">
                    <ValueBox value={getOutputValue(key, output)} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-[55%] md:pb-0">
          {diagramProps ? (
            <CleatSectionCapacityDiagram className="w-full" {...diagramProps} />
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

function SeatedSectionCapacityLayout({
  config,
  fields,
  diagram,
  output,
  getOutputValue,
  resolveDiagramProps,
  ValueBox,
}) {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "Default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;

  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-6 px-4 md:w-[45%]">
          {Object.entries(groupedFields).map(([sectionName, sectionFields], sectionIdx) => (
            <div key={sectionIdx} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-1 dark:text-gray-200">
                {sectionName}
              </h3>
              {sectionFields.map(({ key, label }, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: label }} />
                  <div className="w-[100px] flex-shrink-0">
                    <ValueBox value={getOutputValue(key, output)} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-[55%] md:pb-0">
          {diagramProps ? (
            <SeatedSectionCapacityDiagram className="w-full" {...diagramProps} />
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

function EndPlateDetailingLayout({ config, fields, diagram, output, getOutputValue, resolveDiagramProps, ValueBox }) {
  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;
  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3 px-4 md:w-[45%]">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <h4 className="font-medium text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: label }} />
              <div className="w-[100px] flex-shrink-0">
                <ValueBox value={getOutputValue(key, output)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-[55%] md:pb-0">
          {diagramProps ? (
            <B2BEndPlateDetailingDiagram {...diagramProps} />
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

function ColumnEndPlateDiagramLayout({ config, fields, diagram, output, getOutputValue, resolveDiagramProps, ValueBox }) {
  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;
  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3 px-4 md:w-[40%]">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <h4 className="font-medium text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: label }} />
              <div className="w-[100px] flex-shrink-0">
                <ValueBox value={getOutputValue(key, output)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-[60%] md:pb-0">
          {diagramProps ? (
            <ColumnEndPlateBoltDiagram {...diagramProps} />
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

function BeamColumnEndPlateDiagramLayout({ config, fields, diagram, output, getOutputValue, resolveDiagramProps, ValueBox }) {
  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;
  return (
    <div className="flex w-full flex-col justify-center pb-4 pt-2">
      {config.note && (
        <p className="px-5 pb-4 text-sm text-gray-600">Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3 px-4 md:w-[40%]">
          {fields.map(({ key, label }, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <h4 className="font-medium text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: label }} />
              <div className="w-[100px] flex-shrink-0">
                <ValueBox value={getOutputValue(key, output)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-4 pb-4 md:w-[60%] md:pb-0">
          {diagramProps ? (
            <BeamColumnEndPlateBoltDiagram {...diagramProps} />
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

function EndPlateCapacityLayout({
  config,
  fields,
  diagram,
  output,
  getOutputValue,
  resolveDiagramProps,
  ValueBox,
}) {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "Default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;
  const diagramType = diagram?.diagramType; // "plate" -> shear+tension stacked; "section" -> single "section" mode

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
                  {diagramProps ? (
                    <EndPlateCapacitySketch
                      {...diagramProps}
                      mode={diagramType === "section" ? "section" : (sectionIdx === 0 ? "shear" : "tension")}
                      className="w-full max-w-[420px]"
                    />
                  ) : (
                    <div className="flex w-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                      No diagram data available.
                    </div>
                  )}
                  <h5>Failure Pattern</h5>
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

function SeatedAngleCapacityLayout({
  config,
  fields,
  diagram,
  output,
  getOutputValue,
  resolveDiagramProps,
  ValueBox,
}) {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "Default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;

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
                  {diagramProps ? (
                    <SeatedAngleCapacitySketch
                      {...diagramProps}
                      mode={sectionIdx === 0 ? "shear" : "moment"}
                      className="w-full max-w-[400px]"
                    />
                  ) : (
                    <div className="flex w-full min-h-[240px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                      No diagram data available.
                    </div>
                  )}
                  <h5>Failure Pattern</h5>
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

function PlateFractureCardsLayout({
  config,
  fields,
  diagram,
  output,
  getOutputValue,
  resolveDiagramProps,
  ValueBox,
}) {
  const diagramProps = resolveDiagramProps ? resolveDiagramProps(diagram, output) : null;
  const variant = diagram?.props?.variant;
  const patternCount = variant === "flange" ? 4 : 3;
  const subject = variant === "flange" ? "Flange and Plate" : "Member and Plate";

  return (
    <div className="spacing-main-body">
      {config.note && (
        <p style={{ padding: "20px" }}>Note: {config.note}</p>
      )}
      <div className="flex w-full flex-col gap-5 px-4 pb-4">
        {Array.from({ length: patternCount }, (_, i) => i + 1).map((pattern) => (
          <div key={pattern} className="flex w-full flex-col gap-3 rounded-md border border-gray-200 p-4 md:flex-row dark:border-gray-700">
            <div className="flex w-full flex-col gap-2 md:w-[45%]">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{`Failure Pattern ${pattern} – Tension in ${subject}`}</h4>
              {fields.map(({ key, label }, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">{label}</p>
                  <div className="w-[100px] flex-shrink-0">
                    <ValueBox value={getOutputValue(key, output)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex w-full flex-1 items-center justify-center md:w-[55%]">
              {diagramProps ? (
                <PlateFractureDiagram {...diagramProps} pattern={pattern} className="w-full max-w-[340px]" />
              ) : (
                <div className="flex w-full min-h-[200px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                  No diagram data available.
                </div>
              )}
            </div>
          </div>
        ))}
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
  "baseplate-sketch": BasePlateSketchLayout,
  "weld-diagram": WeldDiagramLayout,
  "column-endplate-diagram": ColumnEndPlateDiagramLayout,
  "beamcolumn-endplate-diagram": BeamColumnEndPlateDiagramLayout,
  "endplate-capacity-sketch": EndPlateCapacityLayout,
  "seated-angle-capacity-sketch": SeatedAngleCapacityLayout,
  "plate-fracture-cards": PlateFractureCardsLayout,
  "cleat-bolt-capacity": CleatBoltCapacityLayout,
  "cleat-section-capacity": CleatSectionCapacityLayout,
  "seated-section-capacity": SeatedSectionCapacityLayout,
  "endplate-detailing": EndPlateDetailingLayout,
};
