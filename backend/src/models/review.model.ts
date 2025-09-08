import mongoose, { Schema } from "mongoose";
import { IReview } from "../types/Review.types"; 

const ReviewSchema: Schema<IReview> = new Schema(
    {
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop",  required: true},
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5},
        comment: { type: String, trim: true},
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
