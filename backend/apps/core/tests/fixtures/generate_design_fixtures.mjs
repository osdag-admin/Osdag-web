#!/usr/bin/env node
/**
 * Generates the design-input fixtures under ./design_inputs/<module-slug>/*.json
 *
 * Each fixture is the exact flat, dotted-key request body that the web app would
 * POST to an adapter's validate_input(). Two sources:
 *
 *   frontend-defaults:<config>  The real `buildSubmissionParams(inputs, allSelected,
 *                               lists, extraState)` of the module's frontend config,
 *                               run on `defaultInputs` (Vite SSR bundle imported in
 *                               Node). Variants: "All" selected (the UI default) and
 *                               "Customized" selections, plus one per connectivity.
 *   osi:<file>                  A desktop example (.osi) parsed with the backend's
 *                               parse_osi() (dump_backend_data.py), fed through the
 *                               frontend's loadStateFromOsi(), then through the same
 *                               buildSubmissionParams(). This is the path a user's
 *                               "open .osi" takes in the browser.
 *
 * Usage (from anywhere; needs frontend/node_modules and a Python with the backend deps):
 *     PYTHON=/path/to/python node generate_design_fixtures.mjs [--backend-json data.json]
 *
 * Nothing in the repo (adapters, configs, app code) is modified; the bundle is built
 * into a temp directory.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../../..');
const FE = join(REPO, 'frontend');
const MODS = join(FE, 'src/modules');
const OUT = join(HERE, 'design_inputs');
let STAGE = null; // temp tree the fixtures are generated into before the backend check
const PYTHON = process.env.PYTHON || 'python3';

// ---------------------------------------------------------------------------------
// 1. Bundle every module config (plus the OSI loader) with the project's own Vite.
// ---------------------------------------------------------------------------------
const CONFIG_FILES = {
  basePlateConfig: 'basePlate/configs/basePlateConfig.js',
  beamBeamEndPlateConfig: 'beamBeamEndPlate/configs/beamBeamEndPlateConfig.js',
  beamToColumnEndPlateConfig: 'beamToColumnEndPlate/configs/beamToColumnEndPlateConfig.js',
  bbCoverBolted: ['coverPlateBolted/configs/coverPlateBoltedConfig.js', 'coverPlateBoltedConfig'],
  bbCoverWelded: ['coverPlateWelded/configs/coverPlateWeldedConfig.js', 'coverPlateWeldedConfig'],
  ccCoverBolted: ['columnColumnCoverPlateBolted/configs/coverPlateBoltedConfig.js', 'coverPlateBoltedConfig'],
  ccCoverWelded: ['columnColumnCoverPlateWelded/configs/coverPlateWeldedConfig.js', 'coverPlateWeldedConfig'],
  columnColumnEndPlateConfig: 'columnColumnEndPlate/configs/columnColumnEndPlateConfig.js',
  axiallyLoadedColumnConfig: 'compressionMember/configs/axiallyLoadedColumnConfig.js',
  strutsBoltedConfig: 'compressionMember/configs/strutsBoltedConfig.js',
  strutsWeldedConfig: 'compressionMember/configs/strutsWeldedConfig.js',
  onCantileverConfig: 'flexuralMember/onCantilever/configs/onCantileverConfig.js',
  plateGirderConfig: 'flexuralMember/plateGirder/configs/plateGirderConfig.js',
  purlinConfig: 'flexuralMember/purlin/configs/purlinConfig.js',
  simplySupportedBeamConfig: 'flexuralMember/simplySupportedBeam/configs/simplySupportedBeamConfig.js',
  cleatAngleConfig: 'shearConnection/cleatAngle/configs/cleatAngleConfig.js',
  endPlateConfig: 'shearConnection/endPlate/configs/endPlateConfig.js',
  finPlateConfig: 'shearConnection/finPlate/configs/finPlateConfig.js',
  seatedAngleConfig: 'shearConnection/seatAngle/configs/seatedAngleConfig.js',
  buttJointBoltedConfig: 'SimpleConnection/ButtJointBolted/config/buttJointBoltedConfig.js',
  buttJointWeldedConfig: 'SimpleConnection/ButtJointWelded/config/buttJointWeldedConfig.js',
  lapJointBoltedConfig: 'SimpleConnection/LapJointBolted/config/lapJointBoltedConfig.js',
  lapJointWeldedConfig: 'SimpleConnection/LapJointWelded/config/lapJointWeldedConfig.js',
  boltedToEndConfig: 'TensionMembers/BoltedToEnd/configs/boltedToEndConfig.js',
  weldedToEndConfig: 'TensionMembers/WeldedToEnd/configs/weldedToEndConfig.js',
};

async function bundleConfigs(tmp) {
  const lines = [];
  const cfgFile = {};
  for (const [alias, spec] of Object.entries(CONFIG_FILES)) {
    const [file, exportName] = Array.isArray(spec) ? spec : [spec, alias];
    lines.push(`export { ${exportName}${exportName === alias ? '' : ` as ${alias}`} } from ${JSON.stringify(join(MODS, file))};`);
    cfgFile[alias] = file;
  }
  lines.push(`export { loadStateFromOsi } from ${JSON.stringify(join(MODS, 'shared/utils/osiLoader.js'))};`);
  const entry = join(tmp, 'entry.js');
  writeFileSync(entry, lines.join('\n'));
  const { build } = await import(pathToFileURL(join(FE, 'node_modules/vite/dist/node/index.js')));
  await build({
    root: FE,
    logLevel: 'warn',
    configFile: false,
    build: {
      ssr: entry,
      outDir: join(tmp, 'out'),
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'configs.mjs' } },
    },
  });
  return { mod: await import(pathToFileURL(join(tmp, 'out/configs.mjs'))), cfgFile };
}

// ---------------------------------------------------------------------------------
// 2. Realistic option lists (what the backend options views return), from osdag_core's
//    catalog (apps.core.catalog, via dump_backend_data.py) plus the constants
//    hard-coded in apps/modules/*/views.py.
// ---------------------------------------------------------------------------------
function toCatalog(c) {
  return { ...c, materialList: [...c.materials, { id: -1, Grade: 'Custom' }] };
}

