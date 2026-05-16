import React from "react";

const FilterOption = ({
  status,
  onClick,
  children,
}: {
  status: boolean;
  onClick: () => void;

  children: React.ReactNode;
}) => {
  return (
    <div
      onClick={onClick}
      className="px-5 py-2 text-xs font-bold rounded-md border "
      style={
        status
          ? {
              background: "#F59E0B1A",
              border: "1px solid #F59E0B1A",
              color: "#D2A947",
            }
          : {
              background: "none",
              border: "1px solid #DFDFDF",
              color: "#000",
            }
      }
    >
      {children}
    </div>
  );
};

export default FilterOption;
