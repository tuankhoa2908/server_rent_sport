const mongoose = require("mongoose");
module.exports = {
    validateMongoDbId: (id) => {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) {
            throw new Error("This is not valid or not Found");
        }
    }
} 