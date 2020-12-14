// Helper functions used in express_server.js


// Function being tested by mocha + chai
const getUserByEmail = (userEmail, database) => {
  const userVals = Object.values(database);
  for (let i = 0; i < userVals.length; i++) {
    if (userVals[i].email === userEmail) {
      return userVals[i].id;
    }
  }
};

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