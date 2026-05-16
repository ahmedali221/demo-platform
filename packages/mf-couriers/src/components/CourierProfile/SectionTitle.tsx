import React from "react";

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="w-full flex items-center gap-2.5">
      <div className="flex-1 bg-[#BFC7D1] h-[2px] rounded-full"></div>
      <div className="bg-[#BFC7D199] border border-[#94A3B8] rounded-md text-[#1D3478] font-bold py-2 px-3">
        {title}
      </div>
      <div className="flex-1 bg-[#BFC7D1] h-[2px] rounded-full"></div>
    </div>
  );
};

export default SectionTitle;
