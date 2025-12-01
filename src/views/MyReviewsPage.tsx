// src/pages/MyReviewsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import {
  getPendingReviews,
  getCompletedReviews,
  type PendingReview,
  type CompletedReview,
} from "@/services/userReviews";
import { RatingStars } from "@/components/RatingStars/RatingStars";
import { ReviewModal } from "@/components/modals/ReviewModal";
type Tab = "pending" | "completed";

export function MyReviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<PendingReview[]>([]);
  const [completed, setCompleted] = useState<CompletedReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PendingReview | null>(null);

  const loadReviews = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [pendingData, completedData] = await Promise.all([
        getPendingReviews(user.uid),
        getCompletedReviews(user.uid),
      ]);
      setPending(pendingData);
      setCompleted(completedData);
    } catch (error) {
      console.error("Error cargando opiniones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/my-reviews");
      return;
    }

    void loadReviews();
  }, [user, navigate]);

  const handleOpenModal = (product: PendingReview) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleReviewSuccess = () => {
    // Recargar las listas
    void loadReviews();
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center text-sm text-pink-600 hover:text-pink-700 transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Mis opiniones
          </h1>
          <p className="text-gray-600 mt-2">
            Calificá los productos que compraste y compartí tu experiencia
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "pending"
                ? "text-pink-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pendientes
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-pink-100 text-pink-600 rounded-full">
                {pending.length}
              </span>
            )}
            {activeTab === "pending" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "completed"
                ? "text-pink-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Realizadas
            {completed.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {completed.length}
              </span>
            )}
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400" />
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Cargando opiniones...</p>
          </div>
        ) : (
          <>
            {/* Pendientes */}
            {activeTab === "pending" && (
              <div className="space-y-4">
                {pending.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-pink-100">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No tenés opiniones pendientes
                    </h3>
                    <p className="text-gray-600">
                      Cuando recibas tus productos, podrás calificarlos acá
                    </p>
                  </div>
                ) : (
                  pending.map((item) => (
                    <article
                      key={`${item.orderId}-${item.productId}`}
                      className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 md:p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Imagen */}
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">🎂</span>
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Recibido el{" "}
                            {item.orderDate.toLocaleDateString("es-AR")}
                          </p>

                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            ⭐ Calificar producto
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Realizadas */}
            {activeTab === "completed" && (
              <div className="space-y-4">
                {completed.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-pink-100">
                    <div className="text-6xl mb-4">💭</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Aún no dejaste opiniones
                    </h3>
                    <p className="text-gray-600">
                      Tus calificaciones aparecerán acá
                    </p>
                  </div>
                ) : (
                  completed.map((item) => (
                    <article
                      key={item.productId}
                      className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 md:p-6"
                    >
                      <div className="flex gap-4 mb-4">
                        {/* Imagen */}
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🎂</span>
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.productName}
                          </h3>
                          <div className="flex items-center gap-3 mb-1">
                            <RatingStars
                              avgRating={item.rating}
                              ratingCount={1}
                              showCount={false}
                              size="sm"
                            />
                            <span className="text-xs text-gray-500">
                              {item.createdAt.toLocaleDateString("es-AR")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comentario */}
                      <p className="text-sm text-gray-700 whitespace-pre-line pl-0 md:pl-24">
                        {item.comment}
                      </p>

                      {/* Acciones */}
                      <div className="mt-4 pl-0 md:pl-24">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${item.productId}`)}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                        >
                          Ver producto →
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <ReviewModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.productId}
          productName={selectedProduct.productName}
          productImage={selectedProduct.productImage}
          orderId={selectedProduct.orderId}
          onSuccess={handleReviewSuccess}
        />
      )}
    </main>
  );
}

export default MyReviewsPage;