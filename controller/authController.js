import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelpper.js";
import JWT from "jsonwebtoken";
import { createReadStream, unlinkSync } from "fs";
import csvParser from "csv-parser";
import { connect, Schema, model } from "mongoose";
import queryModel from "../models/queryModel.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validations
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    // if (!address) {
    //   return res.send({ message: "Address is Required" });
    // }
    // if (!answer) {
    //   return res.send({ message: "Answer is Required" });
    // }
    //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: true,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      // address,
      password: hashedPassword,
      // answer
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        // adddress: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "newPassword is required" });
    }
    // check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "wrong email or answer",
      });
    }

    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

// contact us contoller
export const queryController = async (req, res) => {
  try {
    const { name, email, phone, query } = req.body;
    //validations
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    if (!query) {
      return res.send({ message: "Concern is Required" });
    }
    //save
    const user = await new queryModel({
      name,
      email,
      phone,
      query,
    }).save();

    res.status(201).send({
      success: true,
      message: "Query Submitted Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Query Submission",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

export const uplodController = async (req, res) => {
  const results = [];
  const filePath = req.file.path;
  generateSchemaFromCSV(filePath, async (schema, data) => {
    const DataModel = model("Data", new Schema(schema));

    const uniqueDocuments = data.map((row) => {
      const doc = {};
      Object.keys(schema).forEach((field) => {
        doc[field] = row[field] || "";
      });
      return doc;
    });

    const existingEPIC_NOs = await DataModel.distinct("EPIC_NO");
    const filteredDocuments = uniqueDocuments.filter(
      (doc) => !existingEPIC_NOs.includes(doc["EPIC_NO"])
    );

    if (filteredDocuments.length === 0) {
      // No new data to insert
      unlinkSync(filePath);
      return res.status(200).send("No new data to insert.");
    }

    DataModel.insertMany(filteredDocuments, { ordered: false })
      .then((insertedData) => {
        console.log("Inserted data:", insertedData);
        unlinkSync(filePath);
        res.status(200).send("Upload successful");
      })
      .catch((err) => {
        console.error("Error inserting data:", err);
        res.status(500).send(err.message);
      });
  });
};

const inferDataType = (dataArray) => {
  let stringCount = 0;
  let numberCount = 0;
  let booleanCount = 0;

  dataArray.forEach((value) => {
    if (typeof value === "string") {
      stringCount++;
    } else if (!isNaN(value)) {
      numberCount++;
    } else if (typeof value === "boolean") {
      booleanCount++;
    }
  });

  if (numberCount >= stringCount && numberCount >= booleanCount) {
    return "number";
  } else if (stringCount >= numberCount && stringCount >= booleanCount) {
    return "string";
  } else if (booleanCount >= numberCount && booleanCount >= stringCount) {
    return "boolean";
  } else {
    return "unknown";
  }
};

const generateSchemaFromCSV = (filePath, callback) => {
  const data = [];
  const columnNames = [];

  // To store unique EPIC_NO values
  const epicNumbers = new Set();

  createReadStream(filePath)
    .pipe(csvParser())
    .on("headers", (headers) => {
      // Store column headers
      columnNames.push(...headers);
    })
    .on("data", (row) => {
      // Check for duplicate EPIC_NO
      if (!epicNumbers.has(row["EPIC_NO"])) {
        epicNumbers.add(row["EPIC_NO"]);
        // Store each row of data
        data.push(row);
      }
    })
    .on("end", () => {
      // Infer data types based on the first row of data
      const schema = {};
      columnNames.forEach((columnName) => {
        const columnData = data.map((row) => row[columnName]);
        const columnDataType = inferDataType(columnData);
        schema[columnName] = { type: columnDataType };
      });

      console.log("Inferred schema:", schema);
      callback(schema, data); // Call the callback function with the schema object and unique data
    });
};

// recied query controller
export const recivedQueryController = async (req, res) => {
  queryModel.find({}, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error fetching data from MongoDB");
    } else {
      res.json(data);
    }
  });
};

//  Users List
export const usersController = async (req, res) => {
  userModel.find({}, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error fetching data from MongoDB");
    } else {
      res.json(data);
    }
  });
};

//update prfole
// export const updateProfileController = async (req, res) => {
//   try {
//     const { name, email, password, address, phone } = req.body;
//     const user = await userModel.findById(req.user._id);
//     //password
//     if (password && password.length < 6) {
//       return res.json({ error: "Passsword is required and 6 character long" });
//     }
//     const hashedPassword = password ? await hashPassword(password) : undefined;
//     const updatedUser = await userModel.findByIdAndUpdate(
//       req.user._id,
//       {
//         name: name || user.name,
//         password: hashedPassword || user.password,
//         phone: phone || user.phone,
//         address: address || user.address,
//       },
//       { new: true }
//     );
//     res.status(200).send({
//       success: true,
//       message: "Profile Updated SUccessfully",
//       updatedUser,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "Error WHile Update profile",
//       error,
//     });
//   }
// };

//orders
// export const getOrdersController = async (req, res) => {
//   try {
//     const orders = await orderModel
//       .find({ buyer: req.user._id })
//       .populate("products", "-photo")
//       .populate("buyer", "name");
//     res.json(orders);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error WHile Geting Orders",
//       error,
//     });
//   }
// };
//orders
// export const getAllOrdersController = async (req, res) => {
//   try {
//     const orders = await orderModel
//       .find({})
//       .populate("products", "-photo")
//       .populate("buyer", "name")
//       .sort({ createdAt: "-1" });
//     res.json(orders);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error WHile Geting Orders",
//       error,
//     });
//   }
// };

//order status
// export const orderStatusController = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;
//     const orders = await orderModel.findByIdAndUpdate(
//       orderId,
//       { status },
//       { new: true }
//     );
//     res.json(orders);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error While Updateing Order",
//       error,
//     });
//   }
// };
