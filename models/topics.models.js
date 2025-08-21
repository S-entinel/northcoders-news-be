const db = require(`../db/connection`);

exports.fetchTopics = () => {
    return db.query(
        `SELECT * from topics;`
    ).then(({ rows }) => {
        return rows
    })
}