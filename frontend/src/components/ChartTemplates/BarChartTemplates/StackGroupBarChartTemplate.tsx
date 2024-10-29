"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ApexCharts from "apexcharts";
import type { ApexOptions } from "apexcharts";
import html2canvas from "html2canvas";
import { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Spinner } from "@material-tailwind/react";
import axios from "axios";
import { BACKEND_API_URL } from "../../../config";
import RefreshIcon from "@mui/icons-material/Refresh";

export interface StackedBarChartProps {
  chartSeries: { name: string; group: string; data: number[] }[];
  categories: string[];
  title: string;
  description: string;
  sx?: SxProps;
  id: number;
}

export function StackedGroupBarChartTemplate({
  chartSeries,
  categories,
  title,
  description,
  id,
}: StackedBarChartProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currChartSeries, setCurrChartSeries] = useState(chartSeries);

  if (isLoading) {
    return <Spinner />;
  }

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/api/refresh-dashboard-tile/`,
        {
          tile_id: id,
        }
      );
      setCurrChartSeries(response.data.data.tile_props.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartOptions = useChartOptions(currChartSeries, categories);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
    } else if (format === "PNG" || format === "JPEG" || format === "JPG") {
      const canvas = await html2canvas(chartElement);
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `chart.${format.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        },
        format === "JPEG" ? "image/jpeg" : undefined
      );
    }

    handleClose();
  };

  React.useEffect(() => {
    const chart = new ApexCharts(
      document.querySelector("#stacked-bar-chart"),
      chartOptions
    );
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [chartOptions]);

  return (
    <div style={{ position: "relative", textAlign: "center" }}>
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

      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
        <div>
          <IconButton
            onClick={handleRefresh}
            size="small"
            className="mb-2"
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={handleMenuClick}
            size="small"
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
            <MenuItem
              onClick={() => handleDownload("JPG")}
              sx={{
                typography: "body2",
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              Download as JPG
            </MenuItem>
            <MenuItem
              onClick={() => handleDownload("JPEG")}
              sx={{
                typography: "body2",
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              Download as JPEG
            </MenuItem>
          </Menu>
        </div>
      </div>
      <div id="stacked-bar-chart" style={{ width: "100%", height: "350px" }} />
    </div>
  );
}

function useChartOptions(
  chartSeries: { name: string; group: string; data: number[] }[],
  categories: string[]
): ApexOptions {
  return {
    series: chartSeries,
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: { show: false },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    dataLabels: {
      formatter: (val: number | string) => {
        return `${Number(val) / 1000}K`;
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: (val: number | string) => {
          return `${Number(val) / 1000}K`;
        },
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ["#80c7fd", "#008FFB", "#80f1cb", "#00E396"],
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
  };
}
