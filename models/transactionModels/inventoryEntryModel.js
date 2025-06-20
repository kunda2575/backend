// models/StockInvoice.js
const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');


    const inventoryEntry = sequelize.define('InventoryEntry', {
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
      material_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      material_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      vendor_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
      },
      invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      invoice_cost_incl_gst: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      unit_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity_received: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      invoice_attachment: {
        type: DataTypes.STRING, // File path or URL
        allowNull: true
      },
      entered_by: {
        type: DataTypes.STRING,
        allowNull: false
      },
     

    }, {
      tableName: 'inventory_entry',
      timestamps: true // createdAt and updatedAt
    });
  

  module.exports=inventoryEntry