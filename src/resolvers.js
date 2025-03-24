const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "supersecret";

const resolvers = {
  getCurrentUser: async (_, context) => {
    const req = context.req;
    if (!req) {
      console.error('Request object is missing in context');
      return null;
    }
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return {
        id: null,
        name: null,
        email: null
      }
    }
    
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.userId;
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return {
          id: null,
          name: null,
          email: null
        }
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email
      };
    } catch (error) {
      return {
        id: null,
        name: null,
        email: null
      }
    }
  },

  register: async ({ name, email, password }) => {
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error("Email already in use. Please use a different email address or try logging in.");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

    return { token, user };
  },

  login: async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    const MAX_ATTEMPTS = 5;
    if (user.failedAttempts >= MAX_ATTEMPTS) {
      throw new Error("Account has been locked. Please contact support.");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { failedAttempts: user.failedAttempts + 1 },
      });
      
      const remainingAttempts = MAX_ATTEMPTS - updatedUser.failedAttempts;
      
      if (remainingAttempts <= 0) {
        throw new Error("Account locked due to too many failed attempts. Please contact support.");
      } else {
        throw new Error(`Invalid password. You have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`);
      }
    }

    await prisma.user.update({
      where: { email },
      data: { failedAttempts: 0 },
    });

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

    return { token, user };
  },
  updateUser: async ({ id, name, email }, context) => {
    const req = context.req;
    id = Number(id);
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      console.log('=====___-=== decoded', decoded);
      const userId = decoded.userId;
      
      if (userId !== id) {
        throw new Error('Not authorized to update this user');
      }
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
        },
      });
      
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  }
};

module.exports = resolvers;