const PROPERTY_CLASSES = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9'];
const THICKNESS = ['8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50', '56', '63', '75', '80', '90', '100', '110', '120'];
const BOLT_TYPES = ['Bearing Bolt', 'Friction Grip Bolt'];
const SHEAR_CONNECTIVITY = ['Column Flange-Beam Web', 'Column Web-Beam Web', 'Beam-Beam'];
const ANCHOR_DIAMETERS = ['M8', 'M10', 'M12', 'M16', 'M20', 'M24', 'M30', 'M36', 'M42', 'M48', 'M56', 'M64', 'M72'];
const PG_THICKNESS = ['3', '4', '5', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '36', '40'];
const PG_STIFFENER_THICKNESS = ['6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '36', '40'];

// Option lists per module family, mirroring each views.py `options()` branch.
const LISTS = {
  shear: (c) => ({ connectivityList: SHEAR_CONNECTIVITY, columnList: c.columns, beamList: c.beams, materialList: c.materialList, boltDiameterList: c.boltDiameters, propertyClassList: PROPERTY_CLASSES, thicknessList: THICKNESS }),
  cleat: (c) => ({ ...LISTS.shear(c), thicknessList: undefined, angleList: c.angles }),
  header: (c) => ({ ...LISTS.shear(c), boltTypeList: BOLT_TYPES }),
  seated: (c) => ({ ...LISTS.shear(c), connectivityList: ['Column Flange-Beam Web', 'Column Web-Beam Web'], angleList: c.angles, topAngleList: c.angles, boltTypeList: BOLT_TYPES }),
  momentBeamBolted: (c) => ({ beamList: c.beams, materialList: c.materialList, boltDiameterList: c.boltDiameters, propertyClassList: PROPERTY_CLASSES, thicknessList: THICKNESS }),
  momentColumnBolted: (c) => ({ columnList: c.columns, materialList: c.materialList, boltDiameterList: c.boltDiameters, propertyClassList: PROPERTY_CLASSES, thicknessList: THICKNESS }),
  momentBeamWelded: (c) => ({ beamList: c.beams, materialList: c.materialList, thicknessList: THICKNESS }),
  momentColumnWelded: (c) => ({ columnList: c.columns, materialList: c.materialList, thicknessList: THICKNESS }),
  bcEndPlate: (c) => ({ connectivityList: ['Column Flange-Beam Web', 'Column Web-Beam Web'], columnList: c.columns, beamList: c.beams, materialList: c.materialList, boltDiameterList: c.boltDiameters, propertyClassList: PROPERTY_CLASSES, thicknessList: THICKNESS, boltTypeList: BOLT_TYPES }),
  ccEndPlate: (c) => ({ columnList: c.columns, materialList: c.materialList, boltDiameterList: c.boltDiameters, propertyClassList: PROPERTY_CLASSES, thicknessList: THICKNESS, boltTypeList: BOLT_TYPES }),
  simpleBolted: (c) => ({ materialList: c.materialList, thicknessList: THICKNESS, coverPlateList: ['Single-Cover', 'Double-Cover'], boltDiameterList: c.boltDiameters, propertyClassList: PROPERTY_CLASSES }),
  simpleWelded: (c) => ({ materialList: c.materialList, thicknessList: THICKNESS, coverPlateList: ['Single-Cover', 'Double-Cover'], weldSizeList: ['4', '5', '6', '8', '10', '12'] }),
  tensionBolted: (c) => ({ materialList: c.materialList, angleList: c.angles, channelList: c.channels, boltDiameterList: c.boltDiameters, propertyClassList: PROPERTY_CLASSES, thicknessList: THICKNESS }),
  tensionWelded: (c) => ({ materialList: c.materialList, angleList: c.angles, channelList: c.channels, thicknessList: THICKNESS }),
  strutsBolted: (c) => ({ ...LISTS.tensionBolted(c) }),
  strutsWelded: (c) => ({ ...LISTS.tensionWelded(c) }),
  axiallyLoaded: (c) => ({ materialList: c.materialList, beamList: c.beams, columnList: c.columns, rhsList: c.rhs, shsList: c.shs, chsList: c.chs, angleList: c.angles, channelList: c.channels, endConditionList: ['Fixed', 'Free', 'Hinged', 'Roller'] }),
  flexure: (c) => ({ materialList: c.materialList, beamList: c.beams, columnList: c.columns }),
  plateGirder: (c) => ({ materialList: c.materialList, thicknessList: PG_THICKNESS, stiffenerThicknessList: PG_STIFFENER_THICKNESS }),
  basePlate: (c) => ({
    sectionDesignation: [...new Set([...c.columns, ...c.beams])].sort(),
    materialList: c.materialList,
    anchorDiameterList: ANCHOR_DIAMETERS,
    anchorGradeList: PROPERTY_CLASSES,
    footingGradeList: ['Select Grade', 'M10', 'M15', 'M20', 'M25', 'M30', 'M35', 'M40', 'M45', 'M50', 'M55'],
    connectivityList: ['Welded Column Base', 'Moment Base Plate', 'Hollow/Tubular Column Base'],
  }),
};

// ---------------------------------------------------------------------------------
// 3. Module table: adapter slug -> frontend config + realistic fills.
//    `fill` replaces defaults that are empty in defaultInputs but required by the
//    backend (the user would have to pick/type them before pressing Design).
//    `custom` is the "Customized" selection used for the second variant.
// ---------------------------------------------------------------------------------
const BOLT_CUSTOM = { bolt_diameter: ['16', '20'], bolt_grade: ['8.8', '10.9'], plate_thickness: ['10', '12', '16'] };
const COVER_CUSTOM = { bolt_diameter: ['16', '20'], bolt_grade: ['8.8', '10.9'], flange_plate_thickness: ['10', '12'], web_plate_thickness: ['8', '10'] };
const SHEAR_FILL = { column_section: 'HB 150', beam_section: 'MB 300', primary_beam: 'JB 200', secondary_beam: 'JB 150' };

const MODULES = [
  // ----- shear connection -----
  { slug: 'shear_connection__fin_plate', cfg: 'finPlateConfig', lists: 'shear', connectivities: SHEAR_CONNECTIVITY, custom: BOLT_CUSTOM },
  { slug: 'shear_connection__cleat_angle', cfg: 'cleatAngleConfig', lists: 'cleat', connectivities: SHEAR_CONNECTIVITY, custom: { bolt_diameter: ['16', '20'], bolt_grade: ['8.8', '10.9'], cleat_section: ['50 x 50 x 6', '60 x 60 x 6'] } },
  { slug: 'shear_connection__header_plate', cfg: 'endPlateConfig', lists: 'header', connectivities: SHEAR_CONNECTIVITY, fill: SHEAR_FILL, custom: BOLT_CUSTOM },
  { slug: 'shear_connection__seated_angle', cfg: 'seatedAngleConfig', lists: 'seated', connectivities: ['Column Flange-Beam Web', 'Column Web-Beam Web'], custom: { bolt_diameter: ['16', '20'], bolt_grade: ['8.8', '10.9'], angle_list: ['ISA 100x100x10'], topangle_list: ['ISA 100x100x10'] } },
  // ----- moment connection -----
  { slug: 'moment_connection__beam_beam_cover_plate_bolted', cfg: 'bbCoverBolted', lists: 'momentBeamBolted', custom: COVER_CUSTOM },
  { slug: 'moment_connection__column_column_cover_plate_bolted', cfg: 'ccCoverBolted', lists: 'momentColumnBolted', custom: COVER_CUSTOM },
  { slug: 'moment_connection__beam_beam_cover_plate_welded', cfg: 'bbCoverWelded', lists: 'momentBeamWelded', custom: { flange_plate_thickness: ['10', '12'], web_plate_thickness: ['8', '10'] } },
  { slug: 'moment_connection__column_column_cover_plate_welded', cfg: 'ccCoverWelded', lists: 'momentColumnWelded', custom: { flange_plate_thickness: ['10', '12'], web_plate_thickness: ['8', '10'] } },
  { slug: 'moment_connection__beam_beam_end_plate', cfg: 'beamBeamEndPlateConfig', lists: 'momentBeamBolted', custom: BOLT_CUSTOM },
  { slug: 'moment_connection__beam_column_end_plate', cfg: 'beamToColumnEndPlateConfig', lists: 'bcEndPlate', custom: BOLT_CUSTOM },
  { slug: 'moment_connection__column_column_end_plate', cfg: 'columnColumnEndPlateConfig', lists: 'ccEndPlate', custom: BOLT_CUSTOM },
  // ----- tension member -----
  { slug: 'tension_member__bolted', cfg: 'boltedToEndConfig', lists: 'tensionBolted', custom: { ...BOLT_CUSTOM, section_designation: ['50 x 50 x 6', '60 x 60 x 6'] } },
  { slug: 'tension_member__welded', cfg: 'weldedToEndConfig', lists: 'tensionWelded', custom: { plate_thickness: ['10', '12', '16'], section_designation: ['50 x 50 x 6', '60 x 60 x 6'] } },
  // ----- base plate -----
  {
    slug: 'base_plate', cfg: 'basePlateConfig', lists: 'basePlate',
    fill: { member_designation: 'HB 200', load_axial: '200', load_axial_tension: '50', load_shear_major: '50', load_shear_minor: '30', load_moment_major: '40', load_moment_minor: '20' },
    connectivities: ['Welded Column Base', 'Moment Base Plate'], connectivityKey: 'connectivity',
    // Tension and moments are hidden (left blank) for a welded column base.
    connectivityFill: { 'Welded Column Base': { load_axial_tension: '', load_moment_major: '', load_moment_minor: '' } },
    custom: { anchor_diameter_ocf: ['M20', 'M24'], anchor_grade_ocf: ['8.8'], anchor_diameter_icf: ['M20'], anchor_grade_icf: ['8.8'] },
  },
  // ----- simple connection -----
  { slug: 'simple_connection__lap_joint_bolted', cfg: 'lapJointBoltedConfig', lists: 'simpleBolted', fill: { plate1_thickness: '10', plate2_thickness: '12' }, custom: { bolt_diameter: ['16', '20'], bolt_grade: ['8.8', '10.9'] } },
  { slug: 'simple_connection__lap_joint_welded', cfg: 'lapJointWeldedConfig', lists: 'simpleWelded', fill: { plate1_thickness: '10', plate2_thickness: '12' }, custom: { weld_size: ['6', '8'] } },
  { slug: 'simple_connection__butt_joint_bolted', cfg: 'buttJointBoltedConfig', lists: 'simpleBolted', fill: { plate1_thickness: '10', plate2_thickness: '12' }, custom: { bolt_diameter: ['16', '20'], bolt_grade: ['8.8', '10.9'] } },
  { slug: 'simple_connection__butt_joint_welded', cfg: 'buttJointWeldedConfig', lists: 'simpleWelded', fill: { plate1_thickness: '10', plate2_thickness: '12' }, custom: { weld_size: ['6', '8'] } },
  // ----- compression member -----
  { slug: 'compression_member__axially_loaded_column', cfg: 'axiallyLoadedColumnConfig', lists: 'axiallyLoaded', custom: { section_designation: ['MB 300', 'MB 350'] } },
  { slug: 'compression_member__struts_bolted', cfg: 'strutsBoltedConfig', lists: 'strutsBolted', custom: { ...BOLT_CUSTOM, section_designation: ['50 x 50 x 6', '60 x 60 x 6'] } },
  { slug: 'compression_member__struts_welded', cfg: 'strutsWeldedConfig', lists: 'strutsWelded', custom: { plate_thickness: ['10', '12', '16'], section_designation: ['50 x 50 x 6', '60 x 60 x 6'] } },
  // ----- flexure member -----
  { slug: 'flexure_member__simply_supported_beam', cfg: 'simplySupportedBeamConfig', lists: 'flexure', custom: { section_designation: ['MB 300', 'MB 350'] } },
  { slug: 'flexure_member__on_cantilever', cfg: 'onCantileverConfig', lists: 'flexure', custom: { section_designation: ['MB 300', 'MB 350'] } },
  {
    slug: 'flexure_member__purlin', cfg: 'purlinConfig', lists: 'flexure',
    fill: { effective_span: '6000', bending_moment_yy: '2', bending_moment_zz: '12', shear_force_yy: '3', shear_force_zz: '8' },
    custom: { section_designation: ['MB 300', 'MB 350'] },
  },
  { slug: 'flexure_member__plate_girder', cfg: 'plateGirderConfig', lists: 'plateGirder', custom: { web_thickness: ['20'], top_flange_thickness: ['40'], bottom_flange_thickness: ['40'] } },
];

// Module id parse_osi() returns for a desktop "Module:" line -> adapter slug (+ config) for the OSI source.
const OSI_MODULE_MAP = {
  'Fin Plate Connection': 'shear_connection__fin_plate',
  'Cleat Angle Connection': 'shear_connection__cleat_angle',
  'Seated Angle Connection': 'shear_connection__seated_angle',
  'Header Plate Connection': 'shear_connection__header_plate',
  'Beam-to-Beam Cover Plate Bolted Connection': 'moment_connection__beam_beam_cover_plate_bolted',
  'Column-to-Column Cover Plate Bolted Connection': 'moment_connection__column_column_cover_plate_bolted',
  'Beam-to-Beam Cover Plate Welded Connection': 'moment_connection__beam_beam_cover_plate_welded',
  'Column-to-Column Cover Plate Welded Connection': 'moment_connection__column_column_cover_plate_welded',
  'Beam-to-Beam End Plate Connection': 'moment_connection__beam_beam_end_plate',
  'Beam-to-Column End Plate Connection': 'moment_connection__beam_column_end_plate',
  'Column-to-Column End Plate Connection': 'moment_connection__column_column_end_plate',
  'Tension Member Design - Bolted to End Gusset': 'tension_member__bolted',
  'Tension Member Design - Welded to End Gusset': 'tension_member__welded',
  'Base Plate Connection': 'base_plate',
};

// ---------------------------------------------------------------------------------
// 4. Helpers replicating the browser's state setup (useModuleForm.js).
// ---------------------------------------------------------------------------------
const INPUT_KEY_TO_LIST = {
  bolt_diameter: 'boltDiameterList', bolt_grade: 'propertyClassList', plate_thickness: 'thicknessList',
  flange_plate_thickness: 'thicknessList', web_plate_thickness: 'thicknessList', angle_list: 'angleList',
  topangle_list: 'angleList', cleat_section: 'angleList', weld_size: 'weldSizeList',
  anchor_diameter_ocf: 'anchorDiameterList', anchor_grade_ocf: 'anchorGradeList',
  anchor_diameter_icf: 'anchorDiameterList', anchor_grade_icf: 'anchorGradeList',
  web_thickness: 'thicknessList', top_flange_thickness: 'thicknessList', bottom_flange_thickness: 'thicknessList',
};

function initialExtraState(config, connectivity) {
  const base = typeof config.getInitialExtraState === 'function' ? config.getInitialExtraState() : { selectedOption: 'Column Flange-Beam Web' };
  return connectivity ? { ...base, selectedOption: connectivity } : base;
}

function buildInitialAllSelected(config, value = true) {
  return Object.fromEntries((config.selectionConfig || []).map((s) => [s.inputKey, value]));
}

// useModuleForm's effect: when "All" is on and the input is empty, fill it from the list.
function fillAllFromLists(inputs, allSelected, lists) {
  const next = { ...inputs };
  for (const [inputKey, listKey] of Object.entries(INPUT_KEY_TO_LIST)) {
    if (!allSelected?.[inputKey]) continue;
    const cur = next[inputKey];
    if (Array.isArray(cur) ? cur.length : cur) continue;
    const full = lists[listKey];
    if (Array.isArray(full) && full.length) next[inputKey] = full.map((v) => (typeof v === 'object' && v ? v.value || v.Grade || String(v) : String(v)));
  }
  return next;
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const json = (v) => JSON.parse(JSON.stringify(v)); // what actually goes over the wire (drops undefined)

function check(cond, msg) {
  if (!cond) throw new Error(msg);
}

function writeFixture(slug, name, source, notes, inputs) {
  const dir = join(STAGE, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.json`), JSON.stringify({ source, notes, inputs }, null, 2) + '\n');
}

// ---------------------------------------------------------------------------------
// 5. Main.
// ---------------------------------------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'osdag-fixtures-'));
try {
  const argvOsi = process.argv.indexOf('--backend-json');
  let osiJsonPath = argvOsi > -1 ? process.argv[argvOsi + 1] : null;
  if (!osiJsonPath) {
    osiJsonPath = join(tmp, 'backend_data.json');
    execFileSync(PYTHON, [join(HERE, 'dump_backend_data.py'), osiJsonPath], { stdio: ['ignore', 'ignore', 'inherit'] });
  }
  const backend = JSON.parse(readFileSync(osiJsonPath, 'utf8'));
  const osi = backend.osi;
  const catalog = toCatalog(backend.catalog);
  const { mod, cfgFile } = await bundleConfigs(tmp);

  STAGE = join(tmp, 'stage');
  const counts = {};
  const bump = (slug) => { counts[slug] = (counts[slug] || 0) + 1; };
  void counts;

  // --- frontend-default fixtures ---
  for (const m of MODULES) {
    const config = mod[m.cfg];
    check(config, `no config export ${m.cfg}`);
    const lists = Object.fromEntries(Object.entries(LISTS[m.lists](catalog)).filter(([, v]) => v !== undefined));
    const fillNote = m.fill ? ` Defaults left empty and filled with realistic catalog values: ${JSON.stringify(m.fill)}.` : '';
    const source = `frontend-defaults:${cfgFile[m.cfg].split('/').pop()}`;
    const connectivities = m.connectivities || [null];

    const variants = [];
    connectivities.forEach((conn) => variants.push({ mode: 'all', conn }));
    variants.push({ mode: 'custom', conn: connectivities[0] });

    for (const v of variants) {
      const allSelected = buildInitialAllSelected(config, v.mode === 'all');
      let inputs = { ...config.defaultInputs, ...(m.fill || {}), ...(m.connectivityFill?.[v.conn] || {}) };
      if (v.conn) inputs = { ...inputs, [m.connectivityKey || 'connectivity']: v.conn };
      if (v.mode === 'custom') {
        for (const [k, val] of Object.entries(m.custom || {})) inputs[k] = val;
      } else {
        inputs = fillAllFromLists(inputs, allSelected, lists);
      }
      const extraState = initialExtraState(config, v.conn);
      const payload = json(config.buildSubmissionParams(inputs, allSelected, lists, extraState));
      const name = `${v.mode === 'all' ? 'defaults-all' : 'defaults-customized'}${v.conn ? `__${slugify(v.conn)}` : ''}`;
      const notes =
        `Run of ${m.cfg}.buildSubmissionParams on defaultInputs; ` +
        (v.mode === 'all' ? 'every customizable list set to "All" (the UI default; full option lists sent).' : `customizable lists set to explicit selections ${JSON.stringify(m.custom || {})}.`) +
        (v.conn ? ` Connectivity "${v.conn}" (extraState.selectedOption).` : '') +
        fillNote +
        ' Option lists come from osdag_core SQLite plus the constants in the backend options views.';
      writeFixture(m.slug, name, source, notes, payload);
      bump(m.slug);
    }
  }

  // --- OSI fixtures: parse_osi -> loadStateFromOsi -> buildSubmissionParams ---
  const unsupportedOsi = {};
  for (const [file, rec] of Object.entries(osi)) {
    const slug = OSI_MODULE_MAP[rec.module_line];
    if (!slug) {
      // A module name that is not a current desktop module name (older desktop releases).
      unsupportedOsi[file] = rec.module_line;
      continue;
    }
    const m = MODULES.find((x) => x.slug === slug);
    const config = mod[m.cfg];
    const lists = Object.fromEntries(Object.entries(LISTS[m.lists](catalog)).filter(([, v]) => v !== undefined));

    // State containers the hook would own; loadStateFromOsi writes to them via setters.
    let inputs = { ...config.defaultInputs };
    let allSelected = buildInitialAllSelected(config, true);
    let extraState = initialExtraState(config);
    let prefOverrides = {};
    const apply = (cur) => (v) => (typeof v === 'function' ? v(cur()) : v);
    mod.loadStateFromOsi({ dock: rec.dock, pref: rec.pref, flat: rec.flat }, {
      setInputs: (v) => { inputs = v; },
      setDesignPrefOverrides: (v) => { prefOverrides = v; },
      setExtraState: (f) => { extraState = apply(() => extraState)(f); },
      setSelectionStates: () => {},
      setAllSelected: (f) => { allSelected = apply(() => allSelected)(f); },
      setSelectedItems: () => {},
      moduleConfig: config,
      safeModuleData: lists,
    });
    const merged = { ...inputs, ...prefOverrides }; // useEngineeringModule.handleSubmit
    const payload = json(config.buildSubmissionParams(merged, allSelected, lists, extraState));
    writeFixture(slug, `osi-${slugify(file.replace(/\.osi$/, ''))}`, `osi:${file}`,
      `Desktop example ${file} (Module: "${rec.flat.Module}") parsed by parse_osi(), loaded by the frontend osiLoader into ${m.cfg}'s form state, then ${m.cfg}.buildSubmissionParams (All-selected flags as the loader sets them).`,
      payload);
    bump(slug);
  }

  // --- ask the backend which payloads validate_input() accepts today ---
  const resultsPath = join(tmp, 'check.json');
  execFileSync(PYTHON, [join(HERE, 'check_fixtures.py'), STAGE, resultsPath], { stdio: ['ignore', 'ignore', 'inherit'] });
  const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

  mkdirSync(OUT, { recursive: true });
  for (const entry of readdirSync(OUT, { withFileTypes: true })) {
    if (entry.isDirectory()) rmSync(join(OUT, entry.name), { recursive: true, force: true });
    else if (entry.name.endsWith('.json')) rmSync(join(OUT, entry.name));
  }
  const rejectedOsi = {};
  const kept = {};
  const xfailed = {};
  for (const [id, error] of Object.entries(results)) {
    const [slug, name] = id.split('/');
    const fixture = JSON.parse(readFileSync(join(STAGE, slug, `${name}.json`), 'utf8'));
    if (error && fixture.source.startsWith('osi:')) {
      // The desktop example does not survive the web path; no fixture, recorded instead.
      rejectedOsi[fixture.source.slice(4)] = { slug, error };
      continue;
    }
    if (error) {
      // The real frontend payload is rejected by its own backend validator: a bug.
      fixture.xfail = `Real bug: today's validate_input() rejects the payload the frontend sends (${error})`;
      xfailed[id] = error;
    }
    mkdirSync(join(OUT, slug), { recursive: true });
    writeFileSync(join(OUT, slug, `${name}.json`), JSON.stringify(fixture, null, 2) + '\n');
    kept[slug] = (kept[slug] || 0) + 1;
  }
  writeFileSync(join(OUT, 'osi_rejected.json'), JSON.stringify(rejectedOsi, null, 2) + '\n');

  console.log('fixtures kept per adapter:', JSON.stringify(kept, null, 1));
  console.log(`xfail (real frontend payloads rejected today): ${Object.keys(xfailed).length}`);
  Object.entries(xfailed).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log(`desktop examples with a module name the web does not know (skipped): ${JSON.stringify(unsupportedOsi)}`);
  console.log(`desktop examples rejected on the web path (not written; see design_inputs/osi_rejected.json): ${Object.keys(rejectedOsi).length}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
