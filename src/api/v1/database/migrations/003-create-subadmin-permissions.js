module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subadmin_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      subadminId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      permissionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      assignedById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('subadmin_permissions', {
      fields: ['subadminId', 'permissionId'],
      type: 'unique',
      name: 'unique_subadmin_permission',
    });

    await queryInterface.addIndex('subadmin_permissions', ['subadminId'], { name: 'idx_subadmin_permissions_subadmin' });
    await queryInterface.addIndex('subadmin_permissions', ['permissionId'], { name: 'idx_subadmin_permissions_permission' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('subadmin_permissions');
  },
};
