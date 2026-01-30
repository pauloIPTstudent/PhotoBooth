import jwt from 'jsonwebtoken';
export const login = (req, res) => {
    const { email, password } = req.body;
    // Validar contra credenciais do .env
    const validEmail = process.env.USER_EMAIL || 'user@example.com';
    const validPassword = process.env.USER_PASSWORD || 'password123';
    const userId = process.env.USER_ID || '1';
    const userName = process.env.USER_NAME || 'John Doe';
    if (email === validEmail && password === validPassword) {
        // Gerar JWT
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign({
            id: userId,
            email: validEmail,
            name: userName,
        }, secret, { expiresIn: '24h' });
        return res.json({
            success: true,
            token: token,
            user: {
                id: userId,
                email: validEmail,
                name: userName,
            },
        });
    }
    res.status(401).json({
        success: false,
        message: 'Invalid credentials',
    });
};
//# sourceMappingURL=authController.js.map