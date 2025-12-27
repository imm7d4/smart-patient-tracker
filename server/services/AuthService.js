const UserRepository = require('../repositories/UserRepository');
const {generateToken} = require('../utils/jwt.util');

class AuthService {
  /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} User data with token
     * @throws {Error} If user already exists
     */
  async register(userData) {
    const {name, email, password, role} = userData;

    // Business validation: Check if user already exists
    const userExists = await UserRepository.findByEmail(email);
    if (userExists) {
      throw new Error('User already exists');
    }

    // Create user (password hashing handled by User model pre-save hook)
    const user = await UserRepository.create({name, email, password, role});

    // Generate token
    const token = generateToken(user._id, user.role);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  }

  /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with token
     * @throws {Error} If credentials are invalid
     */
  async login(email, password) {
    // Find user (need password for verification)
    const user = await UserRepository.findByEmail(email);

    // Business validation: Verify credentials
    if (!user || !(await user.matchPassword(password))) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  }
}

module.exports = new AuthService();
