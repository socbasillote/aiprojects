import jwt from "jsonwebtoken";

import env from "../config/env.js";

const generateAccessToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export { generateAccessToken, verifyAccessToken };
