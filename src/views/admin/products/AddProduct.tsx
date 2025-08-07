import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase"; // asegurate que esto exporte db
import type { Product } from "@/interfaces/Product";

const initialState: Product = {
  name: "",
  description: "",
  price: 0,
  type: "",
  image: "",
  featured: false,
  available: true,
};

const AddProduct = () => {
  const [form, setForm] = useState<Product>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? parseFloat(value)
          : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), form);
      alert("Producto agregado correctamente!");
      setForm(initialState);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el producto");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={3}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="price">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            min={0}
            step={0.01}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="type">
            Type
          </label>
          <input
            type="text"
            name="type"
            id="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="image">
            Image URL
          </label>
          <input
            type="text"
            name="image"
            id="image"
            value={form.image}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="accent-indigo-600"
            />
            Featured
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              className="accent-green-600"
            />
            Available
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Save Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
