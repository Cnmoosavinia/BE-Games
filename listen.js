const app = require("./app.js");
const { PORT = 9090 } = process.env;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`listening on port ${PORT}!`);
});

// case insensitive values
// category query that is valid 200
// valid sort by 200
// valid order by 200 asc or desc
// combination test, all 3 together
// empty array for a category with no reviews
//
// non existent category - nonsense 404
// invalid sort by query - banana 400
// invalid order - nonsense 400
// spelling mistakes - category, order, sort by - 400 x3
//
//
