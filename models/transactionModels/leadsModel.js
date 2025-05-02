

const { sequelize } = require('../../config/db')
const { DataTypes } = require("sequelize")


const leads = sequelize.define(
    'Leads',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        contact_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        customer_profession: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        native_language: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lead_source: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lead_stage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value_in_inr: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creation_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        expected_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        team_member: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_interacted_on: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        next_interacted_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        remarks: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        reason_for_lost_customers: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }

    },
    {
        tableName: 'lead_transaction',
        timestamps: true
    }
)
module.exports = leads;