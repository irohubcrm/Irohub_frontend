const mongoose = require("mongoose");

(async () => {
  await mongoose.connect("mongodb+srv://nygilbinoy83_db_user:1234567891@cluster0.x9cjktl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

  const collections = await mongoose.connection.db.listCollections().toArray();

  for (const collection of collections) {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
  }

  console.log("All collections cleaned!");
})();
