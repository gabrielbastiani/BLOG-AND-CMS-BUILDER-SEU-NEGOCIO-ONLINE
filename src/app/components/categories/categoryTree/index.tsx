import React from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Category } from "../../../../../Types/types";

interface CategoryTreeProps {
    categories: Category[];
    moveCategory: (draggedId: string, targetId: string | null) => void;
    level?: number;
    moveUpCategory: (categoryId: string) => void;
    moveDownCategory: (categoryId: string) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, moveCategory, moveUpCategory, moveDownCategory, level = 0 }) => {
    return (
        <DndProvider backend={HTML5Backend}>
            <ul className={`space-y-3 ${level === 0 ? "ml-0" : "ml-6"}`}>
                {categories.map((category, index) => (
                    <CategoryItem
                        key={category.id}
                        category={category}
                        moveCategory={moveCategory}
                        level={level}
                        moveUpCategory={moveUpCategory}
                        moveDownCategory={moveDownCategory}
                        isFirst={index === 0}
                        isLast={index === categories.length - 1}
                    />
                ))}
            </ul>
        </DndProvider>
    );
};

interface CategoryItemProps {
    category: Category;
    moveCategory: (draggedId: string, targetId: string | null) => void;
    moveUpCategory: (categoryId: string) => void;
    moveDownCategory: (categoryId: string) => void;
    level: number;
    isFirst: boolean;
    isLast: boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, moveCategory, moveUpCategory, moveDownCategory, level, isFirst, isLast }) => {
    const [{ isDragging }, ref] = useDrag({
        type: "category",
        item: { id: category.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: "category",
        hover: (dragged: { id: string }) => {
            if (dragged.id !== category.id) {
                moveCategory(dragged.id, category.id);
            }
        },
    });

    return (/* @ts-ignore */
        <li ref={(node) => ref(drop(node))} className={`space-y-2 ${isDragging ? "opacity-50" : "opacity-100"}`}>
            <div className="flex items-center space-x-2">
                <div
                    className={`flex-1 p-4 rounded-md shadow-md transition transform hover:scale-105 ${level === 0 ? "bg-blue-600 text-white mb-3" :
                        level === 1 ? "bg-green-100 text-green-900 mb-3" :
                            level === 2 ? "bg-yellow-100 text-yellow-900 mb-3" :
                                "bg-gray-100 text-gray-900 mb-3"
                        }`}
                >
                    <span className="font-semibold text-lg">{category.name_category}</span>
                </div>
                {/* Ajuste nos botões para ficarem ao lado de cada categoria */}
                <div className="flex flex-col items-center space-y-1">
                    {!isFirst && (
                        <button
                            onClick={() => moveUpCategory(category.id)}
                            className="p-1 rounded-full bg-gray-300 hover:bg-gray-400"
                            aria-label="Mover categoria para cima"
                        >
                            ▲
                        </button>
                    )}
                    {!isLast && (
                        <button
                            onClick={() => moveDownCategory(category.id)}
                            className="p-1 rounded-full bg-gray-300 hover:bg-gray-400"
                            aria-label="Mover categoria para baixo"
                        >
                            ▼
                        </button>
                    )}
                </div>
            </div>
            {/* Renderização recursiva para subcategorias */}
            {(category.children ?? []).length > 0 && (
                <ul className="ml-6 border-l-2 pl-4 border-gray-300">
                    {(category.children ?? []).map((childCategory, index) => (
                        <CategoryItem
                            key={childCategory.id}
                            category={childCategory}
                            moveCategory={moveCategory}
                            moveUpCategory={moveUpCategory}
                            moveDownCategory={moveDownCategory}
                            level={level + 1}
                            isFirst={index === 0}
                            isLast={index === (category.children ?? []).length - 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default CategoryTree;