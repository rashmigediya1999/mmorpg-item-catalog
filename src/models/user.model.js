import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  password: {
    type: DataTypes.VIRTUAL,
    validate: {
      len: [8, 100]
    },
    set(value) {
      this.setDataValue('password', value);
      this.setDataValue('passwordHash', bcrypt.hashSync(value, 10));
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});


User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default User;