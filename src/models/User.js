import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    profileImage : {
        type : String,
        default : ""
    },
    hostel: {
        type: String,
        enum: ["Dia Hostel", "College Hostel"],
        required: true,
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^(\+91)?[6-9]\d{9}$/,
            "Invalid phone number"
        ],
}


}, {timestamps : true} );


// format the phone number before saving to database
userSchema.pre("save", async function () {
  if (this.phone) {
    let phone = this.phone.toString().trim();

    if (/^[6-9]\d{9}$/.test(phone)) {
      phone = "+91" + phone;
    }

    this.phone = phone;
  }
  //next();
});


// hash password before saving to database
userSchema.pre("save", async function() {
    if(!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


//compare password function
userSchema.methods.comparePassword = async function(userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}


const User = mongoose.model("User", userSchema);

export default User;