import Caretaker from "../models/Caretaker.model.js";
import User from "../models/User.model.js";

// Get all caretakers
export const getCaretakers = async (req, res) => {
  try {
    const caretakers = await Caretaker.find().populate(
      "patients",
      "name email photo"
    );
    res.json(caretakers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching caretakers" });
  }
};

export const getUsers = async (req, res) => {
  try {
    // Always use _id, not id
    const excludeId = req.user._id;
    const users = await User.find({ _id: { $ne: excludeId } }).select(
      "-password"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patients for a specific caretaker
export const getPatients = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id).populate(
      "patients",
      "name email photo"
    );
    if (!caretaker)
      return res.status(404).json({ message: "Caretaker not found" });
    res.json(caretaker.patients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching patients" });
  }
};

// Assign a patient to a caretaker
export const assignPatient = async (req, res) => {
  try {
    const { caretakerId, patientId } = req.body;
    const caretaker = await Caretaker.findById(caretakerId);
    if (!caretaker)
      return res.status(404).json({ message: "Caretaker not found" });

    if (!caretaker.patients.includes(patientId)) {
      caretaker.patients.push(patientId);
      await caretaker.save();
    }
    res.json({ message: "Patient assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error assigning patient" });
  }
};

export const caretakerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const caretaker = await Caretaker.findOne({ email });
    if (!caretaker || !(await caretaker.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await Caretaker.findByIdAndUpdate(caretaker._id, {
      $inc: { "profile.totalLogins": 1 },
      $push: {
        "profile.activities": {
          type: "login",
          title: "Successful login",
          time: new Date(),
        },
      },
    });
    const token = caretaker.generateAuthToken();
    const safeCaretaker = caretaker.toObject
      ? caretaker.toObject()
      : { ...caretaker };
    if (safeCaretaker.password) delete safeCaretaker.password;
    res.json({ token, caretaker: safeCaretaker });
  } catch (err) {
    res.status(500).json({ message: "Error during login" });
  }
};

export const getCaretakerProfile = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.user._id)
      .select("-password")
      .populate("patients", "name email photo");
    if (!caretaker)
      return res.status(404).json({ message: "Caretaker not found" });
    res.json({...caretaker.toObject(),
      profile: caretaker.profile || {},
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};
export const getCaretakerSettings = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.user._id).select(
      "settings"
    );
    if (!caretaker)
      return res.status(404).json({ message: "Caretaker not found" });
    res.json(caretaker.settings || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching settings" });
  }
};
export const putCaretakerSettings = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.user._id);
    if (!caretaker)
      return res.status(404).json({ message: "Caretaker not found" });

    caretaker.settings = {
      ...caretaker.settings,
      ...req.body,
    };
    await caretaker.save();
    res.json(caretaker.settings);
  } catch (err) {
    res.status(500).json({ message: "Error updating settings" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          "profile.activities": {
            type: "message_sent",
            title: "Message sent",
            time: new Date(),
          },
        },
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
