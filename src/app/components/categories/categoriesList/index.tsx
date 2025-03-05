import { useEffect, useState } from "react";
import { setupAPIClient } from "@/services/api";
import { Category } from "../../../../../Types/types";
import CategoryTree from "../categoryTree";

const CategoriesList = ({ refetchCategories }: { refetchCategories: () => void }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get('/category/cms');
      setCategories(response.data.rootCategories);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleRefetch = () => {
      fetchCategories();
    };

    window.addEventListener("refetchCategories", handleRefetch);

    return () => {
      window.removeEventListener("refetchCategories", handleRefetch);
    };
  }, []);

  const moveUpCategory = async (categoryId: string) => {
    try {
      const apiClient = setupAPIClient();
      await apiClient.put("/category/moveUp", { categoryId });
      fetchCategories();
    } catch (error) {
      console.error("Erro ao mover categoria para cima:", error);
    }
  };

  const moveDownCategory = async (categoryId: string) => {
    try {
      const apiClient = setupAPIClient();
      await apiClient.put("/category/moveDown", { categoryId });
      fetchCategories();
    } catch (error) {
      console.error("Erro ao mover categoria para baixo:", error);
    }
  };

  const moveCategory = async (draggedId: string, targetId: string | null) => {
    try {
      const apiClient = setupAPIClient();
      await apiClient.put("/category/updateOrder", { draggedId, targetId });
      fetchCategories();
    } catch (error) {
      console.error("Erro ao mover categoria:", error);
    }
  };

  const parentCategories = categories.filter(category => !category.parentId);

  return (
    <div className="mt-6 px-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {parentCategories.map(parentCategory => (
          <div key={parentCategory.id} className="p-4 rounded-lg shadow-lg bg-slate-400">
            <CategoryTree
              categories={[parentCategory]}
              moveUpCategory={moveUpCategory}
              moveDownCategory={moveDownCategory}
              moveCategory={moveCategory}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesList;