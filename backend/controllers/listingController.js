import { Listing } from "../models/listingModel.js";
import { Address } from "../models/addressModel.js";
import { User } from "../models/userModel.js";
import { uploadToS3 } from "../middleware/fileUpload.js";

export const CreateListing = async (req, res, next) => {
  /*
  Creates a new listing.
   */
  try {
    const today = new Date();
    const {
      title,
      description,
      availableFrom,
      availableTo,
      size,
      price,
      address,
      dormType,
      listingAttributes,
      userID,
    } = JSON.parse(req.body.listing);
    const { street, streetNumber, postalCode, city, country, additionalInfo } =
      address;

    // input validation
    if (!title) {
      return res
        .status(404)
        .json({ message: "Please enter a valid title for your listing." });
    }
    if (!description) {
      return res.status(404).json({
        message: "Please enter a valid description for your listing.",
      });
    }
    if (!availableFrom) {
      return res.status(404).json({
        message: "Please enter a valid starting date for your listing.",
      });
    }
    if (!availableTo) {
      return res.status(404).json({
        message: "Please enter a valid ending date for your listing.",
      });
    }
    // start date should be before end date, both dates should not be in the past
    if (
      availableTo < availableFrom ||
      availableTo < today ||
      availableFrom < today
    ) {
      return res
        .status(404)
        .json({ message: "Please enter a valid timespan for your listing." });
    }
    if (!size || size <= 0) {
      return res
        .status(404)
        .json({ message: "Please enter a valid size for your listing." });
    }
    if (!price || price <= 0) {
      return res
        .status(404)
        .json({ message: "Please enter a valid price for your listing." });
    }
    if (
      !address ||
      !street ||
      !streetNumber ||
      !postalCode ||
      !city ||
      !country
    ) {
      return res
        .status(404)
        .json({ message: "Please enter a valid title for your listing." });
    }
    if (!dormType) {
      return res
        .status(404)
        .json({ message: "Please enter a valid dorm type for your listing." });
    }
    if (!userID) {
      return res.status(404).json({ message: "User ID is required." });
    }

    // Find the creator of this new listing
    const user = await User.findOne({
      _id: userID,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create address instance first
    const addressInstance = await Address.create({
      street,
      streetNumber,
      postalCode,
      city,
      country,
      additionalInfo,
    });

    // upload attachments (pictures and/or documents) to S3, get returned keys and S3-URLs
    const attachments = req.files;
    // store S3-URLs in array for DB
    const att = [];
    for (let key in attachments) {
      try {
        const data = await uploadToS3(attachments[key]);
        if (data) {
          att.push(data.Location);
        }
      } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Upload to S3 failed." });
      }
    }

    // Create listing instance, connect address and listing
    const listing = await Listing.create({
      title: title,
      description: description,
      availableFrom: availableFrom,
      availableTo,
      size,
      price,
      address: addressInstance._id,
      status: "ACTIVE",
      dormType,
      listingAttributes,
      createdBy: userID,
      attachments: att,
    });
    addressInstance.listingID = listing._id;
    await addressInstance.save();

    res.status(201).json({
      message: "Listing created successfully",
      success: true,
      listing,
      addressInstance,
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

export const SearchListings = async (req, res, next) => {
  try {
    const {
      start, // dd-mm-yyyy
      end, // dd-mm-yyyy
      minSize,
      maxSize,
      minPrice,
      maxPrice,
      listingAttributes,
      status,
      dormType,
      city,
      postalCode,
      userID,
    } = req.query;

    let query = {};

    // The actual available time period need to exceed the queried time period
    if (start) {
      const [day, month, year] = start.split("-");
      const from = new Date(year, month - 1, day);
      query.availableFrom = { $lte: from };
    }

    if (end) {
      const [day, month, year] = end.split("-");
      const to = new Date(year, month - 1, day);
      query.availableTo = { $gte: to };
    }

    if (maxSize || minSize) {
      query.size = {};

      if (minSize) {
        query.size.$gte = Number(minSize);
      }

      if (maxSize) {
        query.size.$lte = Number(maxSize);
      }
    }

    if (maxPrice || minPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }
    if (listingAttributes) {
      const attributes = decodeURIComponent(listingAttributes).split(",");
      // Attributes need to be formatted, e.g. separate_kitchen -> Separate Kitchen
      const formattedAttributes = attributes.map((attribute) =>
        attribute
          .trim()
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      );
      query.listingAttributes = { $all: formattedAttributes };
    }

    if (status) {
      query.status = status;
    }

    if (dormType) {
      query.dormType = dormType;
    }

    // Find listings based on query, populate address-related fields
    let listings = await Listing.find(query).populate("address");

    if (city) {
      listings = listings.filter(
        (listing) =>
          listing.address &&
          listing.address.city.toLowerCase() === city.toLowerCase()
      );
    }

    if (postalCode) {
      listings = listings.filter(
        (listing) =>
          listing.address && listing.address.postalCode === postalCode
      );
    }

    // Exclude listings created by the user
    if (userID) {
      listings = listings.filter((listing) => listing.createdBy != userID);
    }

    if (listings.length === 0) {
      return res.status(404).json({
        message: "No listings found",
        success: false,
      });
    }

    const formattedListings = listings
      .map((listing) => {
        const { __v, _id: id, status, ...rest } = listing._doc;
        return {
          id,
          ...rest,
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt);

    res.status(200).json({
      message: "Listings found successfully",
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

export const SearchListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Listing ID is required. Got: " + req,
        success: false,
      });
    }

    const listing = await Listing.findOne({ _id: id }).populate("address");
    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
        success: false,
        listing: [],
      });
    }

    res.status(200).json({
      message: "Listing found successfully",
      success: true,
      listing: listing._doc,
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

export const GetListingsCreatedByUser = async (req, res, next) => {
  /*
  Retrieves all listings created by a specified user (based on user-ID)
   */
  try {
    const { userId } = req.params;
    const query = {};
    query.createdBy = userId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    const listings = await Listing.find(query);
    if (!listings || listings.length === 0) {
      return res.status(404).json({
        message: "No listings found",
        success: false,
      });
    }

    const formattedListings = listings.map((listing) => {
      const { __v, _id: id, ...rest } = listing._doc;
      return {
        id,
        ...rest,
      };
    });

    res.status(200).json({
      message: "Listings found successfully",
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

export const EditListing = async (req, res, next) => {
  /*
  Lets an user update and edit the listing.
   */
  try {
    const today = new Date();
    const { listingId } = req.params;
    if (!listingId) {
      return res.status(400).json({
        message: "Specify the Id for the listing to be edited.",
        success: false,
      });
    }
    // Finds the listing to be edited
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        message: "The listing with the specified id does not exist.",
        success: false,
      });
    }
    // New values
    const {
      title: newTitle,
      description: newDescription,
      availableFrom: newAvailableFrom,
      availableTo: newAvailableTo,
      size: newSize,
      price: newPrice,
      address: newAddress,
      dormType: newDormType,
      listingAttributes: newListingAttributes,
      removed,
    } = JSON.parse(req.body.listing);
    const {
      street: newStreet,
      streetNumber: newStreetNumber,
      postalCode: newPostalCode,
      city: newCity,
      country: newCountry,
    } = newAddress;

    // input validation, similar to listing creation
    if (!newTitle) {
      return res
        .status(404)
        .json({ message: "Please enter a valid title for your listing." });
    }
    if (!newDescription) {
      return res.status(404).json({
        message: "Please enter a valid description for your listing.",
      });
    }
    if (!newAvailableFrom) {
      return res.status(404).json({
        message: "Please enter a valid starting date for your listing.",
      });
    }
    if (!newAvailableTo) {
      return res.status(404).json({
        message: "Please enter a valid ending date for your listing.",
      });
    }
    if (
      newAvailableTo < newAvailableFrom ||
      newAvailableTo < today ||
      newAvailableFrom < today
    ) {
      return res
        .status(404)
        .json({ message: "Please enter a valid timespan for your listing." });
    }
    if (!newSize || newSize <= 0) {
      return res
        .status(404)
        .json({ message: "Please enter a valid size for your listing." });
    }
    if (!newPrice || newPrice <= 0) {
      return res
        .status(404)
        .json({ message: "Please enter a valid price for your listing." });
    }
    if (
      !newAddress ||
      !newStreet ||
      !newStreetNumber ||
      !newPostalCode ||
      !newCity ||
      !newCountry
    ) {
      return res
        .status(404)
        .json({ message: "Please enter a valid address for your listing." });
    }
    if (!newDormType) {
      return res
        .status(404)
        .json({ message: "Please enter a valid dorm type for your listing." });
    }

    // Updates the address object first
    const addressId = listing.address;
    await Address.findByIdAndUpdate(addressId, newAddress, { new: true })
      .then((updatedAddress) => {
        console.log(updatedAddress);
      })
      .catch((err) => {
        return res.status(500).json({
          message: err,
          success: false,
        });
      });

    // Updates all fields in listing, removes attachment links for deleted attachments
    await Listing.findByIdAndUpdate(
      listingId,
      {
        title: newTitle,
        description: newDescription,
        availableFrom: newAvailableFrom,
        availableTo: newAvailableTo,
        size: newSize,
        price: newPrice,
        dormType: newDormType,
        listingAttributes: newListingAttributes,
        $pull: { attachments: { $in: removed } },
      },
      { new: true }
    )
      .then((updatedListing) => {
        console.log(updatedListing);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: "something went wrong",
          success: false,
        });
      });

    // Uploads new attachments to S3 and appends their links
    const attachments = req.files;
    const att = [];
    for (let key in attachments) {
      try {
        const data = await uploadToS3(attachments[key]);
        if (data) {
          att.push(data.Location);
        }
      } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Upload to S3 failed." });
      }
    }
    await Listing.findByIdAndUpdate(
      listingId,
      {
        $push: { attachments: { $each: att } },
      },
      { new: true }
    )
      .then((updatedListing) => {
        return res.status(201).json({
          message: "Listing updated successfully",
          success: true,
          updatedListing,
          newAddress,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: "here",
          success: false,
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const DeactivateListing = async (req, res, next) => {
  /*
  Deactivates a listing by setting its status to INACTIVE
   */
  try {
    const { listingId } = req.params;
    if (!listingId) {
      return res.status(400).json({
        message: "Listing ID is required. Got: " + req,
        success: false,
      });
    }
    await Listing.findByIdAndUpdate(
      listingId,
      { status: "INACTIVE" },
      { new: true }
    )
      .then((deactivatedListing) => {
        if (deactivatedListing.status === "INACTIVE") {
          return res.status(200).json({
            message: "Listing deactivated successfully.",
            success: true,
            deactivatedListing,
          });
        } else {
          return res.status(500).json({
            message: "Listing IS NOT deactivated.",
            success: false,
            deactivatedListing,
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Internal server error" + err,
          success: false,
        });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

import { Advertisement } from "../models/advertisementModel.js";

export const getListingsWithAds = async (req, res) => {
  try {
    const listings = await Listing.find();
    const advertisements = await Advertisement.find();

    res.status(200).json({
      success: true,
      listings,
      advertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
