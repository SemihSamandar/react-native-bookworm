import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/", protectRoute ,async (req,res) => { 
    try {
        const { title, caption, rating, image } = req.body

        if(!image || !title || !caption || !rating) {
            return res.status(400).json({message: "Please provide all fields!"})
        }
        //upload the image cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageUrl = uploadResponse.secure_url
       
        
        //save to the database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        })

        await newBook.save()

        res.status(201).json(newBook)
    } catch (error) {
        console.log("Error creating book", error)
        res.status(500).json({message: "error.message"})
    }
})
//pagination --> infinite loading
router.get("/", protectRoute, async (req, res) => {
try {
    constpage = req.query.page || 1; //default page is 1
    const limit = 5; //number of books per page
    const skip = (page - 1) * limit; //calculate the number of books to skip

    const books = await Book.find()
    .sort({ createdAt: -1 }) //decending 
    .skip(skip)
    .limit(limit)
    .populate("user","username profileImage");


    const totalBooks = await Book.countDocuments(); //total number of books in the database

    res.send({
        books,
        currentPage: page,
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit), //total number of pages
    });
} catch (error) {
    console.log("Error in get all books route", error)
    res.status(500).json({message: "Internal server error"})
}
})

// Get books by user
router.get("/user", protectRoute, async (req, res) => {
try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 }) //sort by createdAt in descending order
    res.json(books);

} catch (error) {
    console.log("Get user books error", error.message);
    res.status(500).json({ message: "Server error" });
}
})

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        
// Check if the user is the creator of the book
        if(book.user.toString() !== req.user._id.toString()) 
            return res.status(401).json({ message: "Unauthorized" });
        
       //Delete the image from Cloudinary
        if(!book.image && book.image.includes("cloudinary")) { 
           try {
            const publicId = book.image.split("/").pop().split(".")[0]; // Extract public ID from the image URL
            await cloudinary.uploader.destroy(publicId); // Delete the image from Cloudinary
           } catch (deleteError) {
               console.log("Error deleting image from Cloudinary", deleteError);
           }
        }
        
        await book.deleteOne();

    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


export default router;