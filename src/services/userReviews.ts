// src/services/userReviews.ts
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";

export interface PendingReview {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  orderDate: Date;
}

export interface CompletedReview {
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  createdAt: Date;
  orderId?: string;
}

export async function getPendingReviews(
  userId: string
): Promise<PendingReview[]> {
  const pendingReviews: PendingReview[] = [];

  try {
    const ordersRef = collection(db, "pedidos");
    const q = query(
      ordersRef,
      where("userUid", "==", userId),
      where("status", "==", "entregado")
    );

    const ordersSnap = await getDocs(q);
    console.log(`📦 Pedidos entregados: ${ordersSnap.size}`);

    for (const orderDoc of ordersSnap.docs) {
      const orderData = orderDoc.data();
      const orderId = orderDoc.id;
      const orderDate = orderData.createdAt?.toDate() || new Date();

      for (const item of orderData.items || []) {
        let productId = item.productId || item.id;

        if (!productId) {
          console.warn("⚠️ Item sin productId:", item);
          continue;
        }

        // 🔥 SEPARAR productId de variantId
        if (productId.includes('-')) {
          const parts = productId.split('-');
          productId = parts[0]; // Solo el ID del producto
          console.log(`🔧 ProductId corregido: ${productId}`);
        }

        // Traer datos desde Firestore
        let productImage = "";
        let productName = item.nombre || item.name || "Producto";
        
        try {
          const productRef = doc(db, "productos", productId);
          const productDoc = await getDoc(productRef);
          
          if (productDoc.exists()) {
            const data = productDoc.data();
            console.log(`✅ Producto encontrado: ${data.nombre}`);
            productImage = data.imagen || "";
            productName = data.nombre || productName;
          } else {
            console.warn(`❌ Producto NO existe: ${productId}`);
          }
        } catch (err) {
          console.error(`💥 Error buscando producto:`, err);
        }

        if (!productImage) {
          productImage = "https://via.placeholder.com/150/f472b6/ffffff?text=🎂";
        }

        // Verificar si ya calificó (usa productId limpio)
        const reviewRef = doc(db, "productos", productId, "reviews", userId);
        const reviewSnap = await getDoc(reviewRef);

        if (!reviewSnap.exists()) {
          console.log(`✅ Pendiente: ${productName}`);
          
          pendingReviews.push({
            productId, // 👈 productId limpio
            productName,
            productImage,
            orderId,
            orderDate,
          });
        } else {
          console.log(`⭐ Ya calificaste: ${productName}`);
        }
      }
    }

    console.log(`🎯 Total pendientes: ${pendingReviews.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }

  return pendingReviews.sort(
    (a, b) => b.orderDate.getTime() - a.orderDate.getTime()
  );
}

export async function getCompletedReviews(
  userId: string
): Promise<CompletedReview[]> {
  const completedReviews: CompletedReview[] = [];

  try {
    const productsRef = collection(db, "productos");
    const productsSnap = await getDocs(productsRef);

    for (const productDoc of productsSnap.docs) {
      const productData = productDoc.data();
      const productId = productDoc.id;

      const reviewRef = doc(db, "productos", productId, "reviews", userId);
      const reviewSnap = await getDoc(reviewRef);

      if (reviewSnap.exists()) {
        const reviewData = reviewSnap.data();
        
        completedReviews.push({
          productId,
          productName: productData.nombre || "Producto",
          productImage: productData.imagen || "",
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: reviewData.createdAt?.toDate() || new Date(),
          orderId: reviewData.orderId,
        });
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  return completedReviews.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}