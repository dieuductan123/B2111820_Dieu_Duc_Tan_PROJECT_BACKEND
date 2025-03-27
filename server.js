const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");

async function startServer() {
  try {
    await MongoDB.connect(config.db.uri);
    console.log("Connect to database successfully");

    const PORT = config.app.port;
    app.listen(PORT, () => {
      console.log(`Server is runing on port ${PORT}`);
    });
  } catch (error) {
    console.log("Error in connect to database ", error);
    process.exit();
  }
}

startServer();
