import { Typography, CardContent, Divider } from "@mui/material";

// TODO: FIX HEIGHT
interface SingleValueTemplateProps {
  value: number;
  title: string;
}

const SingleValueTemplate: React.FC<SingleValueTemplateProps> = ({
  title,
  value,
}) => {
  return (
    <div style={{ position: "relative", marginTop: 0, height: "100%" }}>
      <CardContent>
        <Typography
          variant="h6"
          style={{
            textAlign: "center",
            marginBottom: 0,
            wordWrap: "break-word",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          style={{
            textAlign: "center",
            marginBottom: 0,
            wordWrap: "break-word",
            paddingTop: "3rem",
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </div>
  );
};

export default SingleValueTemplate;
