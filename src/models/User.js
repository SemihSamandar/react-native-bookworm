import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profileImage: {
        type: String,
        default: ""
    }
}, {
    timestamps: true //Zamanı çekiyor database de (created time and update time)
})

//hash password before saving user to database
userSchema.pre("save", async function(next) {
    
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    //123 => kflwş$ƒ#43
    this.password = await bcrypt.hash(this.password, salt);
    next()
})

//compare password func
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password)
}

const User = mongoose.model("User", userSchema);
//users
export default User;