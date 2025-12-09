import mongoose from "mongoose";
import { Application } from "../models/applicationModel.js";
import { Listing } from "../models/listingModel.js";
import { User } from "../models/userModel.js";
import { uploadToS3 } from "../middleware/fileUpload.js";
import { model } from "mongoose";
import {Booking} from "../models/bookingModel.js";

export const createApplication = async (req, res, next) => {
  try {
    const { message, applicantEmail, listingId, attachments } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (!applicantEmail) {
      return res.status(400).json({ message: "Applicant email is required." });
    }
    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required." });
    }

    const applicant = await User.findOne({
      email: applicantEmail,
    });
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found." });
    }

    const ObjectId = mongoose.Types.ObjectId;
    const listingIdObj = new ObjectId("" + listingId);
    const listing = await Listing.findOne({
      _id: listingIdObj,
    });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Create the application
    const application = await Application.create({
      message,
      status: "PENDING",
      applicant: applicant._id,
      listing,
      attachments,
    });

    res.status(201).json({
      message: "Application created successfully",
      success: true,
      application,
    });
    next();
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Application already created for this host, applicant, and listing.",
      });
    }

    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the application." });
  }
};
export const uploadDocument = async (req, res) => {
  try {
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

    return res.status(200).json(documentUrls);
  } catch (error) {
    console.error("Error uploading documents:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getApplicationById = async (req, res) => {
  /*
     Finds and returns an application with the corresponding application-ID
   */
  try {
    const { applicationId } = req.query;
    if (!applicationId) {
      return res.status(400).json({ message: "Application Id is required." });
    }

    const application = await Application.findOne({_id: applicationId})
      .populate({path: "listing", populate: {path: "address"}})
      .populate("applicant");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    res.status(200).json({
      message: "Application retrieved successfully",
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving applications." });
  }
};

export const getApplicationsByUserId = async (req, res) => {
  /*
    Finds and returns all applications created by the user with the corresponding user-ID
   */
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User Id is required." });
    }

    const applications = await Application.find({ applicant: userId })
      .populate({
        path: "listing",
        populate: {
          path: "address",
          model: "Address",
        },
      })
      .populate("applicant");

    res.status(200).json({
      message: "Applications retrieved successfully",
      success: true,
      applications,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving applications." });
  }
};

export const getApplicationsByListingId = async (req, res) => {
  /*
     Finds and returns all applications for the listing with the a specific listing-ID
   */
  try {
    const { listingId } = req.query;

    if (!listingId) {
      return res
        .status(400)
        .json({ message: "Listing Id is required. Got: " + listingId });
    }

    const applications = await Application.find({ listing: listingId })
      .populate("listing")
      .populate("applicant");

    res.status(200).json({
      message: "Applications retrieved successfully",
      success: true,
      applications,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving applications." });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { applicationId, status } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application Id is required." });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const application = await Application.findByIdAndUpdate(applicationId, {
      status,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({
      message: "Application status updated successfully",
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the application." });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log(applicationId);
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findByIdAndDelete(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({
      message: "Application deleted successfully",
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the application." });
  }
};
