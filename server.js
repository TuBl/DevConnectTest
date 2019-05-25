const express = require("express");
const app = express();
const connectDB = require("./config/db");

//Connect Database
connectDB();
//Init Middleware
//express now has bodyparsed built it.. to parse req.body
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running"));
//Define routes
//this end point pretains to this file
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
