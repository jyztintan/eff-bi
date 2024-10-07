import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Typography,
  CardBody,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import axios from "axios";

const TABLE_HEAD = ["Tables", "Permissions", "Actions"];

// TODO remove
const temp_data = [
  { table_name: "table 1", permissions: ["View", "Admin"] },
  { table_name: "table 2", permissions: ["View", "Admin"] },
  { table_name: "long long long table name", permissions: ["View"] },
];

export default function DBAccessPermissionsPage() {
  const [open, setOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [permissionsInput, setPermissionsInput] = useState("");
  const [permissions, setPermissions] = useState(temp_data);

  const onGivePermissionClick = (table_name: string) => {
    setSelectedTable(table_name);
    setOpen(true);
  };

  const giveUserPermissions = async () => {
    try {
      const requestData = {
        permissions: permissionsInput,
        email: emailInput,
      };

      console.log(requestData);

      //   const response = await axios.post(
      //     // TODO update this
      //     "http://localhost:8000/api/connection/",
      //     requestData
      //   );

      //   console.log("Response from API:", response.data);

      setOpen(false);
      setEmailInput("");
    } catch (error) {
      console.error("Error while giving permissions:", error);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // TODO get the user_id
        const response = await axios.get(
          "http://localhost:8000/api/user-access-permissions/<int:user_id>"
        );
        setPermissions(response.data); // Update the permissions state with data from the API
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 p-10">
      <Card className="w-full max-w-4xl p-10 rounded-xl">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Your Database Permissions
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See access control permissions for each table
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll px-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="h6"
                      color="blue-gray"
                      className="leading-none font-bold text-center"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(({ table_name, permissions }, index) => {
                const classes = "p-4 text-center";

                return (
                  <tr key={table_name} className="hover:bg-blue-gray-50/50">
                    <td className={classes}>
                      <div className="flex items-center gap-3 justify-center">
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {table_name}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex justify-center">
                        {permissions.map((role, index) => (
                          <Chip
                            key={index}
                            value={role}
                            className={`m-2 text-center w-20 rounded-full ${
                              role === "Admin"
                                ? "bg-red-500"
                                : "bg-gray-200 text-black"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex justify-center">
                        {permissions.includes("Admin") && (
                          <button
                            onClick={() => onGivePermissionClick(table_name)}
                            className="bg-blue-500 text-white p-2 rounded-md"
                          >
                            Give Permissions
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Dialog open={open} handler={() => setOpen(false)}>
        <DialogHeader>Permissions: {selectedTable}</DialogHeader>
        <DialogBody>
          <input
            type="text"
            placeholder="User's email"
            className="w-full p-2 rounded bg-white text-black border border-gray-700 focus:outline-none focus:border-blue-500 mb-5"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <Select
            label="Select Permission type"
            className="min-h-10"
            variant="outlined"
            onChange={setPermissionsInput}
          >
            <Option className="p-3" value="Admin">
              Admin
            </Option>
            <Option className="p-3" value="View">
              View
            </Option>
          </Select>
        </DialogBody>
        <DialogFooter className="space-x-5 justify-center">
          <Button
            variant="gradient"
            className="bg-black"
            onClick={() => setOpen(false)}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            className="bg-black"
            onClick={giveUserPermissions}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
