/* eslint-disable react/prop-types */
import iitbLogo from "../../../assets/homepage/iitb_logo.png";
import fosseeLogo from "../../../assets/homepage/fossee_logo.png";
import insdagLogo from "../../../assets/homepage/insdag_logo.png";
import mosLogo from "../../../assets/homepage/mos_logo.png";
import constructsteelLogo from "../../../assets/homepage/constructsteel_logo.png";

function Acknowledgement({ name, url, logo }) {
  return (
    <div className="my-6">
      <h3>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[#91b014] font-bold"
        >
          {name}
        </a>
      </h3>
      <img src={logo} alt={name} className="max-h-[80px] mt-2.5" />
    </div>
  );
}

export default function AcknowledgementsTab() {
  return (
    <>
      <div className="my-6">
        <h2 className="font-bold text-xl mb-1">Acknowledgements</h2>
        <p>
          Osdag acknowledges the support and contributions of the following
          organizations:
        </p>
      </div>

      <Acknowledgement
        name="Department of Civil Engineering, IIT Bombay"
        url="https://www.civil.iitb.ac.in/"
        logo={iitbLogo}
      />

      <Acknowledgement
        name="constructsteel"
        url="https://constructsteel.org/"
        logo={constructsteelLogo}
      />

      <Acknowledgement
        name="FOSSEE"
        url="https://fossee.in/"
        logo={fosseeLogo}
      />

      <Acknowledgement
        name="INSDAG"
        url="https://insdag.org/"
        logo={insdagLogo}
      />

      <Acknowledgement
        name="Ministry of Steel"
        url="https://steel.gov.in/"
        logo={mosLogo}
      />
    </>
  );
}