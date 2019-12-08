'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn('RecentFiles', 'LastPos', {
                    type: Sequelize.INTEGER,
                    defaultValue: 0
                })
            ])
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn('RecentFiles', 'LastPos', { transaction: t })
            ])
        })
    }
};