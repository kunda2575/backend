const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const inventoryEntry = sequelize.define('InventoryEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  material_id: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Material ID is required' },
    },
  },
  material_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Material name is required' },
      len: {
        args: [2, 100],
        msg: 'Material name must be between 2 and 100 characters',
      },
    },
  },
  vendor_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Vendor name is required' },
    },
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Invoice number is required' },
    },
    // unique: true ← Uncomment if you want to enforce uniqueness
  },
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Invoice date must be a valid date' },
      notEmpty: { msg: 'Invoice date is required' },
    },
  },
  invoice_cost_incl_gst: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Invoice cost must be a decimal value' },
      min: {
        args: [0.01],
        msg: 'Invoice cost must be greater than 0',
      },
    },
  },
  unit_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Unit type is required' },
    },
  },
  quantity_received: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Quantity received must be an integer' },
      min: {
        args: [1],
        msg: 'Quantity must be at least 1',
      },
    },
  },
  invoice_attachment: {
    type: DataTypes.STRING,
    allowNull: true,
    // Optional: Add file extension validation if needed
  },
  entered_by: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Entered by is required' },
    },
  },
}, {
  tableName: 'inventory_entry',
  timestamps: true,
});

module.exports = inventoryEntry;
