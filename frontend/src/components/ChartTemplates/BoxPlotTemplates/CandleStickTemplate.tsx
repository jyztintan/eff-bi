import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";
import html2canvas from "html2canvas";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Spinner } from "@material-tailwind/react";
import axios from "axios";
import { BACKEND_API_URL } from "../../../config";


type CandlestickData = {
  x: Date | number;
  y: [number, number, number, number];
};

interface CandlestickChartProps {
  data: CandlestickData[];
  title: string;
  description: string;
  height?: number;
  id: number;
}

const CandlestickTemplate: React.FC<CandlestickChartProps> = ({
  data,
  title,
  description,
  height = 350,
  id,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currData, setCurrData] = useState(data);

  if (isLoading) {
    return <Spinner />;
  }

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_API_URL}/api/refresh-dashboard-tile/`, {
        tile_id: id,
      });
      setCurrData(response.data.data.tile_props.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const options = {
      series: [
        {
          data: currData,
        },
      ],
      chart: {
        type: "candlestick",
        height: height,
        toolbar: { show: false },
      },
      title: {
        text: title,
        align: "left",
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();

    return () => chart.destroy();
  }, [currData, title, height]);

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
      <div className="flex justify-end">
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
          className="mb-2"
        >
          <MoreVertIcon />
        </IconButton>
      </div>
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
      <div ref={chartRef}></div>
    </div>
  );
};

export default CandlestickTemplate;
