// src/services/reviews.ts
import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

// 👇 Asegurate de tener este tipo así:
export interface ReviewData {
  rating: number;
  comment: string;
  authorName: string;
  email?: string;
  userId: string;
  orderId?: string; // 👈 OPCIONAL
}

export async function addReview(
  productId: string,
  {
    rating,
    comment,
    authorName,
    email,
    orderId,
    userId,
  }: ReviewData
) {
  const productRef = doc(db, "productos", productId);

  await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    const productData = productSnap.data() || {};

    const prevAvg = productData.avgRating || 0;
    const prevCount = productData.ratingCount || 0;
    const prevBreakdown =
      productData.ratingBreakdown || {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
      };

    const newCount = prevCount + 1;
    const newAvg = (prevAvg * prevCount + rating) / newCount;

    const newBreakdown = { ...prevBreakdown };
    newBreakdown[String(rating)]++;

    // una review por user+producto
    const reviewRef = doc(collection(productRef, "reviews"), userId);

    transaction.set(reviewRef, {
      rating,
      comment,
      authorName,
      email,
      orderId,
      userId,
      createdAt: serverTimestamp(),
    });

    transaction.update(productRef, {
      avgRating: newAvg,
      ratingCount: newCount,
      ratingBreakdown: newBreakdown,
    });
  });
}
