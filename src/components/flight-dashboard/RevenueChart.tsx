"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

import { useTheme } from "@/context/ThemeContext";

const ReactApexChart = dynamic(() => import("react-apexcharts").then((mod) => mod.default), {
  ssr: false,
});

export default function RevenueChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const options: ApexOptions = {
    colors: ["#465fff", "#9cb9ff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 310,
      toolbar: { show: false },
      background: "transparent",
      foreColor: isDark ? "#98a2b3" : "#475467",
    },
    theme: {
      mode: isDark ? "dark" : "light",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: isDark ? "#98a2b3" : "#475467",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      labels: {
        colors: isDark ? "#98a2b3" : "#475467",
      },
    },
    yaxis: {
      title: { text: undefined },
      labels: {
        style: {
          colors: isDark ? "#98a2b3" : "#475467",
        },
      },
    },
    grid: {
      borderColor: isDark ? "#1e293b" : "#e2e8f0",
      yaxis: { lines: { show: true } },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: "Revenue ($)",
      data: [12400, 15800, 21000, 18500, 24000, 29000, 31000, 28000, 34000, 42000, 39500, 45850],
    },
    {
      name: "Bookings",
      data: [420, 580, 710, 650, 840, 990, 1050, 980, 1140, 1320, 1180, 1240],
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Revenue & Booking Trends
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monthly performance overview</p>
        </div>

        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
              View Report
            </DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
              Download CSV
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={310} />
        </div>
      </div>
    </div>
  );
}
