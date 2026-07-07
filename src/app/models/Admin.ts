import mongoose, { Schema, model, models } from "mongoose";

const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// This prevents Mongoose from redefining the model if the file reloads
const Admin = models.Admin || model("Admin", adminSchema);

export default Admin;