const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    credits: {
      type: Number,
      default: 10, // Every new user starts with 10 free credits
      min: [0, 'Credits cannot go below 0'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Skill tags — quick reference without a full skills query
    teachTags: [{ type: String, trim: true, lowercase: true }],
    learnTags: [{ type: String, trim: true, lowercase: true }],

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────

userSchema.index({ teachTags: 1 });       // Fast skill matching
userSchema.index({ learnTags: 1 });
userSchema.index({ 'location.city': 1 }); // Local matching

// ── Virtual: full location string ───────────────────────
userSchema.virtual('locationString').get(function () {
  const { city, state, country } = this.location;
  return [city, state, country].filter(Boolean).join(', ');
});

// ── Pre-save Hook: Hash password ─────────────────────────
// Runs automatically before every .save() — never hash manually in controllers
userSchema.pre('save', async function () {
  // 1. If password isn't modified, just stop (no next needed)
  if (!this.isModified('password')) return; 

  // 2. Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  
  // No next() call needed here!
});


// ── Instance Method: Compare passwords ──────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Check if password changed after JWT ─
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedAt;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);