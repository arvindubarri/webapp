import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    query: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("query", querySchema);
