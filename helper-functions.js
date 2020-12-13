// Helper functions used in express_server.js

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

const isFormEmpty = (a, b) => {
  if (a === "" || b === "") {
    return true;
  }
}


module.exports = {
  generateRandomString,
  isFormEmpty,
}