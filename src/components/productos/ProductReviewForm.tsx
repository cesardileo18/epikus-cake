// src/components/productos/ProductReviewForm.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { addReview } from "@/services/reviews";

interface ProductReviewFormProps {
  productId: string;
  productName: string;
  userId: string;              // usuario que está opinando
  defaultAuthorName?: string;
  defaultEmail?: string;
}

export function ProductReviewForm({
  productId,
  productName,
  userId,
  defaultAuthorName = "",
  defaultEmail = "",
}: ProductReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!userId) {
      setError("Tenés que iniciar sesión para dejar una opinión.");
      return;
    }

    if (!comment.trim()) {
      setError("Por favor escribí un comentario.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("La puntuación debe ser entre 1 y 5 estrellas.");
      return;
    }

    setLoading(true);
    try {
      await addReview(productId, {
        rating,
        comment: comment.trim(),
        authorName: authorName.trim() || "Anónimo",
        email: email.trim() || undefined,
        userId, 
        
      });

      setSuccess(true);
      setComment("");
      // si querés también podés limpiar el nombre/email:
      // setAuthorName("");
      // setEmail("");
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al guardar tu opinión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h3>Dejá tu opinión sobre {productName}</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Puntuación:
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              disabled={loading}
            >
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Nombre:
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>

        <div>
          <label>
            Email (para validar compra):
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>

        <div>
          <label>
            Comentario:
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar opinión"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && (
          <p style={{ color: "green" }}>¡Gracias por tu opinión! ⭐</p>
        )}
      </form>
    </section>
  );
}
