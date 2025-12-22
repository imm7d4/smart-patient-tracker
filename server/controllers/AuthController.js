const AuthService = require('../services/AuthService');

class AuthController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;

            // Basic shape validation
            if (!name || !email || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }

            const result = await AuthService.register({ name, email, password, role });

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Basic shape validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            const result = await AuthService.login(email, password);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            const statusCode = error.message === 'Invalid email or password' ? 401 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AuthController();
