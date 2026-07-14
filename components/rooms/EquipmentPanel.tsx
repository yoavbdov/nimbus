"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EquipmentActions } from "@/components/rooms/EquipmentActions";
import { RoomsFilterBar } from "@/components/rooms/RoomsFilterBar";
import { EquipmentTable } from "@/components/rooms/EquipmentTable";
import { AddEquipmentModal } from "@/components/rooms/AddEquipmentModal";
import { EquipmentAvailabilityModal } from "@/components/rooms/EquipmentAvailabilityModal";
import { EquipmentUsageModal } from "@/components/rooms/EquipmentUsageModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useEquipmentPanel } from "@/hooks/rooms/useEquipmentPanel";
import { useAddEquipment } from "@/hooks/rooms/useAddEquipment";
import { useEquipmentAvailabilityCheck } from "@/hooks/rooms/useEquipmentAvailabilityCheck";
import { useDeleteConfirm } from "@/hooks/shared/useDeleteConfirm";
import { deleteEquipment } from "@/lib/firebase/data/equipment";
import { equipmentFilterSchema } from "@/lib/equipment-filters";
import { equipmentFormValuesFor } from "@/lib/equipment-form";

export function EquipmentPanel() {
  const {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearAll,
    filtered,
    equipment,
    total,
    filterKey,
  } = useEquipmentPanel();
  const addEquipment = useAddEquipment();
  const availability = useEquipmentAvailabilityCheck(equipment);
  const del = useDeleteConfirm(deleteEquipment, "פריטי ציוד");

  /** The id+name targets for a set of equipment ids (for the delete dialog). */
  function deletableEquipment(equipmentIds: string[]) {
    return equipment
      .filter((e) => equipmentIds.includes(e.id))
      .map((e) => ({ id: e.id, name: e.name }));
  }

  function handleEquipmentAction(actionId: string, equipmentId: string | null) {
    if (actionId === "details") {
      const item = equipment.find((e) => e.id === equipmentId);
      if (item) addEquipment.openForEdit(equipmentFormValuesFor(item));
    } else if (actionId === "availability") {
      availability.openWith(equipmentId ? [equipmentId] : []);
    } else if (actionId === "delete") {
      del.openFor(equipmentId ? deletableEquipment([equipmentId]) : []);
    }
  }

  function handleBulkAction(actionId: string, equipmentIds: string[]) {
    if (actionId === "availability") {
      availability.openWith(equipmentIds);
    } else if (actionId === "delete") {
      del.openFor(deletableEquipment(equipmentIds));
    }
  }

  return (
    <CardContent className="p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
            ניהול ציוד
          </h1>
          <p className="text-xs text-muted-foreground/80 num">
            {filtered.length} מתוך {total} פריטי ציוד
          </p>
        </div>
        <EquipmentActions
          onAddEquipment={addEquipment.openModal}
          onCheckAvailability={() => availability.openWith([])}
        />
      </div>

      <Separator className="bg-foreground/8" />

      <RoomsFilterBar
        search={search}
        placeholder="חיפוש לפי שם ציוד או הערה…"
        schema={equipmentFilterSchema}
        filters={filters}
        onSearchChange={setSearch}
        onAdd={addFilter}
        onUpdate={updateFilter}
        onRemove={removeFilter}
        onClearAll={clearAll}
      />

      <div className="neu-inset rounded-2xl p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={filterKey}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <EquipmentTable
              equipment={filtered}
              onAction={handleEquipmentAction}
              onBulkAction={handleBulkAction}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <AddEquipmentModal
        open={addEquipment.open}
        mode={addEquipment.mode}
        onOpenChange={addEquipment.handleOpenChange}
        values={addEquipment.values}
        onFieldChange={addEquipment.updateField}
        valid={addEquipment.valid}
        onConfirm={addEquipment.confirm}
      />

      <EquipmentAvailabilityModal
        open={availability.open}
        onOpenChange={availability.handleOpenChange}
        equipment={equipment}
        selectedIds={availability.selectedIds}
        onToggleEquipment={availability.toggleEquipment}
        slot={availability.slot}
        onSlotChange={availability.updateSlot}
        slotValid={availability.slotValid}
        result={availability.result}
        onConfirm={availability.confirm}
        checkingAll={availability.checkingAll}
        pickerOpen={availability.pickerOpen}
        onPickerOpenChange={availability.setPickerOpen}
        pickerQuery={availability.pickerQuery}
        onPickerQueryChange={availability.setPickerQuery}
        pickerMatches={availability.pickerMatches}
        container={availability.container}
        onContainerChange={availability.setContainer}
        onShowUsage={availability.showUsage}
      />

      <EquipmentUsageModal
        usage={availability.usage}
        onOpenChange={availability.handleUsageOpenChange}
      />

      <DeleteConfirmDialog
        open={del.open}
        count={del.count}
        noun="פריטי ציוד"
        singularLabel="הציוד"
        names={del.names}
        expectedPhrase={del.expectedPhrase}
        confirmText={del.confirmText}
        onConfirmTextChange={del.setConfirmText}
        valid={del.valid}
        onCancel={del.cancel}
        onConfirm={del.confirm}
      />
    </CardContent>
  );
}
