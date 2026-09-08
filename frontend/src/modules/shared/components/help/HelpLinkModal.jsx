/* eslint-disable react/prop-types */
import HelpDialogShell from "./HelpDialogShell";

export const HelpLinkModal = ({
  open,
  onClose,
  title,
  helperText = "Please visit:",
  link,
}) => {
  return (
    <HelpDialogShell open={open} onClose={onClose} title={title} width={420}>
      <div className="space-y-3 text-sm">
        <p className="text-gray-600 dark:text-gray-300">{helperText}</p>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="break-all text-osdag-green underline"
        >
          {link}
        </a>
      </div>
    </HelpDialogShell>
  );
};

export default HelpLinkModal;
