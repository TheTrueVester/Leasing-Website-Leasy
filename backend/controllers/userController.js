import {User} from "../models/userModel.js";
import {Listing} from "../models/listingModel.js";
import bcrypt from "bcryptjs";
import {uploadToS3, s3Client} from "../middleware/fileUpload.js";
import {DeleteObjectCommand} from "@aws-sdk/client-s3";

export const EditUser = async (req, res) => {
  const {firstname, lastname, password, userBioAttributes, favorites} =
    req.body;

  if (
    !firstname &&
    !lastname &&
    !password &&
    !userBioAttributes &&
    !favorites
  ) {
    return res.status(400).json({
      message: "Enter at least one user attribute to update",
      success: false,
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send("User not found");

  if (firstname) user.firstname = firstname;
  if (lastname) user.lastname = lastname;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (userBioAttributes) {
    user.userBioAttributes = {
      ...user.userBioAttributes,
      ...userBioAttributes,
    };
  }
  if (favorites) user.favorites = favorites;

  // save user to DB
  await user
    .save()
    .then(() => {
      return res.status(200).json({
        message: "User updated successfully",
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          userBioAttributes: user.userBioAttributes,
          favorites: user.favorites,
          profilePicture: user.profilePicture,
          documents: user.documents,
        },
      });
    })
    .catch((err) => {
      return res.status(404).send(err);
    });
};

export const SearchUserById = async (req, res) => {
  const {id} = req.params;
  const user = await User.findById(id)
    .then((user) => {
      return res.status(200).json({
        message: "User found successfully",
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          userBioAttributes: user.userBioAttributes,
          profilePicture: user.profilePicture,
          documents: user.documents,
        },
      });
    })
    .catch((err) => {
      return res.status(404).send(err);
    });
};

export const GetUserFavoriteListings = async (req, res, next) => {
  try {
    const {id: userId} = req.params;
    const {format = "ids"} = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
        listings: [],
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        listings: [],
      });
    }

    const favorites = user.favorites;
    if (!favorites || favorites.length === 0) {
      return res.status(404).json({
        message: "No favorites found",
        success: false,
        listings: [],
      });
    }

    if (format === "ids") {
      return res.status(200).json({
        message: "Favorite listing IDs found successfully",
        success: true,
        listings: favorites,
      });
    }

    const listings = await Listing.find({_id: {$in: favorites}});
    if (!listings || listings.length === 0) {
      return res.status(404).json({
        message: "No listings found",
        success: false,
        listings: [],
      });
    }

    const formattedListings = listings.map((listing) => {
      const {__v, _id: id, ...rest} = listing._doc;
      return {
        id,
        ...rest,
      };
    });

    res.status(200).json({
      message: "Favorite listings found successfully",
      success: true,
      listings: formattedListings,
    });

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//used to update any User attribute
export const updateUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const userId = req.user._id;
    const {
      newPassword,
      newFirstname,
      newLastname,
      newPhone,
      newBio,
      newMajor,
      newUniversity,
      newHobbies,
      newLanguages,
      newAddress,
      newBankingDetails,
    } = req.body;

    const updateFields = {};

    //these can't be blank
    if (newFirstname) updateFields.firstname = newFirstname;
    if (newLastname) updateFields.lastname = newLastname;
    if (newPassword) updateFields.password = await bcrypt.hash(newPassword, 10);

    //these can be completely deleted
    updateFields["userBioAttributes.bio"] = newBio;
    updateFields["userBioAttributes.phone"] = newPhone;
    updateFields["userBioAttributes.major"] = newMajor;
    updateFields["userBioAttributes.university"] = newUniversity;
    updateFields["userBioAttributes.hobbies"] = newHobbies;
    updateFields["userBioAttributes.languages"] = newLanguages;
    updateFields["userBioAttributes.address"] = newAddress;
    updateFields["userBioAttributes.bankingDetails"] = newBankingDetails;

    const user = await User.findByIdAndUpdate(
      userId,
      {$set: updateFields},
      {new: true}
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const {password, __v, _id: id, ...updatedUser} = user._doc;

    return res.status(200).json({
      message: "User information updated successfully",
      success: true,
      user: {
        id,
        ...updatedUser,
      },
    });
  } catch (error) {
    console.error("Error updating user information:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Upload user profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "No file uploaded",
        success: false,
      });
    }

    const uploadResult = await uploadToS3(file);

    if (!uploadResult) {
      return res.status(500).json({
        message: "File upload failed",
        success: false,
      });
    }

    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {$set: {profilePicture: uploadResult.Location}},
      {new: true}
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      success: true,
      profilePicture: uploadResult.Location,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const AddUnreadMessage = async (req, res) => {
  /*
  Adds the senderID of the unread message to the recipient to show him notifications
   */
  const {senderId, recipientId} = req.body;
  if (!senderId) {
    return res
      .status(400)
      .json({message: "sender of the unread message not specified"});
  }
  if (!recipientId) {
    return res
      .status(400)
      .json({message: "recipient of the unread message not specified"});
  }
  await User.findByIdAndUpdate(
    recipientId,
    {$addToSet: {unreadMessages: senderId}},
    {new: true}
  )
    .then((updatedRecipient) => {
      if (!updatedRecipient) {
        return res
          .status(404)
          .json({message: "The specified recipient was not found."});
      } else {
        return res.status(200).json({
          message: "Unread messages added successfully.",
          updatedRecipient,
        });
      }
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
};

export const RemoveUnreadMessage = async (req, res) => {
  /*
  Removes the senderID of the unread message from the recipient to remove notifications
 */
  const {senderId, recipientId} = req.body;
  if (!senderId) {
    return res
      .status(400)
      .json({message: "sender of the read message not specified"});
  }
  if (!recipientId) {
    return res
      .status(400)
      .json({message: "recipient of the read message not specified"});
  }
  await User.findByIdAndUpdate(
    recipientId,
    {$pull: {unreadMessages: senderId}},
    {new: true}
  )
    .then((updatedRecipient) => {
      if (!updatedRecipient) {
        return res
          .status(404)
          .json({message: "The specified recipient was not found."});
      } else {
        return res.status(200).json({
          message: "Unread messages removed successfully.",
          updatedRecipient,
        });
      }
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
};

// Upload user documents
export const uploadDocument = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No files uploaded",
        success: false,
      });
    }

    const uploadPromises = files.map((file) => uploadToS3(file));
    const uploadResults = await Promise.all(uploadPromises);

    const failedUploads = uploadResults.filter((result) => !result);
    if (failedUploads.length > 0) {
      return res.status(500).json({
        message: "Some file uploads failed",
        success: false,
      });
    }

    const documentUrls = uploadResults.map((result) => result.Location);
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {$push: {documents: {$each: documentUrls}}},
      {new: true}
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Documents uploaded successfully",
      success: true,
      documents: documentUrls,
    });
  } catch (error) {
    console.error("Error uploading documents:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
//remove a document
export const deleteDocument = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const {documentUrl} = req.body;
    if (!documentUrl) {
      return res.status(400).json({
        message: "No document URL provided",
        success: false,
      });
    }

    const userId = req.user._id;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: documentUrl.split("/").pop(),
    };

    await s3Client.send(new DeleteObjectCommand(params));

    const user = await User.findByIdAndUpdate(
      userId,
      {$pull: {documents: documentUrl}},
      {new: true}
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Document deleted successfully",
      success: true,
      documents: user.documents,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
