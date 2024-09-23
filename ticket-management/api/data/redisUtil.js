const redis = require("redis");

// Initialize Redis client
const redisClient = redis.createClient({
  host: "localhost", // Redis server URL or IP address
  port: 6379, // Redis server port (default is 6379)
});
redisClient.connect();

// Log errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// // Log successful connection
// client.on("connect", () => {
//   console.log("Successfully connected to Redis");
// });

// // Optional: Log when ready (fully initialized)
// client.on("ready", () => {
//   console.log("Redis client is ready to use");
// });

// CREATE / UPDATE: Set data with expiration time
const setCache = (key, value, expiry = 3600) => {
  return new Promise((resolve, reject) => {
    redisClient.setex(key, expiry, JSON.stringify(value), (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

// READ: Get data from cache
const getCache = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, data) => {
      if (err) {
        reject(err);
      } else if (data) {
        resolve(JSON.parse(data)); // Parse the cached data
      } else {
        resolve(null); // No data found in cache
      }
    });
  });
};

// DELETE: Remove data from cache
const deleteCache = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply); // Returns number of deleted keys
      }
    });
  });
};

// CLEAR: Clear all cache (optional, for testing or bulk operations)
const clearCache = () => {
  return new Promise((resolve, reject) => {
    redisClient.flushall((err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply); // Returns OK
      }
    });
  });
};

// Export the utility functions
module.exports = {
  setCache,
  getCache,
  deleteCache,
  clearCache,
};
