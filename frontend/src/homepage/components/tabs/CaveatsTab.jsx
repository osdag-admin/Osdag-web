import { CAVEATS_TEXT } from "../../constants/aboutOsdag/caveatsText";

export default function CaveatsTab() {
  return (
    <div className="p-5">
      <h2 className="mb-3 font-bold text-black">Caveats</h2>

      {CAVEATS_TEXT.map((para, index) => (
        <p
          key={index}
          className="mb-3 text-[13px] leading-normal text-black"
        >
          {para}
        </p>
      ))}
    </div>
  );
}