/**
 * Centralized output dock image map and resolver.
 * Used by BaseOutputDock for modal images (spacing, capacity, base plate, etc.).
 */

import spacingIMG from "../../../assets/spacing_3.png";
import capacityIMG1 from "../../../assets/L_shear1.png";
import capacityIMG2 from "../../../assets/L.png";
import Stiffener_BWE from "../../../assets/BB_Stiffener_BWE.png";
import Stiffener_FP from "../../../assets/BB_Stiffener_FP.png";
import Stiffener_OWE from "../../../assets/BB_Stiffener_OWE.png";
import Detailing_BWE from "../../../assets/Detailing-BWE.png";
import Detailing_FP from "../../../assets/Detailing-Flush.png";
import Detailing_OWE from "../../../assets/Detailing-OWE.png";
import GrooveImg from "../../../assets/BB-BC-single_bevel_groove.png";
import Moment_BP from "../../../assets/Moment_BP.png";
import Welded_BP from "../../../assets/Welded_BP.png";
import SHS_BP from "../../../assets/SHS_BP.png";
import RHS_BP from "../../../assets/RHS_BP.png";
import CHS_BP from "../../../assets/CHS_BP.png";
import Moment_BP_Detailing from "../../../assets/Moment_BP_Detailing.png";
import Welded_BP_Detailing from "../../../assets/Welded_BP_Detailing.png";
import SHS_BP_Detailing from "../../../assets/SHS_BP_Detailing.png";
import RHS_BP_Detailing from "../../../assets/RHS_BP_Detailing.png";
import CHS_BP_Detailing from "../../../assets/CHS_BP_Detailing.png";
import Moment_BP_weld_1_1 from "../../../assets/Moment_BP_weld_details_1-1.png";
import Welded_BP_single_bevel from "../../../assets/Welded_BP_single_bevel.png";
import SHS_BP_groove_weld from "../../../assets/SHS_BP_groove_weld_details.png";
import SHS_BP_weld from "../../../assets/SHS_BP_weld_details.png";
import RHS_BP_groove_weld from "../../../assets/RHS_BP_groove_weld_details.png";
import RHS_BP_weld from "../../../assets/RHS_BP_weld_details.png";
import CHS_BP_groove_weld from "../../../assets/CHS_BP_groove_weld_details.png";
import CHS_BP_weld from "../../../assets/CHS_BP_weld_details.png";
import BP_welded_weld from "../../../assets/BP_welded_weld_details.png";
import Key_SHS from "../../../assets/Key_SHS.png";
import Key_RHS from "../../../assets/Key_RHS.png";
import Key_CHS from "../../../assets/Key_CHS.png";
import plateBlockShear from "../../../assets/U.png";
import plateBlockShearWebHorizontal from "../../../assets/Uw.png";
import plateBlockShearWebVertical from "../../../assets/U_Vw.png";

const imageMap = {
  stiffener: {
    "Flushed - Reversible Moment": Stiffener_FP,
    "Extended One Way - Irreversible Moment": Stiffener_OWE,
    "Extended Both Ways - Reversible Moment": Stiffener_BWE,
  },
  detailing: {
    "Flushed - Reversible Moment": Detailing_FP,
    "Extended One Way - Irreversible Moment": Detailing_OWE,
    "Extended Both Ways - Reversible Moment": Detailing_BWE,
  },
  groove: GrooveImg,
  spacing: spacingIMG,
  capacity1: capacityIMG1,
  capacity2: capacityIMG2,
  basePlateSketch: {
    "Moment Base Plate": Moment_BP,
    "Welded Column Base": Welded_BP,
    "Hollow/Tubular Column Base": null,
  },
  basePlateDetailing: {
    "Moment Base Plate": Moment_BP_Detailing,
    "Welded Column Base": Welded_BP_Detailing,
    "Hollow/Tubular Column Base": null,
  },
  weldDetails: {
    "Moment Base Plate": Moment_BP_weld_1_1,
    "Welded Column Base": Welded_BP_single_bevel,
    "Hollow/Tubular Column Base": null,
  },
  keySketch: {
    SHS: Key_SHS,
    RHS: Key_RHS,
    CHS: Key_CHS,
  },
  plate_block_shear: plateBlockShear,
  block_shear_welded_beam: plateBlockShearWebHorizontal,
  block_shear_welded_column: plateBlockShearWebVertical,
};

/**
 * Resolve image for output modal by type, selected option, and base plate state.
 * @param {string} imageType - e.g. 'spacing', 'capacity1', 'basePlateSketch', 'stiffener'
 * @param {string} [selectedOption] - e.g. connectivity or end plate type
 * @param {Object} [basePlateState] - { connectivity, member_designation, designation, weld_type }
 * @returns {string | null} Image src or null
 */
export function getOutputImage(imageType, selectedOption, basePlateState = {}) {
  if (imageType === "groove" || imageType === "spacing" || imageType === "capacity1" || imageType === "capacity2" ||  imageType === "plate_block_shear" || imageType === "block_shear_welded_beam" || imageType === "block_shear_welded_column") {
    return imageMap[imageType] ?? null;
  }
  if (imageType === "basePlateSketch") {
    const conn = basePlateState.connectivity || selectedOption;
    let img = imageMap.basePlateSketch?.[conn];
    if (conn === "Hollow/Tubular Column Base") {
      const sec = (basePlateState.member_designation || basePlateState.designation || "") + "";
      if (sec.includes("SHS")) img = SHS_BP;
      else if (sec.includes("RHS")) img = RHS_BP;
      else if (sec.includes("CHS")) img = CHS_BP;
    }
    return img || Moment_BP;
  }
  if (imageType === "basePlateDetailing") {
    const conn = basePlateState.connectivity || selectedOption;
    let img = imageMap.basePlateDetailing?.[conn];
    if (conn === "Hollow/Tubular Column Base") {
      const sec = (basePlateState.member_designation || basePlateState.designation || "") + "";
      if (sec.includes("SHS")) img = SHS_BP_Detailing;
      else if (sec.includes("RHS")) img = RHS_BP_Detailing;
      else if (sec.includes("CHS")) img = CHS_BP_Detailing;
    }
    return img || Moment_BP_Detailing;
  }
  if (imageType === "weldDetails") {
    const conn = basePlateState.connectivity || selectedOption;
    let img = imageMap.weldDetails?.[conn];
    if (conn === "Welded Column Base") return BP_welded_weld || Welded_BP_single_bevel;
    if (conn === "Hollow/Tubular Column Base") {
      const sec = (basePlateState.member_designation || basePlateState.designation || "") + "";
      const groove = basePlateState.weld_type === "Groove Weld";
      if (sec.includes("SHS")) img = groove ? SHS_BP_groove_weld : SHS_BP_weld;
      else if (sec.includes("RHS")) img = groove ? RHS_BP_groove_weld : RHS_BP_weld;
      else if (sec.includes("CHS")) img = groove ? CHS_BP_groove_weld : CHS_BP_weld;
    }
    return img || Moment_BP_weld_1_1;
  }
  if (imageType === "keySketch") {
    const sec = (basePlateState.member_designation || basePlateState.designation || "") + "";
    if (sec.includes("SHS")) return Key_SHS;
    if (sec.includes("RHS")) return Key_RHS;
    if (sec.includes("CHS")) return Key_CHS;
    return Key_SHS;
  }
  return imageMap[imageType]?.[selectedOption] ?? null;
}
