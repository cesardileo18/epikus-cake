// src/components/reviews/ReviewModal.tsx
import { useState } from "react";
import { X } from "lucide-react";
import { addReview } from "@/services/reviews";
import { useAuth } from "@/context/AuthProvider";
import { showToast } from "@/components/Toast/ToastProvider";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  orderId,
  onSuccess,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast.error("Tenés que iniciar sesión");
      return;
    }

    if (!comment.trim()) {
      showToast.error("Escribí un comentario");
      return;
    }

    setLoading(true);
    try {
      await addReview(productId, {
        rating,
        comment: comment.trim(),
        authorName: user.displayName || user.email || "Cliente",
        email: user.email || undefined,
        orderId,
        userId: user.uid,
      });

      showToast.success("¡Gracias por tu opinión! ⭐");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      showToast.error("Error al guardar tu opinión");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className="rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl md:mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--color-bg-card)' }}>
          {/* Header */}
          <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Calificar producto
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Producto */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--color-bg-section-alt)' }}>
              <img
                src={productImage}
                alt={productName}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{productName}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pedido #{orderId}</p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                ¿Cómo calificarías este producto?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span
                      style={{ color: star <= (hoveredRating || rating) ? 'var(--color-warning)' : 'var(--color-border)' }}
                    >
                      ★
                    </span>
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {rating === 5
                    ? "Excelente"
                    : rating === 4
                    ? "Muy bueno"
                    : rating === 3
                    ? "Bueno"
                    : rating === 2
                    ? "Regular"
                    : "Malo"}
                </span>
              </div>
            </div>

            {/* Comentario */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Contanos tu experiencia
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te pareció el producto? ¿Lo recomendarías?"
                rows={5}
                className="input-search w-full px-4 py-3 resize-none"
                disabled={loading}
                required
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {comment.length}/1000 caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-brand-outline flex-1 px-6 py-3 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="btn-brand flex-1 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Publicar opinión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}