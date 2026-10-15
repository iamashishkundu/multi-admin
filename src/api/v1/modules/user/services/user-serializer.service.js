class UserSerializerService {
  sanitizeUser(user) {
    if (!user) return null;
    const raw = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete raw.passwordHash;
    return raw;
  }
}

module.exports = new UserSerializerService();