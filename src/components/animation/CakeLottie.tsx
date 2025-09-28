import React from "react";

type Props = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

const CakeLottie: React.FC<Props> = ({ width = "100%", height = 360, className }) => {
  return (
    <div
      className={[
        "relative rounded-3xl overflow-hidden",
       
        className || "",
      ].join(" ")}
    >
      {/* glow de marca */}
      <div className="pointer-events-none absolute" />

      <div className="relative w-full" style={{ height }}>
        <iframe
          src="https://lottie.host/embed/26591857-a969-4a28-877d-5f8b31f5d3ef/7LgaiDow0j.lottie"
          style={{ width, height, border: "none" }}
          title="Epikus Cake animation"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default CakeLottie;
