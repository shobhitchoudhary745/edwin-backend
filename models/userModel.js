const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const validateEmail = (email) => {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validateEmail, "Please fill a valid email address"],
    },
    kvk_number: {
      type: String,
    },
    appointmentAgreement: {
      type: String,
    },
    addional_contact_details: {
      type: String,
    },
    extra_contact_details: {
      type: String,
    },
    birthdate: {
      type: String,
    },
    technical_contact_email: {
      type: String,
      // required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validateEmail, "Please fill a valid email address"],
    },
    technical_contact_name: {
      type: String,
    },
    technical_contact_name_lastname: {
      type: String,
    },
    technical_contact_telephone: {
      type: String,
    },
    street_address: {
      type: String,
    },
    installation_address: {
      type: String,
    },
    invoicing_details: {
      type: String,
    },
    post_code: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    extra_info_field: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      minLength: [8, "Password should have more than 8 characters"],
      select: false,
    },
    firstname: {
      type: String,
      required: [true, "Please enter your firstname."],
      maxLength: [30, "Firstame cannot exceed 30 characters"],
    },
    lastname: {
      type: String,
      required: [true, "Please enter your lastname."],
      maxLength: [30, "Lastname cannot exceed 30 characters"],
    },
    residence: {
      type: String,
    },
    mobile_no: {
      type: String,
      required: [true, "Please enter your mobile no."],
    },
    other_mobile: {
      type: String,
    },
    other_email: {
      type: String,
    },
    installationObject: [
      {
        id: {
          type: String,
        },
        installation_country: {
          type: String,
        },
        installation_postcode: {
          type: String,
        },
        installation_residence: {
          type: String,
        },
        installation_street: {
          type: String,
        },
      },
    ],
    companyname: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "intermediary"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 11);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRE,
  });
};

module.exports = mongoose.model("User", userSchema);
