import fullosdagLogo from "../../../assets/homepage/Logo_osdag.svg";
import { ABOUT_TEXT } from "../../constants/aboutOsdag/aboutText";

export default function AboutTab() {
  return (
    <>
      {/* Logo */}
      <img
        src={fullosdagLogo}
        alt="Osdag Logo"
        className="w-full max-w-[580px] mb-4"
      />

      {/* Title */}
      <h3 className="font-bold mb-2">About Osdag</h3>

      <div className="text-[13px] leading-normal font-sans">

        {/* Description */}
        <p className="mb-3 text-justify">
          {ABOUT_TEXT.description}
        </p>

        {/* Development */}
        <p className="mb-3 text-justify">
          {ABOUT_TEXT.development}
        </p>

        {/* License Note */}
        <p className="mb-3 text-justify">
          {ABOUT_TEXT.licenseNote}
        </p>

        {/* Authors */}
        <p className="mb-3 text-justify">
          <b>{ABOUT_TEXT.authorsLabel}</b>{" "}
          <a
            href={ABOUT_TEXT.authorsLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {ABOUT_TEXT.authorsLink}
          </a>
        </p>

        {/* Visit Link */}
        <p className="mb-3 text-justify">
          {ABOUT_TEXT.visitLabel}{" "}
          <a
            href={ABOUT_TEXT.visitLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {ABOUT_TEXT.visitLink}
          </a>{" "}
          {ABOUT_TEXT.visitSuffix}
        </p>

        {/* Divider */}
        <hr className="border-black my-3" />

        {/* Trademark */}
        <p className="mb-3 text-justify">
          {ABOUT_TEXT.trademark}
        </p>

      </div>
    </>
  );
}