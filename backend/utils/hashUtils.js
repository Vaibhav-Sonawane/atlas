// const bcrypt = require('bcryptjs');
import bcrypt from "bcryptjs";

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const generateSalt = async (rounds = 12) => {
  return await bcrypt.genSalt(rounds);
};

export {
  hashPassword,
  comparePassword,
  generateSalt
};