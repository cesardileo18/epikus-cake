import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product } from "@/interfaces/Product";
import { RatingStars } from "@/components/RatingStars/RatingStars";
type ReviewDoc = {
  rating: number;
  comment: string;
  authorName?: string;
  createdAt?: { toDate: () => Date };
};

export function ProductReviewsPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const from = location.state?.from;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      setLoading(true);

      // producto
      const productSnap = await getDoc(doc(db, "productos", productId));
      if (productSnap.exists()) {
        setProduct(productSnap.data() as Product);
      }

      // reviews
      const reviewsRef = collection(db, "productos", productId, "reviews");
      const reviewsSnap = await getDocs(reviewsRef);
      const list: ReviewDoc[] = reviewsSnap.docs.map((d) => d.data() as ReviewDoc);

      setReviews(list);
      setLoading(false);
    };

    void load();
  }, [productId]);

  if (!productId) {
    return <p>Producto no encontrado.</p>;
  }

  return (
    <main className="min-h-screen bg-[#ff7bab48] pt-20">
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Volver */}
        <button
          type="button"
          onClick={() => (from ? navigate(from) : navigate(-1))}
          className="mb-4 inline-flex items-center text-sm text-pink-600 hover:text-pink-700 cursor-pointer"
        >
          ← Volver
        </button>

        {/* Cabecera producto */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Opiniones sobre {product?.nombre ?? "el producto"}
        </h1>

        <div className="mb-4">
          <RatingStars
            avgRating={(product as any)?.avgRating}
            ratingCount={(product as any)?.ratingCount}
          />
        </div>

        {loading && <p>Cargando opiniones...</p>}

        {!loading && reviews.length === 0 && (
          <p className="text-gray-600">Este producto todavía no tiene opiniones.</p>
        )}

        {/* Lista de opiniones */}
        <div className="mt-4 space-y-4">
          {reviews.map((r, idx) => (
            <article
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-white/70 p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {r.authorName || "Cliente"}
                  </span>
                  <RatingStars
                    avgRating={r.rating}
                    ratingCount={1}
                    showCount={false}
                    size="sm"
                  />
                </div>
                {r.createdAt && (
                  <span className="text-xs text-gray-500">
                    {r.createdAt.toDate().toLocaleDateString("es-AR")}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {r.comment}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProductReviewsPage;
