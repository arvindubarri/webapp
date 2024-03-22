// import productModel from "../models/productModel.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const searchVotersController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");

  try {
    const searchTerm = req.params.searchTerm;
    // Get searchTerm from query parameter

    // Check if searchTerm is present and not empty after trimming whitespace
    if (!searchTerm || searchTerm.trim() === "") {
      return res
        .status(400)
        .json({ message: "Search term must be provided and cannot be empty" });
    }

    // Perform a search query based on the searchTerm
    const data = await collection
      .find({
        $or: [
          { FM_NAME_EN: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on NAME field
          { EPIC_NO: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on EPIC_NO field
        ],
      })
      .toArray();

    console.log("Search result:", data);
    res.json(data);
  } catch (error) {
    console.error("Error occurred during search:", error);
    res.status(500).json({ message: "An error occurred during search" });
  }
};

// export const getAllVoterController = async (req, res) => {
//   const collection = mongoose.connection.collection("datas");

//   try {
//     // Retrieve data from MongoDB
//     const data = await collection.find({}).toArray();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const getAllVoterController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");

  try {
    // Retrieve data from MongoDB
    const datas = await collection.find({});
    const data = [];
    await datas.forEach((doc) => {
      data.push(doc);
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get all Voters
export const getAllVotersController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");

  const { page = 1 } = req.query;
  const limit = 1000; // Set the limit to 100 items per page
  const skip = (parseInt(page) - 1) * limit;

  try {
    // Retrieve paginated data from MongoDB
    const data = await collection.find({}).skip(skip).limit(limit).toArray();

    // Get the total count of items in the collection
    const totalCount = await collection.countDocuments();

    res.json({ data, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllVillagesController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");
  const { page = 1 } = req.query;
  const limit = 100; // Set the limit to 10 items per page

  try {
    // Aggregation pipeline to group by PART_NO and count the total number of voters
    const data = await collection
      .aggregate([
        {
          $group: {
            _id: "$PART_NO",
            count: { $sum: 1 },
            PART_NO: { $first: "$PART_NO" },
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .toArray();

    // Aggregation pipeline to count distinct PART_NO
    const partnoCountPipeline = await collection
      .aggregate([{ $group: { _id: "$PART_NO" } }, { $count: "count" }])
      .toArray();

    // Extract the count from the result
    const partnoCount =
      partnoCountPipeline.length > 0 ? partnoCountPipeline[0].count : 0;

    res.json({ data, partnoCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVillageVottersController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");

  try {
    const partname = req.params.slug;

    // Execute a database query to fetch voter details
    const voterDetails = await collection.find({ PART_NO: partname }).toArray();

    if (voterDetails.length === 0) {
      return res.status(404).json({ error: "Voter not found" });
    }

    res.json(voterDetails);
    console.log(voterDetails);
  } catch (error) {
    console.error("Error fetching voter details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET FAMILY List
export const getAllFamiliesController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");
  const { page = 1 } = req.query;
  const limit = 100; // Set the limit to 10 items per page

  try {
    // Aggregation pipeline to group by RLN_FM_NM_EN and count the total number of voters
    const data = await collection
      .aggregate([
        {
          $group: {
            _id: "$RLN_FM_NM_EN",
            count: { $sum: 1 },
            RLN_FM_NM_EN: { $first: "$RLN_FM_NM_EN" },
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .toArray();

    // Aggregation pipeline to count distinct RLN_FM_NM_EN
    const rlnCountPipeline = await collection
      .aggregate([{ $group: { _id: "$RLN_FM_NM_EN" } }, { $count: "count" }])
      .toArray();

    // Extract the count from the result
    const rlnCount =
      rlnCountPipeline.length > 0 ? rlnCountPipeline[0].count : 0;

    res.json({ data, rlnCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFamilyVottersController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");

  try {
    const familyname = req.params.slug;

    // Execute a database query to fetch voter details
    const voterDetails = await collection
      .find({ RLN_FM_NM_EN: familyname })
      .toArray();

    if (voterDetails.length === 0) {
      return res.status(404).json({ error: "Voter not found" });
    }

    res.json(voterDetails);
    console.log(voterDetails);
  } catch (error) {
    console.error("Error fetching voter details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get voter details
export const getVoterDetailController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");

  try {
    const voterName = req.params.slug;

    console.log(voterName);
    // Execute a database query to fetch voter details
    const voterDetails = await collection.findOne({ FM_NAME_EN: voterName });

    if (voterDetails.length === 0) {
      return res.status(404).json({ error: "Voter not found" });
    }

    res.json(voterDetails);
    console.log(voterDetails);
  } catch (error) {
    console.error("Error fetching voter details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Update voter details controller
export const updateVoterDetailsController = async (req, res) => {
  const collection = mongoose.connection.collection("datas");

  try {
    const { slug } = req.params;
    const { DOB, MOBILE_NO, voted, died } = req.body;

    const updateFields = {};
    if (DOB) {
      updateFields.DOB = DOB;
    }
    if (MOBILE_NO) {
      updateFields.MOBILE_NO = MOBILE_NO;
    }
    if (typeof voted === "boolean") {
      updateFields.voted = voted;
    }
    if (typeof died === "boolean") {
      updateFields.died = died;
    }

    const updatedVoter = await collection.findOneAndUpdate(
      { FM_NAME_EN: slug }, // Change from NAME to FM_NAME_EN
      { $set: updateFields },
      { returnOriginal: false }
    );

    if (!updatedVoter.value) {
      return res.status(404).json({ error: "Voter not found" });
    }

    res.json(updatedVoter.value);
    console.log("Voter details updated:", updatedVoter.value);
  } catch (error) {
    console.error("Error updating voter details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
