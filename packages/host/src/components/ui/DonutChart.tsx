import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip);

export default function SafetyDonutChart() {
  const { t } = useTranslation();

  const items = [
    { label: t("dashboard.safe"), value: 142, color: "#2ebd6b", barWidth: "w-16" },
    { label: t("dashboard.warning"), value: 142, color: "#f58220", barWidth: "w-12" },
    { label: t("dashboard.danger"), value: 142, color: "#c0392b", barWidth: "w-10" },
  ];

  const data = {
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ["#2ebd6b", "#f58220", "#c0392b"],
        borderWidth: 4,
        borderColor: "#ffffff",
        hoverOffset: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="w-full p-3 flex flex-col gap-4">
      <div className="w-[170px] h-[170px] mx-auto">
        <Doughnut data={data} options={options} />
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 rtl:flex-row-reverse"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-gray-700 text-sm font-medium min-w-[42px]">
                {item.label}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-1 ">
              <span
                className="text-sm font-bold min-w-[34px] text-center"
                style={{ color: item.color }}
              >
                {item.value}
              </span>

              <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.barWidth}`}
                  style={{ background: item.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
