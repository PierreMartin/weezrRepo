export default (mongoose) => {
    const { MONGO_URI } = require('./constants/env');
    mongoose.connect(MONGO_URI, { useNewUrlParser: true });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Mongoose connection error:'));
    db.once('open', () => console.log(`===> Mongoose Succeeded in connecting`));
};
