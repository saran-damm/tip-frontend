import React from "react";
import { useNavigate } from "react-router-dom";

type CardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  target: string;
};

export default function Card({ title, description, icon, target }: CardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center w-full max-w-md mx-auto">
      <div className="flex justify-center mb-6">{icon}</div>
      <h3 className="text-3xl font-extrabold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 mb-8">{description}</p>

      <button
        onClick={() => navigate(target)}
        // explicit strong styles so nothing in global CSS turns this white
        className="block mx-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-[0.99] focus:ring-4 focus:ring-blue-200 transition"
      >
        Go to {title}
      </button>
    </div>
  );
}
