import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Slide,
} from "@mui/material";
import { useAuth } from "./AuthenticationContext";
import { useNavigate } from "react-router-dom";

interface OrganizationSelectionProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const OrganizationSelection: React.FC<OrganizationSelectionProps> = ({
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<"select" | "create" | "join">("select");
  const [selection, setSelection] = useState<"create" | "join" | "">("");
  const [orgData, setOrgData] = useState({
    orgId: "",
    name: "",
    databaseUri: "",
  });
  const [showTransition, setShowTransition] = useState(true);

  const { setOrganizationId } = useAuth();
  const navigate = useNavigate();

  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelection(event.target.value as "create" | "join");
  };

  const handleNext = () => {
    setShowTransition(false);

    setTimeout(() => {
      if (selection === "create") {
        setStep("create");
      } else if (selection === "join") {
        setStep("join");
      }
      setShowTransition(true);
    }, 300);
  };

  const handleBack = () => {
    setShowTransition(false);

    setTimeout(() => {
      setStep("select");
      setShowTransition(true);
    }, 300);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setOrgData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (step === "create") {
      console.log("org id", orgData, orgData.orgId)
      const response = await fetch("http://localhost:8000/api/organizations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: orgData.orgId,
          name: orgData.name,
          database_uri: orgData.databaseUri,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOrganizationId(orgData.orgId);
        onSubmit({ ...orgData, action: step });
        navigate("/auth/save");
      } else {
        // Handle error
        console.error("Error creating organization");
      }
    } else if (step === "join") {
      // Get organization data
      const response = await fetch(
        `http://localhost:8000/api/organizations/${orgData.orgId}`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const result = await response.json();
        setOrganizationId(orgData.orgId);
        onSubmit({ ...orgData, action: step });
        navigate("/auth/save");
      } else {
        console.error("Organization not found");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        p: 4,
      }}
    >
      <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>
        {step === "select"
          ? "Organization Selection"
          : step === "create"
          ? "Create Organization"
          : "Join Organization"}
      </Typography>

      {/* Slide component for transitions */}
      <Slide
        in={showTransition}
        direction={step === "select" ? "right" : "left"}
      >
        <Box>
          {step === "select" && (
            <Box sx={{ textAlign: "center" }}>
              <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
                <RadioGroup
                  aria-label="organization-selection"
                  name="organization-selection"
                  value={selection}
                  onChange={handleSelectionChange}
                  sx={{ alignItems: "flex-start" }}
                >
                  <FormControlLabel
                    value="create"
                    control={<Radio />}
                    label="Create a new organization"
                  />
                  <FormControlLabel
                    value="join"
                    control={<Radio />}
                    label="Join an existing organization"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {step === "create" && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                name="orgId"
                label="Organization ID"
                type="number"
                value={orgData.orgId}
                onChange={handleInputChange}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="name"
                label="Organization Name"
                type="text"
                value={orgData.name}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="databaseUri"
                label="Database URI"
                type="text"
                value={orgData.databaseUri}
                onChange={handleInputChange}
              />
            </>
          )}

          {step === "join" && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="id"
              label="Organization ID"
              type="number"
              value={orgData.orgId}
              onChange={handleInputChange}
            />
          )}
        </Box>
      </Slide>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          onClick={step === "select" ? onClose : handleBack}
          variant="outlined"
        >
          {step === "select" ? "Back" : "Previous"}
        </Button>
        {step === "select" ? (
          <Button
            onClick={handleNext}
            disabled={!selection}
            variant="contained"
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OrganizationSelection;