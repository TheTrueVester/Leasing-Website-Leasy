import { baseUrl } from "@/api/base";
import Dropzone from "@/components/Dropzone";
import { AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { getUserInitials } from "@/utils/stringUtils";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import React, { useEffect, useState } from "react";

/**
 * UserProfilePage displays the user's profile information.
 * It includes the user's personal information, bio, profile picture, and documents.
 * The user can edit their information, upload a profile picture, banking information, and upload documents.
 */
const UserProfilePage = () => {
  const { user, token, storeUser } = useAuth();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    newFirstname: "",
    newLastname: "",
    newPhone: "",
    newBio: "",
    newMajor: "",
    newUniversity: "",
    newHobbies: "",
    newLanguages: "",
    newAddress: "",
    newBankingDetails: "",
  });

  const [editField, setEditField] = useState<string | null>(null);
  const [pics, setPics] = useState<(File & { preview: string })[]>([]);
  const [docs, setDocs] = useState<(File & { preview: string })[]>([]);

  useEffect(() => {
    if (user) {
      console.log("User data on load:", user);
      setFormData({
        newPassword: "",
        confirmPassword: "",
        newFirstname: user.firstname || "",
        newLastname: user.lastname || "",
        newPhone: user.userBioAttributes?.phone || "",
        newBio: user.userBioAttributes?.bio || "",
        newMajor: user.userBioAttributes?.major || "",
        newUniversity: user.userBioAttributes?.university || "",
        newHobbies: user.userBioAttributes?.hobbies || "",
        newLanguages: user.userBioAttributes?.languages || "",
        newAddress: user.userBioAttributes?.address || "",
        newBankingDetails: user.userBioAttributes?.bankingDetails || "",
      });
    }
  }, [user]);

  // handle changes in input fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // picture upload function
  const handleProfilePictureUpload = async () => {
    if (!pics[0]) return;

    const formData = new FormData();
    formData.append("profilePicture", pics[0]);

    try {
      const response = await fetch(
        `${baseUrl}/users/me/upload/profilePicture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Profile picture upload response:", data);
      if (data.success) {
        const updatedUser = { ...user, profilePicture: data.profilePicture };
        storeUser(updatedUser);
        setPics([]);
        setEditField(null);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  // document upload function
  const handleDocumentUpload = async () => {
    if (docs.length === 0) return;

    const formData = new FormData();
    docs.forEach((doc) => formData.append("documents", doc));

    try {
      const response = await fetch(`${baseUrl}/users/me/upload/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      console.log("Document upload response:", data);
      if (data.success) {
        const updatedUser = {
          ...user,
          documents: [...(user?.documents || []), ...data.documents],
        };
        storeUser(updatedUser);
        setDocs([]);
        setEditField(null);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  // document deletion function
  const handleDocumentDelete = async (documentUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/users/me/upload/documents`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentUrl }),
      });
      const data = await response.json();
      console.log("Document delete response:", data);
      if (data.success) {
        const updatedUser = {
          ...user,
          documents: user?.documents?.filter(
            (doc: string) => doc !== documentUrl
          ),
        };
        storeUser(updatedUser);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    //IBAN Whiteliste
    //check bellow for filter parameters
    if (
      formData.newBankingDetails &&
      !validateIBAN(formData.newBankingDetails)
    ) {
      alert("Invalid IBAN format");
      return;
    }

    try {
      console.log("Submitting form data:", formData);
      const response = await fetch(`${baseUrl}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log("Update user response:", data);
      if (data.success) {
        const updatedUser = {
          ...user,
          firstname: formData.newFirstname,
          lastname: formData.newLastname,
          userBioAttributes: {
            phone: formData.newPhone,
            bio: formData.newBio,
            major: formData.newMajor,
            university: formData.newUniversity,
            hobbies: formData.newHobbies,
            languages: formData.newLanguages,
            address: formData.newAddress,
            bankingDetails: formData.newBankingDetails,
          },
        };
        storeUser(updatedUser);

        setFormData((prevFormData) => ({
          ...prevFormData,
          newPassword: "",
          confirmPassword: "",
        }));
        setEditField(null);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // function to validate IBAN format
  const validateIBAN = (iban: string) => {
    //2 capital letter + 2 numbers + 1 to 30 (capital letters or number)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    return ibanRegex.test(iban);
  };

  // Render editable fields
  const renderEditField = (
    field: string,
    label: string,
    type: string = "text",
    isBioAttribute: boolean = false
  ) => {
    const value =
      user && isBioAttribute
        ? user?.userBioAttributes?.[field]
        : user?.[field as keyof typeof user];
    return (
      <div className="flex flex-col mb-4">
        {editField === field ? (
          <form onSubmit={handleSubmit} className="w-full">
            <label className="text-gray-700 block mb-1">
              <strong>{label}: </strong>
            </label>
            {type === "textarea" ? (
              <Textarea
                name={`new${field.charAt(0).toUpperCase() + field.slice(1)}`}
                value={
                  formData[
                  `new${field.charAt(0).toUpperCase() + field.slice(1)
                  }` as keyof typeof formData
                  ]
                }
                onChange={handleChange}
                className="rounded-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full mb-2"
              />
            ) : (
              <Input
                type={type}
                name={`new${field.charAt(0).toUpperCase() + field.slice(1)}`}
                value={
                  formData[
                  `new${field.charAt(0).toUpperCase() + field.slice(1)
                  }` as keyof typeof formData
                  ]
                }
                onChange={handleChange}
                className="rounded-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full mb-2"
              />
            )}
            <Button type="submit" className="mt-2">
              Save
            </Button>
            <Button
              type="button"
              onClick={() => setEditField(null)}
              className="mt-2 ml-2"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                <strong>{label}</strong>
              </p>
              <p className="text-gray-500">
                {(value as string) || "Not provided"}
              </p>
            </div>
            {field !== "email" && (
              <Button
                variant="secondary"
                size="sm"
                className="shadow-md bg-gray-100 hover:bg-gray-300"
                onClick={() => setEditField(field)}
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid col-start-2 w-full">
      <div className="bg-white flex justify-center py-8">
        <div className="w-full bg-indigo-50 rounded-lg shadow-lg p-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-foreground">Your Profile</h2>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col w-32 h-32 md:w-1/3 md:h-1/3 flex-shrink-0 relative pr-10 space-y-10">
              {/* Profile picture upload; top left */}
              <div>
                {editField === "profilePicture" ? (
                  <div>
                    <Dropzone
                      files={pics}
                      setFiles={setPics}
                      fileType="image"
                      className="py-2 border border-neutral-200 rounded-xl w-full"
                    />
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        onClick={handleProfilePictureUpload}
                        className="mt-2"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEditField(null)}
                        className="mt-2 ml-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Avatar className="w-full h-full">
                      {editField !== "profilePicture" && (
                        <>
                          <AvatarImage
                            src={user?.profilePicture || ""}
                            alt="avatar"
                            className="aspect-auto"
                          />
                          <AvatarFallback className="text-7xl">
                            {user && getUserInitials(user)}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-0 right-0 mt-2 mr-2 shadow-md "
                      onClick={() => setEditField("profilePicture")}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
              {/* Document upload; bellow picture upload */}
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mt-4">
                  Uploaded Documents:
                </h3>
                <ul className="list-disc list-inside">
                  {user?.documents && user?.documents.length === 0 && (
                    <p className="font-medium">No documents uploaded yet</p>
                  )}
                  {user?.documents &&
                    user?.documents.map(
                      (documentUrl: string, index: number) => (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-white p-2 rounded-md shadow-md mt-2"
                        >
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline max-w-80 truncate"
                          >
                            {documentUrl.split("/").pop()}
                          </a>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDocumentDelete(documentUrl)}
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </li>
                      )
                    )}
                </ul>
              </div>
              <div>
                <Dropzone
                  files={docs}
                  setFiles={setDocs}
                  fileType="file"
                  className="py-2 border border-neutral-200 rounded-xl w-full"
                />
                <div className="flex justify-center mt-2">
                  <Button type="button" onClick={handleDocumentUpload}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setDocs([])}
                    className="ml-2"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            {/* all attributes that show up on the profile */}
            <div className="flex flex-col w-2/3 space-y-4">
              {renderEditField("bio", "About Me", "textarea", true)}
              <Separator />
              {renderEditField("firstname", "First Name")}
              <Separator />
              {renderEditField("lastname", "Last Name")}
              <Separator />
              {renderEditField("email", "Email Address")}
              <Separator />
              {renderEditField("phone", "Phone Number", "text", true)}
              <Separator />
              {renderEditField("address", "Address", "text", true)}
              <Separator />
              {renderEditField("university", "University", "text", true)}
              <Separator />
              {renderEditField("major", "Major", "text", true)}
              <Separator />
              {renderEditField("hobbies", "Hobbies", "textarea", true)}
              <Separator />
              {renderEditField("languages", "Languages", "textarea", true)}
              <Separator />
              {renderEditField("bankingDetails", "IBAN", "text", true)}
              <Separator />
              {/*special case password needs second identical input*/}
              {editField === "password" ? (
                <form onSubmit={handleSubmit} className="w-full">
                  <label className="text-gray-700 block mb-1">
                    <strong>New Password: </strong>
                    <Input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="rounded-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full mb-2"
                    />
                  </label>
                  <label className="text-gray-700 block mt-2">
                    <strong>Confirm Password: </strong>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="rounded-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full mb-2"
                    />
                  </label>
                  <Button type="submit" className="mt-2">
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditField(null)}
                    className="mt-2 ml-2"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-gray-700">
                        <strong>Password</strong>
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shadow-md hover:bg-gray-300 ml-4"
                      onClick={() => setEditField("password")}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
