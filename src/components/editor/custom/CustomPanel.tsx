import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reorder } from "framer-motion";
import { PlusCircle } from "lucide-react";
import CustomItem from "./CustomItem";
import { useResumeStore } from "@/store/useResumeStore";
import { CustomItem as CustomItemType } from "@/types/resume";
import { useTranslations } from "next-intl";
import { generateUUID } from "@/utils/uuid";

const CustomPanel = memo(({ sectionId }: { sectionId: string }) => {
  const { activeResume, addCustomItem } = useResumeStore();
  const { customData = {} } = activeResume || {};
  const items = customData[sectionId] || [];
  const t = useTranslations("workbench.customPanel");

  const handleCreateItem = () => {
    const newItem: CustomItemType = {
      id: generateUUID(),
      title: "",
      subtitle: "",
      dateRange: "",
      description: "",
      visible: true,
    };
    addCustomItem(sectionId);
  };

  return (
    <div
      className={cn(
        "space-y-4 px-4 py-4 rounded-lg",
        "bg-white dark:bg-neutral-900/30"
      )}
    >
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={(newOrder) => {
          // 这里需要实现重新排序的逻辑
        }}
        className="space-y-3"
      >
        {items.map((item: CustomItemType) => (
          <CustomItem key={item.id} item={item} sectionId={sectionId} />
        ))}

        <Button onClick={handleCreateItem} className={cn("w-full")}>
          <PlusCircle className="w-4 h-4 mr-2" />
          {t("add")}
        </Button>
      </Reorder.Group>
    </div>
  );
});

CustomPanel.displayName = "CustomPanel";

export default CustomPanel;
