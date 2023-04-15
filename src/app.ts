import express from "express";
import path from "path";
import router from "./routes";

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", router);

app.listen(port, function () {
  console.log("next-departure started on port " + port);
});
