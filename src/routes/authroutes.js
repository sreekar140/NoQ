import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../lib/sendMail.js";


const router = express.Router();
const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn : "15d"});
}


router.post("/register", async (req, res) => {
  try {
    //const { username, email, password, hostel, phone, otp } = req.body;

    let { username, email, password, hostel, phone, otp } = req.body;

    username = username?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();
    hostel = hostel?.trim();
    phone = phone?.trim();
    otp = otp?.trim();

    //all fields check
    if (!username || !email || !password || !hostel || !phone) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    //username length check
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    // 3. Password
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 4. Email format (UPDATED)
    const btRegex = /^bt[a-z0-9]{8}@iiitn\.ac\.in$/;
    if (!btRegex.test(email)) {
      return res.status(400).json({ message: "Only valid IIITN BT emails allowed" });
    }

    // 5. Existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 6. valid hostel check
    const allowedHostels = ["Dia Hostel", "College Hostel"];

    if (!allowedHostels.includes(hostel)) {
        return res.status(400).json({
        message: "Invalid hostel selection",
        });
    }

    // ================= SEND OTP =================
    if (!otp) {
      const generatedOtp = generateOTP();

      otpStore.set(email, {
        otp: generatedOtp,
        expires: Date.now() + 5 * 60 * 1000,
      });

      try {
        await sendOTPEmail(email, generatedOtp);
      } catch (err) {
        console.log("Email error:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
      }

      return res.status(200).json({ message: "OTP sent to email" });
    }

    // ================= VERIFY OTP =================
    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ message: "OTP not requested or expired" });
    }

    if (stored.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ================= CREATE USER =================
    const profileImage = `https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=${username}`;

    const user = new User({
      username,
      email,
      password,
      hostel,
      phone,
      profileImage,
    });

    await user.save();
    otpStore.delete(email);

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        hostel: user.hostel,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.log("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/login", async (req, res) => {

    try {

        //const {email, password} = req.body;

        let { email, password } = req.body;

        email = email?.trim().toLowerCase();
        password = password?.trim();
            
        //all fields check
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        //email check
        const btRegex = /^bt[a-z0-9]{8}@iiitn\.ac\.in$/;
        if (!btRegex.test(email)) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //user existence check
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message : "Invalid credentials"});

        //password check
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect) return res.status(400).json({message : "Invalid credentials"});

        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                hostel: user.hostel,
                phone: user.phone,
                profileImage: user.profileImage,
            },
        });
    }
    catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({message : "Internal server error"});    
    }
});

router.post("/forgotpassword", async (req,res) => {
    
    try {
        
        //const {email,otp} = req.body;

        let { email, otp } = req.body;

        email = email?.trim().toLowerCase();
        otp = otp?.trim();

        //all fields check
        if (!email) {
            return res.status(400).json({ message: "Enter Your email" });
        }

        //email check
        const btRegex = /^bt[a-z0-9]{8}@iiitn\.ac\.in$/;
        if (!btRegex.test(email)) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        //user existence check
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message : "Invalid credentials"});

        // ================= SEND OTP =================
        if (!otp) {
            const generatedOtp = generateOTP();

            otpStore.set(email, {
                otp: generatedOtp,
                expires: Date.now() + 5 * 60 * 1000,
            });

            try {
                await sendOTPEmail(email, generatedOtp);
            } catch (err) {
                console.log("Email error:", err);
                return res.status(500).json({ message: "Failed to send OTP" });
            }

            return res.status(200).json({ message: "OTP sent to email" });
        }

        // ================= VERIFY OTP =================
        const stored = otpStore.get(email);

        if (!stored) {
            return res.status(400).json({ message: "OTP not requested or expired" });
        }

        if (stored.expires < Date.now()) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP expired" });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        otpStore.delete(email);


        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                hostel: user.hostel,
                phone: user.phone,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
        console.log("Error in forgot password route", error);
        res.status(500).json({message : "Internal server error"});
    }
})


export default router;