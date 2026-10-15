module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      actorId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      action: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      module: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      targetId: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('audit_logs', ['actorId'], { name: 'idx_audit_logs_actor' });
    await queryInterface.addIndex('audit_logs', ['module'], { name: 'idx_audit_logs_module' });
    await queryInterface.addIndex('audit_logs', ['createdAt'], { name: 'idx_audit_logs_created_at' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('audit_logs');
  },
};
