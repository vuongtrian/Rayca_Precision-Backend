const redis = require("redis");

// Initialize Redis client
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});
redisClient.connect();

// Log errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// // Log successful connection
redisClient.on("connect", () => {
  console.log("Successfully connected to Redis");
});

// // Optional: Log when ready (fully initialized)
// client.on("ready", () => {
//   console.log("Redis client is ready to use");
// });

// CREATE / UPDATE: Set data with expiration time
const setCache = (key, value) => {
  return new Promise((resolve, reject) => {
    redisClient.set(key, JSON.stringify(value), (err, reply) => {
      if (err) {
        return reject(err);
      }
      resolve(reply);
    });
  });
};

// READ: Get data from cache
const getCache = (key) => {
  return redisClient.get(key);
};

// DELETE: Remove data from cache
const deleteCache = (key) => {
  console.log("Deleting cache");
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, reply) => {
      if (err) {
        return reject(err);
      }
      resolve(reply);
    });
  });
};

// Export the utility functions
module.exports = {
  setCache,
  getCache,
  deleteCache,
};
