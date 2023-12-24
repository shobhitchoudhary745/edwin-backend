const mongoose = require("mongoose");

const installerSchema = new mongoose.Schema(
  {
    ID: {
      type: String,
      required: true,
    },
    company_name: {
      type: String,
      required: [true, "Please enter company name."],
    },
    contact_name: {
      type: String,
      required: [true, "Please enter contact firstname."],
    },
    contact_name_lastname: {
      type: String,
      required: [true, "Please enter contact lastname."],
    },
    email: {
      type: String,
      required: [true, "Please enter email."],
      unique: true,
    },
    mobile: {
      type: String,
      required: [true, "Please enter mobile."],
      unique: true,
    },
    other_email: {
      type: String,
      required: [true, "Please enter email."],
      unique: true,
    },
    other_mobile: {
      type: String,
      required: [true, "Please enter mobile."],
      unique: true,
    },
    kvk_number: {
      type: String,
      required: [true, "Please enter KVK number."],
    },
    extra_information: {
      type: String,
    },
    number_of_installers: {
      type: String,
    },
    region_for_installation: {
      type: String,
    },
    primary_expertise: {
      type: String,
    },
    residence: {
      type: String,
    },
    // add_city: {
    //   type: String,
    // },
    add_street: {
      type: String,
    },
    add_country: {
      type: String,
    },
    add_postcode: {
      type: String,
    },
    // extra_info_field: {
    //   type: String,
    // },
    certifications: {
      type: String,
    },
    profilePic: {
      type: String,
    },
  },
  { timestamps: true }
);

const installerModel = mongoose.model("installers", installerSchema);

module.exports = installerModel;
