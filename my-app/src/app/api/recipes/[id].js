import connectDB from "../../lib/mongoDB";
import Recipe from "../../models/Recipes";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST" && !mongoose.isValidObjectId(id))
    return res
      .status(400)
      .json({ success: false, error: "Invalid Id provided" });

  if ((req.method === "POST" || req.method === "PUT") && !req.body)
    return res.status(400).json("Please provide recipe information");

  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        const recipe = await Recipe.findById(id).select("-__v");

        if (!recipe) {
          const err = new Error("Recipe not found");
          err.statusCode = 404;
          throw err;
        }

        res.status(200).json({ success: true, data: recipe });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }
      break;

    case "DELETE":
      try {
        const recipe = await Recipe.findByIdAndDelete(id).select("-__v");

        if (!recipe) {
          const err = new Error("Recipe not found");
          err.statusCode = 404;
          throw err;
        }

        res.status(200).json({
          success: true,
          message: "Recipe deleted successfully",
          data: recipe,
        });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }

    case "POST":
      try {
        const recipe = await Recipe.create(req.body);

        res.status(200).json({
          success: true,
          message: "Recipe created successfully",
          data: recipe,
        });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }
      break;

    case "PUT":
      try {
        const recipe = await Recipe.findByIdAndUpdate(id, { new: true }).select(
          "-__v"
        );

        if (!recipe) {
          const err = new Error("Recipe not found");
          err.statusCode = 404;
          throw err;
        }

        res
          .status(200)
          .json({
            success: true,
            message: "Recipe updated successfully",
            data: recipe,
          });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }
  }
}
