import { useSortable } from "@dnd-kit/sortable";

type EmptyDropAreaProps = {
  categoryId: string;
};

export const EmptyDropArea = ({ categoryId }: EmptyDropAreaProps) => {
  const { setNodeRef } = useSortable({
    id: `empty-category-${categoryId}`,
    data: {
      type: "empty-category",
      categoryId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="text-gray-400 text-center italic text-sm py-6 border border-dashed border-gray-300 my-2 mx-2 rounded bg-gray-50"
    >
      Drop tasks here
    </div>
  );
};
