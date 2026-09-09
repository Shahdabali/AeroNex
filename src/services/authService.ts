export const authService = {
  login: async (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !email.includes('@')) {
          reject(new Error("Invalid email format"));
        } else if (password.length < 6) {
          reject(new Error("Password must be at least 6 characters"));
        } else if (email === 'test@example.com' && password === 'password123') {
          resolve({ user: { email, id: '1', name: 'Test User' }, token: 'mock-jwt-token' });
        } else {
          // General success for demo purposes if basic validation passes
          resolve({ user: { email, id: '2', name: 'Demo User' }, token: 'mock-jwt-token-2' });
        }
      }, 1500);
    });
  },
  
  socialLogin: async (provider: 'Google' | 'Microsoft') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ user: { email: `user@${provider.toLowerCase()}.com`, name: `${provider} User` }, token: 'mock-social-token' });
      }, 1000);
    });
  },

  demoLogin: async (role: 'Passenger' | 'Researcher' | 'Admin') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ user: { role, name: `${role} Demo` }, token: 'mock-demo-token' });
      }, 800);
    });
  },

  resetPassword: async (email: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) reject(new Error("Email required to reset password"));
        resolve({ success: true, message: "Password reset link sent to email" });
      }, 1000);
    });
  }
};
