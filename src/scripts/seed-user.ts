import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in the environment variables (.env file)');
  process.exit(1);
}

// Simple argument parser
const getArg = (name: string): string | null => {
  const arg = process.argv.find((val) => val.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const username = getArg('username') || 'admin';
const email = getArg('email') || 'admin@company.com';
const password = getArg('password') || 'admin123';
const name = getArg('name') || 'Administrator';
const role = getArg('role') || 'admin';

async function seed() {
  console.log(`Connecting to MongoDB...`);
  
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB.');

    // Define temporary schema/model for seeding
    const UserSchema = new mongoose.Schema(
      {
        username: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        name: { type: String },
        role: { type: String, required: true, default: 'admin' },
        isActive: { type: Boolean, required: true, default: true },
      },
      { timestamps: true }
    );

    const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if user exists
    const existingUser = await UserModel.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      console.log(`⚠️ User with username "${username}" or email "${email}" already exists.`);
      // Let's update their password in case they want to reset it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      existingUser.password = hashedPassword;
      existingUser.name = name;
      existingUser.role = role;
      await existingUser.save();
      console.log(`✅ Updated existing user's credentials and details.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        isActive: true,
      });

      await newUser.save();
      console.log(`✅ Successfully created user:`);
      console.log(`   - Username: ${username}`);
      console.log(`   - Email: ${email}`);
      console.log(`   - Name: ${name}`);
      console.log(`   - Role: ${role}`);
    }

  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
