"use client";

import * as React from "react";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import html2canvas from "html2canvas";
import type { ApexOptions } from "apexcharts";
import { Chart } from "../Chart";

export interface SalesProps {
  chartSeries: { name: string; data: number[] }[];
  categories: string[];
}

export function BarChartTemplate({
  chartSeries,
  categories,
}: SalesProps): React.JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const chartOptions = useChartOptions(categories);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async (format: string) => {
    const chartElement = document.querySelector(
      ".apexcharts-canvas"
    ) as HTMLElement;

    if (!chartElement) return;

    if (format === "SVG") {
      const svgData = chartElement.querySelector("svg");
      if (svgData) {
        const serializer = new XMLSerializer();
        const svgBlob = new Blob([serializer.serializeToString(svgData)], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chart.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else if (format === "PNG") {
      const canvas = await html2canvas(chartElement);
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "chart.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    }

    handleClose();
  };

  return (
    <div style={{ position: "relative", marginTop: 30 }}>
      <div style={{ position: "absolute", top: -20, right: 10, zIndex: 1 }}>
        <IconButton
          onClick={handleMenuClick}
          size="small"
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              borderRadius: 8,
              marginTop: 5,
            },
          }}
        >
          <MenuItem
            onClick={() => handleDownload("SVG")}
            sx={{
              typography: "body2",
              color: "text.primary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            Download as SVG
          </MenuItem>
          <MenuItem
            onClick={() => handleDownload("PNG")}
            sx={{
              typography: "body2",
              color: "text.primary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            Download as PNG
          </MenuItem>
        </Menu>
      </div>
      <CardContent>
        <Chart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="bar"
          width="100%"
        />
      </CardContent>
      <Divider />
    </div>
  );
}

function useChartOptions(categories: string[]): ApexOptions {
  const theme = useTheme();

  const columnWidth = Math.max(40, 100 / categories.length);

  const generateBlueShades = (count: number): string[] => {
    const shades: string[] = [];
    for (let i = 0; i < count; i++) {
      const lightness = 40 + i * (60 / count);
      shades.push(`hsl(210, 100%, ${lightness}%)`);
    }
    return shades;
  };

  const colors = generateBlueShades(categories.length);

  return {
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: { show: false },
    },
    colors: colors,
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: "solid" },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: { bar: { columnWidth: `${columnWidth}%` } },
    stroke: { colors: ["transparent"], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: categories,
      labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value > 0 ? `${value}K` : `${value}`),
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
    },
  };
}
