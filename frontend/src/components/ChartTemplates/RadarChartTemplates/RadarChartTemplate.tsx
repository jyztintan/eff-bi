import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";
import { ApexOptions } from "apexcharts";
import { Typography } from "@mui/material";

interface RadarChartProps {
  series: { name: string; data: number[] }[];
  categories: string[];
  chartHeight?: number;
  title?: string;
  description?: string;
}

const RadarChartTemplate: React.FC<RadarChartProps> = ({
  series,
  categories,
  chartHeight = 350,
  title,
  description,
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const options: ApexOptions = {
      series: series,
      chart: {
        height: chartHeight,
        type: "radar",
        toolbar: { show: false },
      },
      title: {
        text: "Radar Chart",
      },
      yaxis: {
        stepSize: 20,
      },
      xaxis: {
        categories: categories,
      },
    };

    const chart = new ApexCharts(chartRef.current as HTMLElement, options);
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [series, categories, chartHeight]);

  return (
    <div>
      {/* Title and Description */}
      <Typography
        variant="h6"
        style={{ textAlign: "center", marginBottom: 10 }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        style={{ textAlign: "center", marginBottom: 20 }}
      >
        {description}
      </Typography>
      <div ref={chartRef} id="radar-chart" />
    </div>
  );
};

export default RadarChartTemplate;
