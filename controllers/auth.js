const jimp = require("jimp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const { User } = require("../models/user");

const { ctrlWrapper, HttpError, sendEmail } = require("../helpers");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const avatarURL = gravatar.url(email);

  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verifty email</a>`,
  };

  await sendEmail(verifyEmail);

  const responseUser = {
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  };

  res.status(201).json(responseUser);
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    massage: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(400, "missing required field email");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verifty email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or invalid");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verifed");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
  await User.findByIdAndUpdate(user._id, { token });

  const responseUser = {
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  };

  res.status(200).json(responseUser);
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).json({
    message: "Logout success",
  });
};

const updatedSubscriptionUser = async (req, res) => {
  const { subscription } = req.body;

  const result = await User.findByIdAndUpdate(
    req.user._id,
    { subscription },
    { new: true }
  );

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json({
    user: {
      email: result.email,
      subscription: result.subscription,
    },
  });
};

const updatedAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, originalname);
  await fs.rename(tempUpload, resultUpload);

  const avatar = await jimp.read(resultUpload);
  await avatar.resize(250, 250).write(resultUpload);

  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updatedSubscriptionUser: ctrlWrapper(updatedSubscriptionUser),
  updatedAvatar: ctrlWrapper(updatedAvatar),
};
