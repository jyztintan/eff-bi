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
import { BACKEND_API_URL } from "../config/index";
import { useLocation, useNavigate } from "react-router-dom";

type UserPermissions = {
  user_email: string;
  user_id: string;
  permissions: string;
};

const TABLE_HEAD = ["User", "Permissions", "Actions on Permissions"];

const temp_data = [
  { user_email: "bob@email.com", user_id: "12", permissions: "Admin" },
  { user_email: "tom@email.com", user_id: "13", permissions: "View" },
  {
    user_email: "longlonglonglonglonglonglong@email.com",
    user_id: "15",
    permissions: "View",
  },
];

const TablePermissionsPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const table_name = searchParams.get("table_name");
  const table_id = searchParams.get("table_id");

  const navigate = useNavigate();

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [permissionsInput, setPermissionsInput] = useState("");
  const [removePermissionInput, setRemovePermissionInput] = useState("");
  const [allUsers, setAllUsers] = useState<UserPermissions[] | undefined>(
    temp_data
  );
  const [errorText, setErrorText] = useState("");

  const onRemovePermissionClick = (user_email: string, user_id: string) => {
    setSelectedUserEmail(user_email);
    setOpenRemoveDialog(true);
  };

  const giveUserPermissions = async () => {
    try {
      const requestData = {
        permission: permissionsInput,
        user_email: emailInput,
        table_id: table_id,
      };

      const response = await axios.post(
        `${BACKEND_API_URL}/api/user-access-permissions/`,
        requestData
      );

      console.log("Response from API:", response.data);
      // TODO if success show success toast
      setErrorText("");
      setEmailInput("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorText(JSON.stringify(error.response.data));
      } else {
        setErrorText("An unexpected error occurred");
      }

      console.error("Error while giving permissions:", error);
    }
  };

  const removeUserPermissions = async () => {
    const urlPartial =
      removePermissionInput == "Admin" ? "delete-admin" : "delete";

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/api/user-access-permissions/${urlPartial}/${selectedUserEmail}/${table_id}/`
      );

      console.log("Response from API:", response.data);
      // TODO if success show success toast
      setErrorText("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorText(JSON.stringify(error.response.data));
      } else {
        console.log(error);
        setErrorText("An unexpected error occurred");
      }

      console.error("Error while removing permissions:", error);
    }
  };

  const onClickCloseAddDialog = () => {
    setOpenAddDialog(false);
    setErrorText("");
    setEmailInput("");
  };

  const onClickCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setErrorText("");
    fetchTableUsers();
  };

  const fetchTableUsers = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/user-access-permissions/table/${table_id}`
      );
      // console.log(response.data.data);
      setAllUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchTableUsers();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 p-10">
      <Card className="w-full max-w-4xl p-10 rounded-xl">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Table: {table_name}
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See all users who have permissions for this table
              </Typography>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setOpenAddDialog(true)}
              className="bg-blue-500 text-white p-2 pl-5 pr-5 rounded-md hover:bg-blue-400"
            >
              Add Users
            </button>
            <button
              onClick={() => navigate("/settings/access-permissions")}
              className="bg-gray-500 text-white p-2 pl-5 pr-5 rounded-md hover:bg-gray-400"
            >
              Back to all tables
            </button>
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
              {allUsers &&
                allUsers.map(({ user_email, user_id, permissions }) => {
                  const classes = "p-4 text-center";

                  return (
                    <tr key={user_email} className="hover:bg-blue-gray-50/50">
                      <td className={classes}>
                        <div className="flex items-center gap-3 justify-center">
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {user_email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex justify-center">
                          <Chip
                            value={permissions}
                            className={`m-2 text-center w-20 rounded-full ${
                              permissions === "Admin"
                                ? "bg-red-500"
                                : "bg-gray-200 text-black"
                            }`}
                          />
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex justify-center items-center space-x-3">
                          <button
                            onClick={() =>
                              onRemovePermissionClick(user_email, user_id)
                            }
                            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* dialog for add user */}
      <Dialog open={openAddDialog} handler={() => setOpenAddDialog(false)}>
        <DialogHeader>Give permissions to a user</DialogHeader>
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
          {errorText && <div className="text-red-400">{errorText}</div>}
        </DialogBody>
        <DialogFooter className="space-x-5 justify-center">
          <Button
            variant="gradient"
            className="bg-black"
            onClick={onClickCloseAddDialog}
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

      {/* dialog for remove user  */}
      <Dialog
        open={openRemoveDialog}
        handler={() => setOpenRemoveDialog(false)}
      >
        <DialogHeader>Remove {selectedUserEmail}'s permission</DialogHeader>
        <DialogBody>
          <h5 className="text-black">
            Select the permission to <strong>remove</strong> from this user.
            Note that removing 'View' permission would also remove 'Admin'
            permission.
          </h5>
          <br />
          <Select
            label="Select Permission type"
            className="min-h-10"
            variant="outlined"
            onChange={setRemovePermissionInput}
          >
            <Option className="p-3" value="Admin">
              Admin
            </Option>
            <Option className="p-3" value="View">
              View
            </Option>
          </Select>
          {errorText && <div className="text-red-400">{errorText}</div>}
        </DialogBody>
        <DialogFooter className="space-x-5 justify-center">
          <Button
            variant="gradient"
            className="bg-black"
            onClick={onClickCloseRemoveDialog}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            className="bg-black"
            onClick={removeUserPermissions}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default TablePermissionsPage;